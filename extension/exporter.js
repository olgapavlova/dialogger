(async () => {
  const CONFIG = {
    scrollStepPx: 500,
    scrollIntervalMs: 500,
    scrollStableTicks: 3,
    maxScrollMs: 60_000,
    toastAutoHideMs: 2_000
  };

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

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatTimestampYYYYMMDDHHMMSS(date = new Date()) {
    const yyyy = String(date.getFullYear());
    const mm = pad2(date.getMonth() + 1);
    const dd = pad2(date.getDate());
    const hh = pad2(date.getHours());
    const mi = pad2(date.getMinutes());
    const ss = pad2(date.getSeconds());
    return `${yyyy}-${mm}-${dd}-${hh}-${mi}-${ss}`;
  }

  async function scrollToLoadConversation() {
    const startedAt = Date.now();
    let stableTicks = 0;
    let lastHeight = document.body.scrollHeight;

    while (Date.now() - startedAt < CONFIG.maxScrollMs) {
      window.scrollBy(0, CONFIG.scrollStepPx);
      await sleep(CONFIG.scrollIntervalMs);

      const currentHeight = document.body.scrollHeight;
      if (currentHeight === lastHeight) stableTicks += 1;
      else stableTicks = 0;

      if (stableTicks >= CONFIG.scrollStableTicks) return;
      lastHeight = currentHeight;
    }
  }

  function normalizeMarkdown(text) {
    return String(text)
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function markdownFromHtmlFragment(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html ?? "");

    const md = markdownFromNodes(template.content.childNodes);
    return normalizeMarkdown(md);
  }

  function markdownFromNodes(nodes) {
    let out = "";
    for (const node of Array.from(nodes)) out += markdownFromNode(node);
    return out;
  }

  function markdownFromNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node;
    const tag = el.tagName.toLowerCase();

    switch (tag) {
      case "br":
        return "\n";
      case "p":
        return `${normalizeMarkdown(markdownFromNodes(el.childNodes))}\n\n`;
      case "strong":
      case "b":
        return `**${markdownFromNodes(el.childNodes)}**`;
      case "em":
      case "i":
        return `_${markdownFromNodes(el.childNodes)}_`;
      case "pre": {
        const codeEl = el.querySelector("code");
        const code = (codeEl ?? el).textContent ?? "";
        return `\n\`\`\`\n${code.trimEnd()}\n\`\`\`\n\n`;
      }
      case "code": {
        if (el.closest("pre")) return el.textContent ?? "";
        const code = el.textContent ?? "";
        return `\`${code}\``;
      }
      case "ul":
      case "ol": {
        let items = "";
        for (const li of Array.from(el.children)) {
          if (li.tagName.toLowerCase() !== "li") continue;
          const item = normalizeMarkdown(markdownFromNodes(li.childNodes));
          if (item) items += `- ${item}\n`;
        }
        return `${items}\n`;
      }
      case "li":
        return `${normalizeMarkdown(markdownFromNodes(el.childNodes))}\n`;
      default:
        return markdownFromNodes(el.childNodes);
    }
  }

  function collectConversationMessages() {
    const nodes = Array.from(
      document.querySelectorAll("div[data-message-author-role]")
    );

    const messages = [];
    for (const node of nodes) {
      const role = node.getAttribute("data-message-author-role");
      const textContainer =
        node.querySelector(".markdown, .whitespace-pre-wrap") || node;

      const md = markdownFromHtmlFragment(textContainer.innerHTML || "");
      if (!md) continue;

      messages.push({ role, text: md });
    }

    return messages;
  }

  function buildMarkdownDocument(messages) {
    return messages
      .map((m) => (m.role === "user" ? `## ${m.text}` : `${m.text}`))
      .join("\n\n");
  }

  try {
    console.log("[dialogger] Export started");
    toast.set("scrolling to load messages…");
    await scrollToLoadConversation();

    toast.set("collecting messages…");
    const messages = collectConversationMessages();

    console.log(`[dialogger] Messages found: ${messages.length}`);
    if (!messages.length) {
      toast.set("no messages found (is this ChatGPT conversation page?)");
      await sleep(2000);
      return;
    }

    toast.set("building Markdown…");
    const md = buildMarkdownDocument(messages);

    toast.set("downloading…");
    const timestamp = formatTimestampYYYYMMDDHHMMSS(new Date());
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chatgpt_export_${timestamp}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.set(`done (${messages.length} messages)`);
    console.log(`[dialogger] Done. Messages saved: ${messages.length}`);
    await sleep(CONFIG.toastAutoHideMs);
  } catch (err) {
    console.error("[dialogger] Failed:", err);
    toast.set(`error: ${err?.message ?? String(err)}`);
    await sleep(4000);
  } finally {
    toast.remove();
  }
})();
