# Implementation Plan: Управление контентом сайта из браузера

**Design spec:** docs/design-specs/editor-content-management.md
**Stack:** js (React 19 + Vite 6, GitHub Pages, GitHub Actions)
**Manifest:** none

> Профиля стека `js` в плагине нет (`rules/stack-js/` отсутствует).
> План написан вручную по канону `skills/writing-plans/SKILL.md`.
> Тестового фреймворка в проекте сейчас нет. Пункты с `Test entities`
> предполагают добавление `vitest` в пункте 2 (первый пункт, где
> появляется тестируемая логика).

## Факты из кода, учтённые в плане

- Прод отдаётся с ветки `gh-pages` (`build_type: legacy`), workflow в
  репо нет, деплой — `npm run deploy` (`gh-pages -d dist`).
- `public/CNAME` содержит домен; при сборке Vite копирует его в `dist/`.
- В корне два `index.html`: `index.html` (точка входа Vite) и
  `public/index.html` (SEO-версия с мета-тегами). Какой из них
  попадает в `dist/index.html`, проверяется в пункте 1 до переключения
  источника Pages.
- Шесть страниц `src/pages/info/*.jsx` отличаются только картой,
  заголовком и папкой в `public/`. `MKD.jsx` дополнительно рендерит
  строки без файла как подзаголовок → в модели данных нужен четвёртый
  тип пункта «Подзаголовок» (сохранение текущего поведения, новой
  функциональности нет).
- Меню «Информация» продублировано в `src/pages/Info.jsx` и
  `src/components/Header.jsx`.
- Дата новости парсится регуляркой из строки `_Дата: ..._`
  (`src/components/NewsList.jsx`); при ошибке — 1970 год.
- Картинки в тексте уже встречаются в Markdown-виде:
  `src/news/news_1.md`, `public/general/tree_cutting.txt`,
  `public/general/warm_apartments.txt`.

## Этапы

- **Этап 1** — пункты 1–4. Результат: редактор работает в GitHub web,
  сайт публикуется сам.
- **Решение** — после 2–4 недель работы редактора на этапе 1
  определяем, нужен ли этап 2 (см. спеку).
- **Этап 2** — пункты 5–11. Пункт 5 (прототип) блокирует остальные.

## Items

### Item 1: Автодеплой через GitHub Actions
**Stack:** js
**Files (allowed scope):**
- `.github/workflows/deploy.yml`
- `package.json` (только секция `scripts`)
- `README.md` (раздел «Деплой»)

#### Subitems
- [ ] Workflow: триггеры `push` в `dev` и `workflow_dispatch`; шаги checkout → setup-node (версия из `package.json`/LTS) → `npm ci` → `npm run build` → upload-pages-artifact (`dist`) → deploy-pages
- [ ] `concurrency` на группу pages, чтобы два сохранения подряд не деплоились параллельно
- [ ] Права workflow: `pages: write`, `id-token: write`, `contents: read`
- [ ] Локально собрать `dist` и сравнить `dist/index.html` и `dist/CNAME` с текущей веткой `gh-pages` (SEO-мета и домен должны совпасть)
- [ ] Переключить Settings → Pages → Source на «GitHub Actions» (ручной шаг владельца репо, фиксируется в README)
- [ ] Проверить после первого деплоя: сайт открывается по домену, custom domain сохранён
- [ ] Скрипт `deploy` (`gh-pages`) оставить как аварийный ручной путь, описать в README
- [ ] README: раздел «Деплой» — публикация автоматическая, кнопка «Run workflow» для ручного перезапуска

#### Exposes
- Workflow `deploy.yml` со входом `workflow_dispatch` (используется пунктом 10 для кнопки в Pages CMS, если понадобится)
- Точка расширения: шаги «проверка» и «оптимизация» между `npm ci` и deploy (наполняются пунктами 2 и 3)

#### Consumes
- (none)

#### Test entities
- (none) — только CI-конфигурация и документация; проверка ручным прогоном workflow

#### Depends on
- (none)

---

### Item 2: Проверка новостей в сборке
**Stack:** js
**Files (allowed scope):**
- `scripts/validate-content.mjs`
- `scripts/validate-content.test.mjs`
- `package.json` (`scripts`, `devDependencies`: `vitest`)
- `.github/workflows/deploy.yml` (шаг проверки)

#### Subitems
- [ ] Добавить `vitest` и скрипт `test`
- [ ] Скрипт проверяет каждый `src/news/*.md`: есть строка даты, дата парсится в реальный день, месяц из списка русских названий
- [ ] Скрипт проверяет, что картинки, на которые ссылаются новости и `.txt`-файлы «Информации», существуют в `public/`
- [ ] Сообщения об ошибке по-русски с именем файла и строкой (их читает разработчик в логе Actions)
- [ ] Ненулевой код выхода при ошибке; шаг в workflow до `npm run build`

