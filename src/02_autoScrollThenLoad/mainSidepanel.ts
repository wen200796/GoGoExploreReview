import { ColorEnum } from "../common/constants/colorEnum.js";
import { MainStatusButtonTextMap } from "./shared/config/mainStatusInfo/mainStatusButtonMap.js";
import { MainStatusColorMap } from "./shared/config/mainStatusInfo/mainStatusColorMap.js";
import { MainStatusDisplayTextMap } from "./shared/config/mainStatusInfo/mainStatusDisplayTextMap.js";
import { MainButtonTextEnum } from "./shared/constants/MainButtonTextEnum.js";
import { MainStatusDisplayText } from "./shared/constants/mainStatusDisplayText.js";
import { MainStatusEnum } from "./shared/constants/mainStatusEnum.js";
import { reviewDetail } from "./shared/models/reviewDetail.js";
import { MainVariable } from "./shared/types/mainVariable.js";
import { detectFocusPlace } from "./shared/utils/detectFocusPlace.js";
import { loadReviews } from "./shared/utils/loadReviews.js";


type StatusFunction = (mainVariable: MainVariable) => void;
const mainStatusFunctionMap = new Map<MainStatusEnum, StatusFunction>([
  [MainStatusEnum.AWAIT_DETECT, detectFocusPlace],
  [MainStatusEnum.WRONG_URL, detectFocusPlace],
  [MainStatusEnum.NO_FOCUS_PLACE_INFO, detectFocusPlace],
  [MainStatusEnum.NOT_REVIEW_SECTION, detectFocusPlace],
  [MainStatusEnum.READY_TO_START, loadReviews],
  [MainStatusEnum.DONE_LOADING, analyzeData],
  [MainStatusEnum.DONE_ANALYZE, openPopupWindow]
])

let doneLoadReviews: reviewDetail[] = []; // 已載入的評論
let doneAnalyzeReviews: any = []; // 已分析的評論

export function setupDoneLoadReviews(input: reviewDetail[]): void {
  doneLoadReviews = input;
}

export function setupDoneAnalyzeReviews(input: any): void {
  doneAnalyzeReviews = input;
}


