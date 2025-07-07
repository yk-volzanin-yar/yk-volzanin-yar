import { Link } from 'react-router-dom';
import '../assets/styles.css';

function Info() {
  return (
    <section className="info-page">
      <h1 className="info-title">Раскрытие информации</h1>
      <div className="info-links">
        <h3><Link to="/info/general">Общая информация</Link></h3>
        <h3><Link to="/info/reports">Отчетная деятельность компании</Link></h3>
        <h3><Link to="/info/mkd">Общие сведения по МКД</Link></h3>
        <h3><Link to="/info/meetings">Общие собрания</Link></h3>
      </div>
    </section>
  );
}

export default Info;
