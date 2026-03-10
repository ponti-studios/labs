import type { ExtensionMessage } from "../lib/types.ts";

export default defineBackground(() => {
  // Open side panel on extension icon click
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  browser.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === "GET_PAGE_CONTENT") {
      getActiveTabContent().then(sendResponse);
      return true;
    }

    if (message.type === "GET_TABS") {
      getAllTabs().then(sendResponse);
      return true;
    }

    if (message.type === "GET_TAB_CONTENT") {
      getTabContent(message.tabId).then(sendResponse);
      return true;
    }
  });
});

async function getActiveTabContent() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { type: "PAGE_CONTENT_RESPONSE", payload: null };

  try {
    const response = await browser.tabs.sendMessage(tab.id, {
      type: "GET_PAGE_CONTENT",
    });
    return { type: "PAGE_CONTENT_RESPONSE", payload: response ?? null };
  } catch {
    return { type: "PAGE_CONTENT_RESPONSE", payload: null };
  }
}

async function getAllTabs() {
  const tabs = await browser.tabs.query({});
  const filtered = tabs
    .filter((t) => t.id && t.title && t.url && !t.url.startsWith("chrome://"))
    .map((t) => ({
      id: t.id!,
      title: t.title!,
      url: t.url!,
      favIconUrl: t.favIconUrl,
    }));
  return { type: "TABS_RESPONSE", payload: filtered };
}

async function getTabContent(tabId: number) {
  try {
    const response = await browser.tabs.sendMessage(tabId, {
      type: "GET_PAGE_CONTENT",
    });
    return { type: "TAB_CONTENT_RESPONSE", tabId, payload: response ?? null };
  } catch {
    // Content script not running — inject it
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: ["content-scripts/content.js"],
      });
      const response = await browser.tabs.sendMessage(tabId, {
        type: "GET_PAGE_CONTENT",
      });
      return { type: "TAB_CONTENT_RESPONSE", tabId, payload: response ?? null };
    } catch {
      return { type: "TAB_CONTENT_RESPONSE", tabId, payload: null };
    }
  }
}
