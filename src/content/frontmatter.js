import { parse } from 'yaml';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?([\s\S]*)$/;

/**
 * Разбирает файл с YAML-frontmatter, который пишет Pages CMS.
 * Файл без frontmatter возвращается целиком как body с пустыми data.
 * Ошибка YAML пробрасывается — вызывающий решает, пропускать ли запись.
 *
 * @param {string} raw
 * @returns {{data: object, body: string}}
 */
export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER);
  if (!match) {
    return { data: {}, body: raw };
  }
  return { data: parse(match[1]) ?? {}, body: match[2] };
}
