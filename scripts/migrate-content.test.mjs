import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import {
  SECTIONS,
  parseRussianDate,
  parseLegacyNews,
  mapEntryToItem,
  toFrontmatterFile,
  migrate,
} from './migrate-content.mjs';

function readFrontmatter(fileText) {
  const match = fileText.match(/^---\n([\s\S]*?)---\n([\s\S]*)$/);
  return { data: parse(match[1]), body: match[2] };
}

describe('migrate-content', () => {
  describe('parseRussianDate', () => {
    it.each([
      ['22 июня 2025', '2025-06-22'],
      ['7 июля 2025', '2025-07-07'],
      ['1 Января 2026', '2026-01-01'],
    ])('переводит «%s» в %s', (input, expected) => {
      expect(parseRussianDate(input)).toBe(expected);
    });

    it('бросает ошибку на неизвестный месяц', () => {
      expect(() => parseRussianDate('5 июнь 2025')).toThrow(/не удалось разобрать/);
    });

    it('бросает ошибку на несуществующий день', () => {
      expect(() => parseRussianDate('31 июня 2025')).toThrow(/несуществующая/);
    });
  });

  describe('parseLegacyNews', () => {
    it('разбирает заголовок с закрывающими решётками, дату и текст', () => {
      const raw = '### Тарифы ЖКХ ###\n\nПервый абзац.\n\n_Дата: 9 июля 2025_';
      expect(parseLegacyNews(raw)).toEqual({
        title: 'Тарифы ЖКХ',
        date: '2025-07-09',
        body: 'Первый абзац.',
      });
    });

    it('сохраняет эмодзи в заголовке, картинки и двойные пробелы переноса в тексте', () => {
      const raw = '### 🎉Праздник!🎈\n📅 Когда: **24 июня**  \nПриходите!\n\n![Фото](/news_images/a.jpg)\n\n_Дата: 22 июня 2025_\n';
      const news = parseLegacyNews(raw);
      expect(news.title).toBe('🎉Праздник!🎈');
      expect(news.body).toBe('📅 Когда: **24 июня**  \nПриходите!\n\n![Фото](/news_images/a.jpg)');
    });

    it('бросает ошибку без строки даты', () => {
      expect(() => parseLegacyNews('### Заголовок\n\nТекст')).toThrow(/нет строки даты/);
    });

    it('бросает ошибку без заголовка', () => {
      expect(() => parseLegacyNews('Текст\n\n_Дата: 1 мая 2025_')).toThrow(/нет заголовка/);
    });
  });

  describe('mapEntryToItem', () => {
    const readText = async (name) => `  текст из ${name}\n\n`;

    it('пустой файл даёт подзаголовок', async () => {
      expect(await mapEntryToItem(['Дома', ''], 'mkd', readText)).toEqual({ type: 'heading', title: 'Дома' });
    });

    it('.txt даёт статью с текстом файла', async () => {
      expect(await mapEntryToItem(['Чат', 'chat.txt'], 'general', readText)).toEqual({
        type: 'article', title: 'Чат', body: 'текст из chat.txt',
      });
    });

    it('.pdf даёт документ с путём раздела', async () => {
      expect(await mapEntryToItem(['Тариф', 'tariff.pdf'], 'general', readText)).toEqual({
        type: 'document', title: 'Тариф', file: '/general/tariff.pdf',
      });
    });

    it('.png даёт картинку с путём раздела', async () => {
      expect(await mapEntryToItem(['Газ', 'gas.PNG'], 'general', readText)).toEqual({
        type: 'image', title: 'Газ', image: '/general/gas.PNG',
      });
    });

    it('бросает ошибку на неизвестное расширение', async () => {
      await expect(mapEntryToItem(['Архив', 'a.zip'], 'general', readText)).rejects.toThrow(/неизвестный тип/);
    });
  });

  describe('toFrontmatterFile', () => {
    it('сохраняет многострочный текст с двойными пробелами без потерь', () => {
      const body = 'Строка с переносом  \nследующая\n\n![](/a.png)';
      const file = toFrontmatterFile({ title: 'Т', items: [{ type: 'article', title: 'С', body }] });
      expect(readFrontmatter(file).data.items[0].body).toBe(body);
    });

    it('пишет дату строкой без кавычек, как Pages CMS', () => {
      expect(toFrontmatterFile({ date: '2025-07-09' })).toContain('date: 2025-07-09\n');
    });
  });

  describe('migrate', () => {
    let root;

    beforeEach(async () => {
      root = await mkdtemp(path.join(tmpdir(), 'migrate-content-'));
      await mkdir(path.join(root, 'src/news'), { recursive: true });
      await mkdir(path.join(root, 'src/maps'), { recursive: true });
      await mkdir(path.join(root, 'public/general'), { recursive: true });
      await writeFile(path.join(root, 'src/news/news_1.md'), '### Новость ###\n\nТекст.\n\n_Дата: 7 июля 2025_\n');
      await writeFile(path.join(root, 'public/general/chat.txt'), '![Чат](/general/images/chat.png)\nНе грубите.\n');
      for (const { slug } of SECTIONS) {
        const entries = slug === 'general'
          ? '[["Чат", "chat.txt"], ["Тариф", "tariff.pdf"], ["Газ", "gas.png"]]'
          : slug === 'mkd' ? '[["Дома", ""]]' : '[]';
        await writeFile(path.join(root, 'src/maps', `${slug}Map.js`), `export const fileMap = ${entries};\n`);
      }
    });

    afterEach(async () => {
      await rm(root, { recursive: true, force: true });
    });

    it('создаёт новость и все шесть разделов в порядке меню', async () => {
      const result = await migrate(root);
      expect(result.written).toHaveLength(1 + SECTIONS.length);

      const news = readFrontmatter(await readFile(path.join(root, 'content/news/2025-07-07-news_1.md'), 'utf8'));
      expect(news.data).toEqual({ title: 'Новость', date: '2025-07-07' });
      expect(news.body).toBe('Текст.\n');

      const general = readFrontmatter(await readFile(path.join(root, 'content/info/general.md'), 'utf8')).data;
      expect(general).toEqual({
        title: 'Общая информация',
        slug: 'general',
        order: 1,
        items: [
          { type: 'article', title: 'Чат', body: '![Чат](/general/images/chat.png)\nНе грубите.' },
          { type: 'document', title: 'Тариф', file: '/general/tariff.pdf' },
          { type: 'image', title: 'Газ', image: '/general/gas.png' },
        ],
      });

      const meetings = readFrontmatter(await readFile(path.join(root, 'content/info/meetings.md'), 'utf8')).data;
      expect(meetings).toMatchObject({ slug: 'meetings', order: 6, items: [] });
    });

    it('повторный запуск ничего не меняет', async () => {
      await migrate(root);
      const second = await migrate(root);
      expect(second.written).toEqual([]);
      expect(second.unchanged).toHaveLength(1 + SECTIONS.length);
    });

    it('не перезаписывает изменённый файл без force', async () => {
      await migrate(root);
      const target = path.join(root, 'content/info/general.md');
      await writeFile(target, 'правка из CMS');

      const result = await migrate(root);
      expect(result.skipped).toEqual(['content/info/general.md']);
      expect(await readFile(target, 'utf8')).toBe('правка из CMS');

      await migrate(root, { force: true });
      expect(await readFile(target, 'utf8')).not.toBe('правка из CMS');
    });

    it('dry-run ничего не пишет на диск', async () => {
      const result = await migrate(root, { dryRun: true });
      expect(result.written).toHaveLength(1 + SECTIONS.length);
      await expect(readFile(path.join(root, 'content/info/general.md'), 'utf8')).rejects.toThrow();
    });

    it('сообщает файл-источник при битой новости', async () => {
      await writeFile(path.join(root, 'src/news/news_2.md'), '### Без даты\n\nТекст');
      await expect(migrate(root)).rejects.toThrow(/src\/news\/news_2\.md: нет строки даты/);
    });
  });
});
