import { reviewDetail } from "../../../02_autoScrollThenLoad/shared/models/reviewDetail.js";


export class DataForRenderReview {
  public idMatchFirstLevelConditons: Map<number, number[]> = new Map();
  public conditionMatchIds: Map<number, number[]> = new Map();
  public toRenderReviewData: reviewDetail[] = [];

    constructor(
    ) {}
  
  }