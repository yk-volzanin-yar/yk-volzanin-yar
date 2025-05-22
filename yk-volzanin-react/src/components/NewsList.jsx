const newsItems = [
  {
    id: 1,
    date: '22 мая 2025',
    title: 'Профилактические работы в районе Заволга',
    text: 'Уведомляем о плановых работах по обслуживанию теплосетей с временным отключением горячей воды.'
  },
  {
    id: 2,
    date: '22 мая 2025',
    title: 'Профилактические работы в районе Заволга',
    text: 'Уведомляем о плановых работах по обслуживанию теплосетей с временным отключением горячей воды.'
  },
];

function NewsList() {
  return (
    <section className="news-section">
      <h2>Новости</h2>
      {newsItems.map(item => (
        <div key={item.id} className="news-item">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <div className="news-divider"></div>
          <p className="news-date">{item.date}</p>
        </div>
      ))}
    </section>
  );
}

export default NewsList;
