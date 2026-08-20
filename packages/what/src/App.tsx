import { useEffect, useState } from "react";

import { TodayPage } from "./pages/today-page";
import { DatePage } from "./pages/date-page";
import { HistoryPage } from "./pages/history-page";

const DATE_PATH = /^\/(\d{4}-\d{2}-\d{2})\/?$/;

function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  return path;
}

export function App() {
  const path = usePath();

  if (path === "/history" || path === "/history/") return <HistoryPage />;

  const dateMatch = DATE_PATH.exec(path);
  if (dateMatch) return <DatePage dateKey={dateMatch[1]} />;

  return <TodayPage />;
}
