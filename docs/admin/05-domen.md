# 11. Домен и HTTPS

Домен ук-волжанин-яр.рф (`xn-----7kchunjkubf5a1a3p.xn--p1ai`) зарегистрирован
в REG.RU. Сертификат HTTPS выпускает GitHub Pages (Let's Encrypt).

## DNS

| Запись | Значение |
|---|---|
| `@` A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www` CNAME | `yk-volzanin-yar.github.io.` |

Файл `public/CNAME` с доменом попадает в каждую сборку. Удалять его нельзя.

## Настройки Pages

**Settings → Pages**:

- **Source:** GitHub Actions.
- **Custom domain:** `xn-----7kchunjkubf5a1a3p.xn--p1ai`.
- **Enforce HTTPS:** включить, как только GitHub выпустит сертификат.

Публиковать в окружение `github-pages` разрешено из веток `dev`, `main` и
`gh-pages` (**Settings → Environments → github-pages**). Без `dev` деплой
падает с ошибкой «Branch "dev" is not allowed to deploy».

## Сертификат не выпускается

Признаки: в Settings → Pages нельзя включить Enforce HTTPS («The certificate
has not finished being issued»), статус сертификата `bad_authz`.

1. Проверьте DNS (`dig +short CNAME www.xn-----7kchunjkubf5a1a3p.xn--p1ai`
   должен вернуть `yk-volzanin-yar.github.io.`).
2. В **Settings → Pages** удалите Custom domain, сохраните, введите заново.
   Это перезапускает выпуск.
3. Подождите до суток и включите **Enforce HTTPS**.

На 24.10.2026 DNS исправлен, сертификат ещё не перевыпущен, текущий действует
до 09.11.2026.

Дальше: [Разработка](06-razrabotka.md)
