import { reviewDetail } from "../../../02_autoScrollThenLoad/shared/models/reviewDetail.js";
import { DataForRenderReview } from "../models/dataForRenderReview.js";
export function renderListModeReview(container:HTMLDivElement, data : DataForRenderReview): void {
    container.innerHTML = '';
    data.toRenderReviewData.slice(0, 10).forEach((review: reviewDetail) => {
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
      container.appendChild(reviewDiv);
    });

}