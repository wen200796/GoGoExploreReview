import { MainStatusEnum } from "../../constants/mainStatusEnum.js";
import { ColorEnum } from "../../../../common/constants/colorEnum.js";

export const MainStatusColorMap = new Map<MainStatusEnum, ColorEnum>([
  [MainStatusEnum.AWAIT_DETECT, ColorEnum.OPERATE_BLUE],
  [MainStatusEnum.WRONG_URL, ColorEnum.OPERATE_BLUE],
  [MainStatusEnum.NO_FOCUS_PLACE_INFO, ColorEnum.OPERATE_BLUE],
  [MainStatusEnum.NOT_COMMENT_SECTION, ColorEnum.OPERATE_BLUE],
  [MainStatusEnum.READY_TO_START, ColorEnum.OPERATE_ORANGE],
  [MainStatusEnum.LOADING, ColorEnum.WARNING_RED],
  [MainStatusEnum.FAIL_LOAD, ColorEnum.OPERATE_ORANGE],
  [MainStatusEnum.DONE_LOADING, ColorEnum.OPERATE_ORANGE],
  [MainStatusEnum.ANALYZING, ColorEnum.WARNING_RED],
  [MainStatusEnum.DONE_ANALYZE, ColorEnum.DONE_GREEN],
  [MainStatusEnum.FAIL_ANALYZE, ColorEnum.OPERATE_ORANGE],
  [MainStatusEnum.ERROR, ColorEnum.WARNING_RED]
]);
