export function handleGetActiveTabUrl(sendResponse: (response?: any) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      sendResponse({ url: null });
      return;
    }
    const activeTab = tabs[0];
    sendResponse({ url: activeTab.url });
  });
}