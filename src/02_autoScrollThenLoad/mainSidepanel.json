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

const MainStatusDisplayText = Object.freeze({
  AWAIT_DETECT: '尚未偵測頁面',
  WRONG_URL: '請選擇正確網頁',
  NOT_COMMENT_SECTION: '請將頁面切換至評論區',
  READY_TO_START: '準備開始'
});

const ValidUrlPrefix = Object.freeze({
  MAP: 'https://www.google.com/maps',
  SEARCH: 'https://www.google.com/search'
});

class MainVariable {
  constructor() {
    this.mainStatus = MainStatusEnum.AWAIT_DETECT;
    this.currentPageUrl = '';
    this.isCurrentUrlValid = false;
    this.hasFoundCommentSection = false;
  }
}

class BidirectionalMap {
  constructor() {
    this.map = new Map();
    this.reverseMap = new Map();
  }

  set(key, value) {
    this.map.set(key, value);
    this.reverseMap.set(value, key);
  }

  getValue(key) {
    return this.map.get(key);
  }

  getKey(value) {
    return this.reverseMap.get(value);
  }
}

const mainStatusDisplayTextMap = new BidirectionalMap();
mainStatusDisplayTextMap.set(MainStatusEnum.AWAIT_DETECT, MainStatusDisplayText.AWAIT_DETECT);
mainStatusDisplayTextMap.set(MainStatusEnum.WRONG_URL, MainStatusDisplayText.WRONG_URL);
mainStatusDisplayTextMap.set(MainStatusEnum.NOT_COMMENT_SECTION, MainStatusDisplayText.NOT_COMMENT_SECTION);
mainStatusDisplayTextMap.set(MainStatusEnum.READY_TO_START, MainStatusDisplayText.READY_TO_START);


const mainStatusFunctionMap = new Map([
  [MainStatusEnum.AWAIT_DETECT, detectUrlAndSection],
  [MainStatusEnum.WRONG_URL, detectUrlAndSection],
  [MainStatusEnum.NOT_COMMENT_SECTION, detectUrlAndSection],
  [MainStatusEnum.READY_TO_START, detectUrlAndSection]
])

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const mainVariables = new MainVariable();
  const mainButton = document.getElementById('main-button');
  const mainStatusTextElement = document.getElementById('main-status');

  if (!mainStatusTextElement || mainStatusTextElement.innerText === '') {
    console.error("找不到主狀態！");
    return;
  }

  mainVariables.mainStatus = mainStatusDisplayTextMap.getKey(mainStatusTextElement.innerText);

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
    mainStatusTextElement.innerText = mainStatusDisplayTextMap.getValue(mainVariables.mainStatus);
  })

});


function checkInputMainVaribleType(mainVariables) {
  if (!(mainVariables instanceof MainVariable)) {
    throw new TypeError('mainVariable must be an instance of MainVariable');
  }
}

async function detectUrlAndSection(mainVariables) {
  checkInputMainVaribleType(mainVariables);

  const isValid = await detectCurrentPageUrl(mainVariables);
  console.log("當前頁面網址是否有效：", mainVariables.isCurrentUrlValid);
  if (mainVariables.isCurrentUrlValid === true) {
    const hasFound = await detectCommentSection(mainVariables);
    console.log("是否找到評論區：", mainVariables.hasFoundCommentSection);
  }
}

async function detectCurrentPageUrl(mainVariables) {
  checkInputMainVaribleType(mainVariables);
  console.log('detecting current page url')
  mainVariables.isCurrentUrlValid = false;
  mainVariables.hasFoundCommentSection = false;
  try {
    const currentUrl = await getActiveTabUrl(); // 使用 await 等待網址
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

function getActiveTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "GET_ACTIVE_TAB_URL" }, (response) => {
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


async function detectCommentSection(mainVariables) {
  checkInputMainVaribleType(mainVariables);
  console.log('detecting comment section')
  try {
    const hasFound = await checkActiveTabCommentSection(); // 使用 await 等待結果
    mainVariables.hasFoundCommentSection = hasFound;
    return hasFound;
  } catch (error) {
    console.error("Failed to check Active Tab Comment Section", error);
    return false; // 發生錯誤時，返回 false
  }

}

function checkActiveTabCommentSection() {
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

function rejudgeMainStatus(mainVariables) {
  checkInputMainVaribleType(mainVariables);
  if (isNotStartMainStatus(mainVariables.mainStatus)) {
    if (mainVariables.isCurrentUrlValid === false) {
      return MainStatusEnum.WRONG_URL;
    }
    if (mainVariables.hasFoundCommentSection === false) {
      return MainStatusEnum.NOT_COMMENT_SECTION;
    }

    return MainStatusEnum.READY_TO_START
  }

  return 'not yet implemented';
}

function isNotStartMainStatus(mainStatus) {
  return mainStatus === MainStatusEnum.AWAIT_DETECT || mainStatus === MainStatusEnum.WRONG_URL || mainStatus === MainStatusEnum.NOT_COMMENT_SECTION || mainStatus === MainStatusEnum.READY_TO_START;
}