import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseNews, toDate, formatRussianDate, loadNews } from './loadNews.js';

const file = (title, date, body = 'Текст.', extra = '') =>
  `---\ntitle: ${title}\ndate: ${date}\n${extra}---\n${body}\n`;

describe('loadNews', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('toDate', () => {
    it('строка ISO даёт локальную полночь', () => {
      const date = toDate('2025-07-09');
      expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2025, 6, 9, 0]);
    });

    it.each(['2025-02-30', '09.07.2025', '', undefined, 42])('некорректное значение %j даёт null', (value) => {
      expect(toDate(value)).toBeNull();
    });

    it('принимает объект Date', () => {
      const date = new Date(2026, 9, 24);
      expect(toDate(date)).toBe(date);
    });
  });

  describe('formatRussianDate', () => {
    it.each([
      [new Date(2025, 6, 9), '9 июля 2025'],
      [new Date(2025, 0, 1), '1 января 2025'],
      [new Date(2026, 11, 31), '31 декабря 2026'],
    ])('%s → %s', (date, expected) => {
      expect(formatRussianDate(date)).toBe(expected);
    });
  });

  describe('parseNews', () => {
    it('сортирует от новых к старым', () => {
      const news = parseNews({
        a: file('Старая', '2025-06-22'),
        b: file('Новая', '2025-07-09'),
        c: file('Средняя', '2025-07-07'),
      });
      expect(news.map((item) => item.title)).toEqual(['Новая', 'Средняя', 'Старая']);
    });

    it('при одинаковой дате порядок стабилен по имени файла', () => {
      const news = parseNews({ b: file('Б', '2025-07-09'), a: file('А', '2025-07-09') });
      expect(news.map((item) => item.id)).toEqual(['a', 'b']);
    });

    it('собирает HTML: заголовок, текст с переносами, дата в прежнем виде', () => {
      const [item] = parseNews({ a: file('Тарифы ЖКХ', '2025-07-09', 'Москва 15%\nПермь 21%') });
      expect(item.html).toContain('<h3>Тарифы ЖКХ</h3>');
      expect(item.html).toContain('Москва 15%<br>Пермь 21%');
      expect(item.html).toContain('<em>Дата: 9 июля 2025</em>');
    });

    it('выводит фотографии из поля images после текста', () => {
      const [item] = parseNews({
        a: file('Праздник', '2025-06-22', 'Текст.', 'images:\n  - /uploads/foto.jpg\n'),
      });
      expect(item.images).toEqual(['/uploads/foto.jpg']);
      expect(item.html).toMatch(/Текст\.[\s\S]*<img src="\/uploads\/foto\.jpg" alt="Праздник">/);
    });

    it('экранирует HTML в заголовке', () => {
      const [item] = parseNews({ a: file(`'"<b>" & Ко'`, '2025-07-09') });
      expect(item.html).toContain('<h3>&quot;&lt;b&gt;&quot; &amp; Ко</h3>');
    });

    it('пропускает запись без даты, с битой датой, без заголовка и с битым YAML', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const news = parseNews({
        ok: file('Хорошая', '2025-07-09'),
        noDate: '---\ntitle: Без даты\n---\nТекст',
        badDate: file('Битая дата', '2025-13-01'),
        noTitle: '---\ndate: 2025-07-09\n---\nТекст',
        badYaml: '---\ntitle: [\n---\n',
      });
      expect(news.map((item) => item.id)).toEqual(['ok']);
      expect(warn).toHaveBeenCalledTimes(4);
    });

    it('пустой вход даёт пустую ленту', () => {
      expect(parseNews({})).toEqual([]);
    });
  });

  describe('loadNews', () => {
    it('читает реальные файлы content/news', () => {
      const news = loadNews();
      expect(news.length).toBeGreaterThanOrEqual(3);
      expect(news.every((item) => item.date instanceof Date && item.title)).toBe(true);
    });
  });
});
