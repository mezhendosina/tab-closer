const STALE_MS = 24 * 60 * 60 * 1000;
const ALARM_NAME = "tab-cleanup";
const ALARM_PERIOD_MINUTES = 60;

function shouldCloseTab(tab, now) {
  if (tab.lastAccessed == null) {
    return false;
  }
  if (tab.pinned || tab.active || tab.audible) {
    return false;
  }
  return now - tab.lastAccessed >= STALE_MS;
}

async function runCleanup() {
  const now = Date.now();
  const tabs = await chrome.tabs.query({});

  const tabIdsToClose = tabs
    .filter((tab) => shouldCloseTab(tab, now))
    .map((tab) => tab.id)
    .filter((id) => id != null);

  if (tabIdsToClose.length === 0) {
    console.log("[TabCloser] No stale tabs to close.");
    return;
  }

  try {
    await chrome.tabs.remove(tabIdsToClose);
    console.log(`[TabCloser] Closed ${tabIdsToClose.length} tab(s).`);
  } catch (error) {
    console.error("[TabCloser] Failed to close tabs:", error);
  }
}

function scheduleAlarm() {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: ALARM_PERIOD_MINUTES,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  scheduleAlarm();
  runCleanup();
});

chrome.runtime.onStartup.addListener(() => {
  runCleanup();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    runCleanup();
  }
});
