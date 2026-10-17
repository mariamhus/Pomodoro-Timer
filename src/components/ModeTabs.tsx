import { MODES } from "../lib/modes";
import type { Mode } from "../types";

interface ModeTabsProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div role="group" aria-label="Timer mode" className="flex rounded-full bg-black/15 p-1">
      {MODES.map((item) => {
        const selected = item.id === mode;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-5 ${
              selected ? "bg-white text-[var(--mode)]" : "text-white/80 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
