import { reviewDetail } from "../../../02_autoScrollThenLoad/shared/models/reviewDetail";
import { transmitReviewData } from "../../../common/models/transmitReviewData.js";
import { ConditionGroup } from "../../../common/types/Condition.js";
import { DataForRenderReview } from "../models/dataForRenderReview.js";
export function topFilterProcess(data: transmitReviewData, condtions: ConditionGroup<reviewDetail|null>[]): DataForRenderReview {
  const idMatchConditons = new Map<number, number[]>();
    const toRenderReviewData : reviewDetail[] = [];
    data.doneLoadReviews.forEach((review : reviewDetail) => {
        if(review.hasReply){
            toRenderReviewData.push(review);
        }
    });

    const dataForRenderReview : DataForRenderReview = new DataForRenderReview();
    dataForRenderReview.toRenderReviewData = toRenderReviewData;
    return dataForRenderReview;
}