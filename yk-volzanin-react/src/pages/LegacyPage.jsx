import { useEffect } from 'react';
import '../assets/styles.css';

function LegacyPage() {
  useEffect(() => {
    // Динамическая дата в футере
    const currentYear = new Date().getFullYear();
    const yearSpan = document.getElementById("currentYear");
    if (yearSpan) {
      yearSpan.textContent = currentYear;
    }

    // Подключение Яндекс.Карты
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.type = "text/javascript";
    script.onload = () => {
      window.ymaps.ready(() => {
        const map = new window.ymaps.Map("map", {
          center: [57.652443, 39.948898],
          zoom: 17,
        });

        const placemark = new window.ymaps.Placemark([57.652443, 39.948898], {
          balloonContent: `
            <strong>Управляющая компания ВОЛЖАНИН</strong><br>
            Адрес: г. Ярославль, пр-кт Машиностроителей, д. 7
          `,
        });

        map.geoObjects.add(placemark);
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <header className="header">
        <div className="container header-flex">
          <div className="text-background">
            <h1 className="company-name">Управляющая компания ООО "УК"ВОЛЖАНИН"</h1>
            <p>
              <a href="/licens.jpg" target="_blank" className="license-text" rel="noopener noreferrer">
                Лицензия № 076-000336 действительна до 02.04.2030
              </a>
            </p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container main-grid">
          <div className="main-content">
            <section className="info">
              <h2>О нас:</h2>
              <p><strong>Юридический адрес:</strong> г. Ярославль, ул. Чайковского, д. 4, кор.2 , кв.18</p>
              <p><strong>Фактический адрес:</strong> г. Ярославль, пр-кт Машиностроителей, д. 7</p>
            </section>

            <section className="schedule">
              <h2>График работы:</h2>
              <ul className="schedule-list">
                <li>Пн - Чт: с 08:30 до 17:00</li>
                <li>Пт: с 08:30 до 16:00</li>
                <li>Сб, Вс: выходные дни</li>
              </ul>
            </section>

            <section className="contacts">
              <h2>Контакты для связи</h2>
              <div className="contacts-column">
                <p>Приемная: <a href="tel:203045" className="phone">20-30-45</a></p>
                <p>Телефон: <a href="tel:+79201260144" className="phone">+7 920 126 0144</a></p>
                <p>Аварийный номер: <a href="tel:+79038221585" className="emergency-number">+7 903 822 1585</a></p>
              </div>
            </section>
          </div>

          <div className="map-section">
            <h2>Мы на карте</h2>
            <div id="map" style={{ width: '100%', height: '400px' }}></div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-column">
            <h3>О компании</h3>
            <p><strong>Полное наименование:</strong> ООО "УК"ВОЛЖАНИН"</p>
            <p><strong>ИНН:</strong> 7604112535</p>
            <p><strong>КПП:</strong> 760401001</p>
            <p><strong>ОГРН:</strong> 1077604021989</p>
          </div>

          <div className="footer-column">
            <h3>Контакты</h3>
            <p>Телефон: <a href="tel:+79201260144" className="phone">+7 920 126 0144</a></p>
            <p>Городской номер: <a href="tel:203045" className="phone">20-30-45</a></p>
            <p>Аварийный номер: <a href="tel:+79038221585" className="emergency-number">+7 903 822 1585</a></p>
            <p>Директор: Сопин Александр Викторович</p>
          </div>

          <div className="footer-column">
            <h3>Адрес</h3>
            <p>г. Ярославль, пр-кт Машиностроителей, д. 7</p>
            <p className="footer-license">
              <a href="/licens.jpg" target="_blank" className="license-text" rel="noopener noreferrer">
                Лицензия № 076-000336 действительна до 02.04.2030
              </a>
            </p>
          </div>
        </div>
        <p className="footer-copyright">
          &copy; 2007 - <span id="currentYear"></span>. ООО "УК"ВОЛЖАНИН". Все права защищены.
        </p>
      </footer>
    </>
  );
}

export default LegacyPage;
