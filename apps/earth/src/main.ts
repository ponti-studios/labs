import { mount } from "svelte";
import App from "./App.svelte";

// Import Cesium viewer custom element (registers it)
import "./lib/cesium/CesiumViewer";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
