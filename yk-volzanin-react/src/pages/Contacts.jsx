import YandexMap from '../components/YandexMap';

function Contacts() {
  return (
    <section className="contacts-layout">
      <div className="contacts-info">
        <h2>Контакты</h2>
        <p>Приемная: <a href="tel:203045">20-30-45</a></p>
        <p>Телефон: <a href="tel:+79201260144">+7 920 126 0144</a></p>
        <p>Аварийный номер: <a href="tel:+79038221585">+7 903 822 1585</a></p>
        <p>Директор: Сопин Александр Викторович</p>

        <h3>Адрес</h3>
        <p>г. Ярославль, пр-кт Машиностроителей, д. 7</p>
      </div>

      <div className="contacts-map">
        <h2>Мы на карте</h2>
        <YandexMap id="contacts-map" />
      </div>
    </section>
  );
}

export default Contacts;
