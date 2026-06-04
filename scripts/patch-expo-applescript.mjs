#!/usr/bin/env node
/**
 * patch-expo-applescript.mjs — Make `expo run:ios` / `expo start` survive
 * blocked Apple events on Electron-based terminals (e.g. Wave).
 *
 * Why this exists: after building, installing, and launching the app, Expo's
 * AppleDeviceManager.activateWindowAsync() runs two AppleScript commands purely
 * to bring the Simulator window to the front:
 *
 *     tell app "System Events" to count processes whose name is "Simulator"
 *     tell application "Simulator" to activate
 *
 * In Electron terminals such as Wave, macOS refuses to send these Apple events
 * (error -1743, "Not authorized to send Apple events to System Events"), so
 * osascript exits non-zero and the otherwise-successful run crashes at the very
 * end — the app is already installed and opened by this point.
 *
 * This script wraps that cosmetic method in a try/catch across every installed
 * copy of @expo/cli, turning the failure into a no-op. It is idempotent (guarded
 * by a marker) and never fails the install, so it is safe as a postinstall hook.
 */
import { readdirSync, statSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { join } from "node:path";

const MARKER = "[megatest applescript patch]";

const ORIGINAL = `    async activateWindowAsync() {
        await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);
        // TODO: Focus the individual window
        await _osascript().execAsync(\`tell application "Simulator" to activate\`);
    }`;

const PATCHED = `    async activateWindowAsync() {
        // ${MARKER} Electron terminals (e.g. Wave) are blocked from sending
        // Apple events to System Events / Simulator (error -1743), which crashed
        // \`expo run:ios\` after the app was already installed and launched. This
        // window-focus step is cosmetic, so swallow any AppleScript failure.
        try {
            await (0, _ensureSimulatorAppRunning.ensureSimulatorAppRunningAsync)(this.device);
            // TODO: Focus the individual window
            await _osascript().execAsync(\`tell application "Simulator" to activate\`);
        } catch (error) {
            debug('activateWindowAsync skipped (AppleScript blocked): %s', error.message);
        }
    }`;

const TARGET_SUFFIX = join(
  "@expo",
  "cli",
  "build",
  "src",
  "start",
  "platforms",
  "ios",
  "AppleDeviceManager.js",
);

/** Recursively collect every AppleDeviceManager.js under a node_modules tree. */
function findTargets(dir, found) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // unreadable directory — skip
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findTargets(full, found);
    } else if (full.endsWith(TARGET_SUFFIX)) {
      found.push(full);
    }
  }
}

function ensureDebugBinding(source) {
  // The patched activateWindowAsync logs via the module's existing `debug`
  // binding (require('debug')(...)). Fail loudly if that assumption ever breaks.
  if (!/\bconst debug = require\('debug'\)/.test(source)) {
    throw new Error("expected `debug` binding in AppleDeviceManager.js");
  }
}

function run() {
  const root = join(process.cwd(), "node_modules");
  const targets = [];
  findTargets(root, targets);

  const seen = new Set();
  let patched = 0;
  let alreadyPatched = 0;
  let skipped = 0;

  for (const file of targets) {
    let real;
    try {
      real = realpathSync(file); // dedupe symlinks into the bun store
    } catch {
      real = file;
    }
    if (seen.has(real)) continue;
    seen.add(real);

    let source;
    try {
      source = readFileSync(real, "utf8");
    } catch {
      continue;
    }

    if (source.includes(MARKER)) {
      alreadyPatched++;
      continue;
    }
    if (!source.includes(ORIGINAL)) {
      // Different Expo version / already-modified file — leave it untouched.
      skipped++;
      continue;
    }

    try {
      ensureDebugBinding(source);
      writeFileSync(real, source.replace(ORIGINAL, PATCHED), "utf8");
      patched++;
    } catch (error) {
      skipped++;
      console.warn(`  ! could not patch ${real}: ${error.message}`);
    }
  }

  const total = patched + alreadyPatched;
  if (total > 0 || skipped > 0) {
    console.log(
      `▸ expo AppleScript patch: ${patched} patched, ${alreadyPatched} already patched, ${skipped} skipped`,
    );
  }
}

try {
  run();
} catch (error) {
  // Never fail the install over a best-effort dev-tooling patch.
  console.warn(`▸ expo AppleScript patch skipped: ${error.message}`);
}
