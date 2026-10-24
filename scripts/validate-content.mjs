// Проверка контента перед сборкой (пункт 9 плана docs/plans/editor-content-management.md).
// Читает content/news/*.md и content/info/*.md, проверяет обязательные поля
// и наличие в public/ файлов, на которые ссылается контент.
//
// Запускается шагом CI до npm run build и вручную: npm run validate-content
// Код выхода 1, если найдена хотя бы одна ошибка: сборка останавливается,
// на сайте остаётся прошлая версия.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseFrontmatter } from '../src/content/frontmatter.js';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLUG = /^[a-z0-9-]+$/;
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

/** Поля с файлом, обязательные для каждого типа пункта раздела. */
const FILE_FIELDS_BY_TYPE = {
  article: [],
  document: ['file'],
  image: ['image'],
  heading: [],
};

function isValidIsoDate(value) {
  const match = typeof value === 'string' && value.match(ISO_DATE);
  if (!match) {
    return false;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

async function listMarkdown(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  return (await readdir(dir)).filter((name) => name.endsWith('.md')).sort();
}

/**
 * Проверяет весь контент проекта.
 *
 * @param {string} root — корень проекта (папка с content/ и public/)
 * @returns {Promise<{errors: Array<{file: string, message: string}>, news: number, sections: number}>}
 */
export async function validateContent(root) {
  const errors = [];

  const checkFile = (file, ref, where) => {
    if (typeof ref !== 'string' || ref.trim() === '') {
      errors.push({ file, message: `${where}: пустой путь к файлу` });
      return;
    }
    if (EXTERNAL.test(ref)) {
      return;
    }
    if (!ref.startsWith('/')) {
      errors.push({ file, message: `${where}: путь «${ref}» должен начинаться с /` });
      return;
    }
    let decoded = ref.split(/[?#]/)[0];
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      // путь с битой %-последовательностью проверяем как есть
    }
    if (!existsSync(path.join(root, 'public', decoded))) {
      errors.push({ file, message: `${where}: файл ${ref} не найден (ожидался public${decoded})` });
    }
  };

  const checkMarkdownImages = (file, markdown, where) => {
    if (typeof markdown !== 'string') {
      return;
    }
    for (const [, ref] of markdown.matchAll(MARKDOWN_IMAGE)) {
      checkFile(file, ref, `${where}: картинка в тексте`);
    }
  };

  const readEntry = async (file) => {
    let parsed;
    try {
      parsed = parseFrontmatter(await readFile(path.join(root, file), 'utf8'));
    } catch (error) {
      errors.push({ file, message: `ошибка в заголовке файла (YAML): ${error.message.split('\n')[0]}` });
      return null;
    }
    if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
      errors.push({ file, message: 'заголовок файла должен быть набором полей (title, …)' });
      return null;
    }
    return parsed;
  };

  const newsFiles = await listMarkdown(path.join(root, 'content/news'));
  for (const name of newsFiles) {
    const file = `content/news/${name}`;
    const entry = await readEntry(file);
    if (!entry) {
      continue;
    }
    const { data, body } = entry;
    if (isBlank(data.title)) {
      errors.push({ file, message: 'нет заголовка (title)' });
    }
    if (!isValidIsoDate(data.date)) {
      errors.push({ file, message: `нет даты или дата некорректна (date: ${JSON.stringify(data.date ?? null)}), нужен вид 2025-07-09` });
    }
    if (data.images !== undefined && data.images !== null) {
      if (Array.isArray(data.images)) {
        data.images.forEach((ref, index) => checkFile(file, ref, `фотография ${index + 1}`));
      } else {
        errors.push({ file, message: 'поле images должно быть списком' });
      }
    }
    checkMarkdownImages(file, body, 'текст новости');
  }

  const sectionFiles = await listMarkdown(path.join(root, 'content/info'));
  const slugOwners = new Map();
  for (const name of sectionFiles) {
    const file = `content/info/${name}`;
    const entry = await readEntry(file);
    if (!entry) {
      continue;
    }
    const { data } = entry;
    if (isBlank(data.title)) {
      errors.push({ file, message: 'нет названия раздела (title)' });
    }
    if (isBlank(data.slug)) {
      errors.push({ file, message: 'нет адреса раздела (slug)' });
    } else if (!SLUG.test(String(data.slug))) {
      errors.push({ file, message: `адрес «${data.slug}»: только маленькие латинские буквы, цифры и дефис` });
    } else if (slugOwners.has(data.slug)) {
      errors.push({ file, message: `адрес «${data.slug}» уже занят разделом ${slugOwners.get(data.slug)}` });
    } else {
      slugOwners.set(data.slug, file);
    }
    if (data.order !== undefined && data.order !== null && !Number.isFinite(data.order)) {
      errors.push({ file, message: `порядок в меню (order) должен быть числом, сейчас ${JSON.stringify(data.order)}` });
    }

    if (data.items === undefined || data.items === null) {
      continue;
    }
    if (!Array.isArray(data.items)) {
      errors.push({ file, message: 'поле items должно быть списком пунктов' });
      continue;
    }
    data.items.forEach((item, index) => {
      const number = index + 1;
      if (!item || typeof item !== 'object') {
        errors.push({ file, message: `пункт ${number}: пустой пункт` });
        return;
      }
      if (!Object.hasOwn(FILE_FIELDS_BY_TYPE, item.type)) {
        errors.push({ file, message: `пункт ${number}: неизвестный тип «${item.type}»` });
        return;
      }
      if (isBlank(item.title)) {
        errors.push({ file, message: `пункт ${number} (${item.type}): нет заголовка` });
      }
      const where = `пункт ${number}${isBlank(item.title) ? '' : ` «${item.title}»`}`;
      for (const field of FILE_FIELDS_BY_TYPE[item.type]) {
        if (isBlank(item[field])) {
          errors.push({ file, message: `${where}: не выбран файл (${field})` });
        } else {
          checkFile(file, item[field], where);
        }
      }
      if (item.type === 'article') {
        checkMarkdownImages(file, item.body, where);
      }
    });
  }

  return { errors, news: newsFiles.length, sections: sectionFiles.length };
}

// Аннотация GitHub Actions: ошибка видна на странице прогона, а не только в логе.
function annotation({ file, message }) {
  const escape = (text) => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  return `::error file=${escape(file)}::${escape(message)}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { errors, news, sections } = await validateContent(process.cwd());
  if (errors.length > 0) {
    console.error(`Найдено ошибок в контенте: ${errors.length}. Сайт не обновится, пока их не исправят.`);
    for (const error of errors) {
      console.error(`  - ${error.file}: ${error.message}`);
      if (process.env.GITHUB_ACTIONS === 'true') {
        console.log(annotation(error));
      }
    }
    process.exit(1);
  }
  console.log(`Контент в порядке: новостей ${news}, разделов ${sections}.`);
}
