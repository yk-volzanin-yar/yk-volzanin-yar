import { useEffect, useRef } from 'react';

function YandexMap({ center = [57.652443, 39.948898], zoom = 17, id = 'map' }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById('yandexMapScript')) {
      const script = document.createElement('script');
      script.id = 'yandexMapScript';
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.type = 'text/javascript';
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (window.ymaps && mapRef.current && !mapRef.current.hasChildNodes()) {
        window.ymaps.ready(() => {
          const map = new window.ymaps.Map(id, { center, zoom });
          const placemark = new window.ymaps.Placemark(center, {
            balloonContent: `
              <strong>Управляющая компания ВОЛЖАНИН</strong><br>
              Адрес: г. Ярославль, пр-кт Машиностроителей, д. 7
            `,
          });
          map.geoObjects.add(placemark);
        });
      }
    }
  }, [center, zoom, id]);

  return (
    <div
      id={id}
      ref={mapRef}
      style={{ width: '100%', height: '400px', marginTop: '20px' }}
    />
  );
}

export default YandexMap;
