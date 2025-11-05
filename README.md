[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# `dialogger` • Сохраняет ChatGPT-диалог в Markdown-файл
> Длинные диалоги с ChatGPT хочется сохранить в отдельный файл — и потом с этим файлом работать.

## Простые неправильные решения
1. Сохранить страницу из браузера. Не срабатывает.
2. Сохранить диалог из приложения ChatGPT. Такой функциональности нет.
3. Выделить весь контент страницы (руками или автоматически) и скопировать его в буфер. Действие «Выделить весь контент страницы» не приводит к результату: в каждый момент времени только часть контента находится в статусе «Показывать», а большая часть диалога скрыта или даже не подгружена с сервера.
4. Копировать с помощью специальной кнопки каждый ответ отдельно. Можно, и даже можно автоматически сохранять скопированное в файл (например, средствами [системы быстрых команд](https://support.apple.com/ru-ru/guide/shortcuts-mac/welcome/mac)) — но при этом не копируются вопросы, и диалог становится непонятным.
5. Создать плагин или букмарклет, который листает диалог с самого начала и сохраняет в файл всё, что найдёт. У плагинов браузера и у букмарклетов недостаточно прав, чтобы получить доступ к контенту диалога. ChatGPT использует технологию [CSP](https://developer.mozilla.org/ru/docs/Glossary/CSP), чтобы препятствовать такому доступу.
## Работающее решение
> [!NOTE]
> Варианты кода даны только для [Google Chrome](https://www.google.com/chrome/) и [ChatGPT Atlas](https://openai.com/index/introducing-chatgpt-atlas/)

Используем технологию [сниппетов](https://developer.chrome.com/docs/devtools/javascript/snippets) — сохранённых в Chrome Dev Tools фрагментов JavaScript-кода. У них есть полный доступ к странице. Минусы: они хранятся локально, к ним нет доступа через файловую систему.
1. [Создайте](https://developer.chrome.com/docs/devtools/javascript/snippets?hl=ru#create) новый сниппет.
2. Сохраните в него такой код.
	- код для Google Chrome:
```javascript
console.clear();

(async () => {
  console.log("🚀 ChatGPT Chrome Export Script запущен");

  // --- 1. Прокрутка страницы, чтобы подгрузить весь диалог ---
  async function autoScroll() {
    return new Promise((resolve) => {
      let lastHeight = 0;
      const interval = setInterval(() => {
        window.scrollBy(0, 500);
        const currentHeight = document.body.scrollHeight;
        if (currentHeight === lastHeight) {
          clearInterval(interval);
          resolve();
        } else {
          lastHeight = currentHeight;
        }
      }, 500);
    });
  }

  console.log("📜 Прокручиваю диалог...");
  await autoScroll();
  console.log("✅ Прокрутка завершена");

  // --- 2. Собираем сообщения ---
  const messages = [];
  document.querySelectorAll("div[data-message-author-role]").forEach(el => {
    const role = el.getAttribute("data-message-author-role");
    const textContainer =
      el.querySelector(".markdown, .whitespace-pre-wrap") || el;
    let html = textContainer.innerHTML || "";

    // --- 3. Конвертация HTML → Markdown ---
    html = html
        // 🧹 Удаляем всё между <pre> и <code>
      .replace(/<pre[^>]*>[\s\S]*?<code/g, "<pre><code")
      
      // Многострочные блоки кода (с <pre>, <code>, <span> и любыми вложениями)
      .replace(/<pre[\s\S]*?<\/pre>/g, block => {
        let code = block
          .replace(/<\/?pre[^>]*>/g, "")
          .replace(/<\/?code[^>]*>/g, "")
          .replace(/<\/?span[^>]*>/g, "")
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();
        return `\n\`\`\`\n${code}\n\`\`\`\n`;
      })

      // inline-код <code>…</code>
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (m, code) => {
        const clean = code
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .trim();
        return `\`${clean}\``;
      })

      // списки
      .replace(/<\/li>\s*/g, "\n")
      .replace(/<li[^>]*>\s*(?:<p[^>]*>\s*)?/g, "- ")
      .replace(/<\/p>\s*<\/li>/g, "\n")
      .replace(/<\/?ul[^>]*>/g, "\n")

      // параграфы, выделение
      .replace(/<\/p>\s*<p>/g, "\n\n")
      .replace(/<\/?p>/g, "")
      .replace(/<\/?strong>/g, "**")
      .replace(/<\/?em>/g, "_")

      // убрать лишнее
      .replace(/<\/?[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (html) messages.push({ role, text: html });
  });

  console.log(`💬 Найдено сообщений: ${messages.length}`);

  // --- 4. Собираем Markdown ---
  const md = messages
    .map(m => (m.role === "user" ? `## ${m.text}` : `${m.text}`))
    .join("\n\n");

  // --- 5. Сохраняем в файл ---
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chatgpt_export_${timestamp}.md`;
  a.click();
  URL.revokeObjectURL(url);

  console.log(`✅ Сохранено сообщений: ${messages.length}`);
})();

```
- код для ChatGPT Atlas:
```javascript
console.clear();

(async () => {
  console.log("🚀 Начинаем сбор диалога с Markdown-разметкой…");

  // Функция для плавной прокрутки вниз
  async function autoScroll(delay = 800) {
    return new Promise(resolve => {
      let lastScroll = 0;
      const interval = setInterval(() => {
        window.scrollBy(0, window.innerHeight);
        if (window.scrollY === lastScroll) {
          clearInterval(interval);
          resolve();
        }
        lastScroll = window.scrollY;
      }, delay);
    });
  }

  await autoScroll(); // прокрутка, чтобы подгрузить всё

  const container = document.querySelector("#mini-chat-content");
  if (!container) return console.error("❌ Контейнер не найден");

  const articles = Array.from(container.querySelectorAll("article"));
  console.log("📦 Найдено article:", articles.length);

  const messages = [];

  for (const article of articles) {
    const turn = article.getAttribute("data-turn"); // user / assistant

    let text = "";
    if (turn === "user") {
      const el = article.querySelector(".whitespace-pre-wrap");
      if (el) text = el.innerText.trim();
    } else if (turn === "assistant") {
      const el = article.querySelector(".markdown");
      if (el) {

        let html = el.innerHTML;

        // 🧠 Преобразуем теги <code> в Markdown
        html = html.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (match, code) => {
          const cleanCode = code
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .trim();

          // Если код многострочный → ```…```, иначе `…`
          return cleanCode.includes("\n")
            ? `\n\`\`\`\n${cleanCode}\n\`\`\`\n`
            : `\`${cleanCode}\``;
        });

                // 🔹 Элементы списка (удаляем все лишние пробелы и переносы)

        html = html
          .replace(/<\/li>\s*/g, "\n")                  // конец li → перенос
          .replace(/<li[^>]*>\s*(?:<p[^>]*>\s*)?/g, "- ") // начало li → "- ", убираем <p> внутри
          .replace(/<\/p>\s*<\/li>/g, "\n")             // закрытие p+li → один перенос
          .replace(/<\/?ul[^>]*>/g, "\n");               // сам список — один перенос

        // Конвертируем HTML → Markdown
        text = html
          .replace(/<br\s*\/?>/g, "\n")
          .replace(/<\/p>\s*<p>/g, "\n\n")
          .replace(/<\/?p>/g, "")
          .replace(/<\/?strong>/g, "**")
          .replace(/<\/?em>/g, "_")
          .replace(/<\/?code>/g, "`")
          .replace(/<\/?ul>/g, "")
          .replace(/<\/?li>\n/g, "\n- ")
          .replace(/<\/?[^>]+>/g, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      }
    }

    if (text) messages.push({ role: turn, text });
  }

  // Собираем Markdown-диалог
  const markdownText = messages
    .map(m =>
      m.role === "user"
        ? `## ${m.text}`
        : `${m.text}`
    )
    .join("\n\n");

  // Сохраняем результат
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  const filename = `chatgpt_dialog_${timestamp}.md`;

  const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`✅ Готово! Файл сохранён как ${filename}`);
})();
```
3. Донастройте код по вкусу. Можно ничего не настраивать, работать будет в любом случае.
4. Откройте диалог с ChatGPT, который хотите сохранить.
5. Запустите сниппет.
6. Перейдите в каталог, где сохраняются скачанные в браузере файлы, и найдите там файл с диалогом.
## Что можно допиливать и изменять
1. Разделить код на два сниппета — вывод диалога в консоль и сохранение диалога в файл.
2. Тюнинг той части кода, где HTML конвертируется в Markdown. Для разных браузеров эти части кода уже сейчас написаны по-разному.
3. Сохранять ещё и картинки. Пока потребности не было.
