// When Action Icon is clicked
chrome.action.onClicked.addListener((tab) => {
    
  // Open Side Panel
  chrome.sidePanel.open({ tabId: tab.id }, () => {
      console.log("Side Panel Opened");
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_ACTIVE_TAB_URL") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ url: null });
        return;
      }
      const activeTab = tabs[0];
      sendResponse({ url: activeTab.url });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});