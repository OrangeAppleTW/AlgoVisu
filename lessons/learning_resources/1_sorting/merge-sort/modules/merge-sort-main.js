// merge-sort-main.js
// 主模塊：整合其他模塊，提供入口點和訪問介面

import { 
    MergeState,
    updateMergePerformanceMetrics
} from './merge-sort-constants.js';

import { 
    initMergeSortUI, 
    generateMergeArray, 
    startMergeSort, 
    resetMergeSort 
} from './merge-sort-ui.js';

import { renderMergeArray } from './merge-sort-visualization.js';

// 初始化合併排序
function initMergeSort() {
    console.log('初始化合併排序 D3.js 視覺化...');
    
    try {
        // 先重置MergeState確保清潔狀態
        MergeState.reset();
        
        // 檢查D3是否已載入
        if (typeof d3 === 'undefined') {
            console.error('錯誤: 找不到 D3.js 庫! 請確保它已正確載入。');
            document.getElementById('merge-status').textContent = '初始化失敗: 找不到 D3.js 庫';
            return;
        }
        
        // 初始化UI
        initMergeSortUI();
        
        // 設置全局錯誤處理
        window.onerror = function(message, source, lineno, colno, error) {
            console.error('未捕獲的錯誤:', message, source, lineno, colno, error);
            const statusText = document.getElementById('merge-status');
            if (statusText) {
                statusText.textContent = '發生錯誤，請重新整理頁面';
            }
            return true;
        };
        
        console.log('合併排序 D3.js 視覺化初始化完成');
    } catch (error) {
        console.error('合併排序初始化失敗:', error);
        const statusText = document.getElementById('merge-status');
        if (statusText) {
            statusText.textContent = '初始化失敗: ' + error.message;
        }
    }
}

// 導出所有可能需要在外部使用的函數和變量
export {
    MergeState,
    updateMergePerformanceMetrics,
    initMergeSort,
    generateMergeArray,
    startMergeSort,
    resetMergeSort,
    renderMergeArray
};