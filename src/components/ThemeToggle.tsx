"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("themechange", callback);
  return () => window.removeEventListener("themechange", callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("light");
}

function getServerSnapshot() {
  return false; // default (dark) on the server
}

export default function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const isLight = document.documentElement.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light / dark mode"
      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium tracking-widest text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      {light ? "☾ DARK" : "☀ LIGHT"}
    </button>
  );
}
