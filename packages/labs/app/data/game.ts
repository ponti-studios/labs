const newsboyAppUrl = import.meta.env.VITE_NEWSBOY_APP_URL;

if (!newsboyAppUrl) {
  throw new Error("VITE_NEWSBOY_APP_URL must be configured for Labs");
}

export const NEWSBOY_APP_URL = newsboyAppUrl;
