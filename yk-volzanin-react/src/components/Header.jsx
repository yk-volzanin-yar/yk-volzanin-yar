import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles.css';

function Header() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="nav-wrapper">
          <div className="logo">Управляющая компания ООО «УК ВОЛЖАНИН»</div>
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
            <button
              className="license-button"
              onClick={() => setShowModal(true)}
            >
              Лицензия
            </button>
          </nav>
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src="/licens.jpg" alt="Лицензия" style={{ maxWidth: '100%' }} />
            <button onClick={() => setShowModal(false)} className="close-btn">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
