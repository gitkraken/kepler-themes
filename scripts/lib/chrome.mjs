import { spawn } from 'node:child_process';
import { accessSync, constants, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';

// A tiny Chrome DevTools Protocol driver, so screenshots need no npm dependency. It speaks to a
// headless Chrome over Node's built-in WebSocket and only does what the preview needs: open a
// page, run a script in it, and capture a rectangle.

const CHROME_NAMES = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'];
const MACOS_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LAUNCH_TIMEOUT_MS = 20_000;
const DEFAULT_TIMEOUT_MS = 90_000;

function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** The Chrome to drive: `CHROME_PATH`, else the first known name on PATH, else the macOS app; null when there is none. */
export function findChrome({ env = process.env, platform = process.platform } = {}) {
  if (env.CHROME_PATH) return isExecutable(env.CHROME_PATH) ? env.CHROME_PATH : null;
  for (const dir of (env.PATH ?? '').split(delimiter).filter(Boolean)) {
    for (const name of CHROME_NAMES) {
      const path = join(dir, name);
      if (isExecutable(path)) return path;
    }
  }
  return platform === 'darwin' && isExecutable(MACOS_CHROME) ? MACOS_CHROME : null;
}

export const NO_CHROME_MESSAGE =
  'Chrome was not found. Install Google Chrome or Chromium, or set CHROME_PATH to its executable.';

function chromeArgs(userDataDir) {
  return [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    '--mute-audio',
    // GitHub's Ubuntu 24.04 runners restrict unprivileged user namespaces, which breaks Chrome's
    // sandbox. Running without it is acceptable there only: the page is built by this repo's
    // trusted tooling from escaped text and validated colors, never from contributor markup,
    // contributor text reaches the scripts run in it only as JSON values, and the job's token is
    // read-only. Everywhere else the sandbox stays on.
    ...(process.env.CI ? ['--no-sandbox'] : []),
    'about:blank',
  ];
}

/** Starts Chrome and resolves with the browser-level DevTools WebSocket URL from its stderr. */
function launch(executable, userDataDir) {
  const child = spawn(executable, chromeArgs(userDataDir), { stdio: ['ignore', 'ignore', 'pipe'] });
  // A Chrome that never started (a bad path) emits `error` and never `exit`.
  const exited = new Promise((resolve) => {
    child.once('exit', resolve);
    child.once('error', resolve);
  });
  const wsUrl = new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(
      () => reject(new Error(`Chrome did not report a DevTools address within ${LAUNCH_TIMEOUT_MS / 1000}s.\n${log.trim()}`)),
      LAUNCH_TIMEOUT_MS,
    );
    child.stderr.on('data', (chunk) => {
      log += chunk;
      const match = /DevTools listening on (ws:\/\/\S+)/.exec(log);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    child.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited with code ${code} before it was ready.\n${log.trim()}`));
    });
  });
  // The rejection is observed by whoever awaits wsUrl; this keeps a late exit from going unhandled.
  wsUrl.catch(() => {});
  return { child, exited, wsUrl };
}

/** A promise-based CDP connection: send() resolves with a command's result, on() hears events. */
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('Could not connect to Chrome.')), { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const listeners = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id !== undefined) {
      const call = pending.get(message.id);
      if (!call) return;
      pending.delete(message.id);
      if (message.error) call.reject(new Error(`${call.method}: ${message.error.message}`));
      else call.resolve(message.result);
    } else {
      for (const listener of listeners) listener(message);
    }
  });
  socket.addEventListener('close', () => {
    for (const call of pending.values()) call.reject(new Error('Chrome closed the connection.'));
    pending.clear();
  });
  return {
    send(method, params = {}, sessionId) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        pending.set(id, { method, resolve, reject });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    },
    on(listener) {
      listeners.push(listener);
    },
    close() {
      socket.close();
    },
  };
}

/** One tab. The viewport is wide enough for the catalog's grid and sharp at 2x. */
async function openPage(connection) {
  const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => connection.send(method, params, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });
  // The page's star field and transitions would otherwise be caught mid-motion.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Page.enable');

  const evaluate = async (expression, { awaitPromise = false } = {}) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (result.exceptionDetails) {
      throw new Error(`Script in the page failed: ${result.exceptionDetails.exception?.description ?? result.exceptionDetails.text}`);
    }
    return result.result.value;
  };

  return {
    evaluate,
    async navigate(url) {
      const loaded = new Promise((resolve) => {
        connection.on((m) => {
          if (m.sessionId === sessionId && m.method === 'Page.loadEventFired') resolve();
        });
      });
      // A failed navigation is reported here, not as an error, and its load event may never come.
      const { errorText } = await send('Page.navigate', { url });
      if (errorText) throw new Error(`Chrome could not open ${url}: ${errorText}`);
      await loaded;
      await evaluate('document.fonts.ready.then(() => true)', { awaitPromise: true });
    },
    /** A PNG of `clip` (document coordinates, CSS pixels) as a Buffer. */
    async screenshot(clip) {
      const { data } = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { ...clip, scale: 1 },
      });
      return Buffer.from(data, 'base64');
    },
  };
}

/**
 * Runs `fn(openPage)` against a fresh headless Chrome, then always kills it and removes its
 * profile directory. Rejects when Chrome is missing or the whole run passes `timeoutMs`.
 */
export async function withChrome(fn, { executable = findChrome(), timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (!executable) throw new Error(NO_CHROME_MESSAGE);
  const userDataDir = mkdtempSync(join(tmpdir(), 'kepler-themes-chrome-'));
  const chrome = launch(executable, userDataDir);
  let connection;
  let timer;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Taking the screenshots took longer than ${timeoutMs / 1000}s.`)), timeoutMs);
    });
    const work = (async () => {
      connection = await connect(await chrome.wsUrl);
      return fn(() => openPage(connection));
    })();
    // If the timeout wins, `work` may reject later; that must not become an unhandled rejection.
    work.catch(() => {});
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
    try {
      connection?.close();
    } catch {
      // Already closed.
    }
    chrome.child.kill('SIGKILL');
    await chrome.exited;
    // A throw here would replace the screenshots (or the real error) with a cleanup error.
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {
      // A leftover profile in the temp directory is harmless.
    }
  }
}
