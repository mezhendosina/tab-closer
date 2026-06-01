# TabCloser

Chrome extension that automatically closes tabs you have not switched to for 24 hours.

## Settings

Click the extension icon for a quick summary and **Clean up now**, or open full settings via **Settings** / right-click icon → **Options**.

Configurable options:

- Enable / disable automatic cleanup
- Days before a tab is considered stale (default: 1)
- Check interval in minutes (default: 60)
- Skip pinned, active, or audible tabs

Settings sync across Chrome via `chrome.storage.sync` when sync is enabled for your profile.

## How it works

- Uses Chrome `tabs.lastAccessed` (time you last activated the tab).
- Runs cleanup on browser startup and on the configured interval.
- Skips pinned, active, and audible tabs when those options are enabled.

## Build signed `.crx` in GitHub Actions

Workflow: [`.github/workflows/build-crx.yml`](.github/workflows/build-crx.yml)

### One-time setup

1. Generate a signing key (keep the same key for all updates):

   ```bash
   chmod +x scripts/generate-signing-key.sh
   ./scripts/generate-signing-key.sh
   ```

   Or use Chrome: `chrome://extensions` → **Pack extension** → it creates `key.pem` next to the `.crx`.

2. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CRX_PRIVATE_KEY`
   - Value: base64 of `key.pem` (one line):

     ```bash
     # macOS
     base64 -i key.pem | tr -d '\n'

     # Linux
     base64 -w0 key.pem
     ```

3. Bump `version` in `manifest.json`, commit, and push to `main`. The workflow creates tag `v{version}` (e.g. `v1.0.0`) and publishes a **Release** with `.crx` and `.zip`.

   Or run **Actions → Build CRX → Run workflow** manually to rebuild the current manifest version.

### Install from `.crx`

1. Download `tabCloser-vX.Y.Z.crx` from the Release or workflow artifact.
2. `chrome://extensions` → enable **Developer mode**.
3. Drag the `.crx` onto the page (or use **Load unpacked** if Chrome blocks CRX — then use the `.zip` from the same build).

> Use the **same** `key.pem` for every release. If you lose it, Chrome treats updates as a new extension.

## Install from ZIP

1. Unzip `tabCloser-v1.0.0.zip` into a folder.
2. Open `chrome://extensions` → enable **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder.

## Install (from source folder)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select this folder (`tabCloser`).

## Debug

1. On `chrome://extensions`, find TabCloser and click **Service worker** → **Inspect**.
2. Check the console for messages like `[TabCloser] Closed N tab(s).`
3. Lower **Close tabs after (days)** in settings (e.g. `0.01` for a quick test), click **Clean up now**, or reload the extension and wait for the next alarm.

## Restore closed tabs

Use **Ctrl+Shift+T** (Cmd+Shift+T on Mac) or Chrome’s recently closed tabs list.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Alarm scheduling and tab cleanup |
| `settings.js` | Shared defaults and storage helpers |
| `popup.html` / `options.html` | Quick panel and full settings UI |
| `icons/` | Extension icons |
| `.github/workflows/build-crx.yml` | CI: signed `.crx` + `.zip` |
| `scripts/generate-signing-key.sh` | Local PEM for `CRX_PRIVATE_KEY` secret |
