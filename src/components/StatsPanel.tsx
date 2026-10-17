import { Trash2 } from "lucide-react";
import { dateKey, formatDuration, formatTimeOfDay } from "../lib/time";
import type { Session } from "../types";

interface StatsPanelProps {
  sessions: Session[];
  onClear: () => void;
}

export function StatsPanel({ sessions, onClear }: StatsPanelProps) {
  const today = dateKey(new Date());
  const todaySessions = sessions.filter((session) => dateKey(new Date(session.completedAt)) === today);
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.minutes, 0);

  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    const minutes = sessions
      .filter((session) => dateKey(new Date(session.completedAt)) === key)
      .reduce((sum, session) => sum + session.minutes, 0);
    return {
      key,
      minutes,
      short: index === 6 ? "Today" : date.toLocaleDateString([], { weekday: "short" }),
      long: date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }),
    };
  });
  const weekMax = Math.max(...week.map((day) => day.minutes), 1);
  const weekMinutes = week.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <section aria-labelledby="stats-heading" className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-8 sm:py-20">
      <h2 id="stats-heading" className="text-2xl font-bold tracking-tight">
        Your focus
      </h2>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-5">
          <dt className="text-sm text-muted">Focus time today</dt>
          <dd className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{formatDuration(todayMinutes)}</dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="text-sm text-muted">Sessions today</dt>
          <dd className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{todaySessions.length}</dd>
        </div>
        <div className="col-span-2 bg-surface p-5 sm:col-span-1">
          <dt className="text-sm text-muted">Last 7 days</dt>
          <dd className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{formatDuration(weekMinutes)}</dd>
        </div>
      </dl>

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Focus time this week</h3>
          <ol className="mt-5 flex h-48 items-end gap-2 border-b border-line sm:gap-3">
            {week.map((day) => (
              <li key={day.key} className="group relative flex h-full flex-1 flex-col justify-end">
                <span className="sr-only">
                  {day.long}: {formatDuration(day.minutes)}
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-paper opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {formatDuration(day.minutes)}
                </span>
                <span
                  aria-hidden="true"
                  className={`block w-full rounded-t-[4px] ${day.key === week[6].key ? "bg-tomato" : "bg-tomato/45"}`}
                  style={{ height: day.minutes > 0 ? `${Math.max((day.minutes / weekMax) * 100, 3)}%` : "0%" }}
                />
              </li>
            ))}
          </ol>
          <ol aria-hidden="true" className="mt-2 flex gap-2 sm:gap-3">
            {week.map((day) => (
              <li key={day.key} className="flex-1 text-center text-xs text-muted">
                {day.short}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">Today's sessions</h3>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-tomato"
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Clear history
              </button>
            )}
          </div>
          {todaySessions.length === 0 ? (
            <p className="mt-4 text-muted">
              Finish a focus session and it will be logged here with what you worked on.
            </p>
          ) : (
            <ul className="mt-3">
              {[...todaySessions].reverse().map((session) => (
                <li key={session.id} className="flex items-baseline gap-4 border-b border-line py-3">
                  <span className="w-16 shrink-0 text-sm text-muted tabular-nums">
                    {formatTimeOfDay(session.completedAt)}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{session.task || "Untitled focus session"}</span>
                  <span className="text-sm text-muted tabular-nums">{session.minutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
