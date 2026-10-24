# 12. Разработка

## Команды

```sh
npm install                # зависимости
npm run dev                # локальный сервер разработки
npm test                   # тесты (vitest)
npm run validate-content   # проверка content/ как в CI
npm run build              # сборка в dist/
npm run preview            # просмотр собранного сайта
```

## Тесты

| Файл | Что проверяет |
|---|---|
| `src/content/frontmatter.test.js` | разбор YAML-заголовка |
| `src/content/loadNews.test.js` | сортировка, даты, фото, битые записи |
| `src/content/loadSections.test.js` | порядок разделов, типы пунктов |
| `scripts/validate-content.test.mjs` | все правила проверки и запуск из командной строки |

Тесты `loadNews`, `loadSections` и `validate-content` прогоняют и реальный
контент репозитория.

## Добавить новый тип пункта раздела

Тип нужно описать в четырёх местах:

1. `.pages.yml`: блок в `items.blocks`.
2. `src/content/loadSections.js`: `ITEM_TYPES`.
3. `src/pages/info/Section.jsx`: отрисовка.
4. `scripts/validate-content.mjs`: `FILE_FIELDS_BY_TYPE`.

## Gitflow

1. Основная ветка: `dev`. Все коммиты в `dev` сразу публикуются.
2. Для задачи создаётся ветка от `dev`: `feature-{номер issue}-{краткое описание}`.
3. Готовую задачу оформляют Pull Request в `dev`.
4. Релиз: мерж `dev` в `main`, git-тег, Release.

Дальше: [Доступы и полезные ссылки](07-dostupy.md)
