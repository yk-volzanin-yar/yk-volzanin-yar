import { parseFrontmatter } from './frontmatter.js';

const ITEM_TYPES = ['article', 'document', 'image', 'heading'];

/**
 * Разбирает файлы разделов «Информации» и сортирует по полю order
 * (без order — в конец, дальше по названию). Раздел без title или slug
 * и пункты неизвестного типа пропускаются с предупреждением.
 *
 * @param {Record<string, string>} files — путь → содержимое файла
 * @returns {Array<{slug: string, title: string, order: number, items: object[]}>}
 */
export function parseSections(files) {
  const sections = [];
  for (const [id, raw] of Object.entries(files)) {
    let data;
    try {
      ({ data } = parseFrontmatter(raw));
    } catch (error) {
      console.warn(`Раздел ${id} пропущен: ошибка в заголовке файла (${error.message})`);
      continue;
    }
    if (!data.title || !data.slug) {
      console.warn(`Раздел ${id} пропущен: нет названия или адреса (slug)`);
      continue;
    }
    const items = (Array.isArray(data.items) ? data.items : []).filter((item) => {
      const known = item && ITEM_TYPES.includes(item.type) && item.title;
      if (!known) {
        console.warn(`Раздел ${data.slug}: пропущен пункт без заголовка или неизвестного типа`);
      }
      return known;
    });
    sections.push({
      slug: String(data.slug),
      title: String(data.title),
      order: Number.isFinite(data.order) ? data.order : Number.POSITIVE_INFINITY,
      items,
    });
  }
  return sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'));
}

const sectionFiles = import.meta.glob('/content/info/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Все разделы «Информации» из content/info в порядке меню. */
export function loadSections() {
  return parseSections(sectionFiles);
}

/** Раздел по адресу из ссылки или undefined. */
export function getSection(slug) {
  return loadSections().find((section) => section.slug === slug);
}
