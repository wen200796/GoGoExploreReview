import { ValidUrlPrefix } from "./02_autoScrollThenLoad/shared/constants/validUrlPrefix.js";
import { reviewSectionDetectBasicInfo } from "./02_autoScrollThenLoad/shared/models/reviewSectionDetectBasicInfo.js";

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
  if (request.action === "CHECK_ACTIVE_TAB_REVIEW_SECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {

      const detectResult: reviewSectionDetectBasicInfo = new reviewSectionDetectBasicInfo();
      if (tabs.length === 0) {
        detectResult.hasFoundReviewSection = false;
        sendResponse(detectResult);
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
          // 再次從網頁中獲取元素資料
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id! },
            func: () => {
              class reviewSectionDetectBasicInfo {
                hasFoundReviewSection: boolean = true;
                showStarRating: number | null = null;
                showTotalReview: number | null = null;
              }

              const reviewBasicInfo = new reviewSectionDetectBasicInfo();
              const element = document.querySelector('.YTkVxc');
              if (element && element.getAttribute('aria-label')) {
                const ariaLabel = element.getAttribute('aria-label');
                const match = ariaLabel?.match(/(\d+(\.\d+)?) 顆星/);
                if (match) {
                  reviewBasicInfo.showStarRating = parseFloat(match[1]);
                }
              }

              const nextElement = element?.nextElementSibling;
              if (nextElement && nextElement.textContent) {
                const reviewMatch =  nextElement.textContent.match(/(\d[\d,]*) 篇評論/);
                if (reviewMatch) {
                  reviewBasicInfo.showTotalReview = parseInt(reviewMatch[1].replace(',', ''), 10);
                }
              }
              return reviewBasicInfo;
            }
          }, (results: any) => {
            if (results[0].result) {
              Object.assign(detectResult, results[0].result);
              sendResponse(detectResult);
            } else {
              console.log("無法獲取元素資料");
              sendResponse(detectResult);
            }
          });
        } else {
          console.log("指定元素不存在於activeTab中");
          detectResult.hasFoundReviewSection = false;
          sendResponse(detectResult);
        }
      });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});

function getShowReviewBasicInfo(reviewSectionDetectBasicInfo: reviewSectionDetectBasicInfo): reviewSectionDetectBasicInfo {
  const element = document.querySelector('.YTkVxc');
  if (element && element.getAttribute('aria-label')) {
    const ariaLabel = element.getAttribute('aria-label');
    const match = ariaLabel?.match(/(\d+(\.\d+)?) 顆星/);
    if (match) {
      reviewSectionDetectBasicInfo.showStarRating = parseFloat(match[1]);
    }
  }

  const nextElement = element?.nextElementSibling;
  if (nextElement && nextElement.textContent) {
    const reviewMatch = nextElement.textContent.match(/(\d+) 篇評論/);
    if (reviewMatch) {
      reviewSectionDetectBasicInfo.showTotalReview = parseInt(reviewMatch[1], 10);
    }
  }
  return reviewSectionDetectBasicInfo;

}