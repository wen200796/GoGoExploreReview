import { reviewDetail } from "../02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { transmitReviewData } from "../common/models/transmitReviewData.js";
import { DataForRenderReview } from "./shared/models/dataForRenderReview.js";
import { renderListModeReview } from "./shared/utils/renderListModeReview.js";
import { topFilterProcess } from "./shared/utils/topFilterProcess.js";

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const reviewsContainer = document.getElementById('reviews-container') as HTMLDivElement;
  let receiveData: transmitReviewData | null = null;
  if (!reviewsContainer) {
    console.error("找不到評論容器！");
    return;
  }

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    receiveData = event.data;
    console.log('接收到的資料：', receiveData);

    if (receiveData === null) {
      console.error("尚未接收到資料！");
      return;
    }

    if (receiveData !== null && receiveData.doneLoadReviews.length === 0) {
      console.error("接收到的資料沒有評論！");
      return;
    }

    const dataForRender : DataForRenderReview = topFilterProcess(receiveData, []);
    renderListModeReview(reviewsContainer, dataForRender);
  });
});


