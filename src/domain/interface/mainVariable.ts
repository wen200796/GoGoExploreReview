import { MainStatusEnum } from "../enum/mainStatusEnum.js";

export interface MainVariable {
  mainStatus: MainStatusEnum;
  currentPageUrl: string;
  isCurrentUrlValid: boolean;
  hasFoundCommentSection: boolean;
}