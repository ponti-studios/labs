import * as Spotlight from "@spotlightjs/spotlight";

export default function SpotlightJs() {
  // only load Spotlight in dev
  if (process.env.NODE_ENV === "development") {
    Spotlight.init();
  }
  return null;
}