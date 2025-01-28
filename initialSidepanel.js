document.addEventListener('DOMContentLoaded', () => {
  // 從 localStorage 獲取資料
  const consentData = localStorage.getItem('goReviewConsent');

  if (consentData) {
    // 如果用戶已同意，載入主頁面
    console.log(consentData);
    window.location.href = '/02_autoScrollThenLoad/mainSidepanel.html';

  } else {
    // 如果沒有資料，載入同意頁面
    console.log('沒有同意紀錄，請同意使用條款');
    window.location.href = '/01_startToUse/acceptPolicy.html';
  }
});
