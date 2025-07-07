// merge-sort-ui.js
// 用戶界面相關功能

import { 
    MergeState,
    updateMergePerformanceMetrics
} from './merge-sort-constants.js';

import { renderMergeArray, initMergeSvg } from './merge-sort-visualization.js';
import { startMergeSortAlgorithm } from './merge-sort-algorithm.js';

// 生成隨機數組
function generateMergeArray() {
    try {
        // 先重置排序
        resetMergeSort();
        
        // 使用MergeState的方法生成數組
        MergeState.generate();
        
        // 更新效能指標
        updateMergePerformanceMetrics();
        
        // 渲染數組
        console.log('渲染新生成的數組...');
        renderMergeArray();
        
        // 更新按鈕狀態
        document.getElementById('merge-start').disabled = false;
        document.getElementById('merge-reset').disabled = false;
        document.getElementById('merge-status').textContent = '數組已生成，點擊「開始排序」按鈕開始';
    } catch (error) {
        console.error('生成數組時發生錯誤:', error);
        document.getElementById('merge-status').textContent = '生成數組時發生錯誤，請重試';
    }
}

// 開始合併排序
function startMergeSort() {
    if (!MergeState.checkState()) {
        console.warn('數組為空或無效，無法開始排序');
        document.getElementById('merge-status').textContent = '請先生成數組';
        return;
    }
    
    if (!MergeState.running) {
        MergeState.running = true;
        
        // 更新按鈕狀態
        document.getElementById('merge-generate').disabled = true;
        document.getElementById('merge-start').disabled = true;
        document.getElementById('merge-reset').disabled = false;
        
        // 開始執行動畫，並處理可能的錯誤
        startMergeSortAlgorithm()
            .catch(error => {
                console.error('排序過程中斷:', error.message);
                if (error.message !== '排序已取消') {
                    // 如果不是因為取消而中斷，顯示錯誤訊息
                    document.getElementById('merge-status').textContent = `發生錯誤: ${error.message}`;
                }
            })
            .finally(() => {
                // 確保排序結束後重置運行狀態
                MergeState.running = false;
                
                // 更新按鈕狀態
                document.getElementById('merge-generate').disabled = false;
                document.getElementById('merge-start').disabled = true;
            });
    }
}

// 重置排序
function resetMergeSort() {
    // 停止正在執行的動畫
    if (MergeState.animationTimer) {
        clearTimeout(MergeState.animationTimer);
        MergeState.animationTimer = null;
    }
    
    // 確保任何其他正在進行的延遲動作也被取消
    try {
        const svg = d3.select('#merge-svg');
        if (svg.node()) {
            svg.selectAll('.bar').interrupt(); // 將所有進行中的過渡動畫結束
        }
    } catch (e) {
        console.warn('中斷動畫時發生錯誤', e);
    }
    
    // 重置狀態
    MergeState.reset();
    updateMergePerformanceMetrics();
    
    // 清空視覺化區域
    try {
        initMergeSvg();
    } catch (error) {
        console.error('重置SVG時發生錯誤:', error);
    }
    
    // 重置狀態文字
    const statusElement = document.getElementById('merge-status');
    if (statusElement) {
        statusElement.textContent = '請點擊「生成數組」按鈕開始';
    }
    
    // 更新按鈕狀態
    const generateBtn = document.getElementById('merge-generate');
    const startBtn = document.getElementById('merge-start');
    const resetBtn = document.getElementById('merge-reset');
    
    if (generateBtn) generateBtn.disabled = false;
    if (startBtn) startBtn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;
}

// 初始化合併排序視覺化
function initMergeSortUI() {
    console.log('初始化合併排序UI...');
    
    try {
        // 重置狀態
        MergeState.reset();
        
        // 獲取DOM元素
        const generateBtn = document.getElementById('merge-generate');
        const startBtn = document.getElementById('merge-start');
        const resetBtn = document.getElementById('merge-reset');
        
        if (!generateBtn || !startBtn || !resetBtn) {
            console.error('找不到必要的UI元素，UI初始化失敗');
            return;
        }
        
        // 移除任何舊的事件監聽器
        generateBtn.replaceWith(generateBtn.cloneNode(true));
        startBtn.replaceWith(startBtn.cloneNode(true));
        resetBtn.replaceWith(resetBtn.cloneNode(true));
        
        // 獲取新的按鈕引用
        const newGenerateBtn = document.getElementById('merge-generate');
        const newStartBtn = document.getElementById('merge-start');
        const newResetBtn = document.getElementById('merge-reset');
        
        // 添加事件監聽器
        newGenerateBtn.addEventListener('click', generateMergeArray);
        newStartBtn.addEventListener('click', startMergeSort);
        newResetBtn.addEventListener('click', resetMergeSort);
        
        // 設置初始按鈕狀態
        newStartBtn.disabled = true;
        newResetBtn.disabled = true;
        
        // 初始化SVG
        initMergeSvg();
        
        // 監聽窗口大小改變事件，以便重新繪製SVG（添加節流功能，避免過度渲染）
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (MergeState.checkState()) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    renderMergeArray();
                }, 100);
            }
        });
        
        // 設置狀態文字
        const statusText = document.getElementById('merge-status');
        if (statusText) {
            statusText.textContent = '請點擊「生成數組」按鈕開始';
        }
        
        console.log('合併排序 UI 初始化完成');
    } catch (error) {
        console.error('初始化UI時發生錯誤:', error);
    }
}

// 導出所有需要的函數
export {
    generateMergeArray,
    startMergeSort,
    resetMergeSort,
    initMergeSortUI
};