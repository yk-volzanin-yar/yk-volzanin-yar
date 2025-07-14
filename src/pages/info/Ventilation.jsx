import { useState } from 'react';
import { marked } from 'marked';
import '../../assets/styles.css';
import { fileMap } from '../../maps/ventilationMap.js';

marked.setOptions({ breaks: true });

function VentilationInfo() {
  const [open, setOpen] = useState({});
  const [texts, setTexts] = useState({});

  const toggle = async (title, fileName) => {
    if (open[title]) {
      setOpen((prev) => ({ ...prev, [title]: false }));
      return;
    }

    if (fileName.endsWith('.txt') && !texts[fileName]) {
      const res = await fetch(`/ventilation/${fileName}`);
      const raw = await res.text();
      setTexts((prev) => ({ ...prev, [fileName]: raw }));
    }

    setOpen((prev) => ({ ...prev, [title]: true }));
  };

  return (
    <section className="info-page container">
      <h1 className="info-title">Проверка вентиляции в МКД</h1>

      <div className="info-links">
        {fileMap.map(([title, fileName]) => (
          fileName.endsWith('.txt') ? (
            <div key={fileName}>
              <h3 className="toggle-link" onClick={() => toggle(title, fileName)}>
                {title} {open[title] ? '▲' : '▼'}
              </h3>
              {open[title] && (
                <div
                  className="toggle-content"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(texts[fileName] || ''),
                  }}
                />
              )}
            </div>
          ) : (
            <h3 key={fileName}>
              <a
                href={`/ventilation/${fileName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
              </a>
            </h3>
          )
        ))}
      </div>
    </section>
  );
}

export default VentilationInfo;