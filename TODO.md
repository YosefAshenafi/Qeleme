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
- [ ] Figma received and confirmed.
- [ ] Implement UI layout and interactions.
- [ ] Add pagination/progress behavior.
- [ ] Add skip/next/get started behavior.
- [ ] Verify dark mode + language toggle.
- [ ] QA on iOS + Android.

### 2. Welcome
- [ ] Figma received and confirmed.
- [ ] Implement welcome structure and CTA hierarchy.
- [ ] Connect to login/signup routes.
- [ ] QA on iOS + Android.

### 3. Role Selection
- [ ] Figma received and confirmed.
- [ ] Implement student/parent selection UX.
- [ ] Validate routing to next relevant screen.
- [ ] QA on iOS + Android.

### 4. Sign In
- [ ] Figma received and confirmed.
- [ ] Implement final sign in UI.
- [ ] Keep existing validation and auth behavior.
- [ ] Improve error/empty/loading states.
- [ ] QA on iOS + Android.

### 5. Sign Up
- [ ] Figma received and confirmed.
- [ ] Implement single-student signup UI.
- [ ] Implement parent + multiple-children signup UI.
- [ ] Keep current validation behavior and OTP routing.
- [ ] Improve field-level errors and submit states.
- [ ] QA on iOS + Android.

### 6. OTP Verification
- [ ] Figma received and confirmed.
- [ ] Implement OTP entry and resend timer states.
- [ ] Confirm back/edit-phone behavior.
- [ ] QA on iOS + Android.

### 7. Forgot Password
- [ ] Figma received and confirmed.
- [ ] Implement phone/identifier request UI.
- [ ] Confirm navigation to reset flow.
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
- [ ] Figma received and confirmed.
- [ ] Implement plan cards, selection states, CTA.
- [ ] Confirm route to payment.
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

- [ ] Onboarding
- [ ] Welcome
- [ ] Role Selection
- [ ] Sign In
- [ ] Sign Up
- [ ] OTP
- [ ] Forgot Password
- [ ] Reset Password
- [ ] Children Selection
- [ ] Plan Selection
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

- [ ] You send Figma for **Onboarding** first.
- [ ] I implement Onboarding and share what is completed.
- [ ] Then we move to **Welcome** and continue in order.

