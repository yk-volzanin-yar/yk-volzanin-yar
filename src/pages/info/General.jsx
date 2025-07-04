import { useState } from 'react';
import '../../assets/styles.css';

const txtFiles = import.meta.glob('/src/general/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const assetFiles = import.meta.glob('/src/general/*.{pdf,png,jpg,jpeg}', {
  query: '?url',
  import: 'default',
  eager: true,
});

function GeneralInfo() {
  const [open, setOpen] = useState({});

  const toggle = (fileName) => {
    setOpen((prev) => ({
      ...prev,
      [fileName]: !prev[fileName],
    }));
  };

  const txtList = Object.entries(txtFiles).map(([path, content]) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return {
      fileName,
      displayName: decodeURIComponent(fileName.replace(/\.[^/.]+$/, '')),
      rawContent: content,
    };
  });

  const assetList = Object.entries(assetFiles).map(([path, url]) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return {
      fileName,
      displayName: decodeURIComponent(fileName.replace(/\.[^/.]+$/, '')),
      url,
    };
  });

  return (
    <section className="info-page container">
      <h1 className="info-title">Общая информация</h1>

      <div className="info-links">
        {txtList.map((file) => (
          <div key={file.fileName}>
            <h3 className="toggle-link" onClick={() => toggle(file.fileName)}>
              {file.displayName} {open[file.fileName] ? '▲' : '▼'}
            </h3>
            {open[file.fileName] && (
              <div className="toggle-content">
                <pre>{file.rawContent}</pre>
              </div>
            )}
          </div>
        ))}

        {assetList.map((file) => (
          <h3 key={file.fileName}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.displayName}
            </a>
          </h3>
        ))}
      </div>
    </section>
  );
}

export default GeneralInfo;
