English — [Русский](README.ru.md) — [Українська](README.ua.md) — [עברית](README.he.md) — [Deutsch](README.de.md)

# `dialogger` • Exports a ChatGPT conversation to a Markdown file
> Sometimes you want to save a long ChatGPT conversation into a separate file — and then work with that file later.

## Simple but wrong solutions
1. Save the page from the browser. Doesn’t work.
2. Save the conversation from the ChatGPT app. There is no such feature.
3. Select all content on the page (manually or automatically) and copy it to the clipboard. “Select all” won’t give you the full conversation: at any moment only part of the content is visible, while most of it is hidden or not even loaded from the server yet.
4. Copy each assistant answer using a special button. You can even automatically save what you copied into a file (for example with [Shortcuts](https://support.apple.com/guide/shortcuts-mac/welcome/mac)) — but your questions won’t be included, and the conversation becomes hard to follow.
5. Create a bookmarklet (or just paste a script into the page) that scrolls the conversation from the start and saves everything into a file. Such code runs in the page context and often hits limitations (including [CSP](https://developer.mozilla.org/docs/Glossary/CSP)). A Chrome extension solves this because it executes the code as a content script.

## A working solution
A Chrome Extension (Manifest V3) runs the export from the active tab with a single click.

### Install (developer mode)
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder from this repository.

### Usage
1. Open the conversation you want on `chatgpt.com` (or `chat.openai.com`).
2. Click the `dialogger` extension icon.
3. A file named `chatgpt_export_<YYYY-MM-DD-HH-MM-SS>.md` will appear in Downloads.

The exporter code lives in `extension/exporter.js`.

## Things you can improve
1. Split into two modes: print the conversation to the console vs. save to a file.
2. Improve the part where HTML is converted to Markdown.
3. Export images too (not needed so far).
