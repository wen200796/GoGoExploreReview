import { MainStatusEnum } from './../domain/enum/mainStatusEnum.js';
import { BidirectionalMap } from "../domain/class/bidirectionalMap.js";
import { MainStatusDisplayText } from "../domain/enum/mainStatusDisplayText.js";
import { MainVariable } from "../domain/interface/mainVariable.js";
import { ValidUrlPrefix } from '../domain/enum/validUrlPrefix.js';

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



async function detectUrlAndSection(mainVariables: MainVariable) {
  const isValid: boolean = await detectCurrentPageUrl(mainVariables);
  console.log("當前頁面網址是否有效：", mainVariables.isCurrentUrlValid);
  if (mainVariables.isCurrentUrlValid === true) {
    const hasFound = await detectCommentSection(mainVariables);
    console.log("是否找到評論區：", mainVariables.hasFoundCommentSection);
  }
}

async function detectCurrentPageUrl(mainVariables: MainVariable): Promise<boolean> {
  console.log('detecting current page url')
  mainVariables.isCurrentUrlValid = false;
  mainVariables.hasFoundCommentSection = false;
  try {
    const currentUrl: string = await getActiveTabUrl(); // 使用 await 等待網址
    console.log("當前頁面網址：", currentUrl);
    if (currentUrl.startsWith(ValidUrlPrefix.MAP) || currentUrl.startsWith(ValidUrlPrefix.SEARCH)) {
      mainVariables.isCurrentUrlValid = true;
      mainVariables.currentPageUrl = currentUrl;
      return true;
    } else {
      mainVariables.currentPageUrl = '';
      return false;
    }
  } catch (error) {
    console.error("Failed to get active tab URL:", error);
    return false; // 發生錯誤時，返回 false
  }
}

function getActiveTabUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_URL" }, (response: { url?: string }) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message); // 發生錯誤時拒絕 Promise
        return;
      }

      if (response && response.url) {
        resolve(response.url); // 成功時回傳網址
      } else {
        console.error("無法取得目前的分頁資訊");
        resolve(''); // 若無法取得網址，回傳空字串
      }
    });
  });
}

async function detectCommentSection(mainVariables: MainVariable) {
  console.log('detecting comment section')
  try {
    const hasFound: boolean = await checkActiveTabCommentSection(); // 使用 await 等待結果
    mainVariables.hasFoundCommentSection = hasFound;
    return hasFound;
  } catch (error) {
    console.error("Failed to check Active Tab Comment Section", error);
    return false; // 發生錯誤時，返回 false
  }

}

function checkActiveTabCommentSection(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "CHECK_ACTIVE_TAB_COMMENT_SECTION" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message); // 發生錯誤時拒絕 Promise
        return;
      }

      if (response && response.hasFoundCommentSection) {
        resolve(response.hasFoundCommentSection); // 回應成功時回傳結果
      } else {
        console.error("無法取得目前分頁是否切換到評論區塊");
        resolve(false); // 若無法取得結果，回傳 false
      }
    });
  });
}


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