# 7. Как устроен сайт

Сайт написан как одностраничное приложение на React 19 и Vite 6, хостинг на GitHub Pages,
домен ук-волжанин-яр.рф (`xn-----7kchunjkubf5a1a3p.xn--p1ai`).

```
Редактор в Pages CMS ──Save──▶ коммит в ветку dev
                                   │
                    GitHub Actions: deploy.yml
                    npm ci → проверка контента → build → deploy
                                   │
                         GitHub Pages ─▶ ук-волжанин-яр.рф
```

## Где что лежит

| Путь | Что там |
|---|---|
| `content/news/*.md` | новости |
| `content/info/*.md` | разделы «Информации» |
| `public/uploads/` | файлы, загруженные через CMS |
| `public/general/`, `public/news_images/` | файлы сайта до CMS, пути менять нельзя |
| `src/content/` | разбор файлов контента (`loadNews`, `loadSections`) |
| `src/pages/info/Section.jsx` | один шаблон для всех разделов, маршрут `/info/:slug` |
| `src/components/NewsList.jsx` | лента новостей на главной |
| `src/components/Header.jsx` | шапка; меню «Информация» строится из `content/info` |
| `scripts/validate-content.mjs` | проверка контента перед сборкой |
| `.pages.yml` | настройка Pages CMS |
| `.github/workflows/deploy.yml` | сборка и публикация |

Контент читается на этапе сборки через `import.meta.glob`. Чтобы изменение
попало на сайт, нужна новая сборка, её запускает любой коммит в `dev`.

Остальные страницы (Главная, Услуги, О нас, Контакты, Проекты, Вакансии)
пишутся кодом в `src/pages/`. Через CMS они не редактируются.

Дальше: [Формат файлов контента](02-format.md)
