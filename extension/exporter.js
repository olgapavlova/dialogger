(async () => {
  const toast = (() => {
    const el = document.createElement("div");
    el.id = "__dialogger_toast";
    el.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483647",
      "max-width:340px",
      "padding:10px 12px",
      "border-radius:12px",
      "background:rgba(0,0,0,0.78)",
      "color:#fff",
      "font:12px/1.4 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      "box-shadow:0 8px 24px rgba(0,0,0,0.25)"
    ].join(";");
    el.textContent = "dialogger: starting…";
    document.documentElement.appendChild(el);
    return {
      set(text) {
        el.textContent = `dialogger: ${text}`;
      },
      remove() {
        el.remove();
      }
    };
  })();

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

  function decodeEntities(s) {
    return s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
  }

  function htmlToMarkdown(html) {
    let out = html || "";

    out = out
      .replace(/<pre[^>]*>[\s\S]*?<code/g, "<pre><code")
      .replace(/<pre[\s\S]*?<\/pre>/g, (block) => {
        const code = decodeEntities(
          block
            .replace(/<\/?pre[^>]*>/g, "")
            .replace(/<\/?code[^>]*>/g, "")
            .replace(/<\/?span[^>]*>/g, "")
            .replace(/<br\s*\/?>/g, "\n")
            .trim()
        );
        return `\n\`\`\`\n${code}\n\`\`\`\n`;
      })
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (m, code) => {
        const clean = decodeEntities(String(code)).trim();
        return `\`${clean}\``;
      })
      .replace(/<\/li>\s*/g, "\n")
      .replace(/<li[^>]*>\s*(?:<p[^>]*>\s*)?/g, "- ")
      .replace(/<\/p>\s*<\/li>/g, "\n")
      .replace(/<\/?ul[^>]*>/g, "\n")
      .replace(/<\/p>\s*<p>/g, "\n\n")
      .replace(/<\/?p>/g, "")
      .replace(/<\/?strong>/g, "**")
      .replace(/<\/?em>/g, "_")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return out;
  }

  try {
    console.log("[dialogger] Export started");
    toast.set("scrolling to load messages…");
    await autoScroll();

    toast.set("collecting messages…");
    const messages = [];
    document.querySelectorAll("div[data-message-author-role]").forEach((el) => {
      const role = el.getAttribute("data-message-author-role");
      const textContainer = el.querySelector(".markdown, .whitespace-pre-wrap") || el;
      const html = textContainer.innerHTML || "";
      const md = htmlToMarkdown(html);
      if (md) messages.push({ role, text: md });
    });

    console.log(`[dialogger] Messages found: ${messages.length}`);
    if (!messages.length) {
      toast.set("no messages found (is this ChatGPT conversation page?)");
      await sleep(2000);
      return;
    }

    toast.set("building Markdown…");
    const md = messages
      .map((m) => (m.role === "user" ? `## ${m.text}` : `${m.text}`))
      .join("\n\n");

    toast.set("downloading…");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatgpt_export_${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.set(`done (${messages.length} messages)`);
    console.log(`[dialogger] Done. Messages saved: ${messages.length}`);
    await sleep(2000);
  } catch (err) {
    console.error("[dialogger] Failed:", err);
    toast.set(`error: ${err?.message ?? String(err)}`);
    await sleep(4000);
  } finally {
    toast.remove();
  }
})();

