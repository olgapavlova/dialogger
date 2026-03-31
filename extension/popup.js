const exportButton = document.getElementById("export");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = text;
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found.");
  return tab.id;
}

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  setStatus("Running…");

  try {
    const tabId = await getActiveTabId();
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["exporter.js"]
    });
    setStatus("Started. Check the tab (download + console logs).");
  } catch (err) {
    setStatus(`Error: ${err?.message ?? String(err)}`);
  } finally {
    exportButton.disabled = false;
  }
});

