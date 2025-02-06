
import { MainStatusDisplayTextMap } from "./shared/config/mainStatusInfoSetting.js";
import { MainStatusDisplayText } from "./shared/constants/mainStatusDisplayText.js";
import { MainStatusEnum } from "./shared/constants/mainStatusEnum.js";
import { MainVariable } from "./shared/types/mainVariable.js";
import { detectFocusPlace } from "./shared/utils/detectFocusPlace.js";



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

  mainVariables.mainStatus = MainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText) as MainStatusEnum;

  if (!mainButton) {
    console.error("找不到主按鈕！");
    return;
  }



  mainButton.addEventListener('click', async () => {
    console.log('main button clicked');
    mainVariables.mainStatus = MainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText) as MainStatusEnum;
    const func = mainStatusFunctionMap.get(mainVariables.mainStatus);
    if (func) {
      await func(mainVariables);  // 執行函數，並傳遞 mainVariable 作為參數
    } else {
      mainStatusTextElement.innerText = MainStatusDisplayText.ERROR;
      return;
    }

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);
    mainStatusTextElement.innerText = MainStatusDisplayTextMap.getValue(mainVariables.mainStatus) ?? MainStatusDisplayText.ERROR;
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