#### Exposes
- CLI `node scripts/validate-content.mjs` с кодом выхода 0/1 (расширяется в пункте 9)

#### Consumes
- Workflow из Item 1

#### Test entities
- validate-content (разбор даты, отсутствующая картинка, корректный файл)

#### Depends on
- Item 1

---

### Item 3: Сжатие картинок при сборке
**Stack:** js
**Files (allowed scope):**
- `scripts/optimize-images.mjs`
- `scripts/optimize-images.test.mjs`
- `package.json` (`scripts`, `devDependencies`: `sharp`)
- `.github/workflows/deploy.yml` (шаг оптимизации)

#### Subitems
- [ ] Скрипт обходит `dist/**/*.{jpg,jpeg,png,webp}` после `vite build`
- [ ] Картинки шире 1600px уменьшаются до 1600px по ширине; JPEG/WebP пережимаются с качеством ~80; PNG — без потерь с палитрой где возможно
- [ ] Имена и пути файлов не меняются (ссылки в контенте остаются рабочими); файл перезаписывается только если результат меньше оригинала
- [ ] Исключения: `favicon.ico`, `logo.*`, `og-image.jpg`
- [ ] Лог: сколько файлов и сколько КБ сэкономлено
- [ ] Шаг в workflow между build и upload-pages-artifact; оригиналы в репозитории не трогаются

#### Exposes
- (none)

#### Consumes
- Workflow из Item 1

#### Test entities
- optimize-images (большая картинка уменьшается, маленькая не трогается, исключения пропускаются)

#### Depends on
- Item 1

---

### Item 4: Инструкция редактора для GitHub web (этап 1)
**Stack:** js
**Files (allowed scope):**
- `docs/editor-guide/github-web.md`
- `docs/editor-guide/images/*`
- `README.md` (ссылка на инструкцию, замена разделов «Добавление файлов…»)

#### Subitems
- [ ] Сценарий «Добавить новость»: открыть `src/news`, «Add file», имя файла, шаблон текста с датой, загрузка фото в `public/news_images`, вставка ссылки, «Commit changes»
- [ ] Сценарий «Добавить пункт в раздел Информации»: загрузка файла в папку раздела, правка строки в `src/maps/<раздел>Map.js` (с готовым шаблоном строки)
- [ ] Сценарий «Исправить или удалить новость»
- [ ] Как понять, что сайт обновился (через 2–3 минуты), и что делать, если не обновился (сообщить администратору)
- [ ] Ограничение размера фото (ориентир до 10 МБ на файл)
- [ ] Скриншоты каждого шага (снимаются вручную в браузере)
- [ ] Крупный шрифт, короткие шаги, без терминов git
- [ ] Ограничение этапа: новый раздел добавить нельзя — обращаться к администратору

#### Exposes
- (none)

#### Consumes
- Шаблон даты из Item 2 (формат, который пропускает проверка)

#### Test entities
- (none) — только документация

#### Depends on
- Item 2

---

### Item 5: Прототип Pages CMS (spike)
**Stack:** js
**Files (allowed scope):**
- Отдельный тестовый репозиторий (вне этого репо)
- `docs/design-specs/editor-content-management.md` (раздел «Результаты проверки Pages CMS»)

#### Subitems
- [ ] Тестовый репо с `.pages.yml`: коллекция новостей и коллекция разделов с `block`-списком (статья с rich-text, документ, картинка, подзаголовок)
- [ ] Проверить: в какую ветку пишет CMS и можно ли зафиксировать `dev`
- [ ] Проверить: rich-text внутри `block` внутри списка — редактирование, вставка картинок, формат сохранения
- [ ] Проверить: приглашение редактора по email, вход без GitHub, что видит редактор
- [ ] Проверить: язык интерфейса, работают ли русские `label`
- [ ] Проверить: лимиты и условия app.pagescms.org, лимит размера загружаемого файла
- [ ] Проверить: загрузка фото с телефона (мобильный браузер)
- [ ] Записать результаты в спеку; при провале критичного пункта — стоп и возврат в brainstorming

#### Exposes
- Подтверждённая схема `.pages.yml` (форма полей и типов) для Items 6 и 10

#### Consumes
- (none)

#### Test entities
- (none) — исследование, кода в репо нет

#### Depends on
- Решение после этапа 1 (Items 1–4 завершены и проверены редактором)

---

