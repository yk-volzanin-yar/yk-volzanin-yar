import { useEffect, useRef } from 'react';

function YandexMap({ center = [57.652443, 39.948898], zoom = 17, id = 'map' }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadYandexMapScript = () => {
      return new Promise((resolve) => {
        if (window.ymaps) {
          resolve();
        } else {
          const existingScript = document.getElementById('yandexMapScript');
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'yandexMapScript';
            script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
            script.onload = () => resolve();
            document.body.appendChild(script);
          } else {
            existingScript.addEventListener('load', resolve);
          }
        }
      });
    };

    const initMap = () => {
      if (!isMounted || !window.ymaps || !mapRef.current) return;

      window.ymaps.ready(() => {
        if (!isMounted || mapInstance.current) return;

        mapRef.current.innerHTML = '';

        mapInstance.current = new window.ymaps.Map(mapRef.current, {
          center,
          zoom,
        });

        const placemark = new window.ymaps.Placemark(center, {
          balloonContent: `
            <strong>Управляющая компания ВОЛЖАНИН</strong><br>
            Адрес: г. Ярославль, пр-кт Машиностроителей, д. 7
          `,
        });

        mapInstance.current.geoObjects.add(placemark);
      });
    };

    loadYandexMapScript().then(initMap);

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
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
