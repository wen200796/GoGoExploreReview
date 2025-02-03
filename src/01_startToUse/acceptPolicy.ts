document.addEventListener('DOMContentLoaded', () => {
  const agreeCheckbox = document.getElementById('agree-policy') as HTMLInputElement | null;
  const acceptButton = document.getElementById('accept-to-start-use') as HTMLButtonElement | null;

  if (!agreeCheckbox || !acceptButton) {
    console.error("找不到必要的元素！");
    return;
  }

  // 監控勾選框的變化
  agreeCheckbox.addEventListener('change', () => {
    acceptButton.disabled = !agreeCheckbox.checked;
    console.log(`Checkbox is ${agreeCheckbox.checked ? "checked" : "unchecked"}`);
    console.log(`Button disabled: ${acceptButton.disabled}`);
  });

  // 監控按鈕點擊事件
  acceptButton.addEventListener('click', (event) => {
    event.preventDefault(); // 防止預設的超連結行為

    // 儲存資料
    const consentData = {
      agreeDateTime: new Date().toISOString(),
      agreeVersion: 1
    };

    // 儲存到 localStorage
    localStorage.setItem('goReviewConsent', JSON.stringify(consentData));

    alert('已同意並儲存您的資料！');

    // 延遲後跳轉
    setTimeout(() => {
      window.location.href = '/page/02_autoScrollThenLoad/mainSidepanel.html'; // 使用絕對路徑
    }, 500); // 延遲500毫秒跳轉
  });
});