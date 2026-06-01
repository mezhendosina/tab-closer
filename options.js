const form = document.getElementById("settings-form");
const statusEl = document.getElementById("status");
const cleanupNowBtn = document.getElementById("cleanup-now");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function readForm() {
  return {
    enabled: form.enabled.checked,
    staleDays: Number(form.staleDays.value),
    checkIntervalMinutes: Number(form.checkIntervalMinutes.value),
    skipPinned: form.skipPinned.checked,
    skipActive: form.skipActive.checked,
    skipAudible: form.skipAudible.checked,
  };
}

function fillForm(settings) {
  form.enabled.checked = settings.enabled;
  form.staleDays.value = settings.staleDays;
  form.checkIntervalMinutes.value = String(settings.checkIntervalMinutes);
  form.skipPinned.checked = settings.skipPinned;
  form.skipActive.checked = settings.skipActive;
  form.skipAudible.checked = settings.skipAudible;
}

async function init() {
  const settings = await loadSettings();
  fillForm(settings);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const settings = readForm();

  if (settings.staleDays <= 0) {
    setStatus("Days must be greater than 0.", true);
    return;
  }

  await saveSettings(settings);
  setStatus("Settings saved.");
});

cleanupNowBtn.addEventListener("click", async () => {
  cleanupNowBtn.disabled = true;
  setStatus("Running cleanup…");

  try {
    const response = await chrome.runtime.sendMessage({ type: "runCleanup" });
    if (!response?.ok) {
      throw new Error(response?.error || "Cleanup failed");
    }
    setStatus(
      response.closed === 0
        ? "No stale tabs to close."
        : `Closed ${response.closed} tab(s).`,
    );
  } catch (error) {
    setStatus(String(error), true);
  } finally {
    cleanupNowBtn.disabled = false;
  }
});

init();
