// 專注模式初始化 - focus-mode-init.js

/**
 * 專注教學模式的初始化和設置
 */

// 專注模式初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('專注教學模式載入中...');
    
    // 延遲初始化，確保所有腳本都已載入
    setTimeout(function() {
        initializeFocusMode();
    }, 200);
});

// 初始化專注模式
function initializeFocusMode() {
    console.log('開始初始化專注模式');
    
    try {
        // 1. 創建專用的組合枚舉器實例
        console.log('創建專注模式組合枚舉器實例...');
        if (typeof initFocusCombinationsEnumeration === 'function') {
            const enumerator = initFocusCombinationsEnumeration();
            if (enumerator) {
                console.log('專注模式組合枚舉器創建成功');
                
                // 等待枚舉器完全初始化
                const waitForReady = () => {
                    if (enumerator.isReady && enumerator.isReady()) {
                        console.log('枚舉器已準備就緒，繼續初始化...');
                        completeInitialization();
                    } else {
                        console.log('等待枚舉器準備就緒...');
                        setTimeout(waitForReady, 200);
                    }
                };
                
                waitForReady();
            } else {
                throw new Error('無法創建專注模式枚舉器');
            }
        } else {
            console.error('initFocusCombinationsEnumeration 函數未找到');
            // 嘗試使用傳統方式
            fallbackInitialization();
        }
        
    } catch (error) {
        console.error('專注模式初始化失敗:', error);
        // 顯示錯誤訊息給用戶
        showErrorMessage('專注模式初始化失敗，請重新載入頁面。錯誤：' + error.message);
        // 嘗試備用方案
        fallbackInitialization();
    }
}

// 完成初始化
function completeInitialization() {
    try {
        // 3. 同步主視窗狀態
        if (typeof syncWithMainWindow === 'function') {
            syncWithMainWindow();
            console.log('主視窗狀態同步完成');
        }
        
        // 4. 設置主視窗監聽器
        if (typeof setupMainWindowListener === 'function') {
            setupMainWindowListener();
            console.log('主視窗監聽器設置完成');
        }
        
        // 5. 優化專注模式的視覺效果
        adjustForFocusMode();
        
        // 6. 設置視窗事件監聽
        setupWindowEvents();
        
        console.log('專注教學模式初始化完成');
        
    } catch (error) {
        console.error('完成初始化失敗:', error);
    }
}

// 備用初始化方案
function fallbackInitialization() {
    console.log('使用備用初始化方案...');
    
    try {
        if (typeof CombinationsEnumeration === 'function') {
            // 延遲創建，等待DOM準備
            setTimeout(() => {
                window.combinationEnumerator = new CombinationsEnumeration();
                console.log('備用方案：組合枚舉器創建成功');
                completeInitialization();
            }, 500);
        } else {
            console.error('無法找到 CombinationsEnumeration 類');
        }
    } catch (error) {
        console.error('備用初始化也失敗:', error);
    }
}

// 專注模式視覺優化
function adjustForFocusMode() {
    console.log('調整專注模式視覺效果');
    
    // 調整字體大小和間距以適應16:9顯示
    const container = document.querySelector('.tree-container');
    if (container) {
        container.style.fontSize = '1.1em';
    }
    
    // 動態調整樹狀圖節點大小
    const style = document.createElement('style');
    style.id = 'focus-mode-adjustments';
    style.textContent = `
        .tree-node {
            font-size: 1.1em !important;
            transition: all 0.3s ease !important;
        }
        .tree-node.root {
            font-size: 1.2em !important;
        }
        .tree-path-info {
            font-size: 1.2em !important;
        }
        .section-title {
            font-size: 2em !important;
        }
    `;
    
    // 移除舊的樣式（如果存在）
    const existingStyle = document.getElementById('focus-mode-adjustments');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// 設置視窗事件
function setupWindowEvents() {
    console.log('設置視窗事件監聽');
    
    // 視窗關閉前的清理
    window.addEventListener('beforeunload', function(e) {
        console.log('專注模式視窗即將關閉');
        // 可以在這裡進行清理工作
    });
    
    // 視窗大小改變時的處理
    window.addEventListener('resize', function() {
        // 延遲執行以避免頻繁調整
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(function() {
            adjustLayoutForResize();
        }, 250);
    });
    
    // 鍵盤快速鍵
    document.addEventListener('keydown', function(e) {
        handleKeyboardShortcuts(e);
    });
}

// 處理視窗大小改變
function adjustLayoutForResize() {
    console.log('調整佈局以適應新的視窗大小');
    
    // 重新計算樹狀圖佈局
    if (typeof updateTreeVisualization === 'function') {
        setTimeout(updateTreeVisualization, 100);
    }
}

// 處理鍵盤快速鍵
function handleKeyboardShortcuts(e) {
    // 避免在輸入框中觸發快速鍵
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
    }
    
    switch(e.key) {
        case ' ': // 空白鍵：開始/暫停
            e.preventDefault();
            const startBtn = document.getElementById('start-btn');
            const stepBtn = document.getElementById('step-btn');
            if (startBtn && !startBtn.disabled) {
                startBtn.click();
            } else if (stepBtn && !stepBtn.disabled) {
                stepBtn.click();
            }
            break;
            
        case 'r': // R鍵：重設
        case 'R':
            e.preventDefault();
            const resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.click();
            }
            break;
            
        case 'Escape': // ESC鍵：關閉視窗
            window.close();
            break;
    }
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // 5秒後自動移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// 檢查必要的依賴是否存在
function checkDependencies() {
    const requiredFunctions = [
        'initCombinationEnumerator',
        'updateUI',
        'updateTreeVisualization'
    ];
    
    const missing = requiredFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missing.length > 0) {
        console.warn('缺少必要的函數:', missing);
        return false;
    }
    return true;
}

// 提供給外部使用的API
window.focusModeInit = {
    initializeFocusMode: initializeFocusMode,
    adjustForFocusMode: adjustForFocusMode,
    checkDependencies: checkDependencies
};