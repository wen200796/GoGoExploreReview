import { ValidUrlPrefix } from "./02_autoScrollThenLoad/shared/constants/validUrlPrefix.js";
import { reviewDetail } from "./02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { reviewSectionDetectBasicInfo } from "./02_autoScrollThenLoad/shared/models/reviewSectionDetectBasicInfo.js";
import { handleCheckActiveTabReviewSection } from "./backgroundScripts/messageHandle/handleCheckActiveTabReviewSection.js";
import { handleGetActiveTabUrl } from "./backgroundScripts/messageHandle/handleGetActiveTabUrl.js";
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

function handleLoadReviews(sendResponse: (response?: any) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    ;

    const activeTab = tabs[0];
    const url = activeTab.url || '';

    let elementSelector: string;
    elementSelector = googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_WITHOUT_REVIEWER_INFO;


    chrome.scripting.executeScript({
      target: { tabId: activeTab.id! },
      func: (selector: string) => {
        class reviewDetailForFunc {
          starRating: number | null = null; // 星星數
          relativeTime: string | null = null; // 相對時間
          absoluteTime: string | null = null; // 換算絕對時間
          hasContent: boolean = false; // 是否有評論內容
          content: string | null = null; // 評論文字
          isContentCollapsed: boolean = false; // 評論是否被收合內容
          hasReply: boolean = false; // 是否有評論回覆
          replyContent: string | null = null; // 評論回覆
          likeCount: number | null = null; // 評論案讚數
          hasPhotos: boolean = false; // 是否有評論照片
          photos: string[] = []; // 評論照片

          constructor(init?: Partial<reviewDetail>) {
            if (init) {
              Object.assign(this, init);
              if (this.relativeTime) {
                this.absoluteTime = this.calculateAbsoluteTime(this.relativeTime);
              }
              if (this.content && this.content.length > 0) {
                this.hasContent = true;
              }
              if (this.replyContent && this.replyContent.length > 0) {
                this.hasReply = true;
              }
              if (this.photos.length > 0) {
                this.hasPhotos = true;
              }
            }
          }

          private calculateAbsoluteTime(relativeTime: string | null): string | null {
            if (!relativeTime) return null;

            const now = new Date();
            const timeValue = parseInt(relativeTime);
            if (isNaN(timeValue)) return null;

            if (relativeTime.includes('秒')) {
              now.setSeconds(now.getSeconds() - timeValue);
            } else if (relativeTime.includes('分鐘')) {
              now.setMinutes(now.getMinutes() - timeValue);
            } else if (relativeTime.includes('小時')) {
              now.setHours(now.getHours() - timeValue);
            } else if (relativeTime.includes('天')) {
              now.setDate(now.getDate() - timeValue);
            } else if (relativeTime.includes('週')) {
              now.setDate(now.getDate() - timeValue * 7);
            } else if (relativeTime.includes('月')) {
              now.setMonth(now.getMonth() - timeValue);
            } else if (relativeTime.includes('年')) {
              now.setFullYear(now.getFullYear() - timeValue);
            } else {
              return null;
            }

            return now.toISOString();
          }
        }

        const elements: NodeListOf<Element> = document.querySelectorAll(selector);

        const resultArray: reviewDetailForFunc[] = Array.from(elements).map((element: Element) => {

          const findStarRating: number | null = element.querySelector('.kvMYJc') ? parseInt(element.querySelector('.kvMYJc')!.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0') : null;

          const findRelativeTime: string | null = element.querySelector('.rsqaWe') ? element.querySelector('.rsqaWe')!.textContent : null;

          const findContentPart: Element | null = element.querySelector('.MyEned') ? element.querySelector('.MyEned')! : null;

          const findContent: string | null = findContentPart?.querySelector('.wiI7pd') ? findContentPart?.querySelector('.wiI7pd')!.textContent : null;

          const findContentCollapsed: boolean = findContentPart?.querySelector('.w8nwRe') ? true : false;

          const findReplyPart: Element | null = element.querySelector('.CDe7pd') ? element.querySelector('.CDe7pd')! : null;

          const findReplyContent: string | null = findReplyPart?.querySelector('.wiI7pd') ? findReplyPart?.querySelector('.wiI7pd')!.textContent : null;

          const findPhotoPart: Element | null = element.querySelector('.KtCyie') ? element.querySelector('.KtCyie')! : null;

          // 假設 findPhotoPart 是一個包含目標元素的 DOM 節點
          const findPhotoElements = findPhotoPart?.querySelectorAll('.Tya61d') || null;

          // 用來存儲所有圖片 URL 的陣列
          const photoUrls: string[] = [];

          if (findPhotoElements) {
            findPhotoElements.forEach((element) => {
              // 提取元素的 inline style 屬性
              const style = element.getAttribute('style');

              // 如果有 style 屬性，查找 background-image
              if (style) {
                // 使用正則表達式來提取 background-image 中的 URL
                const urlMatch = style.match(/background-image:\s*url\(["']?([^"']+)["']?\)/);
                if (urlMatch && urlMatch[1]) {
                  const imageUrl = urlMatch[1];
                  // 將圖片 URL 加入到 urls 陣列中
                  photoUrls.push(imageUrl);
                }
              }
            }
            );
          }

          const findLikeCount: number = element.querySelector('.GBkF3d ') ? parseInt(element.querySelector('.GBkF3d ')!.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0') : 0;

          return new reviewDetailForFunc({
            starRating: findStarRating,
            relativeTime: findRelativeTime,
            content: findContent,
            isContentCollapsed: findContentCollapsed,
            replyContent: findReplyContent,
            photos: photoUrls,
            likeCount: findLikeCount
          });
        });

        return resultArray;
      },
      args: [elementSelector]
    }, (results: any) => {
      if (results[0].result === null) {
        sendResponse({ nodeCount: 0 });
        return;
      };
      let reviewDetails: reviewDetail[] = [];
      Object.assign(reviewDetails, results[0].result as reviewDetail[]);
      sendResponse({ nodeCount: reviewDetails });
    });
  });
}