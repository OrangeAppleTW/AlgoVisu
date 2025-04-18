// merge-sort-algorithm.js
// 合併排序算法實現

import { 
    MergeState,
    updateMergePerformanceMetrics,
    sleep
} from './merge-sort-constants.js';

import { renderMergeArray } from './merge-sort-visualization.js';
import { updateMergeRecursionVisual } from './merge-sort-recursion-visual.js';

// 黑白簡約風格的顏色定義
const COLORS = {
    COMPARING: '#4A5568',      // 比較中 - 深灰色
    ACTIVE: '#2B6CB0',         // 當前活躍元素 - 深藍色
    SORTED: '#2C5282',         // 已排序 - 藍色
    MERGING: '#1A365D',        // 合併中 - 深藍色
    DIVIDING: '#805AD5'        // 分割中 - 紫色
};

// 繪製分割線
async function drawDivideLine(mid) {
    const svg = d3.select('#merge-svg');
    const margin = { top: 30, right: 80, bottom: 30, left: 80 };
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 300;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    // 計算分割線的位置
    const xScale = d3.scaleBand()
        .domain(d3.range(MergeState.array.length))
        .range([0, contentWidth * 0.8])
        .padding(0.25);
    
    // 計算中心偏移，讓柱子居中
    const centerOffset = (contentWidth - xScale.range()[1]) / 2;
    
    // 計算分割線的X座標
    const midX = centerOffset + xScale(mid) + xScale.bandwidth();
    
    // 繪製新的分割線，並加上唯一的ID以便後續識別
    svg.append('line')
        .attr('class', 'divide-line')
        .attr('data-mid', mid) // 添加屬性以記錄中間點
        .attr('x1', margin.left + midX)
        .attr('y1', margin.top)
        .attr('x2', margin.left + midX)
        .attr('y2', margin.top + contentHeight)
        .attr('stroke', '#222')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .transition()
        .duration(300)
        .attr('opacity', 1);
}

// 清除特定的分割線
function removeDivideLine(mid) {
    // 只刪除特定中間點的分割線
    d3.select('#merge-svg')
        .selectAll('.divide-line[data-mid="' + mid + '"]')
        .transition()
        .duration(300)
        .attr('opacity', 0)
        .remove();
}

// 清除所有分割線
function removeAllDivideLines() {
    d3.select('#merge-svg')
        .selectAll('.divide-line')
        .transition()
        .duration(300)
        .attr('opacity', 0)
        .remove();
}

// 計算當前遞迴深度的輔助函數
function calculateDepth(low, high) {
    const totalLength = MergeState.array.length;
    const currentLength = high - low + 1;
    // 通過當前子數組的長度與原始數組的長度比例計算深度
    const ratio = currentLength / totalLength;
    if (ratio === 1) return 0;      // 整個數組
    if (ratio >= 0.5) return 1;     // 一半數組
    if (ratio >= 0.25) return 2;    // 四分之一數組
    if (ratio >= 0.125) return 3;   // 八分之一數組
    return 4;                       // 更小的分割
}

