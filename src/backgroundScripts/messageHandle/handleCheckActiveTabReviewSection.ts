import { ValidUrlPrefix } from "../../02_autoScrollThenLoad/shared/constants/validUrlPrefix.js";
import { reviewSectionDetectBasicInfo } from "../../02_autoScrollThenLoad/shared/models/reviewSectionDetectBasicInfo.js";
import { googlePlaceHtmlElement } from "../../common/constants/googlePlaceHtmlElement.js";

export function handleCheckActiveTabReviewSection(sendResponse: (response?: any) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    const detectResult: reviewSectionDetectBasicInfo = new reviewSectionDetectBasicInfo();
    if (tabs.length === 0) {
      detectResult.hasFoundReviewSection = false;
      sendResponse(detectResult);
      return;
    }
    const activeTab = tabs[0];
    const url = activeTab.url || '';

    let elementSelector: string;
    if (url.startsWith(ValidUrlPrefix.MAP)) {
      elementSelector = `${googlePlaceHtmlElement.PLACE_SECTION_TAB}[aria-label*='評論'][aria-selected='true']`;
    } else {
      elementSelector = "defaultSelector";
    }

    chrome.scripting.executeScript({
      target: { tabId: activeTab.id! },
      func: (selector: string) => {
        return document.querySelector(selector) !== null;
      },
      args: [elementSelector]
    }, (results: any) => {
      if (results[0].result) {
        console.log("指定元素存在於activeTab中");

        chrome.scripting.executeScript({
          target: { tabId: activeTab.id! },
          func: (googlePlaceHtmlElement) => {
            class reviewSectionDetectBasicInfo {
              hasFoundReviewSection: boolean = true;
              showStarRating: number | null = null;
              showTotalReview: number | null = null;
            }

            const reviewBasicInfo = new reviewSectionDetectBasicInfo();
            const element = document.querySelector(googlePlaceHtmlElement.PLACE_REVIEW_SECTION_SHOW_STAR_RATING);
            if (element && element.getAttribute('aria-label')) {
              const ariaLabel = element.getAttribute('aria-label');
              const match = ariaLabel?.match(/(\d+(\.\d+)?) 顆星/);
              if (match) {
                reviewBasicInfo.showStarRating = parseFloat(match[1]);
              }
            }

            const nextElement = element?.nextElementSibling;
            if (nextElement && nextElement.textContent) {
              const reviewMatch = nextElement.textContent.match(/(\d[\d,]*) 篇評論/);
              if (reviewMatch) {
                reviewBasicInfo.showTotalReview = parseInt(reviewMatch[1].replace(/,/g, ''), 10);
              }
            }
            return reviewBasicInfo;
          },
          args: [googlePlaceHtmlElement]
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
}