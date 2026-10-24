import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import '../../assets/styles.css';
import { getSection } from '../../content/loadSections.js';

// Один шаблон для всех разделов «Информации»: раздел ищется по адресу
// /info/:slug в content/info. Пункты: статья раскрывается по клику,
// документ и картинка открываются в новой вкладке, подзаголовок — текст.
function Section() {
  const { slug } = useParams();
  const section = getSection(slug);
  const [open, setOpen] = useState({});

  if (!section) {
    return (
      <section className="info-page container">
        <h1 className="info-title">Раздел не найден</h1>
        <div className="info-links">
          <h3><Link to="/info">Все разделы информации</Link></h3>
        </div>
      </section>
    );
  }

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="info-page container">
      <h1 className="info-title">{section.title}</h1>

      <div className="info-links">
        {section.items.map((item, index) => {
          const key = `${index}-${item.title}`;

          if (item.type === 'heading') {
            return <h3 style={{ color: '#2e2e2e' }} key={key}>{item.title}</h3>;
          }

          if (item.type === 'article') {
            return (
              <div key={key}>
                <h3 className="toggle-link" onClick={() => toggle(key)}>
                  {item.title} {open[key] ? '▲' : '▼'}
                </h3>
                {open[key] && (
                  <div
                    className="toggle-content"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(item.body ?? '', { breaks: true }),
                    }}
                  />
                )}
              </div>
            );
          }

          return (
            <h3 key={key}>
              <a
                href={item.type === 'document' ? item.file : item.image}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            </h3>
          );
        })}
      </div>
    </section>
  );
}

export default Section;
