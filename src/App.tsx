import { useCallback, useEffect, useState } from "react";
import { ChartColumn, Settings as SettingsIcon } from "lucide-react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Controls } from "./components/Controls";
import { ModeTabs } from "./components/ModeTabs";
import { RoundPips } from "./components/RoundPips";
import { SettingsDialog } from "./components/SettingsDialog";
import { StatsPanel } from "./components/StatsPanel";
import { TaskInput } from "./components/TaskInput";
import { TimerDisplay } from "./components/TimerDisplay";
import { useHotkeys } from "./hooks/useHotkeys";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePomodoro } from "./hooks/usePomodoro";
import { playChime, unlockAudio } from "./lib/chime";
import { DEFAULT_SETTINGS, MODES, modeInfo } from "./lib/modes";
import { sendNotification } from "./lib/notify";
import { createId, formatClock } from "./lib/time";
import type { Mode, Session, Settings } from "./types";

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>("pomodoro:settings", DEFAULT_SETTINGS);
  const [sessions, setSessions] = useLocalStorage<Session[]>("pomodoro:sessions", []);
  const [task, setTask] = useLocalStorage<string>("pomodoro:task", "");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);

  const handleComplete = useCallback(
    (finished: Mode) => {
      if (finished === "focus") {
        setSessions((previous) => [
          ...previous,
          { id: createId(), minutes: settings.focus, completedAt: new Date().toISOString(), task: task.trim() },
        ]);
      }
      const message = modeInfo(finished).doneMessage;
      setAnnouncement(message);
      if (settings.sound) playChime(settings.volume);
      if (settings.notifications && document.hidden) sendNotification("Pomodoro", message);
    },
    [settings, task, setSessions],
  );

  const timer = usePomodoro(settings, handleComplete);
  const info = modeInfo(timer.mode);

  const start = useCallback(() => {
    unlockAudio();
    timer.start();
  }, [timer]);

  const changeMode = useCallback(
    (mode: Mode) => {
      if (mode === timer.mode) return;
      if (timer.status !== "idle") {
        setPendingMode(mode);
        return;
      }
      timer.setMode(mode);
    },
    [timer],
  );

  useHotkeys(
    {
      Space: () => (timer.status === "running" ? timer.pause() : start()),
      r: () => timer.status !== "idle" && timer.reset(),
      s: timer.skip,
      "1": () => changeMode("focus"),
      "2": () => changeMode("short"),
      "3": () => changeMode("long"),
    },
    !settingsOpen && pendingMode === null,
  );

  useEffect(() => {
    document.title = timer.status === "idle" ? "Pomodoro Timer" : `${formatClock(timer.remaining)} ${info.label}`;
  }, [timer.status, timer.remaining, info.label]);

  useEffect(() => {
    document.documentElement.dataset.mode = timer.mode;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--mode").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  }, [timer.mode]);

  useEffect(() => {
    if (timer.status !== "running") return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [timer.status]);

  return (
    <>
      <div className="stage flex min-h-[92dvh] flex-col text-white">
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 pt-5 sm:px-8 sm:pt-7">
          <p className="text-lg font-bold tracking-tight">Pomodoro</p>
          <nav className="flex items-center gap-1" aria-label="Page">
            <a href="#stats-heading" className="header-button" aria-label="Your focus stats" title="Stats">
              <ChartColumn aria-hidden="true" className="size-5" />
            </a>
            <button type="button" onClick={() => setSettingsOpen(true)} className="header-button" aria-label="Settings" title="Settings">
              <SettingsIcon aria-hidden="true" className="size-5" />
            </button>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:gap-10 sm:px-8">
          <h1 className="sr-only">Pomodoro timer</h1>
          <ModeTabs mode={timer.mode} onChange={changeMode} />
          <TimerDisplay remaining={timer.remaining} total={timer.total} label={info.label} />
          <RoundPips mode={timer.mode} cycle={timer.cycle} longEvery={settings.longEvery} />
          <Controls status={timer.status} onStart={start} onPause={timer.pause} onReset={timer.reset} onSkip={timer.skip} />
          <TaskInput value={task} onChange={setTask} />
        </main>

        <p className="hidden pb-6 text-center text-sm text-white/70 sm:block">
          Press <kbd className="kbd-light">Space</kbd> to {timer.status === "running" ? "pause" : "start"},{" "}
          <kbd className="kbd-light">S</kbd> to skip, or <kbd className="kbd-light">1</kbd>–<kbd className="kbd-light">{MODES.length}</kbd> to switch mode
        </p>
      </div>

      <StatsPanel
        sessions={sessions}
        onClear={() => {
          if (window.confirm("Clear all focus history? This can't be undone.")) setSessions([]);
        }}
      />

      <footer className="mx-auto w-full max-w-4xl px-4 pb-10 text-sm text-muted sm:px-8">
        Your settings and history are saved in this browser.
      </footer>

      <p aria-live="assertive" className="sr-only">
        {announcement}
      </p>

      <ConfirmDialog
        open={pendingMode !== null}
        title={pendingMode ? `Switch to ${modeInfo(pendingMode).label}?` : ""}
        message="Your current timer will be reset."
        confirmLabel="Switch"
        onConfirm={() => {
          if (pendingMode) timer.setMode(pendingMode);
          setPendingMode(null);
        }}
        onCancel={() => setPendingMode(null)}
      />

      <SettingsDialog open={settingsOpen} settings={settings} onChange={setSettings} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
