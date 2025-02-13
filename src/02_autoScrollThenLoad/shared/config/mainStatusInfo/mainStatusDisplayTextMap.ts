import { BidirectionalMap } from "../../../../common/models/bidirectionalMap.js";
import { MainStatusEnum } from "../../constants/mainStatusEnum.js";
import { MainStatusDisplayText } from "../../constants/mainStatusDisplayText.js";

export const MainStatusDisplayTextMap = new BidirectionalMap<string, string>();
MainStatusDisplayTextMap.set(MainStatusEnum.AWAIT_DETECT, MainStatusDisplayText.AWAIT_DETECT);
MainStatusDisplayTextMap.set(MainStatusEnum.WRONG_URL, MainStatusDisplayText.WRONG_URL);
MainStatusDisplayTextMap.set(MainStatusEnum.NO_FOCUS_PLACE_INFO, MainStatusDisplayText.NO_FOCUS_PLACE_INFO);
MainStatusDisplayTextMap.set(MainStatusEnum.NOT_REVIEW_SECTION, MainStatusDisplayText.NOT_REVIEW_SECTION);
MainStatusDisplayTextMap.set(MainStatusEnum.READY_TO_START, MainStatusDisplayText.READY_TO_START);
MainStatusDisplayTextMap.set(MainStatusEnum.LOADING, MainStatusDisplayText.LOADING);
MainStatusDisplayTextMap.set(MainStatusEnum.FAIL_LOAD, MainStatusDisplayText.FAIL_LOAD);
MainStatusDisplayTextMap.set(MainStatusEnum.DONE_LOADING, MainStatusDisplayText.DONE_LOADING);
MainStatusDisplayTextMap.set(MainStatusEnum.ANALYZING, MainStatusDisplayText.ANALYZING);
MainStatusDisplayTextMap.set(MainStatusEnum.DONE_ANALYZE, MainStatusDisplayText.DONE_ANALYZE);
MainStatusDisplayTextMap.set(MainStatusEnum.FAIL_ANALYZE, MainStatusDisplayText.FAIL_ANALYZE);
MainStatusDisplayTextMap.set(MainStatusEnum.ERROR, MainStatusDisplayText.ERROR);
