import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles.css';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleOpenLicense = () => {
    if (window.innerWidth <= 768) {
      window.open('/licens.jpg', '_blank');
    } else {
      setShowModal(true);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          console.log('Autoplay was prevented by the browser.');
        });
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        console.log('Autoplay was prevented by the browser.');
      });
    }
  }, []);

  return (
    <header className="site-header">
      <div className="nav-wrapper">
        <div className="logo-container">
          <img src="/logo.svg" alt="УК Волжанин" className="header-logo-img" />
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
              <Link to="/info/reports">Регламентные мероприятия готовности МКД к отопительному периоду</Link>
              <Link to="/info/ventilation">Проверка вентиляции в МКД</Link>
            </div>
          </div>
          <button onClick={handleOpenLicense} className="license-button">Лицензия</button>
          <Link to="/projects">Проекты</Link>
          <Link to="/vacancies">Вакансии</Link>
          <a
            href="https://dom.gosuslugi.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="external-link"
          >
            ГИС ЖКХ ⤴
          </a>
        </nav>
      </div>

      <button onClick={toggleMusic} className="music-toggle">
        {isPlaying ? '🔊' : '🔈'}
      </button>

      <audio ref={audioRef} src="/music.mp3" loop />

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