### Item 6: Модель данных и миграция контента
**Stack:** js
**Files (allowed scope):**
- `content/news/*.md`
- `content/info/*.md`
- `public/uploads/` (папка для новых загрузок, `.gitkeep`)
- `scripts/migrate-content.mjs`
- `scripts/migrate-content.test.mjs`
- `src/news/*.md` (удаление после миграции)
- `src/maps/*.js` (удаление после миграции)
- `src/general/fileMap.js` (удаление, если не используется)
- `public/*/*.txt` (удаление после переноса текста в разделы)

#### Subitems
- [ ] Формат новости: frontmatter `title`, `date` (ISO), `images` (опционально) + тело Markdown
- [ ] Формат раздела: frontmatter `title`, `slug`, `order`, `items[]`; пункт — `type` (`article` | `document` | `image` | `heading`), `title`, `body` / `file` / `image`
- [ ] `slug` текущих разделов совпадает с текущими URL: `general`, `reports`, `ventilation`, `mkd`, `company`, `meetings`
- [ ] Скрипт миграции: новости — заголовок из `###`, дата из `_Дата: …_`, тело без них
- [ ] Скрипт миграции: разделы — из `src/maps/*.js`; `.txt` → `article` с текстом внутри; `.pdf` → `document`; `.png/.jpg` → `image`; строка без файла → `heading`
- [ ] PDF и картинки остаются на прежних путях в `public/` (ссылки извне не ломаются); новые загрузки идут в `public/uploads/`
- [ ] Прогнать миграцию, закоммитить результат, удалить старые источники

#### Exposes
- Формат файлов `content/news/*.md` и `content/info/*.md` (для Items 7, 8, 9, 10)

#### Consumes
- Подтверждённая схема из Item 5

#### Test entities
- migrate-content (разбор новости с датой, разбор карты раздела всех четырёх типов, пустая карта)

#### Depends on
- Item 5

---

### Item 7: Загрузка контента и лента новостей
**Stack:** js
**Files (allowed scope):**
- `src/content/loadNews.js`
- `src/content/loadSections.js`
- `src/content/frontmatter.js`
- `src/content/*.test.js`
- `src/components/NewsList.jsx`
- `package.json` (`dependencies`)

#### Subitems
- [ ] Парсер frontmatter, работающий в браузере (`gray-matter` требует `Buffer`; либо проверить сборку с ним, либо заменить на лёгкий YAML-парсер, например `yaml`)
- [ ] `loadNews()`: `import.meta.glob('/content/news/*.md')`, разбор, сортировка по `date` по убыванию, отбрасывание записей без даты с предупреждением в консоли
- [ ] `loadSections()`: `import.meta.glob('/content/info/*.md')`, сортировка по `order`, поиск по `slug`
- [ ] `NewsList`: заголовок и дата из полей; дата выводится в формате «9 июля 2025»; пагинация «Показать ещё» сохраняется
- [ ] Удалить регулярку `_Дата:` из `NewsList`

#### Exposes
- `loadNews(): Array<{ id, title, date, html, images }>`
- `loadSections(): Array<Section>`, `getSection(slug): Section | undefined`

#### Consumes
- Формат файлов из Item 6

#### Test entities
- loadNews (сортировка по дате, запись без даты)
- loadSections (сортировка по order, поиск по slug)
- frontmatter (разбор frontmatter с кириллицей и списками)

#### Depends on
- Item 6

---

### Item 8: Общий шаблон раздела, маршруты и меню
**Stack:** js
**Files (allowed scope):**
- `src/pages/info/Section.jsx`
- `src/pages/Info.jsx`
- `src/components/Header.jsx`
- `src/App.jsx`
- `src/pages/info/{General,Reports,Ventilation,MKD,Company,Meetings}.jsx` (удаление)
- `src/assets/styles.css` (только если нужен стиль для `heading` / картинок в статье)

#### Subitems
- [ ] `Section.jsx`: берёт `slug` из маршрута, рендерит пункты по типу — `article` раскрывается по клику (как сейчас `.txt`), `document` и `image` — ссылка в новой вкладке, `heading` — подзаголовок
- [ ] Неизвестный `slug` → сообщение «Раздел не найден» и ссылка на `/info`
- [ ] `App.jsx`: один маршрут `/info/:slug` вместо шести
- [ ] `Info.jsx` и `Header.jsx`: список разделов из `loadSections()` вместо захардкоженных ссылок
- [ ] Удалить шесть старых страниц
- [ ] Ручная сверка каждого из шести разделов с текущим продом (тексты, ссылки, картинки, порядок)

#### Exposes
- (none)

#### Consumes
- `loadSections()`, `getSection(slug)` из Item 7

