import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./game";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("/sw.js", { scope: "/" });
}
