// 格式化日期為 yyyy-MM-dd
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month, so +1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 將函數導出
module.exports = {
  formatDateToYYYYMMDD
};
