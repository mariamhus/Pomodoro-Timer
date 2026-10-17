import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import type { Status } from "../types";

interface ControlsProps {
  status: Status;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function Controls({ status, onStart, onPause, onReset, onSkip }: ControlsProps) {
  const running = status === "running";
  const primaryLabel = running ? "Pause" : status === "paused" ? "Resume" : "Start";

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <button
        type="button"
        onClick={onReset}
        disabled={status === "idle"}
        aria-label="Reset timer"
        title="Reset (R)"
        className="round-button"
      >
        <RotateCcw aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        onClick={running ? onPause : onStart}
        className="inline-flex h-16 min-w-44 items-center justify-center gap-2.5 rounded-full bg-white px-8 text-lg font-bold text-[var(--mode)] shadow-[0_6px_0_rgb(0_0_0/0.18)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_rgb(0_0_0/0.18)]"
      >
        {running ? (
          <Pause aria-hidden="true" className="size-5" fill="currentColor" />
        ) : (
          <Play aria-hidden="true" className="size-5" fill="currentColor" />
        )}
        {primaryLabel}
      </button>
      <button type="button" onClick={onSkip} aria-label="Skip to next session" title="Skip (S)" className="round-button">
        <SkipForward aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
