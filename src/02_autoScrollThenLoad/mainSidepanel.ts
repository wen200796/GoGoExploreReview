import { ColorEnum } from "../common/constants/colorEnum.js";
import { MainStatusButtonTextMap } from "./shared/config/mainStatusInfo/mainStatusButtonMap.js";
import { MainStatusColorMap } from "./shared/config/mainStatusInfo/mainStatusColorMap.js";
import { MainStatusDisplayTextMap } from "./shared/config/mainStatusInfo/mainStatusDisplayTextMap.js";
import { MainButtonTextEnum } from "./shared/constants/MainButtonTextEnum.js";
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
    hasFoundFocusPlace: false,
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
    mainButton.innerText = MainStatusButtonTextMap.get(mainVariables.mainStatus) ?? MainButtonTextEnum.RE_DETECT;
    mainButton.style.backgroundColor = MainStatusColorMap.get(mainVariables.mainStatus) ?? ColorEnum.OPERATE_BLUE;
  })

});


function rejudgeMainStatus(mainVariables: MainVariable): MainStatusEnum {
  switch (mainVariables.mainStatus) {
    case MainStatusEnum.AWAIT_DETECT:
    case MainStatusEnum.WRONG_URL:
    case MainStatusEnum.NO_FOCUS_PLACE_INFO:
    case MainStatusEnum.NOT_COMMENT_SECTION:
    case MainStatusEnum.READY_TO_START:
      if (!mainVariables.isCurrentUrlValid) {
        return MainStatusEnum.WRONG_URL;
      }
      if (!mainVariables.hasFoundFocusPlace) {
        return MainStatusEnum.NO_FOCUS_PLACE_INFO;
      }
      if (!mainVariables.hasFoundCommentSection) {
        return MainStatusEnum.NOT_COMMENT_SECTION;
      }
      return MainStatusEnum.READY_TO_START;
    default:
      throw new Error('Invalid main status');
  }
}