// merge-sort-d3.js
// 合併排序 D3.js 視覺化入口文件

// 全局變量 - 確保和舊實現兼容
let mergeArray = [];
let mergeArrayAux = [];
let mergeSortRunning = false;
let mergeSortComparisonCount = 0;
let mergeSortSwapCount = 0;
let mergeAnimationTimer = null;

// 錯誤處理函數
function handleModuleError(error) {
    console.error('載入合併排序模塊時發生錯誤:', error);
    
    // 顯示錯誤消息到UI
    const statusText = document.getElementById('merge-status');
    if (statusText) {
        statusText.textContent = '載入視覺化模塊失敗，請檢查控制台錯誤';
        statusText.style.color = 'red';
    }
}

// 加載主模塊
// 導入遞迴視覺化模塊 
// (我們現在只保留文字說明，不需要動態視覺化了)

import('./modules/merge-sort-main.js')
    .then(module => {
        console.log('合併排序模塊加載完成');
        
        // 設置全局變量的代理
        Object.defineProperty(window, 'mergeArray', {
            get: function() { return module.MergeState.array; },
            set: function(value) { 
                // 當設置全局陣列時，將值更新到模塊狀態
                if (Array.isArray(value)) {
                    module.MergeState.array = value.map((val, index) => {
                        if (typeof val === 'object') {
                            return { ...val, position: index };
                        } else {
                            return { 
                                id: index, 
                                value: val, 
                                position: index, 
                                state: 'unsorted' 
                            };
                        }
                    });
                } else {
                    module.MergeState.array = value;
                }
            }
        });
        
        Object.defineProperty(window, 'mergeSortRunning', {
            get: function() { return module.MergeState.running; },
            set: function(value) { module.MergeState.running = value; }
        });
        
        Object.defineProperty(window, 'mergeSortComparisonCount', {
            get: function() { return module.MergeState.comparisonCount; },
            set: function(value) { module.MergeState.comparisonCount = value; }
        });
        
        Object.defineProperty(window, 'mergeSortSwapCount', {
            get: function() { return module.MergeState.swapCount; },
            set: function(value) { module.MergeState.swapCount = value; }
        });
        
        Object.defineProperty(window, 'mergeAnimationTimer', {
            get: function() { return module.MergeState.animationTimer; },
            set: function(value) { module.MergeState.animationTimer = value; }
        });
        
        // 方法
        window.updateMergePerformanceMetrics = module.updateMergePerformanceMetrics;
        window.initMergeSort = module.initMergeSort;
        window.generateMergeArray = module.generateMergeArray;
        window.startMergeSort = module.startMergeSort;
        window.resetMergeSort = module.resetMergeSort;
        window.renderMergeArray = module.renderMergeArray;
        
        // 如果頁面已經加載，則直接初始化
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(module.initMergeSort, 100);
        } else {
            // 否則等待頁面加載完成
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(module.initMergeSort, 100);
            });
        }
    })
    .catch(handleModuleError);

// 這個函數將被 sorting.js 調用
// 提供備用初始化方法
function initMergeSortBackup() {
    console.log('嘗試通過舊方法初始化合併排序...');
    
    // 檢查是否已加載新模塊
    if (typeof window.initMergeSort === 'function') {
        window.initMergeSort();
    } else {
        console.warn('合併排序模塊尚未載入，將在載入後自動初始化');
        
        // 如果模塊尚未載入，設置一個檢查器
        const checkModuleLoaded = setInterval(() => {
            if (typeof window.initMergeSort === 'function') {
                clearInterval(checkModuleLoaded);
                window.initMergeSort();
            }
        }, 100);
    }
}

// 確保在 window.initMergeSort 不可用時提供備用
if (typeof window.initMergeSort !== 'function') {
    window.initMergeSort = initMergeSortBackup;
}