// Одноразовая миграция контента в формат Pages CMS (пункт 6 плана
// docs/plans/editor-content-management.md).
//
//   src/news/*.md               → content/news/<дата>-<имя>.md
//   src/maps/<раздел>Map.js     → content/info/<раздел>.md
//   public/<раздел>/*.txt       → текст статьи внутри content/info/<раздел>.md
//
// PDF и картинки остаются на прежних путях в public/, чтобы не ломать
// внешние ссылки. Старые источники скрипт не удаляет.
//
// Запуск вручную: node scripts/migrate-content.mjs [--dry-run] [--force]
// Существующий файл с другим содержимым не перезаписывается без --force
// (его могли уже поправить в CMS). Код выхода 1 при ошибке.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { stringify } from 'yaml';

/** Разделы «Информации» в порядке меню сайта (src/pages/Info.jsx). */
export const SECTIONS = [
  { slug: 'general', title: 'Общая информация' },
  { slug: 'reports', title: 'Регламентные мероприятия готовности МКД к отопительному периоду' },
  { slug: 'ventilation', title: 'Проверка вентиляции в МКД' },
  { slug: 'mkd', title: 'Общие сведения по МКД' },
  { slug: 'company', title: 'Отчетная деятельность компании' },
  { slug: 'meetings', title: 'Общие собрания' },
];

const MONTHS = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
};

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/**
 * Переводит дату вида «22 июня 2025» в «2025-06-22».
 * Бросает ошибку на неизвестный месяц или несуществующий день.
 */
export function parseRussianDate(text) {
  const match = text.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  const month = match && MONTHS[match[2].toLowerCase()];
  if (!month) {
    throw new Error(`не удалось разобрать дату «${text}»`);
  }
  const day = Number(match[1]);
  const year = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error(`несуществующая дата «${text}»`);
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Разбирает новость старого формата: заголовок «### … ###» в первой строке,
 * дата в строке «_Дата: … _», остальное — текст.
 *
 * @returns {{title: string, date: string, body: string}}
 */
export function parseLegacyNews(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const titleIndex = lines.findIndex((line) => /^#{1,6}\s/.test(line));
  if (titleIndex === -1) {
    throw new Error('нет заголовка (строка, начинающаяся с ###)');
  }
  const title = lines[titleIndex].replace(/^#+\s*/, '').replace(/\s*#+\s*$/, '').trim();

  const dateIndex = lines.findIndex((line) => /^\s*_Дата:.*_\s*$/.test(line));
  if (dateIndex === -1) {
    throw new Error('нет строки даты «_Дата: … _»');
  }
  const date = parseRussianDate(lines[dateIndex].replace(/^\s*_Дата:\s*/, '').replace(/_\s*$/, ''));

  const body = lines
    .filter((_, index) => index !== titleIndex && index !== dateIndex)
    .join('\n')
    .trim();

  return { title, date, body };
}

/**
 * Превращает строку карты раздела [заголовок, файл] в пункт раздела.
 * readText(fileName) возвращает содержимое .txt-файла раздела.
 */
export async function mapEntryToItem([title, fileName], slug, readText) {
  if (!fileName) {
    return { type: 'heading', title };
  }
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.txt') {
    return { type: 'article', title, body: (await readText(fileName)).trim() };
  }
  if (ext === '.pdf') {
    return { type: 'document', title, file: `/${slug}/${fileName}` };
  }
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return { type: 'image', title, image: `/${slug}/${fileName}` };
  }
  throw new Error(`неизвестный тип файла «${fileName}» в пункте «${title}»`);
}

/** Собирает файл с YAML-frontmatter в формате, который пишет Pages CMS. */
export function toFrontmatterFile(data, body = '') {
  const yamlText = stringify(data, { lineWidth: 0 });
  return `---\n${yamlText}---\n${body ? `${body}\n` : ''}`;
}

/**
 * Готовит список файлов для записи, ничего не меняя на диске.
 *
 * @returns {Promise<Array<{path: string, content: string}>>}
 */
export async function planMigration(root) {
  const outputs = [];

  const newsDir = path.join(root, 'src/news');
  const newsFiles = existsSync(newsDir)
    ? (await readdir(newsDir)).filter((name) => name.endsWith('.md')).sort()
    : [];
  for (const name of newsFiles) {
    const source = path.join(newsDir, name);
    let news;
    try {
      news = parseLegacyNews(await readFile(source, 'utf8'));
    } catch (error) {
      throw new Error(`${path.relative(root, source)}: ${error.message}`);
    }
    outputs.push({
      path: path.join(root, 'content/news', `${news.date}-${name}`),
      content: toFrontmatterFile({ title: news.title, date: news.date }, news.body),
    });
  }

  for (const [index, section] of SECTIONS.entries()) {
    const mapPath = path.join(root, 'src/maps', `${section.slug}Map.js`);
    const { fileMap } = await import(pathToFileURL(mapPath).href);
    const readText = (fileName) => readFile(path.join(root, 'public', section.slug, fileName), 'utf8');

    const items = [];
    for (const entry of fileMap) {
      try {
        items.push(await mapEntryToItem(entry, section.slug, readText));
      } catch (error) {
        throw new Error(`${path.relative(root, mapPath)}: ${error.message}`);
      }
    }

    outputs.push({
      path: path.join(root, 'content/info', `${section.slug}.md`),
      content: toFrontmatterFile({ title: section.title, slug: section.slug, order: index + 1, items }),
    });
  }

  return outputs;
}

/**
 * Пишет результат миграции. Файл с тем же содержимым пропускается,
 * файл с другим содержимым — только при force.
 *
 * @returns {Promise<{written: string[], unchanged: string[], skipped: string[]}>}
 */
export async function migrate(root, { dryRun = false, force = false } = {}) {
  const result = { written: [], unchanged: [], skipped: [] };
  for (const output of await planMigration(root)) {
    const relative = path.relative(root, output.path);
    if (existsSync(output.path)) {
      const current = await readFile(output.path, 'utf8');
      if (current === output.content) {
        result.unchanged.push(relative);
        continue;
      }
      if (!force) {
        result.skipped.push(relative);
        continue;
      }
    }
    if (!dryRun) {
      await mkdir(path.dirname(output.path), { recursive: true });
      await writeFile(output.path, output.content);
    }
    result.written.push(relative);
  }
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  try {
    const result = await migrate(process.cwd(), { dryRun, force: args.includes('--force') });
    const verb = dryRun ? 'будет записано' : 'записано';
    for (const file of result.written) console.log(`${verb}: ${file}`);
    for (const file of result.unchanged) console.log(`без изменений: ${file}`);
    for (const file of result.skipped) console.warn(`пропущено (файл уже изменён, нужен --force): ${file}`);
  } catch (error) {
    console.error(`Ошибка миграции: ${error.message}`);
    process.exit(1);
  }
}
