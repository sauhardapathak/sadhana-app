# Sādhana

A simple daily companion for spiritual practice — checklist, streaks, lessons, goals, and reminders. Built with Expo + React Native + TypeScript.

## What it does

- **Home** — daily practice checklist you can edit, live progress, streaks, a rotating daily quote, plus a japa round counter and meditation timer.
- **Learn** — short reading lessons, each ending in a quiz (Easy → Extreme) with explanations. You can pause a quiz and resume later.
- **Progress** — personal goals with progress bars, and a seva session log.
- **Milestones** — achievements for consistency, learning, and service.
- **Profile** — your name and guide, lifetime stats, reminder settings, plus data export and reset.
- **First launch** — a short setup asks for your name, practices, and reminder time.
- **Dark mode** — follows your phone's light/dark setting.

Everything is stored **on your device only**. No account, no servers, no tracking.

## Run it

```bash
git clone https://github.com/sauhardapathak/sadhana-app.git
cd sadhana-app
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app, or press `a` (Android emulator), `i` (iOS simulator), `w` (web).

## Scripts

```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm test            # Jest unit tests
```

CI runs all of the above plus `expo-doctor` on every push.

## Project layout

```
app/               # Screens (Expo Router): (tabs)/, onboarding, learn/[id]
src/
  components/      # Reusable UI (cards, badges, counter, timer, …)
  constants/       # Theme (light + dark tokens)
  data/            # Quote library
  store/           # State (Context + useReducer, saved to AsyncStorage)
  types/           # Shared types
  utils/           # Dates, quotes, reminders
__tests__/         # Unit tests (state, dates, reminders)
eas.json           # Build profiles (needs `eas init` project ID to ship)
```

## What's next

- [x] On-device persistence, streaks, reminders, quizzes, goals, dark mode
- [ ] App-store release (EAS builds, privacy policy, listings)
- [ ] Audio lessons
- [ ] Sign-in + sync across devices
- [ ] Community and quiz challenges

## Contributing

Personal project, actively developed. Ideas welcome via issues.
