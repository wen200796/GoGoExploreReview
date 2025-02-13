import { MainStatusEnum } from "../../constants/mainStatusEnum.js";
import { MainButtonTextEnum } from "../../constants/MainButtonTextEnum.js";

export const MainStatusButtonTextMap = new Map<MainStatusEnum, MainButtonTextEnum>([
  [MainStatusEnum.AWAIT_DETECT, MainButtonTextEnum.START_DETECT],
  [MainStatusEnum.WRONG_URL, MainButtonTextEnum.RE_DETECT],
  [MainStatusEnum.NO_FOCUS_PLACE_INFO, MainButtonTextEnum.RE_DETECT],
  [MainStatusEnum.NOT_REVIEW_SECTION, MainButtonTextEnum.RE_DETECT],
  [MainStatusEnum.READY_TO_START, MainButtonTextEnum.START_LOAD],
  [MainStatusEnum.LOADING, MainButtonTextEnum.RE_LOAD],
  [MainStatusEnum.FAIL_LOAD, MainButtonTextEnum.STOP_LOAD],
  [MainStatusEnum.DONE_LOADING, MainButtonTextEnum.START_ANALYZE],
  [MainStatusEnum.ANALYZING, MainButtonTextEnum.STOP_ANALYZE],
  [MainStatusEnum.DONE_ANALYZE, MainButtonTextEnum.OPEN_POPUP],
  [MainStatusEnum.FAIL_ANALYZE, MainButtonTextEnum.RE_ANALYZE]
]);
