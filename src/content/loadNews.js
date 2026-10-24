import { marked } from 'marked';
import { parseFrontmatter } from './frontmatter.js';

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Переводит значение поля date в Date (полночь по местному времени).
 * Принимает строку «2025-07-09» или Date. Некорректное значение → null.
 */
export function toDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const match = typeof value === 'string' && value.trim().match(ISO_DATE);
  if (!match) {
    return null;
  }
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** «9 июля 2025» — как дата выглядела на сайте до миграции. */
export function formatRussianDate(date) {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Разбирает файлы новостей и сортирует их от новых к старым.
 * Запись без заголовка, с некорректной датой или битым YAML пропускается
 * с предупреждением в консоли — остальная лента рендерится.
 *
 * @param {Record<string, string>} files — путь → содержимое файла
 * @returns {Array<{id: string, title: string, date: Date, html: string, images: string[]}>}
 */
export function parseNews(files) {
  const news = [];
  for (const [id, raw] of Object.entries(files)) {
    let parsed;
    try {
      parsed = parseFrontmatter(raw);
    } catch (error) {
      console.warn(`Новость ${id} пропущена: ошибка в заголовке файла (${error.message})`);
      continue;
    }
    const { data, body } = parsed;
    const date = toDate(data.date);
    if (!data.title || !date) {
      console.warn(`Новость ${id} пропущена: нет заголовка или корректной даты`);
      continue;
    }
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
    const imagesHtml = images
      .map((src) => `<p><img src="${escapeHtml(src)}" alt="${escapeHtml(data.title)}"></p>`)
      .join('');

    news.push({
      id,
      title: String(data.title),
      date,
      images,
      html:
        `<h3>${escapeHtml(data.title)}</h3>` +
        marked.parse(body, { breaks: true }) +
        imagesHtml +
        `<p><em>Дата: ${formatRussianDate(date)}</em></p>`,
    });
  }
  return news.sort((a, b) => b.date - a.date || a.id.localeCompare(b.id));
}

const newsFiles = import.meta.glob('/content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Все новости сайта из content/news, от новых к старым. */
export function loadNews() {
  return parseNews(newsFiles);
}
