import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles.css';

function Header() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenLicense = () => {
    if (window.innerWidth <= 768) {
      window.open('/licens.jpg', '_blank');
    } else {
      setShowModal(true);
    }
  };

  return (
    <header className="site-header">
      <div className="nav-wrapper">
        <div className="logo">Управляющая организация ООО «ВОЛЖАНИН»</div>
        <nav className="main-nav">
          <Link to="/">Главная</Link>
          <Link to="/about">О нас</Link>
          <Link to="/contacts">Контакты</Link>
          <div className="dropdown">
            <span>Информация ▾</span>
            <div className="dropdown-content">
              <Link to="/info/reports">Отчетность</Link>
              <Link to="/info/mkd">Общие сведения по МКД</Link>
              <Link to="/info/meetings">Общие собрания</Link>
            </div>
          </div>
          <button onClick={handleOpenLicense} className="license-button">Лицензия</button>
        </nav>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src="/licens.jpg" alt="Лицензия" />
            <button className="close-btn" onClick={() => setShowModal(false)}>Закрыть</button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
