const summaryEl = document.getElementById("summary");
const statusEl = document.getElementById("status");
const cleanupBtn = document.getElementById("cleanup-now");
const settingsBtn = document.getElementById("open-settings");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function formatSummary(settings, staleCount) {
  if (!settings.enabled) {
    return "Automatic cleanup is <strong>off</strong>.";
  }

  const daysLabel =
    settings.staleDays === 1 ? "1 day" : `${settings.staleDays} days`;

  return (
    `Closes tabs not opened for <strong>${daysLabel}</strong>. ` +
    `Checks every <strong>${settings.checkIntervalMinutes} min</strong>. ` +
    `<strong>${staleCount}</strong> tab(s) would close now.`
  );
}

async function refresh() {
  const settings = await loadSettings();
  const response = await chrome.runtime.sendMessage({ type: "countStale" });
  const staleCount = response?.ok ? response.count : 0;
  summaryEl.innerHTML = formatSummary(settings, staleCount);
}

cleanupBtn.addEventListener("click", async () => {
  cleanupBtn.disabled = true;
  setStatus("Running…");

  try {
    const response = await chrome.runtime.sendMessage({ type: "runCleanup" });
    if (!response?.ok) {
      throw new Error(response?.error || "Cleanup failed");
    }
    setStatus(
      response.closed === 0
        ? "Nothing to close."
        : `Closed ${response.closed} tab(s).`,
    );
    await refresh();
  } catch (error) {
    setStatus(String(error), true);
  } finally {
    cleanupBtn.disabled = false;
  }
});

settingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

refresh();
