const whatAppUrl = import.meta.env.VITE_WHAT_APP_URL;

if (!whatAppUrl) {
  throw new Error("VITE_WHAT_APP_URL must be configured for Labs");
}

export const WHAT_APP_URL = whatAppUrl;
