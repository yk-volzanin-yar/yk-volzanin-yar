import { useState } from 'react';
import { loadNews } from '../content/loadNews.js';

const PAGE_SIZE = 10;
const allNews = loadNews();

function NewsList() {
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <section className="news-section">
      <h2>Новости</h2>
      {allNews.length === 0 && <p>Новостей пока нет.</p>}
      {allNews.slice(0, displayedCount).map((item) => (
        <div key={item.id} className="news-item" dangerouslySetInnerHTML={{ __html: item.html }} />
      ))}
      {displayedCount < allNews.length && (
        <button onClick={handleShowMore} className="load-more-btn">Показать ещё</button>
      )}
    </section>
  );
}

export default NewsList;
