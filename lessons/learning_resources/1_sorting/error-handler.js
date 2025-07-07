// 排序演算法頁面的錯誤處理程式
// 用於捕捉並處理頁面加載過程中的錯誤

window.addEventListener('error', function(event) {
    console.error('捕捉到錯誤:', event.error || event.message);
    
    // 如果是找不到元素的錯誤，不顯示給用戶
    if (event.error && event.error.toString().includes('Cannot read properties of null')) {
        console.warn('DOM 元素尚未準備好，或找不到元素');
        event.preventDefault(); // 防止錯誤向上傳播
    }
}, true);

// 優雅地處理初始化函數
window.safeInitialize = function(initFunction, functionName) {
    if (typeof initFunction === 'function') {
        try {
            console.log(`安全初始化: ${functionName}`);
            initFunction();
        } catch (error) {
            console.warn(`初始化 ${functionName} 時發生錯誤:`, error);
        }
    } else {
        console.warn(`找不到初始化函數: ${functionName}`);
    }
};
