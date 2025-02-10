import { MainStatusEnum } from "../constants/mainStatusEnum.js";
import { PlaceBasicInfo } from "./placeBasicInfo.js";


export interface MainVariable {
  mainStatus: MainStatusEnum;
  currentPageUrl?: string;
  isCurrentUrlValid: boolean;
  hasFoundFocusPlace: boolean;
  plaveBasicInfo?: PlaceBasicInfo;
  hasFoundCommentSection: boolean;
}