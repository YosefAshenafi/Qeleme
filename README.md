# MegaTest

**MegaTest** is a mobile learning app (iOS and Android) built with Expo and React Native. It is aimed at **high school (secondary)** students—practice questions, flashcards, and national exam practice—with sign-in, profiles, reports, and subscription payments. The experience is intended for a **teen** audience (typically **13+**), which fits common educational-app expectations on Google Play when you provide accurate store listing and age information.

MegaTest does **not** include AI-generated tutoring, chatbots, or similar features; learning is through structured questions and content from your configured backend.

## What the app does

- **Authentication** — login, registration, OTP verification, password reset, role and plan selection, onboarding  
- **MCQs** — curriculum questions by grade, subject, and chapter; national exam sets for supported grades  
- **Flashcards** — grade- and chapter-scoped decks  
- **Profile & reports** — student profile, stats, account settings  
- **Payments** — plan selection and checkout (return URL uses the `megatest://` app scheme)  
- **Kindergarten** — picture MCQ and category flows where enabled in the app  

## Tech stack

- **Expo SDK 54** · **React Native** · **expo-router** (file-based routes)  
- **Redux Toolkit** for app state  
- **i18next** for localization  
- **@megatest/source** — application source: UI, features, services, and types (`src/`)

## Repository layout

| Path | Purpose |
|------|---------|
| `app/` | Expo Router screens: auth, main tabs (home, MCQ, flashcards, profile, reports), kindergarten (`kg`) flows |
| `src/` | Application source: screens, services (`flashcardService`, `kgService`, …), config, components |
| `assets/` | Images, fonts, and other static assets |

## API configuration

The app resolves the backend base URL in **`src/config/constants.ts`** (`getBaseUrl()` → `BASE_URL`). Point that value at your API host for each environment. Payment-related URLs (if used) are configured in the same module.

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

- **MCQ tree** — `GET /api/mcq?gradeLevelId={gradeNumber}`  
- **National exams (grouped)** — `GET /api/questions/grouped?gradeLevelId={id}&yearId={id}&subject={name}`  
- **Available national exams** — `GET /api/national-exams/available/{gradeNumber}`  
- **Chapter MCQs** — `GET /api/mcq/questions?gradeLevelId={id}&subjectId={id}&chapterId={id}`  
- **Flashcards** — `GET /api/flashcards?...` (see `src/services/flashcardService.ts`)

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

Pull requests are welcome. Please keep changes focused and consistent with existing patterns in `app/` and `src/`.
