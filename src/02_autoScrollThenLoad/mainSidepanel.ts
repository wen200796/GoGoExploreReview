
import { BidirectionalMap } from "../common/models/bidirectionalMap.js";
import { MainStatusDisplayText } from "./shared/constants/mainStatusDisplayText.js";
import { MainStatusEnum } from "./shared/constants/mainStatusEnum.js";
import { MainVariable } from "./shared/types/mainVariable.js";
import { detectFocusPlace } from "./shared/utils/detectFocusPlace.js";


const mainStatusDisplayTextMap = new BidirectionalMap<string, string>();
mainStatusDisplayTextMap.set(MainStatusEnum.AWAIT_DETECT, MainStatusDisplayText.AWAIT_DETECT);
mainStatusDisplayTextMap.set(MainStatusEnum.WRONG_URL, MainStatusDisplayText.WRONG_URL);
mainStatusDisplayTextMap.set(MainStatusEnum.NO_FOCUS_PLACE_INFO, MainStatusDisplayText.NO_FOCUS_PLACE_INFO);
mainStatusDisplayTextMap.set(MainStatusEnum.NOT_COMMENT_SECTION, MainStatusDisplayText.NOT_COMMENT_SECTION);
mainStatusDisplayTextMap.set(MainStatusEnum.READY_TO_START, MainStatusDisplayText.READY_TO_START);

type StatusFunction = (mainVariable: MainVariable) => void;
const mainStatusFunctionMap = new Map<MainStatusEnum, StatusFunction>([
  [MainStatusEnum.AWAIT_DETECT, detectFocusPlace],
  [MainStatusEnum.WRONG_URL, detectFocusPlace],
  [MainStatusEnum.NO_FOCUS_PLACE_INFO, detectFocusPlace],
  [MainStatusEnum.NOT_COMMENT_SECTION, detectFocusPlace],
  [MainStatusEnum.READY_TO_START, detectFocusPlace]
])

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables: MainVariable = {
    mainStatus: MainStatusEnum.AWAIT_DETECT,
    isCurrentUrlValid: false,
    hasFoundPlaceInfo: false,
    hasFoundCommentSection: false
  };
  const mainButton = document.getElementById('main-button');
  const mainStatusTextElement = document.getElementById('main-status');

  if (!mainStatusTextElement || mainStatusTextElement.innerText === '') {
    console.error("找不到主狀態！");
    return;
  }

  mainVariables.mainStatus = mainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText) as MainStatusEnum;

  if (!mainButton) {
    console.error("找不到主按鈕！");
    return;
  }



  mainButton.addEventListener('click', async () => {
    console.log('main button clicked');
    const func = mainStatusFunctionMap.get(mainVariables.mainStatus);
    if (func) {
      await func(mainVariables);  // 執行函數，並傳遞 mainVariable 作為參數
    }

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);
    mainStatusTextElement.innerText = mainStatusDisplayTextMap.getValue(mainVariables.mainStatus) ?? '發生錯誤';
  })

});


function rejudgeMainStatus(mainVariables: MainVariable): MainStatusEnum {
  if (isNotStartMainStatus(mainVariables.mainStatus)) {
    if (mainVariables.isCurrentUrlValid === false) {
      return MainStatusEnum.WRONG_URL;
    }

    if (mainVariables.hasFoundPlaceInfo === false) {
      return MainStatusEnum.NO_FOCUS_PLACE_INFO;
    }

    if (mainVariables.hasFoundCommentSection === false) {
      return MainStatusEnum.NOT_COMMENT_SECTION;
    }

    return MainStatusEnum.READY_TO_START
  }

  throw new Error('Invalid main status');
}

function isNotStartMainStatus(mainStatusEnum: MainStatusEnum) {
  return mainStatusEnum === MainStatusEnum.AWAIT_DETECT || mainStatusEnum === MainStatusEnum.WRONG_URL || mainStatusEnum === MainStatusEnum.NO_FOCUS_PLACE_INFO || mainStatusEnum === MainStatusEnum.NOT_COMMENT_SECTION || mainStatusEnum === MainStatusEnum.READY_TO_START;
}