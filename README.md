# TabCloser

Chrome extension that automatically closes tabs you have not switched to for 24 hours.

## How it works

- Uses Chrome `tabs.lastAccessed` (time you last activated the tab).
- Runs cleanup on browser startup and every 60 minutes.
- Skips pinned tabs, the active tab in each window, and tabs playing audio.

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

3. Push a tag to build and publish to **Releases**:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

   Or run **Actions → Build CRX → Run workflow** to get `.crx` and `.zip` as downloadable artifacts (no Release without a tag).

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
3. To test faster, temporarily change `STALE_MS` in `background.js` to `60_000` (1 minute), reload the extension, and call `runCleanup()` from the service worker console.

## Restore closed tabs

Use **Ctrl+Shift+T** (Cmd+Shift+T on Mac) or Chrome’s recently closed tabs list.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Alarm scheduling and tab cleanup |
| `icons/` | Extension icons |
| `.github/workflows/build-crx.yml` | CI: signed `.crx` + `.zip` |
| `scripts/generate-signing-key.sh` | Local PEM for `CRX_PRIVATE_KEY` secret |
