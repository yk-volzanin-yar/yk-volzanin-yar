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
        <div className="logo-container">
          <img src="/logo_with_text.svg" alt="УК Волжанин" className="header-logo-img" />
          <div className="logo">
            Управляющая организация ООО «ВОЛЖАНИН»
          </div>
        </div>
        <nav className="main-nav">
          <Link to="/">Главная</Link>
          <Link to="/services">Работы и услуги</Link>
          <Link to="/about">О нас</Link>
          <Link to="/contacts">Контакты</Link>
          <div className="dropdown">
            <Link to="/info">Информация ▾</Link>
            <div className="dropdown-content">
              <Link to="/info/general">Общая информация</Link>
              <Link to="/info/reports">Отчетность в межотопительный период</Link>
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
