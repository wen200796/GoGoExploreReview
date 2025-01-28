document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  const mainVariable = {
    mainState: 'MS00',
    currentPageUrl: '',
    isCurrentPageValid: false,
    hasFoundCommentSection: false
  }
  for (const key in mainVariable) {
    console.log(mainVariable[key])
  }
  findCommentSection();
});

function findCommentSection() {
  console.log('finding comment section')
}