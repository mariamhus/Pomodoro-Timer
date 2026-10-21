// Component tests with React Testing Library: find elements the way a user would
// (by role and accessible name) and click them with user-event.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Status } from "../types";
import { Controls } from "./Controls";

function setup(status: Status) {
  const handlers = { onStart: vi.fn(), onPause: vi.fn(), onReset: vi.fn(), onSkip: vi.fn() };
  render(<Controls status={status} {...handlers} />);
  return handlers;
}

describe("Controls", () => {
  it.each([
    ["idle", "Start"],
    ["running", "Pause"],
    ["paused", "Resume"],
  ] as const)("shows %s state as a %s button", (status, label) => {
    setup(status);
    expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
  });

  it("calls onStart from the idle state", async () => {
    const user = userEvent.setup();
    const idle = setup("idle");

    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(idle.onStart).toHaveBeenCalledOnce();
    expect(idle.onPause).not.toHaveBeenCalled();
  });

  it("calls onPause from the running state", async () => {
    const user = userEvent.setup();
    const running = setup("running");

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(running.onPause).toHaveBeenCalledOnce();
    expect(running.onStart).not.toHaveBeenCalled();
  });

  it("disables reset when there is nothing to reset", () => {
    setup("idle");
    expect(screen.getByRole("button", { name: "Reset timer" })).toBeDisabled();
  });

  it("resets and skips from a running timer", async () => {
    const user = userEvent.setup();
    const running = setup("running");

    await user.click(screen.getByRole("button", { name: "Reset timer" }));
    await user.click(screen.getByRole("button", { name: "Skip to next session" }));

    expect(running.onReset).toHaveBeenCalledOnce();
    expect(running.onSkip).toHaveBeenCalledOnce();
  });
});
