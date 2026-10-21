import { useCallback, useEffect, useReducer, useRef } from "react";
import { durationMs } from "../lib/modes";
import type { Mode, Settings, Status } from "../types";

export interface TimerState {
  mode: Mode;
  status: Status;
  total: number;
  remaining: number;
  endsAt: number | null;
  cycle: number;
}

type Action =
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "tick"; now: number }
  | { type: "reset"; total: number }
  | { type: "setMode"; mode: Mode; total: number }
  | { type: "advance"; settings: Settings; now: number; autoStart: boolean };

function nextStep(state: TimerState, settings: Settings): { mode: Mode; cycle: number } {
  if (state.mode === "focus") {
    const cycle = state.cycle + 1;
    return cycle >= settings.longEvery ? { mode: "long", cycle } : { mode: "short", cycle };
  }
  return { mode: "focus", cycle: state.mode === "long" ? 0 : state.cycle };
}

export function reducer(state: TimerState, action: Action): TimerState {
  switch (action.type) {
    case "start":
      if (state.status === "running" || state.remaining <= 0) return state;
      return { ...state, status: "running", endsAt: action.now + state.remaining };
    case "pause":
      if (state.status !== "running" || state.endsAt === null) return state;
      return { ...state, status: "paused", remaining: Math.max(0, state.endsAt - action.now), endsAt: null };
    case "tick":
      if (state.status !== "running" || state.endsAt === null) return state;
      return { ...state, remaining: Math.max(0, state.endsAt - action.now) };
    case "reset":
      return { ...state, status: "idle", total: action.total, remaining: action.total, endsAt: null };
    case "setMode":
      return { ...state, mode: action.mode, status: "idle", total: action.total, remaining: action.total, endsAt: null };
    case "advance": {
      const { mode, cycle } = nextStep(state, action.settings);
      const total = durationMs(mode, action.settings);
      return {
        mode,
        cycle,
        total,
        remaining: total,
        status: action.autoStart ? "running" : "idle",
        endsAt: action.autoStart ? action.now + total : null,
      };
    }
  }
}

export function usePomodoro(settings: Settings, onComplete: (mode: Mode) => void) {
  const [state, dispatch] = useReducer(reducer, settings, (initial) => ({
    mode: "focus" as Mode,
    status: "idle" as Status,
    total: durationMs("focus", initial),
    remaining: durationMs("focus", initial),
    endsAt: null,
    cycle: 0,
  }));

  const completedRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const settingsRef = useRef(settings);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    settingsRef.current = settings;
  });

  useEffect(() => {
    if (state.status !== "running") return;
    const tick = () => dispatch({ type: "tick", now: Date.now() });
    const id = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "running" || state.remaining > 0 || state.endsAt === null) return;
    if (completedRef.current === state.endsAt) return;
    completedRef.current = state.endsAt;
    const current = settingsRef.current;
    onCompleteRef.current(state.mode);
    dispatch({
      type: "advance",
      settings: current,
      now: Date.now(),
      autoStart: state.mode === "focus" ? current.autoBreaks : current.autoFocus,
    });
  }, [state.status, state.remaining, state.endsAt, state.mode]);

  useEffect(() => {
    if (state.status === "idle") dispatch({ type: "reset", total: durationMs(state.mode, settings) });
  }, [settings, state.mode, state.status]);

  const start = useCallback(() => dispatch({ type: "start", now: Date.now() }), []);
  const pause = useCallback(() => dispatch({ type: "pause", now: Date.now() }), []);
  const reset = useCallback(
    () => dispatch({ type: "reset", total: durationMs(state.mode, settingsRef.current) }),
    [state.mode],
  );
  const skip = useCallback(
    () => dispatch({ type: "advance", settings: settingsRef.current, now: Date.now(), autoStart: false }),
    [],
  );
  const setMode = useCallback(
    (mode: Mode) => dispatch({ type: "setMode", mode, total: durationMs(mode, settingsRef.current) }),
    [],
  );

  return { ...state, start, pause, reset, skip, setMode };
}
