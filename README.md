# MegaTest

**MegaTest** is a mobile learning app (iOS and Android) built with Expo and React Native. It is aimed at **high school (secondary)** students—practice questions, flashcards, and national exam practice—with sign-in, profiles, reports, and subscription payments. The experience is intended for a **teen** audience (typically **13+**), which fits common educational-app expectations on Google Play when you provide accurate store listing and age information.

MegaTest does **not** include AI-generated tutoring, chatbots, or similar features; learning is through structured questions and content from your configured backend.

## What the app does

- **Authentication** — login, student registration, OTP verification, password reset, plan selection, onboarding  
- **School practice** — curriculum questions by grade, subject, and chapter; national exam sets for supported grades  
- **Flashcards** — grade- and chapter-scoped decks  
- **Profile & reports** — student profile, stats, account settings  
- **Payments** — plan selection and checkout (return URL uses the `megatest://` app scheme)  

## Tech stack

- **Expo SDK 54** · **React Native** · **expo-router** (file-based routes)  
- **React 19** with **React Context** for global UI and session state (auth, theme, language) via `src/core/providers/`  
- **i18next** for localization (`src/core/i18n`, `src/i18n/locales/`)  
- **expo-secure-store** / AsyncStorage for tokens and user payload via `src/features/auth/utils/authStorage.ts`  
- **Source** — application code lives under **`src/`** (features, `src/core`, `src/i18n`, etc.)

## Project hierarchy

### How the repo is split

| Layer | Path | Role |
|--------|------|------|
| **Routes** | `app/` | Expo Router only: URL groups `(auth)`, `(tabs)`, and the entry `index`. Files are thin re-exports such as `export { default } from '@/features/.../Screen'`. |
| **Source** | `src/` | All product code: screens, API services, shared UI, providers, theme, i18n, config, and types. |
| **Assets** | `assets/` | Images, fonts, Lottie; referenced by the `@/assets/*` alias. |
| **Native** | `ios/`, `android/` | Generated native projects for dev builds (`expo run:ios` / `expo run:android`). |

### Inside `src/`

Product code is organized **by feature** under `src/features/`. Each domain folder (`auth`, `home`, `practice`, `flashcards`, `profile`, `reports`, …) may include **`components/`**, **`hooks/`**, **`constants/`**, **`utils/`**, **`services/`**, and **`types/`** as needed—keep feature-owned code inside that feature.

**Cross-feature** code (nothing fits a single domain) lives under **`src/features/common/`** with the same kinds of subfolders (`components`, `hooks`, `constants`, `utils`, `services`, `types`). Prefer the name **`common`** for this folder.

Shared UI, services, utils, constants, and types now live under **`src/features/common/`** (see subfolders there).

| Area | Typical location |
|------|------------------|
| **Domain feature code** | `src/features/<domain>/` — `components/`, `hooks/`, `constants/`, `utils/`, `services/`, `types/` |
| **Shared across features** | `src/features/common/` — same subfolder names as above |
| **App shell** | `src/core/providers/`, `src/core/theme/`, `src/core/i18n/` |
| **Config** | `src/core/config/constants.ts` (e.g. `BASE_URL`, payment-related hosts) |

### Imports

- **`@/*`** resolves to **`src/*`** (see root `tsconfig.json` and `metro.config.js`).  
- Route files under `app/` import screen components with paths like `@/features/home/components/HomeScreen`. Shared UI tends toward `@/features/common/components/...`.

### Navigation (high level)

- **`app/index.tsx`** → `IndexScreen`: redirects by auth and grade (signed-in → tabs, else → welcome).  
- **`(auth)`** — welcome, login, signup, forgot/reset password, OTP, plan selection, payment, onboarding, etc. (student accounts only).  
- **`(tabs)`** — home, practice, flashcards, reports, profile.

## API configuration

The backend base URL is defined in **`src/core/config/constants.ts`** (`getBaseUrl()` → `BASE_URL`). Point that value at your API host for each environment. Payment-related URLs (if used) are configured in the same module. There is also a `expo.extra.apiUrl` field in `app.json`; keep these in sync with your deployment story so they do not drift.

## API reference (backend)

The mobile client calls REST endpoints under `{BASE_URL}/api/...`. Examples:

### Authentication

**Register student** — `POST /api/auth/register/student`

```json
{
  "fullName": "Jane Student",
  "username": "janestudent",
  "password": "securepassword",
  "grade": "Grade 12",
  "parentId": "0",
  "paymentPlan": "premium",
  "amountPaid": 100
}
```

**Verify OTP** — `POST /api/auth/verify`

```json
{
  "phoneNumber": "+251910810689",
  "otp": "123456"
}
```

**Student profile** — `GET /api/auth/student/profile` (header: `Authorization: Bearer <token>`)

### Learning content

- **Practice tree (curriculum)** — `GET /api/mcq?gradeLevelId={gradeNumber}`  
- **National exams (grouped)** — `GET /api/questions/grouped?gradeLevelId={id}&yearId={id}&subject={name}`  
- **Available national exams** — `GET /api/national-exams/available/{gradeNumber}`  
- **Chapter questions** — `GET /api/mcq/questions?gradeLevelId={id}&subjectId={id}&chapterId={id}`  
- **Flashcards** — `GET /api/flashcards?...` (see `src/features/common/services/flashcardService.ts`)

Responses follow the shapes used in the app (grades → subjects → chapters → questions with options and explanations).

## Getting started

1. **Install dependencies** (from the repo root):

   ```bash
   npm install
   ```

   The repo declares `bun@1.2.0` as the package manager; you can use `bun install` if you prefer.

2. **Start the dev server**:

   ```bash
   npm run start
   ```

3. **Run on a device or simulator**:

   - iOS: `npm run ios` (or `npx expo run:ios`)  
   - Android: `npm run android` (or `npx expo run:android`)  
   - Expo Go: scan the QR code from the dev server  

4. **Optional** — `npm run lint` / `npm test` for linting and tests.

## App metadata

- **Bundle IDs** — iOS/Android: `com.megatest.edu` (see `app.json`)  
- **URL scheme** — `megatest` (deep links for payment return, etc.)  
- **EAS** — project id is set under `expo.extra.eas` in `app.json` for EAS Build  

## Contributing

Pull requests are welcome. Please keep changes focused and consistent with existing patterns: new screens and logic in **`src/`** (usually under **`src/features/`**), new routes as small files under **`app/`** that re-export the right screen.
