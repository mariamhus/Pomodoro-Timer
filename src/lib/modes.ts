import type { Mode, Settings } from "../types";

export const MODES: { id: Mode; label: string; doneMessage: string }[] = [
  { id: "focus", label: "Focus", doneMessage: "Focus session complete. Time for a break." },
  { id: "short", label: "Short break", doneMessage: "Break's over. Ready to focus again?" },
  { id: "long", label: "Long break", doneMessage: "Long break's over. Ready for a new round?" },
];

export function modeInfo(mode: Mode) {
  return MODES.find((item) => item.id === mode) ?? MODES[0];
}

export function durationMs(mode: Mode, settings: Settings): number {
  return settings[mode] * 60 * 1000;
}

export const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  short: 5,
  long: 15,
  longEvery: 4,
  autoBreaks: false,
  autoFocus: false,
  sound: true,
  volume: 0.6,
  notifications: false,
};
