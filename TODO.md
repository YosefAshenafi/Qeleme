# Qeleme Mobile UI Redesign TODO

Purpose: redesign all app interfaces step by step without missing any page, using Figma prototypes as the source of truth.

## How We Will Work

- [ ] We redesign one screen (or one small flow) at a time.
- [ ] You send the Figma design for the requested screen.
- [ ] I implement that screen in code and verify it.
- [ ] We review together before moving to the next screen.
- [ ] We keep visual consistency through a shared design system.

---

## Phase 0 - Setup and Rules (Do Once)

- [ ] Confirm design source: Figma prototype/screens are final reference.
- [ ] Define responsive targets (small phone, medium phone, large phone, tablet if needed).
- [ ] Confirm supported themes: light mode, dark mode.
- [ ] Confirm supported languages and RTL/LTR needs.
- [ ] Freeze core tokens:
  - [ ] colors
  - [ ] typography scale
  - [ ] spacing scale
  - [ ] border radius scale
  - [ ] elevation/shadow levels
  - [ ] icon sizes
- [ ] Define shared components to avoid duplicate UI code:
  - [ ] screen layout wrapper
  - [ ] header/top bar
  - [ ] buttons (primary/secondary/ghost)
  - [ ] text input and password input
  - [ ] dropdown/select
  - [ ] checkbox/radio/switch
  - [ ] error/success message blocks
  - [ ] loading states (button + full screen)

---

## Phase 1 - Auth Flow Redesign (Priority)

### 1. Onboarding
- [x] Figma received and confirmed.
- [x] Implement UI layout and interactions.
- [x] Add pagination/progress behavior.
- [x] Add skip/next/get started behavior.
- [x] Verify dark mode + language toggle.
- [x] QA on iOS + Android.

### 2. Welcome
- [x] Figma received and confirmed.
- [x] Implement welcome structure and CTA hierarchy.
- [x] Connect to login/signup routes.
- [x] QA on iOS + Android.

### 3. Role Selection
- [x] Skipped for now (student-only signup enabled).
- [x] Role-selection routing bypassed to direct signup.
- [ ] Re-enable parent/multi-student flow later if needed.

### 4. Sign In
- [x] Figma received and confirmed.
- [x] Implement final sign in UI.
- [ ] Keep existing validation and auth behavior.
- [ ] Improve error/empty/loading states.
- [ ] QA on iOS + Android.

### 5. Sign Up
- [x] Figma received and confirmed (aligned with auth theme).
- [x] Implement single-student signup UI.
- [x] Parent + multiple-children signup deferred (role flow skipped for now).
- [x] Keep current validation behavior and OTP routing.
- [ ] Improve field-level errors and submit states.
- [ ] QA on iOS + Android.

### 6. OTP Verification
- [x] UI aligned with auth theme (card, gradient CTA, background).
- [ ] Wire remaining copy to i18n if desired.
- [ ] Implement OTP entry and resend timer states (logic exists; confirm UX).
- [ ] Confirm back/edit-phone behavior.
- [ ] QA on iOS + Android.

### 7. Forgot Password
- [x] Figma received and confirmed (Recover Your Access / institutional email).
- [x] Implement email request UI + primary CTA + footer link.
- [x] POST `${BASE_URL}/api/auth/forgot-password` (backend can enable when ready).
- [ ] QA on iOS + Android.

### 8. Reset Password
- [ ] Figma received and confirmed.
- [ ] Implement new password form + validation states.
- [ ] Confirm success and redirect behavior.
- [ ] QA on iOS + Android.

### 9. Children Selection (if separate in flow)
- [ ] Figma received and confirmed.
- [ ] Implement selection/management UI.
- [ ] Keep data passing and validation intact.
- [ ] QA on iOS + Android.

### 10. Plan Selection
- [x] UI aligned with blue theme (cards, recommended label, scroll-to-pay).
- [ ] Figma cross-check if you have a dedicated frame.
- [x] Plan cards, selection states, CTA.
- [x] Route to payment unchanged.
- [ ] QA on iOS + Android.

### 11. Payment
- [ ] Figma received and confirmed.
- [ ] Implement payment UI and state handling.
- [ ] Verify errors, retry, loading, cancellation.
- [ ] QA on iOS + Android.

### 12. Payment Success
- [ ] Figma received and confirmed.
- [ ] Implement success feedback screen and next action.
- [ ] QA on iOS + Android.

---

## Phase 2 - Main App Pages (Post Auth)

- [ ] Home / Dashboard (`app/(tabs)/index.tsx`).
- [ ] MCQ pages.
- [ ] Flashcards pages.
- [ ] Reports pages.
- [ ] Profile and settings pages.
- [ ] KG-related pages (`kg-dashboard`, categories, instructions, picture MCQ).
- [ ] Any additional route/page not covered above.
- [ ] QA each page on iOS + Android.

---

## Phase 3 - Polish and Consistency

- [ ] Ensure all screens use shared components and tokens.
- [ ] Remove duplicated styles and dead UI code.
- [ ] Align paddings, headings, button heights, and spacing globally.
- [ ] Ensure all forms have:
  - [ ] empty states
  - [ ] error states
  - [ ] loading states
  - [ ] success states
- [ ] Accessibility pass:
  - [ ] touch target size
  - [ ] contrast checks
  - [ ] dynamic text handling
  - [ ] screen reader labels for important controls

---

## Phase 4 - Validation and Release Readiness

- [ ] Run lint and fix UI-related issues.
- [ ] Verify navigation transitions and back-stack behavior.
- [ ] Cross-check all Figma-to-code details.
- [ ] Final regression test of auth + core learning flows.
- [ ] Prepare release checklist.

---

## Figma Handoff Template (Use For Every Screen)

When I ask for a screen, please send:

- [ ] Figma link to exact frame(s).
- [ ] Screen name (example: "Welcome v2").
- [ ] Device frame size used in Figma.
- [ ] Light and dark variants (if both exist).
- [ ] Interaction notes (tap, swipe, transitions, animations).
- [ ] States (default, focus, error, loading, success, disabled).
- [ ] Assets/icons/illustrations source (or confirm existing assets should be reused).
- [ ] Copy/text finalization (headings, labels, button text).
- [ ] Anything intentionally different from current behavior.

---

## Screen-by-Screen Execution Tracker

- [x] Onboarding
- [x] Welcome
- [x] Role Selection (skipped for now)
- [x] Sign In
- [x] Sign Up
- [ ] OTP (polish / i18n / QA)
- [x] Forgot Password (polish / QA)
- [ ] Reset Password
- [ ] Children Selection
- [ ] Plan Selection (polish / Figma cross-check / QA)
- [ ] Payment
- [ ] Payment Success
- [ ] Home/Dashboard
- [ ] MCQ
- [ ] Flashcards
- [ ] Reports
- [ ] Profile/Settings
- [ ] KG Pages

---

## Next Action

- [x] You send Figma for **Onboarding** first.
- [x] I implement Onboarding and share what is completed.
- [x] You send Figma for **Welcome** next.
- [x] I implement Welcome and share what is completed.
- [x] Role Selection skipped for now (student-only).
- [x] You send Figma for **Sign In** next.
- [x] I implement Sign In and share what is completed.
- [x] **Sign Up** implemented (single student; theme-aligned).
- [ ] **OTP**: quick review on device; optional Figma tweaks; i18n for hardcoded strings if you want parity with other auth screens.
- [ ] **Forgot Password** + **Reset Password**: send Figma when ready so we match design (next major auth gaps).
- [ ] **Payment** + **Payment Success**: send Figma when ready.

