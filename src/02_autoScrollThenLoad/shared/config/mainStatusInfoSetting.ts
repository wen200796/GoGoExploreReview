import { BidirectionalMap } from "../../../common/models/bidirectionalMap.js";
import { MainStatusEnum } from "../constants/mainStatusEnum.js";
import { MainStatusDisplayText } from "../constants/mainStatusDisplayText.js";

export const MainStatusDisplayTextMap = new BidirectionalMap<string, string>();
MainStatusDisplayTextMap.set(MainStatusEnum.AWAIT_DETECT, MainStatusDisplayText.AWAIT_DETECT);
MainStatusDisplayTextMap.set(MainStatusEnum.WRONG_URL, MainStatusDisplayText.WRONG_URL);
MainStatusDisplayTextMap.set(MainStatusEnum.NO_FOCUS_PLACE_INFO, MainStatusDisplayText.NO_FOCUS_PLACE_INFO);
MainStatusDisplayTextMap.set(MainStatusEnum.NOT_COMMENT_SECTION, MainStatusDisplayText.NOT_COMMENT_SECTION);
MainStatusDisplayTextMap.set(MainStatusEnum.READY_TO_START, MainStatusDisplayText.READY_TO_START);



