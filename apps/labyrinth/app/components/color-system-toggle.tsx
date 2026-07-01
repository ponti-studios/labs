"use client";

import * as React from "react";
import { COLOR_MODE_ATTRIBUTE, COLOR_SYSTEM_ATTRIBUTE, ThemeToggle } from "@pontistudios/ui";

type ColorSystem = "primer" | "apple";
type ColorMode = "light" | "dark";

const SYSTEM_STORAGE_KEY = "labs:ui-color-system";
const MODE_STORAGE_KEY = "labs:ui-color-mode";

function applyTheme(system: ColorSystem, mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute(COLOR_SYSTEM_ATTRIBUTE, system);
  root.setAttribute(COLOR_MODE_ATTRIBUTE, mode);
}

function readStoredSystem(): ColorSystem {
  const stored = window.localStorage.getItem(SYSTEM_STORAGE_KEY);
  if (stored === "apple") return "apple";
  if (stored === "primer") return "primer";

  const fromDom = document.documentElement.getAttribute(COLOR_SYSTEM_ATTRIBUTE);
  return fromDom === "apple" ? "apple" : "primer";
}

function readStoredMode(): ColorMode {
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;

  const fromDom = document.documentElement.getAttribute(COLOR_MODE_ATTRIBUTE);
  if (fromDom === "light" || fromDom === "dark") return fromDom;

  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ColorSystemToggle() {
  if (!import.meta.env.DEV) {
    return null;
  }

  return <ColorSystemToggleDev />;
}

function ColorSystemToggleDev() {
  const [system, setSystem] = React.useState<ColorSystem>("primer");
  const [mode, setMode] = React.useState<ColorMode>("light");

  React.useEffect(() => {
    const nextSystem = readStoredSystem();
    const nextMode = readStoredMode();
    setSystem(nextSystem);
    setMode(nextMode);
    applyTheme(nextSystem, nextMode);
  }, []);

  const updateMode = React.useCallback(
    (nextMode: ColorMode) => {
      setMode(nextMode);
      window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
      applyTheme(system, nextMode);
    },
    [system],
  );

  return <ThemeToggle mode={mode} onModeChange={updateMode} />;
}
