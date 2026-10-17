import type { Mode } from "../types";

interface RoundPipsProps {
  mode: Mode;
  cycle: number;
  longEvery: number;
}

export function RoundPips({ mode, cycle, longEvery }: RoundPipsProps) {
  const current = mode === "focus" ? cycle + 1 : Math.max(cycle, 1);
  const label =
    mode === "long" ? "Round complete, enjoy the long break" : `Session ${Math.min(current, longEvery)} of ${longEvery}`;

  return (
    <div className="flex items-center gap-3">
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: longEvery }, (_, index) => {
          const done = index < cycle;
          const active = mode === "focus" && index === cycle;
          return (
            <span
              key={index}
              className={`size-2.5 rounded-full ${
                done ? "bg-white" : active ? "bg-white/45 ring-2 ring-white/70" : "bg-black/20"
              }`}
            />
          );
        })}
      </div>
      <p className="text-sm font-medium text-white/85">{label}</p>
    </div>
  );
}
