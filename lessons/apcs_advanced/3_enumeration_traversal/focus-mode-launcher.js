// 專注教學模式開啟功能 - focus-mode-launcher.js

/**
 * 負責從主頁面開啟專注教學模式視窗的功能
 */

// 專注教學模式開啟函數
function openFocusMode() {
    console.log('準備開啟專注教學模式');
    
    // 計算16:9比例的視窗大小
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    
    // 以螢幕80%作為基準，保持16:9比例
    const windowWidth = Math.min(screenWidth * 0.8, 1280);
    const windowHeight = Math.round(windowWidth * 9 / 16);
    
    // 居中顯示
    const left = Math.round((screenWidth - windowWidth) / 2);
    const top = Math.round((screenHeight - windowHeight) / 2);
    
    // 視窗特性設定
    const windowFeatures = [
        `width=${windowWidth}`,
        `height=${windowHeight}`,
        `left=${left}`,
        `top=${top}`,
        'resizable=yes',
        'scrollbars=no',
        'toolbar=no',
        'menubar=no',
        'location=no',
        'status=no',
        'directories=no'
    ].join(',');
    
    console.log(`開啟視窗: ${windowWidth}x${windowHeight} at (${left}, ${top})`);
    
    try {
        // 開啟新視窗
        const focusWindow = window.open(
            'combinations-focus-mode.html',
            'focusMode',
            windowFeatures
        );
        
        if (focusWindow) {
            // 確保視窗獲得焦點
            focusWindow.focus();
            
            // 設置視窗載入完成後的回調
            setupFocusWindowCallbacks(focusWindow);
            
            console.log('專注教學模式視窗已開啟');
            
            // 可選：追蹤視窗狀態
            trackFocusWindow(focusWindow);
            
        } else {
            throw new Error('無法開啟新視窗');
        }
        
    } catch (error) {
        console.error('開啟專注模式失敗:', error);
        showPopupBlockedMessage();
    }
}

// 設置專注視窗的回調函數
function setupFocusWindowCallbacks(focusWindow) {
    // 檢查視窗是否成功載入
    const checkLoaded = setInterval(() => {
        try {
            if (focusWindow.closed) {
                clearInterval(checkLoaded);
                return;
            }
            
            // 檢查視窗是否已完全載入
            if (focusWindow.document && focusWindow.document.readyState === 'complete') {
                clearInterval(checkLoaded);
                console.log('專注模式視窗載入完成');
                
                // 可以在這裡執行額外的初始化
                onFocusWindowLoaded(focusWindow);
            }
        } catch (error) {
            // 跨域限制可能會導致錯誤，這是正常的
            clearInterval(checkLoaded);
        }
    }, 100);
    
    // 10秒後停止檢查
    setTimeout(() => clearInterval(checkLoaded), 10000);
}

// 專注視窗載入完成後的處理
function onFocusWindowLoaded(focusWindow) {
    console.log('專注視窗載入完成，執行後續設置');
    
    try {
        // 確保專注視窗可以訪問主視窗的狀態
        if (focusWindow.syncWithMainWindow) {
            setTimeout(() => {
                focusWindow.syncWithMainWindow();
            }, 500);
        }
    } catch (error) {
        console.log('無法直接呼叫專注視窗的同步函數:', error);
    }
}

// 追蹤專注視窗狀態
function trackFocusWindow(focusWindow) {
    // 定期檢查視窗是否仍然開啟
    const tracker = setInterval(() => {
        try {
            if (focusWindow.closed) {
                console.log('專注模式視窗已關閉');
                clearInterval(tracker);
                onFocusWindowClosed();
                return;
            }
        } catch (error) {
            // 視窗可能已經關閉或無法存取
            clearInterval(tracker);
        }
    }, 1000);
    
    // 存儲追蹤器以便後續清理
    window.focusWindowTracker = tracker;
}

// 專注視窗關閉後的處理
function onFocusWindowClosed() {
    console.log('處理專注視窗關閉事件');
    
    // 清理追蹤器
    if (window.focusWindowTracker) {
        clearInterval(window.focusWindowTracker);
        delete window.focusWindowTracker;
    }
    
    // 可以在這裡執行其他清理工作
    // 例如：更新主視窗的狀態、恢復某些設置等
}

// 顯示彈出視窗被阻擋的訊息
function showPopupBlockedMessage() {
    const message = `
        ⚠️ 無法開啟專注教學模式
        
        可能原因：
        1. 瀏覽器阻擋了彈出視窗
        2. 請允許此網站開啟彈出視窗
        3. 或檢查瀏覽器的彈出視窗設定
        
        請在瀏覽器網址列附近尋找彈出視窗阻擋圖示，
        並允許此網站開啟彈出視窗。
    `;
    
    alert(message);
    
    // 也可以顯示更友好的自定義提示
    showCustomPopupMessage();
}

// 顯示自定義的彈出視窗提示
function showCustomPopupMessage() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    `;
    
    popup.innerHTML = `
        <h3 style="color: #e74c3c; margin-bottom: 20px;">⚠️ 無法開啟專注教學模式</h3>
        <p style="margin-bottom: 20px; line-height: 1.6;">
            瀏覽器可能阻擋了彈出視窗。<br>
            請在網址列附近找到彈出視窗阻擋圖示，<br>
            並允許此網站開啟彈出視窗。
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px;">
            我知道了
        </button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // 點擊背景關閉
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// 提供給外部調用的API
window.focusModeLauncher = {
    openFocusMode: openFocusMode,
    trackFocusWindow: trackFocusWindow
};

// 自動綁定到按鈕（如果存在）
document.addEventListener('DOMContentLoaded', function() {
    const focusBtn = document.getElementById('focus-mode-btn');
    if (focusBtn) {
        focusBtn.addEventListener('click', openFocusMode);
        console.log('專注教學模式按鈕已綁定');
    }
});