import { useEffect, useState } from 'react';
import { marked } from 'marked';

const newsFiles = import.meta.glob('../news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

function NewsList() {
  const [displayedCount, setDisplayedCount] = useState(10);
  const [newsContent, setNewsContent] = useState([]);

  useEffect(() => {
    const allNews = Object.entries(newsFiles)
      .map(([path, rawText], index) => {
        const match = rawText.match(/_Дата:\s*(.+?)_/);
        const dateStr = match?.[1]?.trim() || '01 января 1970';

        const months = {
          января: 0, февраля: 1, марта: 2, апреля: 3, мая: 4, июня: 5,
          июля: 6, августа: 7, сентября: 8, октября: 9, ноября: 10, декабря: 11
        };

        const [day, monthName, year] = dateStr.split(' ');
        const date = new Date(year, months[monthName] ?? 0, day);

        return {
          id: path,
          html: marked.parse(rawText),
          date
        };
      })
      .sort((a, b) => b.date - a.date);

    setNewsContent(allNews.slice(0, displayedCount));
  }, [displayedCount]);

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + 10);
  };

  return (
    <section className="news-section">
      <h2>Новости</h2>
      {newsContent.length === 0 && <p>Загрузка новостей...</p>}
      {newsContent.map((item) => (
        <div key={item.id} className="news-item" dangerouslySetInnerHTML={{ __html: item.html }} />
      ))}
      {displayedCount < Object.keys(newsFiles).length && (
        <button onClick={handleShowMore} className="load-more-btn">Показать ещё</button>
      )}
    </section>
  );
}

export default NewsList;
