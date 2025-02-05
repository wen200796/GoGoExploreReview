import { ValidUrlPrefix } from "./02_autoScrollThenLoad/shared/constants/validUrlPrefix.js";

console.log("Background Script Loaded");
// 當點擊擴展圖標時
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  if (tab.id) {
    // 打開側邊欄
    chrome.sidePanel.open({ tabId: tab.id }, () => {
      console.log("Side Panel Opened");
    });
  }
});

// 處理來自內容腳本的消息
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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

// 處理另一個消息
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "CHECK_ACTIVE_TAB_COMMENT_SECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      if (tabs.length === 0) {
        sendResponse({ hasFoundCommentSection: false });
        return;
      }
      const activeTab = tabs[0];
      const url = activeTab.url || '';

      // 根據 URL 決定要查找的元素選擇器和檢查邏輯
      let elementSelector: string;
      let checkFunction: (selector: string) => boolean;

      if (url.startsWith(ValidUrlPrefix.MAP)) {
        elementSelector = ".hh2c6[aria-label*='評論'][aria-selected='true']";
        checkFunction = (selector: string): boolean => {
          return document.querySelector(selector) !== null;
        };
      } else if (url.startsWith(ValidUrlPrefix.SEARCH)) {
        elementSelector = ".zzG8g[aria-selected='true']";
        checkFunction = (selector: string): boolean => {
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
        checkFunction = (selector: string): boolean => {
          return document.querySelector(selector) !== null;
        };
      }

      // 在 activeTab 中執行腳本來檢查指定元素是否存在
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id! },
        func: (selector: string) => {
          return document.querySelector(selector) !== null;
        },
        args: [elementSelector]
      }, (results: any) => {
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