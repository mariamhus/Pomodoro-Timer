import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Volume2, X } from "lucide-react";
import { playChime, unlockAudio } from "../lib/chime";
import { notificationsSupported, requestNotificationPermission } from "../lib/notify";
import type { Settings } from "../types";

interface SettingsDialogProps {
  open: boolean;
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClose: () => void;
}

interface StepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

function Stepper({ id, label, value, min, max, unit, onChange }: StepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next)));
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="step-button"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isNaN(next) && event.target.value !== "") onChange(clamp(next));
          }}
          className="h-9 w-14 rounded-lg border border-line bg-paper text-center font-semibold tabular-nums focus:border-tomato focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="step-button"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
        <span className="w-16 text-sm text-muted">{unit}</span>
      </div>
    </div>
  );
}

interface ToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ id, label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-tomato" : "bg-line"}`}
      >
        <span
          className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsDialog({ open, settings, onChange, onClose }: SettingsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setNotice(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => onChange({ ...settings, [key]: value });

  async function toggleNotifications(enabled: boolean) {
    if (!enabled) {
      update("notifications", false);
      setNotice(null);
      return;
    }
    if (!notificationsSupported()) {
      setNotice("This browser doesn't support notifications.");
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      update("notifications", true);
      setNotice(null);
    } else {
      setNotice("Notifications are blocked. Allow them for this site in your browser settings, then try again.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="settings-title"
      className="sheet"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 id="settings-title" className="text-xl font-bold tracking-tight">
          Settings
        </h2>
        <button type="button" onClick={onClose} aria-label="Close settings" className="step-button -mr-2 size-10">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="overflow-y-auto px-6 pb-6">
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-muted">Timer</legend>
          <div className="divide-y divide-line">
            <Stepper id="focus" label="Focus" value={settings.focus} min={1} max={90} unit="min" onChange={(v) => update("focus", v)} />
            <Stepper id="short" label="Short break" value={settings.short} min={1} max={30} unit="min" onChange={(v) => update("short", v)} />
            <Stepper id="long" label="Long break" value={settings.long} min={1} max={60} unit="min" onChange={(v) => update("long", v)} />
            <Stepper
              id="longEvery"
              label="Long break after"
              value={settings.longEvery}
              min={2}
              max={8}
              unit="sessions"
              onChange={(v) => update("longEvery", v)}
            />
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-muted">Flow</legend>
          <div className="divide-y divide-line">
            <Toggle
              id="autoBreaks"
              label="Start breaks automatically"
              checked={settings.autoBreaks}
              onChange={(v) => update("autoBreaks", v)}
            />
            <Toggle
              id="autoFocus"
              label="Start focus sessions automatically"
              checked={settings.autoFocus}
              onChange={(v) => update("autoFocus", v)}
            />
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-muted">Alerts</legend>
          <div className="divide-y divide-line">
            <Toggle id="sound" label="Play a sound when time's up" checked={settings.sound} onChange={(v) => update("sound", v)} />
            {settings.sound && (
              <div className="flex items-center gap-3 py-3">
                <label htmlFor="volume" className="font-medium">
                  Volume
                </label>
                <input
                  id="volume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.volume}
                  onChange={(event) => update("volume", Number(event.target.value))}
                  className="min-w-0 flex-1 accent-[var(--color-tomato)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playChime(settings.volume);
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium hover:border-muted"
                >
                  <Volume2 aria-hidden="true" className="size-4" />
                  Test
                </button>
              </div>
            )}
            <Toggle
              id="notifications"
              label="Desktop notifications"
              description="Get notified when a session ends while this tab is in the background."
              checked={settings.notifications}
              onChange={(v) => void toggleNotifications(v)}
            />
          </div>
          {notice && (
            <p role="alert" className="mt-1 text-sm text-tomato">
              {notice}
            </p>
          )}
        </fieldset>

        <p className="mt-6 text-sm text-muted">
          Shortcuts: <kbd>Space</kbd> start or pause, <kbd>R</kbd> reset, <kbd>S</kbd> skip, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> switch mode.
        </p>
      </div>
    </dialog>
  );
}
