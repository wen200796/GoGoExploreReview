import { ValidUrlPrefix } from "./02_autoScrollThenLoad/shared/constants/validUrlPrefix.js";
import { reviewDetail } from "./02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { reviewSectionDetectBasicInfo } from "./02_autoScrollThenLoad/shared/models/reviewSectionDetectBasicInfo.js";
import { handleCheckActiveTabReviewSection } from "./backgroundScripts/messageHandle/handleCheckActiveTabReviewSection.js";
import { handleGetActiveTabUrl } from "./backgroundScripts/messageHandle/handleGetActiveTabUrl.js";
import { handleLoadReviews } from "./backgroundScripts/messageHandle/handleLoadReviews.js";
import { googlePlaceHtmlElement } from "./common/constants/googlePlaceHtmlElement.js";

const reviewElementNodes: HTMLElement[] = [];
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

// 處理 GET_ACTIVE_TAB_URL 消息
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "GET_ACTIVE_TAB_URL") {
    handleGetActiveTabUrl(sendResponse);
    return true; // Indicates that the response will be sent asynchronously
  }
});

// 處理 CHECK_ACTIVE_TAB_REVIEW_SECTION 消息
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "CHECK_ACTIVE_TAB_REVIEW_SECTION") {
    handleCheckActiveTabReviewSection(sendResponse);
    return true; // Indicates that the response will be sent asynchronously
  }
});

// 處理 LOAD_REVIEWS 消息
chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (request.action === "LOAD_REVIEWS") {
    handleLoadReviews(sendResponse);
    return true; // Indicates that the response will be sent asynchronously
  }
});

