document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const receivedData = event.data;
    console.log('接收到的資料：', receivedData);
  });
});