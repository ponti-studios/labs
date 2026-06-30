"use client";

import * as React from "react";
import {
  COLOR_MODE_ATTRIBUTE,
  COLOR_SYSTEM_ATTRIBUTE,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pontistudios/ui";

type ColorSystem = "primer" | "apple";
type ColorMode = "system" | "light" | "dark";

const SYSTEM_STORAGE_KEY = "labs:ui-color-system";
const MODE_STORAGE_KEY = "labs:ui-color-mode";

function applyTheme(system: ColorSystem, mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute(COLOR_SYSTEM_ATTRIBUTE, system);

  if (mode === "system") {
    root.removeAttribute(COLOR_MODE_ATTRIBUTE);
  } else {
    root.setAttribute(COLOR_MODE_ATTRIBUTE, mode);
  }
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
  if (stored === "light" || stored === "dark" || stored === "system") return stored;

  const fromDom = document.documentElement.getAttribute(COLOR_MODE_ATTRIBUTE);
  if (fromDom === "light" || fromDom === "dark") return fromDom;
  return "system";
}

export function ColorSystemToggle() {
  const [system, setSystem] = React.useState<ColorSystem>("primer");
  const [mode, setMode] = React.useState<ColorMode>("system");

  React.useEffect(() => {
    const nextSystem = readStoredSystem();
    const nextMode = readStoredMode();
    setSystem(nextSystem);
    setMode(nextMode);
    applyTheme(nextSystem, nextMode);
  }, []);

  const updateSystem = React.useCallback(
    (nextSystem: ColorSystem) => {
      setSystem(nextSystem);
      window.localStorage.setItem(SYSTEM_STORAGE_KEY, nextSystem);
      applyTheme(nextSystem, mode);
    },
    [mode],
  );

  const updateMode = React.useCallback(
    (nextMode: ColorMode) => {
      setMode(nextMode);
      window.localStorage.setItem(MODE_STORAGE_KEY, nextMode);
      applyTheme(system, nextMode);
    },
    [system],
  );

  return (
    <div className="border-border bg-background/90 fixed right-4 bottom-4 z-[60] rounded-2xl border p-3 shadow-lg backdrop-blur-md">
      <div className="grid gap-2">
        <Select value={system} onValueChange={(value) => updateSystem(value as ColorSystem)}>
          <SelectTrigger className="bg-background w-36">
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primer">Primer</SelectItem>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectContent>
        </Select>

        <Select value={mode} onValueChange={(value) => updateMode(value as ColorMode)}>
          <SelectTrigger className="bg-background w-36">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
