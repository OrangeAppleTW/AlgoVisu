// 專注模式同步功能 - focus-mode-sync.js

/**
 * 與主視窗同步狀態的功能模組
 */

// 與主視窗同步狀態
function syncWithMainWindow() {
    console.log('開始同步主視窗狀態...');
    
    if (window.opener && window.opener.getCurrentState) {
        try {
            const mainState = window.opener.getCurrentState();
            if (mainState && window.combinationEnumerator) {
                console.log('正在同步主視窗狀態...', mainState);
                
                // 恢復主視窗的狀態
                window.combinationEnumerator.m = mainState.m || 2;
                window.combinationEnumerator.elements = [1, 2, 3];
                window.combinationEnumerator.currentStep = mainState.currentStep || 0;
                window.combinationEnumerator.allCombinations = mainState.solutions || [];
                window.combinationEnumerator.currentCombination = mainState.currentCombination || [];
                window.combinationEnumerator.isRunning = mainState.isRunning || false;
                
                // 重新產生步驟和樹狀結構
                if (window.combinationEnumerator.generateAllSteps) {
                    window.combinationEnumerator.generateAllSteps();
                }
                
                if (window.combinationEnumerator.createTreeStructure) {
                    window.combinationEnumerator.createTreeStructure();
                }
                
                // 更新UI顯示
                if (window.combinationEnumerator.updateDisplay) {
                    window.combinationEnumerator.updateDisplay();
                }
                
                // 更新組合計數器
                updateCombinationCount();
                
                // 更新公式顯示
                updateFormulaDisplay();
                
                console.log('主視窗狀態同步完成');
            } else {
                console.log('無主視窗狀態或枚舉器未初始化，使用預設設定');
                initializeDefaultState();
            }
        } catch (error) {
            console.log('無法同步主視窗狀態:', error);
            // 如果無法同步，使用預設設定
            initializeDefaultState();
        }
    } else {
        console.log('無主視窗連接，使用預設設定');
        initializeDefaultState();
    }
}

// 初始化預設狀態
function initializeDefaultState() {
    console.log('初始化預設狀態');
    // 如果無法連接主視窗，使用預設配置
    if (window.combinationEnumerator) {
        window.combinationEnumerator.m = 2;
        window.combinationEnumerator.elements = [1, 2, 3];
        window.combinationEnumerator.allCombinations = [];
        window.combinationEnumerator.currentCombination = [];
        window.combinationEnumerator.isRunning = false;
        window.combinationEnumerator.currentStep = 0;
        
        // 確保生成初始樹狀結構
        if (window.combinationEnumerator.generateAllSteps) {
            window.combinationEnumerator.generateAllSteps();
        }
        
        if (window.combinationEnumerator.createTreeStructure) {
            window.combinationEnumerator.createTreeStructure();
        }
        
        // 使用安全的更新方法
        if (window.combinationEnumerator.safeUpdateDisplay) {
            window.combinationEnumerator.safeUpdateDisplay();
        } else if (window.combinationEnumerator.basicUpdateDisplay) {
            window.combinationEnumerator.basicUpdateDisplay();
        }
        
        // 更新UI
        updateCombinationCount();
        updateStatus('準備開始 C(3,2) 組合枚舉');
        updateFormulaDisplay();
    }
}

// 更新組合計數器
function updateCombinationCount() {
    const countElement = document.getElementById('combination-count');
    if (countElement && window.combinationEnumerator) {
        const count = window.combinationEnumerator.allCombinations ? window.combinationEnumerator.allCombinations.length : 0;
        countElement.textContent = count;
    }
}

// 更新公式顯示
function updateFormulaDisplay() {
    const formulaElement = document.getElementById('combination-formula');
    if (formulaElement && window.combinationEnumerator) {
        const m = window.combinationEnumerator.m || 2;
        const n = window.combinationEnumerator.elements ? window.combinationEnumerator.elements.length : 3;
        const total = calculateCombination(n, m);
        formulaElement.textContent = `C(${n},${m}) = ${total}`;
    }
}

// 計算組合數
function calculateCombination(n, m) {
    if (m > n || m < 0) return 0;
    if (m === 0 || m === n) return 1;
    
    let result = 1;
    for (let i = 0; i < m; i++) {
        result = result * (n - i) / (i + 1);
    }
    return Math.round(result);
}

// 更新狀態顯示
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// 監聽主視窗的狀態變化
function setupMainWindowListener() {
    if (window.opener) {
        // 每2秒檢查一次主視窗狀態
        const syncInterval = setInterval(function() {
            try {
                if (window.opener.closed) {
                    console.log('主視窗已關閉，準備關閉專注模式視窗');
                    clearInterval(syncInterval);
                    // 延遲關閉，給用戶一些時間
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                } else {
                    // 可以在這裡添加更多同步邏輯
                    // 例如定期同步狀態（如果需要的話）
                }
            } catch (error) {
                console.log('主視窗監聽出錯:', error);
                clearInterval(syncInterval);
            }
        }, 2000);
        
        // 監聽視窗關閉事件
        window.addEventListener('beforeunload', function() {
            clearInterval(syncInterval);
        });
    }
}

// 強制刷新樹狀圖
function forceRefreshTree() {
    if (window.combinationEnumerator) {
        setTimeout(() => {
            if (window.combinationEnumerator.createTreeStructure) {
                window.combinationEnumerator.createTreeStructure();
            }
            if (window.combinationEnumerator.updateDisplay) {
                window.combinationEnumerator.updateDisplay();
            }
            console.log('樹狀圖強制刷新完成');
        }, 100);
    }
}

// 提供給外部調用的同步函數
window.focusModeSync = {
    syncWithMainWindow: syncWithMainWindow,
    setupMainWindowListener: setupMainWindowListener,
    updateCombinationCount: updateCombinationCount,
    updateStatus: updateStatus,
    forceRefreshTree: forceRefreshTree,
    initializeDefaultState: initializeDefaultState
};