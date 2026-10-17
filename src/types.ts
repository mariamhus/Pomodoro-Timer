export type Mode = "focus" | "short" | "long";

export type Status = "idle" | "running" | "paused";

export interface Settings {
  focus: number;
  short: number;
  long: number;
  longEvery: number;
  autoBreaks: boolean;
  autoFocus: boolean;
  sound: boolean;
  volume: number;
  notifications: boolean;
}

export interface Session {
  id: string;
  minutes: number;
  completedAt: string;
  task: string;
}
