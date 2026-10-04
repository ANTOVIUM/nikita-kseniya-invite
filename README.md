# Никита и Ксения · 24 июля 2027

Рабочее приглашение: https://nikita-kseniya-24072027.alyshagf.chatgpt.site

В репозитории — исходники приглашения, сервер сохранения ответов, миграции базы и проверки. Персональные ответы гостей и секрет организаторов не включены.

Корневой index.html направляет гостей в опубликованную версию с работающей анкетой. GitHub Pages не выполняет серверный код и не сохраняет RSVP самостоятельно.

Для GitHub Pages: Settings → Pages → Deploy from a branch → main → / (root) → Save.

Крупные ресурсы загружаются командой `node scripts/download-assets.mjs`. Затем `npm install`, `npm run check`, `npm run build`. Самодостаточный HTML: `python3 scripts/build-inline.py`.
