const MainStatusEnum = Object.freeze({
  AWAIT_DETECT: 'MS00',
  WRONG_URL: 'MS01',
  NOT_COMMENT_SECTION: 'MS02',
  READY_TO_START: 'MS03',
  SCROLLING: 'MS04',
  PAUSE_WRONG_URL: 'MS05',
  PAUSE_NOT_COMMENT_SECTION: 'MS06',
  DONE_SCROLLING: 'MS07'
});

const ValidUrlPrefix = Object.freeze({
  MAP: 'https://www.google.com/maps',
  SEARCH: 'https://www.google.com/search'
});

class MainVariable{
  constructor() {
    this.mainStatus = MainStatusEnum.AWAIT_DETECT;
    this.currentPageUrl = '';
    this.isCurrentPageValid = false;
    this.hasFoundCommentSection = false;
  }
}

const mainStatusFunctionMap = new Map([
  [MainStatusEnum.AWAIT_DETECT, detectUrlAndSection]
])

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables = new MainVariable();
  const mainButton = document.getElementById('main-button');

  if (!mainButton ) {
    console.error("找不到必要的元素！");
    return;
  }

  mainButton.addEventListener('click', () => {
    const func = mainStatusFunctionMap.get(mainVariables.mainStatus);
    if (func) {
      func(mainVariables);  // 執行函數，並傳遞 mainVariable 作為參數
      }
  })

});

function checkInputMainVaribleType(mainVariables){
  if (!(mainVariables instanceof MainVariable)) {
    throw new TypeError('mainVariable must be an instance of MainVariable');
  }
}

function detectUrlAndSection(mainVariables) {
  checkInputMainVaribleType(mainVariables);
  
  if(detectCurrentPageUrl(mainVariables) === false){
    console.log(mainVariables.mainStatus);
    return;
  }


}

function detectCurrentPageUrl(mainVariables) {
  console.log('detecting current page Url');
  getActiveTabUrl((currentUrl) => {
    console.log(currentUrl);
    if (currentUrl.startsWith(ValidUrlPrefix.MAP) || currentUrl.startsWith(ValidUrlPrefix.SEARCH)) {
      mainVariables.isCurrentPageValid = true;
      mainVariables.currentPageUrl = currentUrl;
      mainVariables.mainStatus = MainStatusEnum.WRONG_URL;
      console.log(mainVariables.isCurrentPageValid);
      return true;
    } else {
      mainVariables.isCurrentPageValid = false;
      mainVariables.currentPageUrl = '';
      console.log(mainVariables.isCurrentPageValid);
      return false;
    }
  });
}

function getActiveTabUrl(callback) {
  chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_URL" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError.message);
      callback('');
      return;
    }

    if (response && response.url) {
      console.log("目前分頁的網址：", response.url);
      callback(response.url);
    } else {
      console.error("無法取得目前的分頁資訊");
      callback('');
    }
  });
}

function detectCommentSection() {
  console.log('detecting comment section')
}