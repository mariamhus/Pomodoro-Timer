import { formatClock } from "../lib/time";

interface TimerDisplayProps {
  remaining: number;
  total: number;
  label: string;
}

export function TimerDisplay({ remaining, total, label }: TimerDisplayProps) {
  const clock = formatClock(remaining);
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
  const minutesLeft = Math.ceil(remaining / 60000);

  return (
    <div className="w-full">
      <p
        role="timer"
        aria-label={`${minutesLeft} ${minutesLeft === 1 ? "minute" : "minutes"} left in ${label.toLowerCase()}`}
        className="digits flex justify-center leading-[0.82] select-none"
      >
        {clock.split("").map((char, index) => (
          <span key={index} aria-hidden="true" className={char === ":" ? "digit-colon" : "digit"}>
            {char}
          </span>
        ))}
      </p>
      <div
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="mx-auto mt-6 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-black/20"
      >
        <div className="h-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}
