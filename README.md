# 🌐 ООО "ВОЛЖАНИН" — Frontend проект

**Сайт:** [ук-волжанин-яр.рф](https://ук-волжанин-яр.рф)

---

## 🚀 Быстрый старт

### Разработка

1. Установите зависимости:
   ```sh
   npm install
   ```
2. Запустите проект в режиме разработки:
   ```sh
   npm run dev
   ```

---

### Деплой

Сайт публикуется автоматически. Любое изменение в ветке `dev`, в том числе
сделанное через веб-интерфейс GitHub, запускает workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Он собирает
проект и выкладывает его на GitHub Pages. Через 1–3 минуты изменения появляются на сайте.

- Ход сборки виден на вкладке **Actions** репозитория.
- Перезапустить публикацию вручную: **Actions → Deploy → Run workflow**.
- Если сборка упала, на сайте остаётся прошлая версия, а GitHub присылает
  письмо автору изменения.

Однократная настройка (делает владелец репозитория):
**Settings → Pages → Build and deployment → Source: GitHub Actions**.
Потом проверить, что в **Custom domain** остался `ук-волжанин-яр.рф`.

Аварийный ручной деплой с компьютера (публикует в ветку `gh-pages`,
работает, только если в Pages источником выбрана эта ветка):
```sh
npm run deploy
```
## Для красивого оформления текста в новостях или в общей информации можно попросить deepseek помочь отформатировать текст

https://chat.deepseek.com/

перед тем,как работать с текстом ему нужно обьяснить задачу
Например:
`Ты рабоатешь с текстовым форматом .md , .txt (или другие по аналогии). Тебе нужно отформатировать мой введенный текст так, чтобы было красиво.`

Дальше вводишь свой текст и он тебе его форматирует под нужный формат

результат можно посмотреть сразу в окне создания файла в github в разделе `предпросмотр`


## Контент: новости и разделы «Информации»

Контент хранится в файлах Markdown с YAML-заголовком. Их пишет Pages CMS,
но можно править и руками на github.com.

- `content/news/<дата>-<имя>.md` — новость. Поля: `title`, `date` (`2025-07-09`),
  `images` (необязательно, список путей), дальше текст новости.
- `content/info/<раздел>.md` — раздел «Информации». Поля: `title`, `slug`
  (адрес `/info/<slug>`, латиница), `order` (место в меню), `items` — пункты:
  - `article` — `title`, `body` (текст Markdown, раскрывается по клику);
  - `document` — `title`, `file` (путь к PDF);
  - `image` — `title`, `image` (путь к картинке);
  - `heading` — `title` (подзаголовок без ссылки).
- Новые загрузки — в `public/uploads/`. Старые файлы остаются по прежним
  путям (`public/general/`, `public/news_images/`), чтобы не ломать ссылки.

Новый раздел появляется в меню «Информация» сам, код менять не нужно.
Пример раздела:

```yaml
---
title: Общие сведения по МКД
slug: mkd
order: 4
items:
  - type: document
    title: Договор управления
    file: /uploads/dogovor.pdf
---
```

---
## 🏷 Gitflow

1. Главная ветка для разработки — `dev`
2. Для новой задачи создаем отдельную ветку от `dev`:
   ```
   feature-{номер issue}-{краткое описание}
   ```
   Пример:  
   `feature-1-сделать_каркас_приложения_на_реакт`
3. После завершения задачи оформляем Pull Request в `dev`
4. При необходимости релиза:
    - Мержим `dev` в `main`
    - Проставляем git-тег и оформляем Release

---

## ✅ Передача прав другому владельцу

- [Yandex Business — подтверждение организации и управление в Яндекс.Справочнике](https://yandex.ru/sprav/133467149255/p/edit/main)
- [REG.RU — доступ к домену](https://www.reg.ru/user/account/#/card/108401733/nss/)
- [Яндекс Вебмастер — управление сайтом в поиске Яндекса](https://webmaster.yandex.ru/site/http:%D1%83%D0%BA-%D0%B2%D0%BE%D0%BB%D0%B6%D0%B0%D0%BD%D0%B8%D0%BD-%D1%8F%D1%80.%D1%80%D1%84:80/settings/access/)

---

## 📈 SEO

- [Яндекс Вебмастер](https://webmaster.yandex.ru/site/http:%D1%83%D0%BA-%D0%B2%D0%BE%D0%BB%D0%B6%D0%B0%D0%BD%D0%B8%D0%BD-%D1%8F%D1%80.%D1%80%D1%84:80/settings/access/)
- [Google Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Axn-----7kchunjkubf5a1a3p.xn--p1ai)

---

## 🛠 Инструменты

- [DNS Checker](https://dnschecker.org/#A/xn-----7kchunjkubf5a1a3p.xn--p1ai)
- [PageSpeed Insights (Mobile)](https://pagespeed.web.dev/analysis/https-xn-----7kchunjkubf5a1a3p-xn--p1ai/mr6gmhnrms?hl=ru&form_factor=mobile)

---

## 🗺 Карты

- [2GIS](https://2gis.ru/yaroslavl/geo/3941285329113096/39.949346%2C57.652384/tab/inside?m=39.949488%2C57.651631%2F17.59)
- [Яндекс Карты](https://yandex.ru/maps/16/yaroslavl/house/prospekt_mashinostroiteley_7/Z0AYfwNoQUwPQFttfXp0c3hnZw==/?ll=39.951111%2C57.651526&z=17.01)