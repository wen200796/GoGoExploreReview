
import { ValidUrlPrefix } from "../constants/validUrlPrefix.js";
import { MainVariable } from "../types/mainVariable.js";


export async function detectUrlAndSection(mainVariables: MainVariable) {
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
