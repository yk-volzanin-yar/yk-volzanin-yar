import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from './frontmatter.js';

describe('parseFrontmatter', () => {
  it('разбирает кириллицу, списки и многострочный текст', () => {
    const raw = [
      '---',
      'title: Общая информация',
      'items:',
      '  - type: article',
      '    title: Грубость в чате',
      '    body: |+',
      '      Строка  ',
      '      вторая',
      '',
      '',
      '---',
      'Текст после',
      '',
    ].join('\n');
    const { data, body } = parseFrontmatter(raw);
    expect(data.title).toBe('Общая информация');
    expect(data.items[0]).toMatchObject({ type: 'article', title: 'Грубость в чате' });
    expect(data.items[0].body).toBe('Строка  \nвторая\n\n');
    expect(body).toBe('Текст после\n');
  });

  it('понимает CRLF-переводы строк', () => {
    const { data, body } = parseFrontmatter('---\r\ntitle: Т\r\n---\r\nтело');
    expect(data).toEqual({ title: 'Т' });
    expect(body).toBe('тело');
  });

  it('пустой frontmatter даёт пустые data', () => {
    expect(parseFrontmatter('---\n---\nтело')).toEqual({ data: {}, body: 'тело' });
  });

  it('файл без frontmatter возвращается целиком как body', () => {
    expect(parseFrontmatter('### Старая новость')).toEqual({ data: {}, body: '### Старая новость' });
  });

  it('пробрасывает ошибку битого YAML', () => {
    expect(() => parseFrontmatter('---\ntitle: [не закрыто\n---\n')).toThrow();
  });
});
