import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseSections, loadSections, getSection } from './loadSections.js';

const section = (slug, title, order, items = '[]') =>
  `---\ntitle: ${title}\nslug: ${slug}\n${order === undefined ? '' : `order: ${order}\n`}items: ${items}\n---\n`;

describe('loadSections', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('parseSections', () => {
    it('сортирует по order, разделы без order — в конец по названию', () => {
      const sections = parseSections({
        a: section('b', 'Второй', 2),
        b: section('z', 'Яблоко'),
        c: section('a', 'Первый', 1),
        d: section('y', 'Арбуз'),
      });
      expect(sections.map((s) => s.slug)).toEqual(['a', 'b', 'y', 'z']);
    });

    it('сохраняет пункты всех четырёх типов в исходном порядке', () => {
      const items = `
  - { type: document, title: Тариф, file: /general/t.pdf }
  - { type: article, title: Чат, body: Не грубите }
  - { type: heading, title: Дома }
  - { type: image, title: Газ, image: /general/gas.png }`;
      const [result] = parseSections({ a: section('general', 'Общая', 1, items) });
      expect(result.items.map((item) => item.type)).toEqual(['document', 'article', 'heading', 'image']);
    });

    it('пропускает пункты неизвестного типа и без заголовка', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const items = `
  - { type: video, title: Ролик }
  - { type: heading }
  - { type: heading, title: Ок }`;
      const [result] = parseSections({ a: section('mkd', 'МКД', 1, items) });
      expect(result.items).toEqual([{ type: 'heading', title: 'Ок' }]);
      expect(warn).toHaveBeenCalledTimes(2);
    });

    it('пропускает раздел без slug или title и с битым YAML', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const sections = parseSections({
        ok: section('ok', 'Хороший', 1),
        noSlug: '---\ntitle: Без адреса\n---\n',
        noTitle: '---\nslug: x\n---\n',
        badYaml: '---\ntitle: [\n---\n',
      });
      expect(sections.map((s) => s.slug)).toEqual(['ok']);
      expect(warn).toHaveBeenCalledTimes(3);
    });

    it('раздел без items даёт пустой список пунктов', () => {
      const [result] = parseSections({ a: '---\ntitle: Пустой\nslug: empty\n---\n' });
      expect(result.items).toEqual([]);
    });
  });

  describe('реальные файлы content/info', () => {
    it('шесть разделов в порядке меню сайта', () => {
      expect(loadSections().map((s) => s.slug)).toEqual(
        expect.arrayContaining(['general', 'reports', 'ventilation', 'mkd', 'company', 'meetings']),
      );
      expect(loadSections()[0].slug).toBe('general');
    });

    it('getSection находит раздел по slug и возвращает undefined для неизвестного', () => {
      expect(getSection('mkd').items.every((item) => item.type === 'heading')).toBe(true);
      expect(getSection('net-takogo')).toBeUndefined();
    });
  });
});
