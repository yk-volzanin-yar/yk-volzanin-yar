import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateContent } from './validate-content.mjs';

const SCRIPT = fileURLToPath(new URL('./validate-content.mjs', import.meta.url));
const PROJECT_ROOT = path.dirname(path.dirname(SCRIPT));

const news = (fields, body = 'Текст новости.') => `---\n${fields}\n---\n${body}\n`;
const section = (fields) => `---\n${fields}\n---\n`;

describe('validate-content', () => {
  let root;

  const write = async (relative, text) => {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, text);
  };

  const messages = async () => (await validateContent(root)).errors.map((e) => `${e.file}: ${e.message}`);

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'validate-content-'));
    await write('public/uploads/foto.jpg', 'jpg');
    await write('public/general/tariff.pdf', 'pdf');
    await write('public/general/images/pump.png', 'png');
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('корректные данные всех видов проходят проверку', async () => {
    await write('content/news/2025-07-09-a.md', news(
      'title: Тарифы\ndate: 2025-07-09\nimages:\n  - /uploads/foto.jpg',
      'Текст ![фото](/uploads/foto.jpg) и ![внешняя](https://example.com/a.png)',
    ));
    await write('content/info/general.md', section([
      'title: Общая информация',
      'slug: general',
      'order: 1',
      'items:',
      '  - type: article',
      '    title: Насосы',
      '    body: |+',
      '      ![Насос](/general/images/pump.png)',
      '      Текст статьи.',
      '',
      '  - type: document',
      '    title: Тариф',
      '    file: /general/tariff.pdf',
      '  - type: image',
      '    title: Фото',
      '    image: /uploads/foto.jpg',
      '  - type: heading',
      '    title: Дома',
    ].join('\n')));
    await write('content/info/meetings.md', section('title: Общие собрания\nslug: meetings\nitems: []'));

    const result = await validateContent(root);
    expect(result).toEqual({ errors: [], news: 1, sections: 2 });
  });

  it('проект без папки content не даёт ошибок', async () => {
    expect(await validateContent(root)).toEqual({ errors: [], news: 0, sections: 0 });
  });

  describe('новости', () => {
    it('новость без даты', async () => {
      await write('content/news/a.md', news('title: Без даты'));
      expect(await messages()).toEqual([expect.stringMatching(/^content\/news\/a\.md: нет даты или дата некорректна \(date: null\)/)]);
    });

    it.each(['2025-02-30', '09.07.2025', '2025-7-9'])('некорректная дата %s', async (date) => {
      await write('content/news/a.md', news(`title: Т\ndate: '${date}'`));
      expect(await messages()).toEqual([expect.stringContaining(`date: "${date}"`)]);
    });

    it('новость без заголовка', async () => {
      await write('content/news/a.md', news('date: 2025-07-09'));
      expect(await messages()).toEqual(['content/news/a.md: нет заголовка (title)']);
    });

    it('битый YAML', async () => {
      await write('content/news/a.md', news('title: [не закрыто\ndate: 2025-07-09'));
      expect(await messages()).toEqual([expect.stringMatching(/^content\/news\/a\.md: ошибка в заголовке файла \(YAML\)/)]);
    });

    it('файл без заголовка-frontmatter', async () => {
      await write('content/news/a.md', '### Старая новость\n\n_Дата: 9 июля 2025_');
      expect(await messages()).toHaveLength(2);
    });

    it('отсутствующая фотография', async () => {
      await write('content/news/a.md', news('title: Т\ndate: 2025-07-09\nimages:\n  - /uploads/net.jpg'));
      expect(await messages()).toEqual([
        'content/news/a.md: фотография 1: файл /uploads/net.jpg не найден (ожидался public/uploads/net.jpg)',
      ]);
    });

    it('images не списком', async () => {
      await write('content/news/a.md', news('title: Т\ndate: 2025-07-09\nimages: /uploads/foto.jpg'));
      expect(await messages()).toEqual(['content/news/a.md: поле images должно быть списком']);
    });

    it('отсутствующая картинка в тексте, внешние ссылки пропускаются', async () => {
      await write('content/news/a.md', news(
        'title: Т\ndate: 2025-07-09',
        '![a](/uploads/net.png)\n![b](https://example.com/x.png)\n![c](//cdn.example.com/y.png)',
      ));
      expect(await messages()).toEqual([expect.stringContaining('текст новости: картинка в тексте: файл /uploads/net.png не найден')]);
    });

    it('кириллическое имя файла в %-кодировке находится', async () => {
      await write('public/uploads/фото.jpg', 'jpg');
      await write('content/news/a.md', news('title: Т\ndate: 2025-07-09', '![](/uploads/%D1%84%D0%BE%D1%82%D0%BE.jpg)'));
      expect(await messages()).toEqual([]);
    });
  });

  describe('разделы', () => {
    it('дублирующийся адрес называет оба файла', async () => {
      await write('content/info/a.md', section('title: А\nslug: general'));
      await write('content/info/b.md', section('title: Б\nslug: general'));
      expect(await messages()).toEqual(['content/info/b.md: адрес «general» уже занят разделом content/info/a.md']);
    });

    it('адрес кириллицей', async () => {
      await write('content/info/a.md', section('title: А\nslug: общая'));
      expect(await messages()).toEqual([expect.stringContaining('только маленькие латинские буквы')]);
    });

    it('нет названия и адреса', async () => {
      await write('content/info/a.md', section('order: 1'));
      expect(await messages()).toEqual([
        'content/info/a.md: нет названия раздела (title)',
        'content/info/a.md: нет адреса раздела (slug)',
      ]);
    });

    it('порядок не числом', async () => {
      await write('content/info/a.md', section('title: А\nslug: a\norder: первый'));
      expect(await messages()).toEqual([expect.stringContaining('order) должен быть числом, сейчас "первый"')]);
    });

    it('items не списком', async () => {
      await write('content/info/a.md', section('title: А\nslug: a\nitems: текст'));
      expect(await messages()).toEqual(['content/info/a.md: поле items должно быть списком пунктов']);
    });

    it('пункт неизвестного типа и пункт без заголовка', async () => {
      await write('content/info/a.md', section(
        'title: А\nslug: a\nitems:\n  - { type: video, title: Ролик }\n  - { type: heading }',
      ));
      expect(await messages()).toEqual([
        'content/info/a.md: пункт 1: неизвестный тип «video»',
        'content/info/a.md: пункт 2 (heading): нет заголовка',
      ]);
    });

    it('документ и картинка без выбранного файла', async () => {
      await write('content/info/a.md', section(
        'title: А\nslug: a\nitems:\n  - { type: document, title: Договор }\n  - { type: image, title: Схема, image: "" }',
      ));
      expect(await messages()).toEqual([
        'content/info/a.md: пункт 1 «Договор»: не выбран файл (file)',
        'content/info/a.md: пункт 2 «Схема»: не выбран файл (image)',
      ]);
    });

    it('файл пункта не найден, путь без / в начале', async () => {
      await write('content/info/a.md', section(
        'title: А\nslug: a\nitems:\n  - { type: document, title: Договор, file: /uploads/net.pdf }\n  - { type: image, title: Схема, image: uploads/foto.jpg }',
      ));
      expect(await messages()).toEqual([
        'content/info/a.md: пункт 1 «Договор»: файл /uploads/net.pdf не найден (ожидался public/uploads/net.pdf)',
        'content/info/a.md: пункт 2 «Схема»: путь «uploads/foto.jpg» должен начинаться с /',
      ]);
    });

    it('отсутствующая картинка в тексте статьи', async () => {
      await write('content/info/a.md', section(
        'title: А\nslug: a\nitems:\n  - type: article\n    title: Статья\n    body: "![](/general/images/net.png)"',
      ));
      expect(await messages()).toEqual([expect.stringContaining('пункт 1 «Статья»: картинка в тексте: файл /general/images/net.png не найден')]);
    });
  });

  describe('запуск из командной строки', () => {
    const run = (env = {}) => spawnSync(process.execPath, [SCRIPT], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, GITHUB_ACTIONS: '', ...env },
    });

    it('код выхода 0 и сводка для корректного контента', async () => {
      await write('content/info/a.md', section('title: А\nslug: a'));
      const result = run();
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Контент в порядке: новостей 0, разделов 1.');
    });

    it('код выхода 1 и список ошибок с путём файла', async () => {
      await write('content/news/a.md', news('title: Без даты'));
      const result = run();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Найдено ошибок в контенте: 1');
      expect(result.stderr).toContain('content/news/a.md: нет даты');
      expect(result.stdout).not.toContain('::error');
    });

    it('в GitHub Actions печатает аннотации', async () => {
      await write('content/news/a.md', news('title: Без даты'));
      const result = run({ GITHUB_ACTIONS: 'true' });
      expect(result.stdout).toMatch(/^::error file=content\/news\/a\.md::нет даты/m);
    });
  });

  it('реальный контент репозитория проходит проверку', async () => {
    expect((await validateContent(PROJECT_ROOT)).errors).toEqual([]);
  });
});