#### Test entities
- (none) — UI-рендер без бизнес-логики; логика выбора раздела покрыта тестами `loadSections` в Item 7

#### Depends on
- Item 7

---

### Item 9: Проверка данных этапа 2 в сборке
**Stack:** js
**Files (allowed scope):**
- `scripts/validate-content.mjs`
- `scripts/validate-content.test.mjs`

#### Subitems
- [ ] Перевести проверку с `src/news` на `content/news` и `content/info`
- [ ] Новость: обязательны `title` и корректная `date`
- [ ] Раздел: обязательны `title`, `slug` (латиница, уникален), `items[].type` из четырёх значений, обязательные поля по типу
- [ ] Все ссылки на файлы (`file`, `image`, картинки в Markdown) существуют в `public/`
- [ ] Удалить проверки старого формата

#### Exposes
- CLI `node scripts/validate-content.mjs` (тот же контракт, что в Item 2)

#### Consumes
- Формат файлов из Item 6

#### Test entities
- validate-content (новость без даты, дублирующийся slug, пункт без файла, отсутствующая картинка, корректные данные)

#### Depends on
- Item 6

---

### Item 10: Конфигурация Pages CMS
**Stack:** js
**Files (allowed scope):**
- `.pages.yml`

#### Subitems
- [ ] `media`: источник «Картинки и документы», `input: public/uploads`, `output: /uploads`, `rename: safe`, разрешённые расширения (jpg, jpeg, png, webp, pdf)
- [ ] Коллекция «Новости»: путь `content/news`, поля с русскими подписями — Заголовок, Дата, Текст (rich-text, markdown), Картинки (`multiple`); `view` сортирует по дате по убыванию
- [ ] Коллекция «Разделы информации»: путь `content/info`, поля — Название, Адрес в ссылке (slug, с подсказкой и `pattern` на латиницу), Порядок, Пункты (`block`: Статья / Документ / Картинка / Подзаголовок)
- [ ] `operations`: создание и удаление разрешены для новостей и разделов
- [ ] Шаблоны коммитов на русском (`Новость: {path}`, `Раздел: {path}`)
- [ ] Ветка записи — `dev` (по результатам Item 5)
- [ ] Подключить репо к Pages CMS, установить GitHub App, пригласить редактора (ручные шаги владельца)

#### Exposes
- (none)

#### Consumes
- Формат файлов из Item 6
- Подтверждённая схема из Item 5
- Workflow из Item 1 (сохранение в `dev` запускает деплой)

#### Test entities
- (none) — только конфигурация; проверка сквозным сценарием в Item 11

#### Depends on
- Item 6, Item 9

---

### Item 11: Инструкция редактора для Pages CMS и сквозная проверка
**Stack:** js
**Files (allowed scope):**
- `docs/editor-guide/pages-cms.md`
- `docs/editor-guide/images/*`
- `docs/editor-guide/github-web.md` (пометка «запасной вариант»)
- `README.md` (замена разделов про ручное добавление файлов)

#### Subitems
- [ ] Сквозной прогон под учёткой редактора: добавить новость с фото с телефона → сохранить → проверить на сайте
- [ ] Сквозной прогон: создать новый раздел с пунктами всех четырёх типов → проверить меню и страницу
- [ ] Сквозной прогон: сломанные данные (пустая дата) → сборка падает, сайт остаётся прежним, приходит письмо
- [ ] Инструкция: вход, добавить / исправить / удалить новость, добавить раздел, добавить пункт каждого типа, перевод английских кнопок интерфейса
- [ ] Скриншоты каждого шага
- [ ] Инструкция GitHub web помечается как запасной путь на случай недоступности Pages CMS (с новым форматом файлов)
- [ ] README: актуальная схема работы с контентом

#### Exposes
- (none)

#### Consumes
- Всё из Items 7–10

#### Test entities
- (none) — документация и ручная сквозная проверка

#### Depends on
- Item 8, Item 10

## Граф зависимостей

```
1 ─┬─ 2 ── 4
   └─ 3
        [решение]
           5 ── 6 ─┬─ 7 ── 8 ─┐
                   └─ 9 ── 10 ┴─ 11
```

Параллельно можно вести: 2 и 3; 7 и 9.

## Implementation guidance

> **Implementation:** Профиля `js` нет, поэтому `/ship` и стек-агенты
> (`developer`, `reviewer`, `tester`) не запустятся. Варианты:
> - `/tdd` по одному пункту через `tdd-guide` (stackless fallback).
> - `/code-review` через `code-reviewer` (fallback).
> - Либо сначала создать профиль `rules/stack-js/`, после чего
>   доступен `/ship --from=implement`.
