const DEFAULT_SETTINGS = {
  enabled: true,
  staleDays: 1,
  checkIntervalMinutes: 60,
  skipPinned: true,
  skipActive: true,
  skipAudible: true,
};

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

async function saveSettings(settings) {
  await chrome.storage.sync.set(settings);
}

function staleMsFromSettings(settings) {
  return settings.staleDays * 24 * 60 * 60 * 1000;
}
