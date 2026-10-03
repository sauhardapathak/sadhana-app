# 🪷 Sādhana

A gentle, devotional companion for daily spiritual practice — built with **React Native + TypeScript + Expo**.

Sādhana helps you keep up a consistent daily practice (sādhana), learn from scripture through reading and listening, track goals set by your spiritual guide, and mark meaningful milestones along the path — without turning devotion into a game.

---

## ✨ Features

### 🏠 Home
- Today's sādhana checklist (puja, japa, meditation, reading…)
- Live progress bar and completion banner
- Streak tracking — current streak, longest streak, total days
- A daily reflective quote

### 📖 Learn
- **Reading** and **Listening** lessons, filterable by type
- Each lesson ends with a quiz that rises in difficulty:
  **Easy → Medium → Hard → Extreme**
- Instant answer checking with explanations
- Score summary at the end of each lesson

### 📊 Progress
- Goals assigned by your spiritual guide (or self-set)
- Visual progress bars with one-tap increment
- Separate "In Progress" and "Completed" sections

### 🎗 Milestones
- Achievements framed as spiritual milestones, not trophies
- Unlocked ("Reached") and locked ("On the Path") states
- Categories: Consistency, Knowledge, Service, Practice, Milestone

### 👤 Profile
- Avatar, spiritual name, and guide name
- Lifetime stats and streaks
- Placeholders for upcoming features

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Expo](https://expo.dev/) (SDK 57) |
| Language | TypeScript (strict) |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State | React Context + `useReducer` |
| Icons | `@expo/vector-icons` (Ionicons) |
| Styling | React Native `StyleSheet` + shared design tokens |

---

## 📁 Project Structure

```
sadhana-app/
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout — providers + stack
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── _layout.tsx         # Tab bar config
│   │   ├── index.tsx           # 🏠 Home
│   │   ├── learn.tsx           # 📖 Learn (lesson list)
│   │   ├── progress.tsx        # 📊 Progress (goals)
│   │   ├── achievements.tsx    # 🎗 Milestones
│   │   └── profile.tsx         # 👤 Profile
│   └── learn/
│       ├── _layout.tsx
│       └── [id].tsx            # Lesson detail + quiz flow
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── SadhanaCheckItem.tsx
│   │   ├── StreakBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── DifficultyBadge.tsx
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, typography tokens
│   ├── store/
│   │   └── sadhanaStore.tsx    # Global state (Context + useReducer)
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   └── utils/
│       └── date.ts             # Date/time helpers
├── app.json                    # Expo configuration
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ (20 or 22 recommended)
- The **Expo Go** app on your iOS or Android device, or a simulator/emulator

### Install & Run

```bash
# Clone the repository
git clone https://github.com/sauhardapathak/sadhana-app.git
cd sadhana-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then:
- **Phone:** scan the QR code with the Expo Go app
- **iOS simulator:** press `i`
- **Android emulator:** press `a`
- **Web:** press `w`

### Type Checking

```bash
npx tsc --noEmit
```

---

## 🔮 Roadmap

The architecture is intentionally future-ready. Planned additions:

- [ ] **Authentication** — sign in / sign up (the `UserProfile` type and provider are ready)
- [ ] **Backend + persistence** — swap the in-memory store for a real API + local caching
- [ ] **Audio lessons** — the `Lesson.audioUrl` field is already modeled; wire in `expo-av`
- [ ] **Notifications** — daily practice reminders via Expo push notifications
- [ ] **Community** — share progress and connect with fellow seekers
- [ ] **Learning Battles** — friendly quiz challenges between devotees

---

## 🤝 Contributing

This is a personal project in active development. Suggestions and ideas are welcome via issues.

---

## 🙏 A Note on Intent

This app is designed to *support* devotion, not to gamify it. Streaks and milestones are gentle encouragements toward consistency — the practice itself remains the heart of it all.

> *"Little by little, through practice and non-attachment, the mind's fluctuations are stilled."*
> — adapted from the Yoga Sūtras of Patañjali