document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables: MainVariable = {
    mainStatus: MainStatusEnum.AWAIT_DETECT,
    isCurrentUrlValid: false,
    hasFoundFocusPlace: false,
    hasFoundReviewSection: false
  };




  const mainButton = document.getElementById('main-button') as HTMLButtonElement;
  const redetectButton = document.getElementById('redetect-button') as HTMLElement;
  const reloadButton = document.getElementById('reload-button') as HTMLElement;
  const mainStatusTextElement = document.getElementById('main-status') as HTMLElement;
  const placeName = document.getElementById('place-name') as HTMLElement;
  const placeShowStarRating = document.getElementById('place-show-star-rating') as HTMLElement;
  const placeShowTotalReview = document.getElementById('place-show-total-review') as HTMLElement;
  const loadResult = document.getElementById('load-result') as HTMLElement;
  const doneLoadShowElements: NodeListOf<Element> = document.querySelectorAll('.done-load-show');

  if (!mainStatusTextElement || mainStatusTextElement.innerText === '') {
    console.error("找不到主狀態！");
    return;
  }

  mainVariables.mainStatus = MainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText) as MainStatusEnum;

  if (!mainButton) {
    console.error("找不到主按鈕！");
    return;
  }

  if (!redetectButton) {
    console.error("找不到重新偵測按鈕！");
    return;
  }

  if (!reloadButton) {
    console.error("找不到重新載入按鈕！");
    return;
  }

  if (!loadResult) {
    console.error("找不到載入結果元素！");
    return;
  }

  if (!doneLoadShowElements || doneLoadShowElements.length === 0) {
    console.error("找不到載入完成顯示元素！");
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
    await ActionBeforeRejudge(mainVariables);

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);

    ActionAfterRejudge(mainVariables);
  })

  redetectButton.addEventListener('click', async () => {
    console.log('redetect button clicked');
    mainVariables.mainStatus = MainStatusEnum.AWAIT_DETECT;
    await ActionBeforeRejudge(mainVariables);

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);

    ActionAfterRejudge(mainVariables);
  })

  reloadButton.addEventListener('click', async () => {
    console.log('redetect button clicked');
    mainVariables.mainStatus = MainStatusEnum.AWAIT_DETECT;
    await ActionBeforeRejudge(mainVariables);

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);

    ActionAfterRejudge(mainVariables);

    // 重新載入需要第二次觸發 ActionBeforeRejudge

    await ActionBeforeRejudge(mainVariables);

    mainVariables.mainStatus = rejudgeMainStatus(mainVariables);

    ActionAfterRejudge(mainVariables);


  })

  async function ActionBeforeRejudge(mainVariables: MainVariable): Promise<void> {
    doneLoadShowElements.forEach((button) => {
      (button as HTMLElement).style.display = 'none';
    });
    mainButton.disabled = false;
    const func = mainStatusFunctionMap.get(mainVariables.mainStatus);
    if (func) {
      await func(mainVariables);  // 執行函數，並傳遞 mainVariable 作為參數
    } else {
      if (mainStatusTextElement) {
        mainStatusTextElement.innerText = MainStatusDisplayText.ERROR;
        return;
      }
    }
  }

  async function ActionAfterRejudge(mainVariables: MainVariable): Promise<void> {
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
      placeShowStarRating.innerText = mainVariables.placeBasicInfo?.showStarRating?.toString() ?? detectNothingForReview;
      placeShowTotalReview.innerText = mainVariables.placeBasicInfo?.showTotalReview?.toLocaleString("zh-TW") ?? detectNothingForReview;
    } else {
      placeShowStarRating.innerText = detectNothingForReview;
      placeShowTotalReview.innerText = detectNothingForReview
    }

    if (mainVariables.placeBasicInfo?.showTotalReview === 0) {
      mainButton.disabled = true;
      redetectButton.style.display = 'block';
      mainButton.innerText = '無評論可載入';
    }

    if (mainVariables.mainStatus === MainStatusEnum.READY_TO_START){
      redetectButton.style.display = 'block';
    }
  

  if (mainVariables.mainStatus === MainStatusEnum.DONE_LOADING || mainVariables.mainStatus === MainStatusEnum.DONE_ANALYZE) {
    doneLoadShowElements.forEach((button) => {
      (button as HTMLElement).style.display = 'block';
    });
    console.log('im here ');
    loadResult.innerText = `${doneLoadReviews.length} / ${mainVariables.placeBasicInfo?.showTotalReview?.toLocaleString("zh-TW")} 筆評論`;
  }

  if (mainVariables.mainStatus === MainStatusEnum.DONE_LOADING && doneLoadReviews.length === 0) {
    mainButton.disabled = true;
    doneLoadShowElements.forEach((button) => {
      (button as HTMLElement).style.display = 'block';
    });
    mainButton.innerText = '無評論可分析';
  }
}}
);


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
    case MainStatusEnum.DONE_LOADING:
      return MainStatusEnum.DONE_LOADING;
    case MainStatusEnum.DONE_ANALYZE:
      return MainStatusEnum.DONE_ANALYZE;
    default:
      throw new Error('Invalid main status');
  }
}

function analyzeData(mainvaribles: MainVariable) {
  console.log('analyzeData');
  mainvaribles.mainStatus = MainStatusEnum.ANALYZING;
  mainvaribles.mainStatus = MainStatusEnum.DONE_ANALYZE;
}

function openPopupWindow() {
  const popupUrl = '/page/03_filterModeReview/filteModeReviewV1_copy_5.html'; // 要開啟的網頁
  const popupOptions = 'width=1000,height=900,scrollbars=yes';
  const popupWindow = window.open(popupUrl, 'popupWindow', popupOptions);

  popupWindow?.addEventListener('load', () => {
    popupWindow.postMessage(doneLoadReviews, window.location.origin);
  });
}

