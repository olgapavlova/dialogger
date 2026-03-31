<img width="440" height="280" alt="dialogger-promo" src="https://github.com/user-attachments/assets/083b12cb-e278-4652-9fd5-cf8ee59bdacd" />

[English](README.md) — [Русский](README.ru.md) — [Українська](README.ua.md) — עברית — [Deutsch](README.de.md)

# `dialogger` • מייצא שיחת ChatGPT לקובץ Markdown
> לפעמים רוצים לשמור שיחה ארוכה עם ChatGPT לקובץ נפרד — ואז לעבוד עם הקובץ הזה בהמשך.

## פתרונות פשוטים אבל לא נכונים
1. לשמור את הדף מתוך הדפדפן. זה לא עובד.
2. לשמור את השיחה מתוך אפליקציית ChatGPT. אין אפשרות כזו.
3. לבחור את כל התוכן בדף (ידנית או אוטומטית) ולהעתיק ללוח. “בחר הכל” לא נותן את כל השיחה: בכל רגע רק חלק מהתוכן מוצג, ורוב השיחה מוסתרת או עדיין לא נטענה מהשרת.
4. להעתיק כל תשובת עוזר בנפרד באמצעות כפתור ייעודי. אפשר אפילו לשמור אוטומטית את מה שהועתק לקובץ (למשל באמצעות [Shortcuts](https://support.apple.com/guide/shortcuts-mac/welcome/mac)) — אבל השאלות שלך לא ייכללו, והשיחה תהיה קשה להבנה.
5. ליצור bookmarklet (או פשוט להדביק סקריפט לתוך הדף) שמגלגל את השיחה מהתחלה ושומר הכול לקובץ. קוד כזה רץ בהקשר של הדף ולעיתים נתקע במגבלות (כולל [CSP](https://developer.mozilla.org/docs/Glossary/CSP)). תוסף Chrome פותר זאת כי הוא מריץ את הקוד כ‑content script.

## פתרון עובד
תוסף Chrome (Manifest V3) מפעיל ייצוא מהטאב הפעיל בלחיצה אחת.

### התקנה (מצב מפתח)
1. פתחו `chrome://extensions`.
2. הפעילו **Developer mode**.
3. לחצו **Load unpacked** ובחרו את התיקייה `extension/` מתוך הריפו הזה.

### שימוש
1. פתחו את השיחה הרצויה ב‑`chatgpt.com` (או `chat.openai.com`).
2. לחצו על אייקון התוסף `dialogger`.
3. בתיקיית Downloads יופיע קובץ בשם `chatgpt_export_<YYYY-MM-DD-HH-MM-SS>.md`.

קוד הייצוא נמצא ב‑`extension/exporter.js`.

## מה אפשר לשפר
1. לפצל לשני מצבים: הדפסה לקונסול מול שמירה לקובץ.
2. לשפר את החלק שממיר HTML ל‑Markdown.
3. לייצא גם תמונות (עדיין לא היה צורך).
