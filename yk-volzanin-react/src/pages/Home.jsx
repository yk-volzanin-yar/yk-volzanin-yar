import { useState } from 'react';
import NewsList from '../components/NewsList';

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const handleOpenImage = (src) => {
    setActiveImage(src);
    setShowModal(true);
  };

  return (
    <div className="home-layout">
      <div className="main-grid">
        <div className="main-content">
          <NewsList />
        </div>
        <aside className="sidebar">
          <div className="emergency-box">
            <h3>Единый диспетчерский центр</h3>
            <p>
              <strong>Телефон:</strong>{' '}
              <a href="tel:+74852304500">(4852) 30-45-00</a>
            </p>
          </div>

          <div
            className="placeholder-img"
            onClick={() => handleOpenImage('/cheaters.jpg')}
          >
            <img
              src="/cheaters.jpg"
              alt="Мошенники"
              className="reminder-img"
            />
          </div>

          <div
            className="placeholder-img"
            onClick={() => handleOpenImage('/fire.jpg')}
          >
            <img
              src="/fire.jpg"
              alt="Действия при пожаре"
              className="reminder-img"
            />
          </div>
        </aside>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} alt="Памятка" />
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
