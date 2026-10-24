import { Link } from 'react-router-dom';
import '../assets/styles.css';
import { loadSections } from '../content/loadSections.js';

const sections = loadSections();

function Info() {
  return (
    <section className="info-page">
      <h1 className="info-title">Раскрытие информации</h1>
      <div className="info-links">
        {sections.map((section) => (
          <h3 key={section.slug}><Link to={`/info/${section.slug}`}>{section.title}</Link></h3>
        ))}
      </div>
    </section>
  );
}

export default Info;
