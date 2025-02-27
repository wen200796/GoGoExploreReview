import { reviewDetail } from "../../02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { googlePlaceHtmlElement } from "../../common/constants/googlePlaceHtmlElement.js";

export function handleLoadReviews(sendResponse: (response?: any) => void) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    const activeTab = tabs[0];
    const url = activeTab.url || '';

    chrome.scripting.executeScript({
      target: { tabId: activeTab.id! },
      func: (googlePlaceHtmlElement) => {
        class reviewDetailForBackgroundFunc {
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

        const elements: NodeListOf<Element> = document.querySelectorAll(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW);

        const resultArray: reviewDetailForBackgroundFunc[] = Array.from(elements).map((element: Element) => {
          const findStarRating: number | null = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_STAR_RATING) ? parseInt(element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_STAR_RATING)!.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0') : null;

          const findRelativeTime: string | null = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_RELATIVE_TIME) ? element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_RELATIVE_TIME)!.textContent : null;

          const findContentPart: Element | null = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_CONTENT_PART) ? element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_CONTENT_PART)! : null;

          const findContent: string | null = findContentPart?.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_CONTENT) ? findContentPart?.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_CONTENT)!.textContent : null;

          const findContentCollapsed: boolean = findContentPart?.querySelector('.w8nwRe') ? true : false;

          const findReplyPart: Element | null = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_REPLY_PART) ? element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_REPLY_PART)! : null;

          const findReplyContent: string | null = findReplyPart?.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_REPLY_CONTENT) ? findReplyPart?.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_REPLY_CONTENT)!.textContent : null;

          const findPhotoPart: Element | null = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_PHOTO_PART) ? element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_PHOTO_PART)! : null;

          // 假設 findPhotoPart 是一個包含目標元素的 DOM 節點
          const findPhotoElements = findPhotoPart?.querySelectorAll(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_PHOTO_ELEMENTS) || null;

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
            });
          }

          const findLikeCount: number = element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_LIKE_COUNT) ? parseInt(element.querySelector(googlePlaceHtmlElement.PLACE_SINGLE_REVIEW_LIKE_COUNT)!.getAttribute('aria-label')?.match(/\d+/)?.[0] || '0') : 0;

          return new reviewDetailForBackgroundFunc({
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
      args: [googlePlaceHtmlElement]
    }, (results: any) => {
      if (results[0].result === null) {
        sendResponse({ loadReviews: 0 });
        return;
      };
      let reviewDetails: reviewDetail[] = [];
      Object.assign(reviewDetails, results[0].result as reviewDetail[]);
      sendResponse({ loadReviews: reviewDetails });
    });
  });
}