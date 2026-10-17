import { useEffect, useRef } from "react";

type Handlers = Record<string, () => void>;

export function useHotkeys(handlers: Handlers, enabled = true) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key === " " ? "Space" : event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (target?.closest("dialog[open]")) return;
      if (target?.tagName === "BUTTON" && key === "Space") return;
      const handler = handlersRef.current[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
