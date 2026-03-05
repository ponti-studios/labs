// Background script for the Chrome extension
console.log("Polly background script is running");

// Listen for installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("Polly extension installed");
});
