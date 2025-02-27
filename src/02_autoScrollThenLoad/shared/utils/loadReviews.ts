import { MainStatusEnum } from "../constants/mainStatusEnum.js";
import { MainVariable } from "../types/mainVariable.js";
import { detectFocusPlace } from "./detectFocusPlace.js";

export async function loadReviews(mainVariables: MainVariable): Promise<void> {
  console.log('detecting comment section')

  await detectFocusPlace(mainVariables);
  if (!mainVariables.hasFoundReviewSection) {
    return;
  }
  try {
    const detectResult: any = await loadActiveTabReviews(); // 使用 await 等待結果
    console.log('detectResult:', detectResult);
    if (detectResult) {
      mainVariables.mainStatus = MainStatusEnum.DONE_LOADING;
      return;
    }
    mainVariables.mainStatus = MainStatusEnum.FAIL_LOAD;
  } catch (error) {
    console.error("Failed to check Active Tab Comment Section", error);
    mainVariables.mainStatus = MainStatusEnum.FAIL_LOAD;
  }
}

function loadActiveTabReviews(): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "LOAD_REVIEWS" }, (response: any) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message); // 發生錯誤時拒絕 Promise
        return;
      }

      if (response) {
        resolve(response); // 回應成功時回傳結果
      } else {
        console.error("無法取得目前分頁是否切換到評論區塊");
        resolve(0);
      }
    });
  });
}