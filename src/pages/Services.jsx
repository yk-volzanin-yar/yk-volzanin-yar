import '../assets/styles.css';
import ServiceImage from '../assets/services.png';

export default function Services() {
  return (
    <main className="services-page container">
      <h1 className="services-title">Работы и услуги</h1>

      <div className="services-row">
        <aside className="services-left">
          <img
            src={ServiceImage}
            alt="Работы и услуги"
            className="services-main-image"
          />
        </aside>

        <section className="services-right">
          <h2>Платные услуги</h2>
          <p className="services-phones">
            <strong><a href="tel:203045">20-30-45</a>, <a href="tel:+79038221585">+7 (903) 822-15-85</a></strong>
          </p>

          <p>
            <strong>Быстро, качественно и с гарантией выполним работы и услуги в вашей квартире:</strong>
          </p>

          <h3>Сантехнические</h3>
          <ul>
            <li>Установка трубопроводов водоснабжения и отопления</li>
            <li>Радиаторов, ванн, унитазов</li>
            <li>Монтаж приборов учета, поверка счетчиков воды</li>
          </ul>

          <p><strong>Выдаем полный пакет документов</strong></p>
        </section>
      </div>
    </main>
  );
}
