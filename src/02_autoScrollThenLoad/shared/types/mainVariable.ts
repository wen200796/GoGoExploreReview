import { MainStatusEnum } from "../constants/mainStatusEnum.js";


export interface MainVariable {
  mainStatus: MainStatusEnum;
  currentPageUrl: string;
  isCurrentUrlValid: boolean;
  hasFoundCommentSection: boolean;
}