importScripts("settings.js");

const ALARM_NAME = "tab-cleanup";

function shouldCloseTab(tab, now, settings) {
  if (!settings.enabled) {
    return false;
  }
  if (tab.lastAccessed == null) {
    return false;
  }
  if (settings.skipPinned && tab.pinned) {
    return false;
  }
  if (settings.skipActive && tab.active) {
    return false;
  }
  if (settings.skipAudible && tab.audible) {
    return false;
  }
  return now - tab.lastAccessed >= staleMsFromSettings(settings);
}

async function runCleanup() {
  const settings = await loadSettings();
  if (!settings.enabled) {
    console.log("[TabCloser] Disabled in settings.");
    return { closed: 0 };
  }

  const now = Date.now();
  const tabs = await chrome.tabs.query({});

  const tabIdsToClose = tabs
    .filter((tab) => shouldCloseTab(tab, now, settings))
    .map((tab) => tab.id)
    .filter((id) => id != null);

  if (tabIdsToClose.length === 0) {
    console.log("[TabCloser] No stale tabs to close.");
    return { closed: 0 };
  }

  try {
    await chrome.tabs.remove(tabIdsToClose);
    console.log(`[TabCloser] Closed ${tabIdsToClose.length} tab(s).`);
    return { closed: tabIdsToClose.length };
  } catch (error) {
    console.error("[TabCloser] Failed to close tabs:", error);
    throw error;
  }
}

async function scheduleAlarm() {
  const settings = await loadSettings();
  await chrome.alarms.clear(ALARM_NAME);

  if (!settings.enabled) {
    return;
  }

  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.checkIntervalMinutes,
  });
}

async function countStaleTabs() {
  const settings = await loadSettings();
  if (!settings.enabled) {
    return 0;
  }

  const now = Date.now();
  const tabs = await chrome.tabs.query({});
  return tabs.filter((tab) => shouldCloseTab(tab, now, settings)).length;
}

chrome.runtime.onInstalled.addListener(async () => {
  await scheduleAlarm();
  await runCleanup();
});

chrome.runtime.onStartup.addListener(() => {
  runCleanup();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    runCleanup();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") {
    return;
  }
  if (
    changes.enabled ||
    changes.checkIntervalMinutes
  ) {
    scheduleAlarm();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "runCleanup") {
    runCleanup()
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "countStale") {
    countStaleTabs()
      .then((count) => sendResponse({ ok: true, count }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }
});
