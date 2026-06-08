# MegaTest

**Type:** Mobile app — **iOS & Android** (Expo + React Native).

**MegaTest** is a mobile learning app for **high school (secondary) students**: curriculum practice questions, flashcards, and national-exam prep, with sign-in, profiles, progress reports, and subscription payments. It targets a **teen audience (13+)**.

Learning is delivered through **structured questions and content from a configured backend** — there is no AI tutoring or chatbot.

---

## Table of contents

- [What the app does](#what-the-app-does)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Getting started](#getting-started)
- [Verifying it works](#verifying-it-works)
- [Authentication & accounts](#authentication--accounts)
- [Project structure](#project-structure)
- [Code conventions & maintainer's guide](#code-conventions--maintainers-guide)
- [Navigation](#navigation)
- [API configuration & reference](#api-configuration--reference)
- [Quality checks: types, lint, tests](#quality-checks-types-lint-tests)
- [Build & release](#build--release)
- [Important constraints & gotchas](#important-constraints--gotchas)
- [Contributing](#contributing)

---

## What the app does

- **Authentication** — login, student registration, OTP verification, password reset, plan selection, onboarding.
- **School practice** — curriculum questions by grade → subject → chapter; national-exam sets for supported grades (6, 8, 12).
- **Flashcards** — grade- and chapter-scoped decks with a flip-card review flow.
- **Early / KG picture quiz** — a drag-to-answer picture quiz for kindergarten grades.
- **Profile & reports** — student profile, locally-tracked study stats, charts, and account settings.
- **Payments** — plan selection and checkout (the payment return uses the `megatest://` app scheme).

---

## Tech stack

| Area | Choice |
|------|--------|
| Runtime | **Expo SDK 54**, **React Native 0.81**, **React 19** (New Architecture enabled) |
| Routing | **expo-router** (file-based routes, typed routes) |
| State | **React Context** providers (auth, theme, language); screen state in co-located hooks; persisted session/prefs in secure store / AsyncStorage |
| Storage | **expo-secure-store** + **AsyncStorage** (tokens, user payload, settings, activity tracking) |
| i18n | **i18next** / **react-i18next** (`en`, `am`) |
| Animation / gesture | **react-native-reanimated** (~4.1), **react-native-gesture-handler** (~2.28) |
| Charts / media | **victory-native** (reports), **expo-av** / **expo-video**, **lottie-react-native** |
| Language | **TypeScript** (strict, via `expo/tsconfig.base`) |
| Package manager | **bun** (`bun@1.2.0`) — npm also works |

---

## Architecture overview

The app is a **single React Native client** that talks to a remote REST backend. There is no server in this repo.

```
app/ (expo-router)  ──▶  src/features/<domain>/components/<Screen>   ← thin route files re-export screens
                              │
                              ├─ hooks/      ← screen state + logic (the "brain")
                              ├─ components/ ← presentational sub-views
                              └─ styles      ← StyleSheet modules
                              │
                              ▼
                         src/features/<domain>/services/*  +  src/features/common/services/*
                              │                                   (HTTP calls → BASE_URL)
                              ▼
                         Remote REST API   (src/core/config/constants.ts → BASE_URL)
```

- **App shell / cross-cutting state** lives in `src/core/providers/` (`AuthProvider`, `ThemeProvider`, `LanguageProvider`, composed by `AppProviders`). These wrap the router and expose `useAuth()`, `useTheme()`, etc.
- **Each screen** is a route file under `app/` that re-exports a feature screen from `src/features/<domain>/components/`. The screen component is mostly **render**; its **state and logic live in a co-located hook** (e.g. `usePracticeScreen`, `useFlashcardsScreen`).
- **Network access** is centralized in **service modules** (`src/features/common/services/*` and per-feature `services/`) that call `BASE_URL` (configured in `src/core/config/constants.ts`).
- **Local analytics** (study time, accuracy, streaks shown on the Reports tab) are tracked on-device by `ActivityTrackingService` (a singleton over AsyncStorage).

---

## Getting started

### Prerequisites

- **Node.js 18+** and **bun** (`curl -fsSL https://bun.sh/install | bash`) — or npm.
- **Xcode** + iOS Simulator (for iOS) and/or **Android Studio** + an emulator (for Android).
- **Expo Go** installed on the simulator/device for the fastest dev loop (`npm run ios` / `npm run android` use it).
- Network access to the backend (`BASE_URL`) — required to sign in and load content.

### 1. Install dependencies

```bash
bun install      # preferred (declared package manager)
# or: npm install
```

### 2. Configure environment

Environment variables live in `.env` (git-ignored). The only public key the app reads is:

```bash
EXPO_PUBLIC_OPENAI_API_KEY=<your-key-if-used>
```

Backend hosts are set in code, not env — see [API configuration](#api-configuration--reference).

### 3. Run the app

| Command | What it does |
|---------|--------------|
| `npm run start` | Start the Metro dev server (then scan the QR with Expo Go, or press a target). |
| `npm run ios` | Boot the iOS Simulator + Metro and open the app in **Expo Go** (see note below). |
| `npm run android` | Build & run the Android dev build (`expo run:android`). |
| `npm run ios:native` | Build & run the native iOS dev build (`expo run:ios`). |

> **Why `npm run ios` (not `expo start` + `i`)?** Electron-based terminals (e.g. Wave) block the AppleScript event Expo uses to detect the Simulator, which crashes the CLI. `scripts/ios-sim.sh` avoids that by launching via `xcrun simctl`.

---

## Verifying it works

After the app loads in the simulator/Expo Go, confirm the core flows:

1. **Auth** — Welcome → Sign Up (or Login) → OTP → land on the **Home** tab.
2. **Practice** — Practice tab → pick a subject card → choose a chapter → answer MCQs → see the **results panel**. Try the **National Exam** tab for a supported grade (6/8/12).
3. **Flashcards** — Flashcards tab → start a deck → tap to flip → "Got it" / "Still learning" → results.
4. **Early picture quiz** (KG grade only) — drag the image onto an answer option.
5. **Reports** — Reports tab shows the accuracy ring, the 14-day study chart, practice mix, and recent activity.
6. **Profile** — Profile tab → change theme/language, open the avatar image picker, view account settings.

A green smoke-test for code health (no device needed): start Metro and confirm the JS bundle compiles —

```bash
npm run start
# in another shell, fetch the bundle (HTTP 200 + large JS body = whole app resolves & transforms):
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=ios&dev=true"
```

---

## Authentication & accounts

**Authentication is required**, and **there are no seeded/demo accounts.** Accounts are real records on the backend.

- Create a **student** account in-app via **Sign Up** (full name, username, password, grade, plan). This calls `POST /api/auth/register/student` against `BASE_URL` and requires OTP verification.
- A **reachable backend** (`BASE_URL` in `src/core/config/constants.ts`) is required to register, sign in, and load content.
- Tokens and the user payload are persisted via `src/features/auth/utils/authStorage.ts` (secure store + AsyncStorage).

There are no admin or multi-role logins in the client — it is a single **student** role.

---

## Project structure

### How the repo is split

| Layer | Path | Role |
|-------|------|------|
| **Routes** | `app/` | expo-router only: groups `(auth)`, `(tabs)`, `(early)`, and the entry `index`. Files are thin re-exports, e.g. `export { default } from '@/features/.../Screen'`. |
| **Source** | `src/` | All product code: screens, services, shared UI, providers, theme, i18n, config, types. |
| **Assets** | `assets/` | Images, fonts, Lottie; referenced via the `@/assets/*` alias. |
| **Native** | `ios/`, `android/` | Native projects for dev/release builds. **Hand-maintained — do not run `expo prebuild`** (see gotchas). |
| **Scripts** | `scripts/` | Dev helpers: `ios-sim.sh` (Wave-safe sim launch), `gen-quiz-sounds.mjs`, `strip-ts-comments.mjs`, `patch-expo-applescript.mjs`. |

### Inside `src/`

Product code is organized **by feature** under `src/features/`. Each domain (`auth`, `home`, `practice`, `flashcards`, `early`, `profile`, `reports`, `root`) contains the subfolders it needs:

```
src/
├─ core/                     # app shell (not a product feature)
│  ├─ providers/             # AuthProvider, ThemeProvider, LanguageProvider, AppProviders
│  ├─ theme/                 # colors
│  ├─ i18n/                  # i18next setup
│  └─ config/                # constants.ts (BASE_URL, payment/OTP hosts)
├─ features/
│  ├─ <domain>/
│  │  ├─ components/         # screen + presentational sub-components + *.styles.ts
│  │  ├─ hooks/              # screen state/logic hooks
│  │  ├─ services/           # HTTP calls for this domain
│  │  ├─ utils/  constants/  types/
│  └─ common/                # cross-feature code (shared UI, services, hooks, utils, types)
└─ i18n/locales/             # en.ts, am.ts (translation data)
```

**Rule of thumb:** code owned by one domain stays in that domain folder. Code used by 2+ domains goes in `src/features/common/`.

### Imports / path aliases

Configured in `tsconfig.json` + `metro.config.js`:

| Alias | Resolves to |
|-------|-------------|
| `@/*`, `@shared/*` | `src/*` |
| `@/features/*` | `src/features/*` |
| `@/components/*` | `src/features/common/components/*` |
| `@/core/*`, `@/config/*` | `src/core/*`, `src/core/config/*` |
| `@/services/*`, `@/hooks/*`, `@/utils/*`, `@/constants/*`, `@/types/*` | corresponding `src/features/common/*` |
| `@/assets/*` | `assets/*` |

---

## Code conventions & maintainer's guide

> This section is the most important for anyone extending the code. The screens follow a few consistent patterns; mirror them and the codebase stays predictable.

### Conventions

- **Feature ownership** — put new code under the owning `src/features/<domain>/`; only promote to `common/` when a second feature needs it.
- **Keep files focused (~500 lines max).** When a hook, component, or stylesheet grows past ~500 lines, split it using the patterns below. (ESLint/TS won't enforce this — it's a review guideline.)
- **No inline comments** — `no-inline-comments` is an ESLint **error**. Use block comments on their own line to explain *why*, not *what*.
- **English only** for all identifiers, comments, and code-facing strings; user-facing copy goes through i18n (`t('...')`), never hard-coded.
- **Remote vs. local strings** — subject/category/chapter/exam names come from the backend, **not** the i18n files. If a label isn't found in `src/i18n/locales/`, it is backend data.
- **Don't "fix" `react-hooks/exhaustive-deps` warnings blindly** — several effects use intentionally curated dependency arrays; changing them alters fetch/timing behavior.

### Screen anatomy

A screen is split into four kinds of file so render, logic, and styling stay separate:

```
app/(tabs)/practice.tsx                         → re-exports the screen
src/features/practice/components/
  PracticeScreen.tsx                            → render only (reads from the hook)
  *.styles.ts                                   → StyleSheet
src/features/practice/hooks/
  usePracticeScreen.tsx                         → state + effects + composition (the "brain")
```

### Pattern 1 — Orchestrator hook + focused sub-hooks (for complex screens)

The **Practice** feature is the reference example. `usePracticeScreen` is a thin **orchestrator** that owns shared state and composes small, single-responsibility hooks:

| File | Responsibility |
|------|----------------|
| `hooks/usePracticeScreen.tsx` | Orchestrator: shared state + wiring + the public object the screen consumes |
| `hooks/usePracticeTimer.ts` | MCQ stopwatch (state + lifecycle) |
| `hooks/usePracticeDerived.ts` | Memoized selectors (filtered/sorted subject lists, grid columns) |
| `hooks/usePracticePreselection.ts` | Applies navigation pre-selection params + list auto-scroll effects |
| `hooks/usePracticeLifecycle.tsx` | Screen-focus refetch, KG redirect, nav header config, route-driven reset |
| `hooks/practiceHelpers.ts` | Pure functions (grade parsing, result copy, option styling) |

When extracting **handlers** that touch a lot of shared state, use a **factory function** with a fully-typed dependency interface (the compiler then verifies every dependency is wired):

```ts
// practiceMcqHandlers.ts
export interface McqHandlerDeps { /* state values + setters it needs */ }
export function createMcqHandlers(deps: McqHandlerDeps) {
  const handleAnswerSelect = (id: string) => { /* uses deps.* */ };
  return { handleAnswerSelect, /* ... */ };
}
```

This keeps state ownership in the orchestrator (so behavior/timing is unchanged) while moving large handler bodies out. See `practiceMcqHandlers.ts`, `practiceBooksHandlers.ts`, `practiceNationalExamHandlers.ts`. The Flashcards feature uses the same idea (`createFlashcardsHandlers.ts`).

### Pattern 2 — Zero-churn stylesheet splitting

Large `*.styles.ts` files are split into section modules that export **plain style objects**, then merged once. Consumers keep importing the same name and using `styles.<key>` — nothing else changes:

```ts
// PracticeScreen.styles.ts (the index)
import { StyleSheet } from 'react-native';
import { practiceResultsStyles } from './practiceResults.styles';
import { practiceBooksStyles } from './practiceBooks.styles';

export const PracticeScreenStyles = StyleSheet.create<any>({
  ...practiceResultsStyles,
  ...practiceBooksStyles,
});
```

Shared style constants (brand color, screen dimensions) go in a `*StyleTokens.ts` module so each section can import only what it uses.

### Pattern 3 — Presentational sub-components

Big render blocks (modals, lists, cards) are extracted into presentational components that receive props, e.g. `PracticeBooksList`, `PracticeChapterChooserModal`, `EarlyPictureResults`, `EarlyPictureOptions`, `QuestionImage`. The screen stays a readable composition root.

### Adding a new screen (checklist)

1. Create the screen + styles under `src/features/<domain>/components/`.
2. Put its state/logic in `src/features/<domain>/hooks/use<Screen>.ts`.
3. Add the route file under `app/(group)/<route>.tsx` that re-exports the screen.
4. Network calls go in `src/features/<domain>/services/` (or `common/services/` if shared), hitting `BASE_URL`.
5. User-facing text → add keys to `src/i18n/locales/en.ts` and `am.ts` and use `t('...')`.
6. Run [the quality checks](#quality-checks-types-lint-tests).

---

## Navigation

- **`app/index.tsx`** → `IndexScreen`: redirects by auth/grade (signed-in → tabs; KG grade → early dashboard; otherwise → welcome).
- **`(auth)`** — welcome, login, signup, forgot/reset password, OTP, plan selection, payment, onboarding.
- **`(tabs)`** — home, practice, flashcards, reports, profile.
- **`(early)`** — KG dashboard, subcategories, picture quiz, category instructions.

---

## API configuration & reference

### Configuration

Backend hosts are defined in **`src/core/config/constants.ts`**:

```ts
export const BASE_URL = 'https://www.trustechit.com';   // main REST API
export const CHAPPA_BASE_URL = 'https://api.qelem.net';  // payments
export const OTP_BASE_URL = 'https://api.afromessage.com/api';
```

Point `BASE_URL` at your environment's API host. `app.json` also has an `expo.extra.apiUrl` field — keep these in sync with your deployment so they don't drift.

### REST endpoints used by the client (`{BASE_URL}/api/...`)

**Authentication**

```http
POST /api/auth/register/student      # body: { fullName, username, password, grade, parentId, paymentPlan, amountPaid }
POST /api/auth/verify                # body: { phoneNumber, otp }
GET  /api/auth/student/profile       # header: Authorization: Bearer <token>
```

**Learning content**

```http
GET /api/mcq?gradeLevelId={gradeNumber}                                   # curriculum tree
GET /api/national-exams/available/{gradeNumber}                           # available exam years/subjects
GET /api/questions/grouped?gradeLevelId={id}&yearId={id}&subject={name}   # national exam questions
GET /api/mcq/questions?gradeLevelId={id}&subjectId={id}&chapterId={id}    # chapter questions
GET /api/flashcards?...                                                   # see flashcardService.ts
```

Response shapes follow the app's models (grades → subjects → chapters → questions with options and explanations). The authoritative client-side contracts live in `src/features/common/services/*.ts`.

---

## Quality checks: types, lint, tests

| Command | Purpose |
|---------|---------|
| `npx tsc --noEmit` | TypeScript type-check (no emit). Must be clean. |
| `npm run lint` (`expo lint`) | ESLint. **Use `expo lint`, not `npx eslint .`** — the latter lints `.agents/skills` examples and reports false errors. |
| `npm test` | Jest (`jest --watchAll`) via `jest-expo`. |

> **Tests:** the Jest toolchain (`jest-expo`, `react-test-renderer`) is configured but the suite is currently empty. New tests belong next to the code they cover or under a `__tests__/` folder.

---

## Build & release

All build helpers live in the **`Makefile`** — run `make` (or `make help`) to list them. Local Android release builds are signed via a **git-ignored `android/keystore.properties`**.

### Android — local release APK

**One-time setup** (release keystore + its credentials file):

```bash
make android-keystore                                   # generates android/app/release.keystore (keytool prompts for passwords)
cp android/keystore.properties.example android/keystore.properties
# then edit android/keystore.properties with the storePassword / keyPassword you chose
```

> ⚠️ **Back up `android/app/release.keystore` and its passwords.** Both are git-ignored. If you publish to Google Play, every future update **must** be signed with this same keystore — losing it means you can no longer update the app.

**Build:**

```bash
make android-apk      # signed release APK → android/app/build/outputs/apk/release/app-release.apk
make android-aab      # signed release AAB → android/app/build/outputs/bundle/release/app-release.aab  (Play Store)
make android-install  # adb install the APK on a connected device/emulator
make android-clean    # ./gradlew clean
```

Signing is wired in `android/app/build.gradle`: the `release` build type reads `android/keystore.properties`, and falls back to the debug keystore if that file is absent (so fresh clones still build).

### iOS

```bash
make ios-run          # build & run a Release build on a simulator/device
make ios-ipa          # archive + export a release .ipa locally (Xcode)
make ios-testflight   # cloud build for TestFlight (EAS)
make ios-submit       # submit the latest build to TestFlight (EAS)
```

### App identity

- **Bundle / package ID** — iOS & Android: `com.megatest.edu` (`app.json`).
- **Version** — set in `app.json` (`version`) and mirrored in `android/app/build.gradle` (`versionName` / `versionCode`); keep them in sync each release.
- **URL scheme** — `megatest` (deep links, e.g. payment return).
- **EAS** — project id under `expo.extra.eas` in `app.json`; profiles in `eas.json`.

---

## Important constraints & gotchas

- **Never run `expo prebuild`.** The `ios/` and `android/` projects (and app icons) are hand-maintained; prebuild reverts manual pbxproj/asset edits. Change icons via `app.json` + regenerated native assets.
- **No app-wide `GestureHandlerRootView`.** Wrap gesture screens individually (the early picture quiz does this).
- **`ThemedText` forces `lineHeight: 24`.** If you set `fontSize` above ~20, also set `lineHeight`, or Amharic glyphs clip.
- **iOS Simulator in Electron terminals** (Wave) — use `npm run ios`, not `expo start` + `i`.
- **`exhaustive-deps` warnings** are intentional in several effect hooks; don't auto-fix them.

---

## Contributing

Pull requests welcome. Keep changes focused and consistent with the patterns above:

- New screens/logic under `src/` (usually `src/features/<domain>/`); new routes as small re-export files under `app/`.
- Keep files under ~500 lines — split using the [maintainer patterns](#code-conventions--maintainers-guide).
- Before opening a PR: `npx tsc --noEmit` clean, `npm run lint` with **0 errors**, and the app loads in the simulator.
