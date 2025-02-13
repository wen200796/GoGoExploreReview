import { MainStatusEnum } from "../constants/mainStatusEnum.js";
import { PlaceBasicInfo } from "./placeBasicInfo.js";


export interface MainVariable {
  mainStatus: MainStatusEnum;
  currentPageUrl?: string;
  isCurrentUrlValid: boolean;
  hasFoundFocusPlace: boolean;
  placeBasicInfo?: PlaceBasicInfo;
  hasFoundReviewSection: boolean;
}