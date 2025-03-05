import { reviewDetail } from "../02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { transmitReviewData } from "../common/models/transmitReviewData.js";

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const reviewsContainer = document.getElementById('reviews-container') as HTMLElement;
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
    reviewsContainer.innerHTML = '';
    receiveData.doneLoadReviews.slice(0, 10).forEach((review: reviewDetail) => {
      // 建立 review 容器
      const reviewDiv: HTMLDivElement = document.createElement('div');
      reviewDiv.classList.add('review');



      // 建立內容區塊
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('content');

      // 建立 stars 區塊
      const starsDiv = document.createElement('div');
      starsDiv.classList.add('stars');
      // 若有提供星數，否則用預設文字
      const starRating = document.createElement('span');
      starRating.textContent = review.starRating ? review.starRating.toString() : '?';
      starRating.style.fontSize = '30px';
      starsDiv.appendChild(starRating);

      const starScoreBase = document.createElement('span');
      starScoreBase.textContent = ' / 5';
      starScoreBase.style.color = '#666';
      starsDiv.appendChild(starScoreBase);
      contentDiv.appendChild(starsDiv);

      // 建立 meta 區塊，例如評論時間
      const metaDiv = document.createElement('div');
      metaDiv.classList.add('meta');
      metaDiv.textContent = review.relativeTime ? review.relativeTime : '未知時間';
      contentDiv.appendChild(metaDiv);




      // 建立評論內容的 p 標籤
      const p = document.createElement('p');
      p.textContent = review.content ? review.content : '';
      contentDiv.appendChild(p);

      reviewDiv.appendChild(contentDiv);

      const photosDiv = document.createElement('div');
      review.photos.forEach((photoUrl: string) => {
        const photoImg = document.createElement('img');
        photoImg.style.width = '100px';
        photoImg.style.marginRight = '5px';
        photoImg.src = photoUrl;
        photosDiv.appendChild(photoImg);
      });

      reviewDiv.appendChild(photosDiv);

      // 將建立好的 review 元素加入容器中
      reviewsContainer.appendChild(reviewDiv);
    });
  });

});