// 主合併排序算法
async function startMergeSortAlgorithm() {
    // 檢查數組是否有效
    if (!MergeState.checkState()) {
        console.error('排序失敗: 數組為空或無效');
        document.getElementById('merge-status').textContent = '無法排序: 數組為空，請先生成數組';
        MergeState.running = false;
        return;
    }
    
    const statusText = document.getElementById('merge-status');
    const speedSlider = document.getElementById('merge-speed');
    const speedValue = speedSlider ? parseInt(speedSlider.value) : 50;
    const speed = (101 - speedValue) * 5; // 速度轉換，調整符合氣泡排序
    
    try {
        // 先渲染一次初始狀態，確保正確顯示
        await renderMergeArray();
        await sleep(500); // 短暫暫停，讓用戶看清初始狀態
        
        if (statusText) statusText.textContent = '開始合併排序...';
        
        // 初始化輔助數組作為全局變量，以便所有遞迴調用都能訪問到
        let auxArray = new Array(MergeState.array.length);
        
        // 初始化遞迴視覺化步驟
        window.recursionSteps = [];
        // 添加初始步驟
        window.recursionSteps.push({
            level: 0,
            blocks: [{
                values: MergeState.array.map(item => item.value),
                status: 'original'
            }]
        });
        // 更新視覺化
        updateMergeRecursionVisual(MergeState.array, window.recursionSteps);
        
        // 開始排序，並傳入輔助數組
        await mergeSort(0, MergeState.array.length - 1, auxArray);
        
        // 排序完成時的視覺效果
        // 設置所有元素為已排序狀態
        MergeState.array.forEach(element => {
            element.state = 'sorted';
        });
        await renderMergeArray();
        
        // 添加排序完成的步驟到遞迴視覺化
        window.recursionSteps.push({
            level: 0,
            blocks: [{
                values: MergeState.array
                    .sort((a, b) => a.position - b.position)
                    .map(item => item.value),
                status: 'sorted'
            }]
        });
        // 更新視覺化
        updateMergeRecursionVisual(MergeState.array, window.recursionSteps);
        
        // 最後清除所有分割線
        removeAllDivideLines();
        
        // 最終效果：藍色波浪由左至右
        for (let i = 0; i < MergeState.array.length; i++) {
            await renderMergeArray([{ index: i, color: '#2C5282' }]);
            await sleep(speed);
        }
        
        if (statusText) statusText.textContent = '排序完成！';
    } catch (error) {
        console.error('合併排序過程發生錯誤:', error);
        if (statusText) statusText.textContent = `排序過程遇到錯誤: ${error.message}`;
    } finally {
        // 恢復按鈕狀態
        MergeState.running = false;
        document.getElementById('merge-generate').disabled = false;
        document.getElementById('merge-start').disabled = true;
    }
    
    // 合併排序實現 - 改進版本，接收輔助數組
    async function mergeSort(low, high, auxArray) {
        // 基本情況：只有一個元素
        if (low >= high) return;
        
        // 計算中間點
        const mid = Math.floor((low + high) / 2);
        
        // 顯示分割過程
        if (statusText) statusText.textContent = `分割: [${low}..${high}] 為 [${low}..${mid}] 和 [${mid+1}..${high}]`;
        
        // 繪製分割線
        await drawDivideLine(mid);
        
        // 突出顯示當前處理的分區
        const highlights = [];
        for (let i = low; i <= high; i++) {
            highlights.push({ index: i, color: COLORS.DIVIDING });
        }
        await renderMergeArray(highlights);
        
        // 更新遞迴視覺化 - 記錄分割步驟
        const recursionStep = {
            level: calculateDepth(low, high),
            blocks: [{
                values: MergeState.array
                    .filter(item => item.position >= low && item.position <= high)
                    .sort((a, b) => a.position - b.position)
                    .map(item => item.value),
                status: 'dividing'
            }]
        };
        // 將步驟添加到全局狀態或DOM中
        if (!window.recursionSteps) window.recursionSteps = [];
        window.recursionSteps.push(recursionStep);
        // 更新視覺化
        updateMergeRecursionVisual(MergeState.array, window.recursionSteps);
        
        await sleep(speed);
        
        // 遞迴排序左半部分，傳遞輔助數組
        await mergeSort(low, mid, auxArray);
        
        // 遞迴排序右半部分，傳遞輔助數組
        await mergeSort(mid + 1, high, auxArray);
        
        // 合併兩個已排序的子數組
        if (statusText) statusText.textContent = `合併: [${low}..${mid}] 和 [${mid+1}..${high}]`;
        
        // 移除分割線，代表兩區要合併
        removeDivideLine(mid);
        
        // 更新遞迴視覺化 - 記錄合併步驟
        const mergingStep = {
            level: calculateDepth(low, high),
            blocks: [
                {
                    values: MergeState.array
                        .filter(item => item.position >= low && item.position <= mid)
                        .sort((a, b) => a.position - b.position)
                        .map(item => item.value),
                    status: 'merging'
                },
                {
                    values: MergeState.array
                        .filter(item => item.position >= mid+1 && item.position <= high)
                        .sort((a, b) => a.position - b.position)
                        .map(item => item.value),
                    status: 'merging'
                }
            ]
        };
        window.recursionSteps.push(mergingStep);
        updateMergeRecursionVisual(MergeState.array, window.recursionSteps);
        
        await merge(low, mid, high, auxArray);
    }
    
    // 合併兩個子數組 - 改進的版本，接收輔助數組作為參數
    async function merge(low, mid, high, auxArray) {
        // 使用不同顏色標記左右子數組
        const leftHighlights = [];
        for (let k = low; k <= mid; k++) {
            leftHighlights.push({ index: k, color: '#805AD5' }); // 左側紫色
        }
        await renderMergeArray(leftHighlights);
        await sleep(speed);
        
        const rightHighlights = [];
        for (let k = mid + 1; k <= high; k++) {
            rightHighlights.push({ index: k, color: '#2B6CB0' }); // 右側藍色
        }
        await renderMergeArray(rightHighlights);
        await sleep(speed);
        
        // 合併開始時高亮顯示
        const mergeHighlights = [];
        for (let k = low; k <= high; k++) {
            mergeHighlights.push({ index: k, color: COLORS.MERGING });
        }
        await renderMergeArray(mergeHighlights);
        await sleep(speed);
        
        // 為合併階段創建臨時數組 - 基於位置索引
        auxArray.length = MergeState.array.length; // 確保數組大小正確
        for (let i = low; i <= high; i++) {
            // 更高效的查找方式
            const element = MergeState.array.find(item => item.position === i);
            if (element) {
                auxArray[i] = {...element};
            }
        }
        
        // 合併過程中的索引
        let i = low;      // 左子數組的當前索引
        let j = mid + 1;  // 右子數組的當前索引
        
        // 合併過程
        for (let k = low; k <= high; k++) {
            // 左子數組已用完，取右子數組的元素
            if (i > mid) {
                // 高亮顯示正在處理的元素
                const highlights = [
                    { index: j, color: COLORS.ACTIVE }
                ];
                await renderMergeArray(highlights);
                await sleep(speed);
                
                // 獲取右側子數組中的元素
                const elementToMove = auxArray[j];
                
                // 更新元素狀態和位置 - 美覺式動畫
                const targetElement = MergeState.array.find(item => item.id === elementToMove.id);
                if (targetElement) {
                    // 先高亮顯示當前處理的元素
                    targetElement.state = 'activeComparing';
                    await renderMergeArray([{ index: targetElement.position, color: COLORS.ACTIVE }]);
                    await sleep(speed);
                    
                    // 更新位置後立即渲染
                    targetElement.position = k;
                    targetElement.state = 'merging';
                    
                    // 顯示新位置的效果
                    await renderMergeArray([{ index: k, color: COLORS.MERGING }]);
                    await sleep(speed);
                }
                
                j++;
                await renderMergeArray();
                await sleep(speed);
            }
            // 右子數組已用完，取左子數組的元素
            else if (j > high) {
                // 高亮顯示正在處理的元素
                const highlights = [
                    { index: i, color: COLORS.ACTIVE }
                ];
                await renderMergeArray(highlights);
                await sleep(speed);
                
                // 獲取左側子數組中的元素
                const elementToMove = auxArray[i];
                
                // 更新元素狀態和位置 - 更詳細的動畫展示
                const targetElement = MergeState.array.find(item => item.id === elementToMove.id);
                if (targetElement) {
                    // 先更新狀態為「正在移動」
                    targetElement.state = 'merging';
                    await renderMergeArray([{ index: targetElement.position, color: COLORS.ACTIVE }]);
                    await sleep(speed);
                    
                    // 再更新位置
                    targetElement.position = k;
                }
                
                i++;
                await renderMergeArray();
                await sleep(speed);
            }
            // 比較兩個子數組的元素，取較小者
            else if (auxArray[i].value <= auxArray[j].value) {
                // 高亮顯示正在比較的兩個元素
                const highlights = [
                    { index: i, color: COLORS.ACTIVE },
                    { index: j, color: COLORS.COMPARING }
                ];
                await renderMergeArray(highlights);
                
                // 比較計數增加
                MergeState.comparisonCount++;
                updateMergePerformanceMetrics();
                
                if (statusText) statusText.textContent = `比較: ${auxArray[i].value} <= ${auxArray[j].value}`;
                await sleep(speed);
                
                // 獲取左側子數組中的元素
                const elementToMove = auxArray[i];
                
                // 更新元素狀態和位置 - 更詳細的動畫展示
                const targetElement = MergeState.array.find(item => item.id === elementToMove.id);
                if (targetElement) {
                    // 先更新狀態為「正在移動」
                    targetElement.state = 'merging';
                    await renderMergeArray([{ index: targetElement.position, color: COLORS.ACTIVE }]);
                    await sleep(speed);
                    
                    // 再更新位置
                    targetElement.position = k;
                }
                
                i++;
                await renderMergeArray();
                await sleep(speed);
            }
            else {
                // 高亮顯示正在比較的兩個元素
                const highlights = [
                    { index: i, color: COLORS.COMPARING },
                    { index: j, color: COLORS.ACTIVE }
                ];
                await renderMergeArray(highlights);
                
                // 比較計數增加
                MergeState.comparisonCount++;
                // 交換計數增加
                MergeState.swapCount++;
                updateMergePerformanceMetrics();
                
                if (statusText) statusText.textContent = `比較: ${auxArray[i].value} > ${auxArray[j].value}`;
                await sleep(speed);
                
                // 獲取右側子數組中的元素
                const elementToMove = auxArray[j];
                
                // 更新元素狀態和位置 - 更詳細的動畫展示
                const targetElement = MergeState.array.find(item => item.id === elementToMove.id);
                if (targetElement) {
                    // 先更新狀態為「正在移動」
                    targetElement.state = 'merging';
                    await renderMergeArray([{ index: targetElement.position, color: COLORS.ACTIVE }]);
                    await sleep(speed);
                    
                    // 再更新位置
                    targetElement.position = k;
                }
                
                j++;
                await renderMergeArray();
                await sleep(speed);
            }
        }
        
        // 標記該範圍內的元素為已排序
        for (let k = low; k <= high; k++) {
            const element = MergeState.array.find(item => item.position === k);
            if (element) {
                element.state = 'sorted';
            }
        }
        
        // 添加排序完成的子數組到遞迴視覺化
        const sortedStep = {
            level: calculateDepth(low, high),
            blocks: [{
                values: MergeState.array
                    .filter(item => item.position >= low && item.position <= high)
                    .sort((a, b) => a.position - b.position)
                    .map(item => item.value),
                status: 'sorted'
            }]
        };
        window.recursionSteps.push(sortedStep);
        updateMergeRecursionVisual(MergeState.array, window.recursionSteps);
        
        // 顯示已排序的範圍
        const sortedHighlights = [];
        for (let k = low; k <= high; k++) {
            sortedHighlights.push({ index: k, color: COLORS.SORTED });
        }
        await renderMergeArray(sortedHighlights);
        
        if (statusText) statusText.textContent = `完成合併: [${low}..${high}]`;
        await sleep(speed);
        
        // 恢復正常顯示
        await renderMergeArray();
    }
}

// 導出函數
export {
    startMergeSortAlgorithm
};