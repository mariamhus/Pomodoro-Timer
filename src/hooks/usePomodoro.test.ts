// Tests the hook as a component would use it. Fake timers control both setInterval
// and Date.now(), so 25 minutes of timer runs in milliseconds.
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../lib/modes";
import { usePomodoro } from "./usePomodoro";

const MIN = 60 * 1000;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("usePomodoro", () => {
  it("starts idle on a full focus session", () => {
    const { result } = renderHook(() => usePomodoro(DEFAULT_SETTINGS, vi.fn()));
    expect(result.current).toMatchObject({ mode: "focus", status: "idle", remaining: 25 * MIN });
  });

  it("counts down while running", () => {
    const { result } = renderHook(() => usePomodoro(DEFAULT_SETTINGS, vi.fn()));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10 * MIN));

    expect(result.current.remaining).toBe(15 * MIN);
  });

  it("calls onComplete once and moves to a break when focus ends", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => usePomodoro(DEFAULT_SETTINGS, onComplete));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(25 * MIN));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("focus");
    // autoBreaks is off by default, so the break waits for the user.
    expect(result.current).toMatchObject({ mode: "short", status: "idle", cycle: 1 });
  });

  it("starts the break automatically when autoBreaks is on", () => {
    const settings = { ...DEFAULT_SETTINGS, autoBreaks: true };
    const { result } = renderHook(() => usePomodoro(settings, vi.fn()));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(25 * MIN));

    expect(result.current).toMatchObject({ mode: "short", status: "running" });
  });

  it("picks up new durations from settings while idle", () => {
    const { result, rerender } = renderHook(({ settings }) => usePomodoro(settings, vi.fn()), {
      initialProps: { settings: DEFAULT_SETTINGS },
    });

    rerender({ settings: { ...DEFAULT_SETTINGS, focus: 50 } });

    expect(result.current.remaining).toBe(50 * MIN);
  });
});
