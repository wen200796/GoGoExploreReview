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
  [MainStatusEnum.NOT_REVIEW_SECTION, detectFocusPlace],
  [MainStatusEnum.READY_TO_START, detectReviewSection]
])

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables: MainVariable = {
    mainStatus: MainStatusEnum.AWAIT_DETECT,
    isCurrentUrlValid: false,
    hasFoundFocusPlace: false,
    hasFoundReviewSection: false
  };
  const mainButton = document.getElementById('main-button');
  const mainStatusTextElement = document.getElementById('main-status');
  const placeName = document.getElementById('place-name');
  const placeShowStarRating = document.getElementById('place-show-star-rating');
  const placeShowTotalReview = document.getElementById('place-show-total-review');

  if (!mainStatusTextElement || mainStatusTextElement.innerText === '') {
    console.error("找不到主狀態！");
    return;
  }

  mainVariables.mainStatus = MainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText) as MainStatusEnum;

  if (!mainButton) {
    console.error("找不到主按鈕！");
    return;
  }

  if (!placeName) {
    console.error("找不到顯示地點名稱元素！");
    return;
  }

  if (!placeShowStarRating) {
    console.error("找不到顯示地點評分元素！");
    return;
  }

  if (!placeShowTotalReview) {
    console.error("找不到顯示地點評論數元素！");
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

    const detectNoFocusPlace: string = '未偵測到關注地點';
    const detectNothingForReview: string = '未偵測到資訊 (需切換至評論區)';
    if (mainVariables.hasFoundFocusPlace) {
      placeName.innerText = mainVariables.placeBasicInfo?.name ?? '偵測異常';
    } else {
      placeName.innerText = detectNoFocusPlace;
    }


    if (mainVariables.hasFoundReviewSection) {
      console.log('已找到評論區');
      placeShowStarRating.innerText = mainVariables.placeBasicInfo?.showStarRating?.toString() ?? detectNothingForReview;
      placeShowTotalReview.innerText = mainVariables.placeBasicInfo?.showTotalReview?.toLocaleString("zh-TW") ?? detectNothingForReview;
    } else {
      placeShowStarRating.innerText = detectNothingForReview;
      placeShowTotalReview.innerText = detectNothingForReview
    }
  })

});


function rejudgeMainStatus(mainVariables: MainVariable): MainStatusEnum {
  switch (mainVariables.mainStatus) {
    case MainStatusEnum.AWAIT_DETECT:
    case MainStatusEnum.WRONG_URL:
    case MainStatusEnum.NO_FOCUS_PLACE_INFO:
    case MainStatusEnum.NOT_REVIEW_SECTION:
    case MainStatusEnum.READY_TO_START:
      if (!mainVariables.isCurrentUrlValid) {
        return MainStatusEnum.WRONG_URL;
      }
      if (!mainVariables.hasFoundFocusPlace) {
        return MainStatusEnum.NO_FOCUS_PLACE_INFO;
      }
      if (!mainVariables.hasFoundReviewSection) {
        return MainStatusEnum.NOT_REVIEW_SECTION;
      }
      return MainStatusEnum.READY_TO_START;
    default:
      throw new Error('Invalid main status');
  }
}

async function detectReviewSection(mainVariables: MainVariable): Promise<void> {
  console.log('detecting comment section')
  try {
    const detectResult: any = await loadActiveTabReviews(); // 使用 await 等待結果
    console.log('detectResult:', detectResult);
  } catch (error) {
    console.error("Failed to check Active Tab Comment Section", error);
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