import { useEffect } from 'react';

function Footer() {
  useEffect(() => {
    const span = document.getElementById('currentYear');
    if (span) {
      span.textContent = new Date().getFullYear();
    }
  }, []);

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-column">
          <h3>О компании</h3>
          <p><strong>Полное наименование:</strong> ООО "УК ВОЛЖАНИН"</p>
          <p><strong>ИНН:</strong> 7604112535</p>
          <p><strong>КПП:</strong> 760401001</p>
          <p><strong>ОГРН:</strong> 1077604021989</p>
        </div>

        <div className="footer-column">
          <h3>Контакты</h3>
          <p>Телефон: <a href="tel:+79201260144">+7 920 126 0144</a></p>
          <p>Городской номер: <a href="tel:203045">20-30-45</a></p>
          <p>Аварийный номер: <a href="tel:+79038221585">+7 903 822 1585</a></p>
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
      <p className="footer-copy">&copy; 2007 - <span id="currentYear"></span>. ООО "УК ВОЛЖАНИН". Все права защищены.</p>
    </footer>
  );
}

export default Footer;
