// Plain functions in, values out: the simplest kind of test.
import { describe, expect, it } from "vitest";
import { dateKey, formatClock, formatDuration } from "./time";

describe("formatClock", () => {
  it("formats milliseconds as mm:ss", () => {
    expect(formatClock(25 * 60 * 1000)).toBe("25:00");
    expect(formatClock(65 * 1000)).toBe("01:05");
  });

  it("rounds up, so the display never shows 00:00 while time is left", () => {
    expect(formatClock(59_001)).toBe("01:00");
    expect(formatClock(1)).toBe("00:01");
  });

  it("treats negative time as zero", () => {
    expect(formatClock(-5000)).toBe("00:00");
  });
});

describe("formatDuration", () => {
  it.each([
    [25, "25 min"],
    [60, "1 h"],
    [95, "1 h 35 min"],
  ])("%i minutes -> %s", (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});

describe("dateKey", () => {
  it("uses the local date with zero padding", () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
