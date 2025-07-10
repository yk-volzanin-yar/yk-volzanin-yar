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
            <strong><a href="tel:988632">98-86-32</a>, <a href="tel:+79611622437">+7 (961) 162-24-37</a></strong>
          </p>

          <p>
            <strong>Быстро, качественно и с гарантией&nbsp;выполним работы и услуги в вашей квартире:</strong>
          </p>

          <h3>Сантехнические</h3>
          <ul>
            <li>Установка трубопроводов водоснабжения и отопления</li>
            <li>Радиаторов, ванн, унитазов</li>
            <li>Монтаж приборов учета, поверка счетчиков воды</li>
          </ul>

          <p><strong>Выдаем полный пакет документов</strong></p>

          <h3><strong>Скидка для пенсионеров – 10%</strong></h3>

          <h4><em>Выполняем работы, не требующие свидетельства СРО о допуске</em></h4>
        </section>
      </div>
    </main>
  );
}
