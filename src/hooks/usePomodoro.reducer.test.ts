// The timer's rules live in a pure reducer: (state, action) => new state.
// No React, no real clock: every action carries its own `now`, so these tests are fast and exact.
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../lib/modes";
import { reducer, type TimerState } from "./usePomodoro";

const MIN = 60 * 1000;
const settings = DEFAULT_SETTINGS; // 25 min focus, 5 short, 15 long, long break every 4 rounds

function idle(overrides: Partial<TimerState> = {}): TimerState {
  return { mode: "focus", status: "idle", total: 25 * MIN, remaining: 25 * MIN, endsAt: null, cycle: 0, ...overrides };
}

describe("start / pause / tick", () => {
  it("start sets the end time from the remaining time", () => {
    const state = reducer(idle(), { type: "start", now: 1000 });
    expect(state.status).toBe("running");
    expect(state.endsAt).toBe(1000 + 25 * MIN);
  });

  it("tick works out remaining time from the clock, so missed ticks don't cause drift", () => {
    const running = reducer(idle(), { type: "start", now: 0 });
    // Jump 10 minutes in one tick, as happens when a background tab is throttled.
    const state = reducer(running, { type: "tick", now: 10 * MIN });
    expect(state.remaining).toBe(15 * MIN);
  });

  it("remaining never goes below zero", () => {
    const running = reducer(idle(), { type: "start", now: 0 });
    expect(reducer(running, { type: "tick", now: 99 * MIN }).remaining).toBe(0);
  });

  it("pause freezes the remaining time and resume continues from it", () => {
    let state = reducer(idle(), { type: "start", now: 0 });
    state = reducer(state, { type: "pause", now: 5 * MIN });
    expect(state).toMatchObject({ status: "paused", remaining: 20 * MIN, endsAt: null });

    // Time spent paused doesn't count.
    state = reducer(state, { type: "start", now: 60 * MIN });
    expect(state.endsAt).toBe(60 * MIN + 20 * MIN);
  });

  it("ignores actions that don't make sense in the current state", () => {
    const fresh = idle();
    expect(reducer(fresh, { type: "pause", now: 0 })).toBe(fresh);
    expect(reducer(fresh, { type: "tick", now: 0 })).toBe(fresh);

    const running = reducer(fresh, { type: "start", now: 0 });
    expect(reducer(running, { type: "start", now: 1 })).toBe(running);
  });
});

describe("reset and setMode", () => {
  it("reset returns to idle with the full duration", () => {
    const running = reducer(idle(), { type: "start", now: 0 });
    const state = reducer(running, { type: "reset", total: 25 * MIN });
    expect(state).toMatchObject({ status: "idle", remaining: 25 * MIN, endsAt: null });
  });

  it("setMode switches mode but keeps the round count", () => {
    const state = reducer(idle({ cycle: 2 }), { type: "setMode", mode: "short", total: 5 * MIN });
    expect(state).toMatchObject({ mode: "short", status: "idle", remaining: 5 * MIN, cycle: 2 });
  });
});

describe("advance (moving to the next session)", () => {
  const advance = (state: TimerState, autoStart = false) =>
    reducer(state, { type: "advance", settings, now: 0, autoStart });

  it("focus is followed by a short break and counts the round", () => {
    const state = advance(idle({ cycle: 0 }));
    expect(state).toMatchObject({ mode: "short", cycle: 1, total: 5 * MIN });
  });

  it("every 4th focus round is followed by a long break", () => {
    expect(advance(idle({ cycle: 3 }))).toMatchObject({ mode: "long", cycle: 4, total: 15 * MIN });
  });

  it("a short break goes back to focus without resetting rounds", () => {
    expect(advance(idle({ mode: "short", cycle: 2 }))).toMatchObject({ mode: "focus", cycle: 2 });
  });

  it("a long break goes back to focus and starts a new set of rounds", () => {
    expect(advance(idle({ mode: "long", cycle: 4 }))).toMatchObject({ mode: "focus", cycle: 0 });
  });

  it("runs straight away only when autoStart is on", () => {
    expect(advance(idle(), false)).toMatchObject({ status: "idle", endsAt: null });
    expect(advance(idle(), true)).toMatchObject({ status: "running", endsAt: 5 * MIN });
  });

  it("walks a full cycle: 4 focus rounds with breaks, then a long break", () => {
    let state = idle();
    const modes: string[] = [];
    for (let i = 0; i < 8; i++) {
      state = advance(state);
      modes.push(state.mode);
    }
    expect(modes).toEqual(["short", "focus", "short", "focus", "short", "focus", "long", "focus"]);
  });
});
