# Pomodoro Timer

A focus timer built with React and TypeScript, based on the Pomodoro technique. Work in focused sessions separated by short and long breaks. The page changes color with each mode, keeps accurate time even when the tab is in the background, and tracks how much you've focused today and this week.

**Live demo:** [pomodorotimer-sand.vercel.app](https://pomodorotimer-sand.vercel.app/)

<img width="1495" height="836" alt="image" src="https://github.com/user-attachments/assets/9e91e915-b6ba-459f-9415-963f66f68839" />

## Features

- Focus, short break, and long break modes with a large, readable countdown
- Automatic cycle: a long break after a set number of focus sessions, with progress dots for the current round
- Adjustable durations and cycle length
- Optional auto-start for breaks and for focus sessions
- Sound alert when time is up, generated with the Web Audio API (no audio files), with volume control and a test button
- Desktop notifications when a session ends in a background tab
- Countdown in the browser tab title
- Keyboard shortcuts: Space to start or pause, R to reset, S to skip, 1, 2, and 3 to switch mode
- "What are you working on?" label saved with each completed session
- Stats: focus time and sessions today, a 7-day chart, and a log of today's sessions
- Accurate timing based on timestamps, so the timer doesn't drift when the browser throttles background tabs
- Warning before closing the tab while a timer is running
- Settings, task, and history saved in local storage
- Automatic light and dark mode
- Accessible: labelled controls, live announcements when a session ends, visible focus, and reduced-motion support
- Fonts bundled with the app, so it works without loading anything from Google Fonts

## Tech stack

- [React 19](https://react.dev/) with TypeScript
- [Vite](https://vite.dev/) for development and builds
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide](https://lucide.dev/) icons
- [Fontsource](https://fontsource.org/) for self-hosted Barlow Condensed and Instrument Sans
- [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for tests

## Getting started

You need [Node.js](https://nodejs.org/) 20.19 or newer.

```bash
git clone https://github.com/mariamhus/Pomodoro-Timer.git
cd Pomodoro-Timer
npm install
npm run dev
```

Then open http://localhost:5173.

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Starts the dev server               |
| `npm run build`   | Type-checks and builds to `dist/`   |
| `npm run preview` | Serves the production build locally |
| `npm test`        | Runs the tests in watch mode        |
| `npm run test:run` | Runs the tests once                |

## How the timer works

The timer state lives in a `useReducer` inside the `usePomodoro` hook. When a session starts, the hook stores the exact time it should end instead of counting down one second at a time. Every tick recalculates the time left from that end time, so the countdown stays accurate even if the browser slows down timers in a background tab. When the time runs out, the hook records the session, plays the alert, and moves to the next mode.

## Tests

- **Timer rules** (`usePomodoro.reducer.test.ts`): the reducer is a pure function, so each test passes in a state and an action and checks the result. Covers start, pause and resume, drift-free ticking, and the focus → break → long break cycle.
- **The hook** (`usePomodoro.test.ts`): fake timers run full sessions in milliseconds and check that a finished session calls back once and moves to the right break.
- **Controls** (`Controls.test.tsx`): renders the buttons and clicks them the way a user would, finding them by role and label.
- **Formatting** (`time.test.ts`): the clock and duration helpers, including rounding and edge cases.

## Deploying

**Vercel:** import the repository at [vercel.com/new](https://vercel.com/new). Vite is detected automatically.

**Netlify:** import the repository, set the build command to `npm run build` and the publish directory to `dist`.
