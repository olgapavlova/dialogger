[English](README.md) — [Русский](README.ru.md) — [Українська](README.ua.md) — [עברית](README.he.md) — Deutsch

# `dialogger` • Exportiert einen ChatGPT‑Dialog in eine Markdown-Datei
> Manchmal möchte man einen langen ChatGPT‑Dialog in eine separate Datei speichern — und später mit dieser Datei weiterarbeiten.

## Einfache, aber falsche Lösungen
1. Die Seite im Browser speichern. Funktioniert nicht.
2. Den Dialog in der ChatGPT‑App speichern. Diese Funktion gibt es nicht.
3. Den gesamten Seiteninhalt auswählen (manuell oder automatisch) und in die Zwischenablage kopieren. „Alles auswählen“ liefert nicht den kompletten Dialog: Zu jedem Zeitpunkt ist nur ein Teil sichtbar, während der Großteil verborgen ist oder noch nicht vom Server geladen wurde.
4. Jede Assistenz‑Antwort einzeln über eine spezielle Taste kopieren. Man kann das Kopierte sogar automatisch in eine Datei speichern (z. B. mit [Shortcuts](https://support.apple.com/guide/shortcuts-mac/welcome/mac)) — aber die eigenen Fragen werden dabei nicht mitkopiert, und der Dialog ist schwer nachzuvollziehen.
5. Ein Bookmarklet erstellen (oder einfach ein Script in die Seite einfügen), das den Dialog von Anfang an durchscrollt und alles in eine Datei speichert. Solcher Code läuft im Seitenkontext und stößt häufig an Grenzen (u. a. [CSP](https://developer.mozilla.org/docs/Glossary/CSP)). Eine Chrome‑Erweiterung löst das, weil sie den Code als Content Script ausführt.

## Eine funktionierende Lösung
Eine Chrome‑Erweiterung (Manifest V3) startet den Export aus dem aktiven Tab mit einem Klick.

### Installation (Developer Mode)
1. Öffne `chrome://extensions`.
2. Aktiviere **Developer mode**.
3. Klicke **Load unpacked** und wähle den Ordner `extension/` aus diesem Repository.

### Nutzung
1. Öffne den gewünschten Dialog auf `chatgpt.com` (oder `chat.openai.com`).
2. Klicke auf das Erweiterungs‑Icon `dialogger`.
3. In Downloads erscheint die Datei `chatgpt_export_<YYYY-MM-DD-HH-MM-SS>.md`.

Der Export‑Code liegt in `extension/exporter.js`.

## Was man verbessern kann
1. In zwei Modi aufteilen: Dialog in die Konsole ausgeben vs. in eine Datei speichern.
2. Den Teil verbessern, der HTML in Markdown umwandelt.
3. Bilder mit exportieren (bisher nicht nötig).
