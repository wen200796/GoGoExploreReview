
import { BidirectionalMap } from "../common/models/bidirectionalMap.js";
import { MainStatusDisplayText } from "./shared/constants/mainStatusDisplayText.js";
import { MainStatusEnum } from "./shared/constants/mainStatusEnum.js";
import { MainVariable } from "./shared/types/mainVariable.js";
import { detectUrlAndSection } from "./shared/utils/detectUrlAndSection.js";


const mainStatusDisplayTextMap = new BidirectionalMap<string, string>();
mainStatusDisplayTextMap.set(MainStatusEnum.AWAIT_DETECT, MainStatusDisplayText.AWAIT_DETECT);
mainStatusDisplayTextMap.set(MainStatusEnum.WRONG_URL, MainStatusDisplayText.WRONG_URL);
mainStatusDisplayTextMap.set(MainStatusEnum.NOT_COMMENT_SECTION, MainStatusDisplayText.NOT_COMMENT_SECTION);
mainStatusDisplayTextMap.set(MainStatusEnum.READY_TO_START, MainStatusDisplayText.READY_TO_START);

type StatusFunction = (mainVariable: MainVariable) => void;
const mainStatusFunctionMap = new Map<MainStatusEnum, StatusFunction>([
  [MainStatusEnum.AWAIT_DETECT, detectUrlAndSection],
  [MainStatusEnum.WRONG_URL, detectUrlAndSection],
  [MainStatusEnum.NOT_COMMENT_SECTION, detectUrlAndSection],
  [MainStatusEnum.READY_TO_START, detectUrlAndSection]
])

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables: MainVariable = {
    mainStatus: MainStatusEnum.AWAIT_DETECT,
    isCurrentUrlValid: false,
    hasFoundCommentSection: false,
    currentPageUrl: ''
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
    if (mainVariables.hasFoundCommentSection === false) {
      return MainStatusEnum.NOT_COMMENT_SECTION;
    }

    return MainStatusEnum.READY_TO_START
  }

  throw new Error('Invalid main status');
}

function isNotStartMainStatus(mainStatusEnum: MainStatusEnum) {
  return mainStatusEnum === MainStatusEnum.AWAIT_DETECT || mainStatusEnum === MainStatusEnum.WRONG_URL || mainStatusEnum === MainStatusEnum.NOT_COMMENT_SECTION || mainStatusEnum === MainStatusEnum.READY_TO_START;
}