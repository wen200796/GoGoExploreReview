// When Action Icon is clicked
const ValidUrlPrefix = Object.freeze({
  MAP: 'https://www.google.com/maps',
  SEARCH: 'https://www.google.com/search'
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "CHECK_ACTIVE_TAB_COMMENT_SECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ hasFoundCommentSection: false });
        return;
      }
      const activeTab = tabs[0];
      const url = activeTab.url;

      // 根據 URL 決定要查找的元素選擇器和檢查邏輯
      var elementSelector;
      var checkFunction;
      if (url.startsWith(ValidUrlPrefix.MAP)) {
        elementSelector = ".hh2c6[aria-label*='評論'][aria-selected='true']";
        checkFunction = (selector) => {
          return document.querySelector(selector) !== null;
        };
      } else if (url.startsWith(ValidUrlPrefix.SEARCH)) {
        elementSelector = ".zzG8g[aria-selected='true']";
        checkFunction = (selector) => {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const span = element.querySelector('span');
            if (span && span.innerText.includes("評論")) {
              return true;
            }
          }
          return false;
        };
      } else {
        elementSelector = "defaultSelector";
        checkFunction = (selector) => {
          return document.querySelector(selector) !== null;
        };
      }

      // 在 activeTab 中執行腳本來檢查指定元素是否存在
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: checkFunction,
        args: [elementSelector]
      }, (results) => {
        if (results[0].result) {
          console.log("指定元素存在於activeTab中");
          sendResponse({ hasFoundCommentSection: true });
        } else {
          console.log("指定元素不存在於activeTab中");
          sendResponse({ hasFoundCommentSection: false });
        }
      });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});