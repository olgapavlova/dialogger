async function isChatGPTConversationTab(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const host = location.host;
      const path = location.pathname || "/";
      const isChatGPTHost = host === "chatgpt.com" || host === "chat.openai.com";
      const looksLikeConversation =
        path.startsWith("/c/") || path.startsWith("/share/") || path.includes("/c/");
      const hasMessages = Boolean(
        document.querySelector("div[data-message-author-role]")
      );

      return isChatGPTHost && looksLikeConversation && hasMessages;
    }
  });

  return Boolean(result);
}

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab?.id;
  if (!tabId) return;

  try {
    const ok = await isChatGPTConversationTab(tabId);
    if (!ok) return;

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["exporter.js"]
    });
  } catch {
    // Not accessible / not permitted (e.g. not on chatgpt.com) — no-op by design.
  }
});

