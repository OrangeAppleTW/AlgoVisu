// 插入排序D3.js視覺化實現
let insertionArray = [];
let insertionSortRunning = false;
let insertionSortPaused = false;
let insertionAnimationTimer = null;

// 用來追蹤當前元素和比較元素的索引
let currentElementIndex = -1;
let comparingElementIndex = -1;
let sortedPositions = [];

// 初始化插入排序視覺化
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const generateBtn = document.getElementById('insertion-generate');
    const startBtn = document.getElementById('insertion-start');
    const pauseBtn = document.getElementById('insertion-pause');
    const resetBtn = document.getElementById('insertion-reset');
    const speedSlider = document.getElementById('insertion-speed');
    const statusText = document.getElementById('insertion-status');
    
    // 初始化按鈕事件
    generateBtn.addEventListener('click', generateInsertionArray);
    startBtn.addEventListener('click', startInsertionSort);
    pauseBtn.addEventListener('click', togglePauseInsertionSort);
    resetBtn.addEventListener('click', resetInsertionSort);
    
    // 初始化SVG
    initSvg();
    
    // 為進度條添加滑塊拖曳效果
    function updateSliderProgress(slider) {
        const percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--progress-percent', `${percent}%`);
    }
    
    // 初始更新進度
    updateSliderProgress(speedSlider);
    
    // 監聽值變化
    speedSlider.addEventListener('input', function() {
        updateSliderProgress(this);
    });
    
    // 監聽窗口大小改變事件，以便重新繪製SVG
    window.addEventListener('resize', function() {
        if (insertionArray.length > 0) {
            renderInsertionArray();
        }
    });
});

// 初始化SVG圖表
function initSvg() {
    // 清空SVG內容
    d3.select('#insertion-svg').selectAll('*').remove();
    
    // 設置邊界 - 足夠的邊距讓視覺效果美觀
    const margin = { top: 30, right: 80, bottom: 30, left: 80 };
    const svg = d3.select('#insertion-svg');
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    
    // 添加一個圖形容器，用於繪製柱狀圖
    svg.append('g')
       .attr('class', 'bars-container')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

// 生成隨機數組
function generateInsertionArray() {
    resetInsertionSort();
    const length = 15; // 數組長度
    const min = 5;     // 最小值
    const max = 100;   // 最大值
    
    // 生成隨機數組
    insertionArray = Array.from({ length }, (_, i) => ({
        id: i,  // 唯一標識符
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        position: i,  // 初始位置 = 索引
        sorted: false  // 初始狀態：未排序
    }));
    
    // 重置狀態變量
    currentElementIndex = -1;
    comparingElementIndex = -1;
    sortedPositions = [];
    
    // 渲染數組
    renderInsertionArray();
    
    // 更新按鈕狀態
    document.getElementById('insertion-start').disabled = false;
    document.getElementById('insertion-reset').disabled = false;
    document.getElementById('insertion-status').textContent = '數組已生成，點擊「開始排序」按鈕開始';
}

// 根據柱子狀態獲取顏色
function getBarColor(barPosition) {
    // 檢查是否是當前元素
    if (barPosition === currentElementIndex) {
        return '#4A5568'; // 當前元素 - 中藍色
    }
    
    // 檢查是否是正在比較的元素
    if (barPosition === comparingElementIndex) {
        return '#2B6CB0'; // 正在比較 - 亮藍色
    }
    
    // 檢查是否是已排序元素
    if (sortedPositions.includes(barPosition)) {
        return '#1A365D'; // 已排序 - 深藍色
    }
    
    // 剩下的都是未排序元素
    return '#A0AEC0'; // 未排序 - 灰色
}

// 使用D3.js渲染數組
function renderInsertionArray(frameRange = null) {
    if (!insertionArray || insertionArray.length === 0) return;
    
    // 設置SVG基本參數
    const svg = d3.select('#insertion-svg');
    const margin = { top: 30, right: 80, bottom: 30, left: 80 }; // 增加左右邊距
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    // 建立比例尺 - 適中的柱子寬度和間距
    const xScale = d3.scaleBand()
        .domain(d3.range(insertionArray.length))
        .range([0, contentWidth * 0.7]) // 只使用中間70%的空間
        .padding(0.25);  // 中等的padding
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(insertionArray, d => d.value) * 1.1])
        .range([contentHeight, 0]); // 反轉Y軸，值越大柱子越高
    
    // 選擇容器
    const container = svg.select('.bars-container');
    
    // 計算中心偏移量，使柱子居中
    const centerOffset = (contentWidth - xScale.range()[1]) / 2;
    
    // 按position排序數組以便正確渲染
    const sortedArray = [...insertionArray].sort((a, b) => a.position - b.position);
    
    // 數據綁定 - 使用id作為key（重要！這樣D3可以正確追蹤元素）
    const bars = container.selectAll('.bar')
        .data(sortedArray, d => d.id);
    
    // 刪除不需要的元素
    bars.exit().remove();
    
    // 先刪除現有的框架
    container.selectAll('.frame').remove();
    
    // 添加新元素
    const barsEnter = bars.enter()
        .append('g')
        .attr('class', 'bar')
        .attr('id', d => `bar-${d.id}`)
        .attr('transform', d => `translate(${centerOffset + xScale(d.position)}, 0)`);
    
    // 添加矩形
    barsEnter.append('rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => contentHeight - yScale(d.value))
        .attr('fill', d => getBarColor(d.position))
        .attr('rx', 0) // 無圓角
        .attr('ry', 0);
    
    // 添加文字 - 數值顯示在柱子上方
    barsEnter.append('text')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5) // 文字位於柱子上方
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '11px') 
        .text(d => d.value);
    
    // 如果有框架範圍，添加框架
    if (frameRange) {
        // 計算框架位置和尺寸
        const frameStartPos = centerOffset + xScale(frameRange.start) - 5;
        const frameWidth = xScale.bandwidth() * (frameRange.end - frameRange.start + 1) + 10;
        
        // 添加框架 (透明的，只用來定位元素範圍)
        container.append('rect')
        .attr('class', 'frame')
        .attr('x', frameStartPos)
        .attr('y', 10) // 框架頂部位置
        .attr('width', frameWidth)
        .attr('height', contentHeight + 10)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(231, 76, 60, 0)') // 透明邊框
        .attr('stroke-width', 0)                // 隱藏邊框
        .attr('stroke-dasharray', '5,5')
        .attr('rx', 3)
        .attr('ry', 3);
    }
    
    // 更新現有元素（包括動畫）
    const duration = (101 - document.getElementById('insertion-speed').value) * 5;
    
    // 更新柱子位置
    bars.transition()
        .duration(duration)
        .attr('transform', d => `translate(${centerOffset + xScale(d.position)}, 0)`);
    
    // 更新矩形
    bars.select('rect')
        .transition()
        .duration(duration)
        .attr('fill', d => getBarColor(d.position))
        .attr('y', d => yScale(d.value))
        .attr('height', d => contentHeight - yScale(d.value));
    
    // 更新文字位置
    bars.select('text')
        .transition()
        .duration(duration)
        .attr('y', d => yScale(d.value) - 5);
}

// 執行插入排序的一步
async function insertionSortStep(index) {
    const statusText = document.getElementById('insertion-status');
    
    // 獲取當前要插入的元素
    const currentBar = insertionArray.find(bar => bar.position === index);
    if (!currentBar) return;
    
    const key = currentBar.value;
    statusText.textContent = `選取元素 ${key} 進行插入`;
    
    // 設置當前元素
    currentElementIndex = index;
    comparingElementIndex = -1;
    
    // 渲染更新
    renderInsertionArray();
    
    // 等待一段時間以便觀察
    await new Promise(resolve => {
        insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 10);
    });
    
    if (insertionSortPaused) return;
    
    let j = index - 1;
    
    // 從右到左比較並逐步交換位置
    while (j >= 0) {
        if (insertionSortPaused) return;
        
        const compareBar = insertionArray.find(bar => bar.position === j);
        if (!compareBar) break;
        
        // 設置比較元素
        comparingElementIndex = j;
        
        // 顯示正在比較的元素
        statusText.textContent = `比較 ${compareBar.value} > ${key}`;
        renderInsertionArray();
        
        // 等待一段時間以便觀察
        await new Promise(resolve => {
            insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 10);
        });
        
        if (insertionSortPaused) return;
        
        if (compareBar.value > key) {
            // 如果當前比較的元素大於待插入元素，交換位置
            statusText.textContent = `${compareBar.value} > ${key}，交換位置`;
            
            // 聲明要交換元素
            statusText.textContent = `交換 ${compareBar.value} 和 ${key}`;
            renderInsertionArray();
            
            // 等待一段時間以便觀察
            await new Promise(resolve => {
                insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 8);
            });
            
            if (insertionSortPaused) return;
            
            // 交換位置
            compareBar.position += 1;
            currentBar.position = j;
            
            // 更新當前元素索引
            currentElementIndex = j;
            
            // 更新比較元素索引（不再比較）
            comparingElementIndex = -1;
            
            // 將比較過的元素添加到已排序列表
            if (!sortedPositions.includes(j+1)) {
                sortedPositions.push(j+1);
            }
            
            // 重新渲染以顯示交換效果
            renderInsertionArray();
            
            // 等待一段時間以便觀察
            await new Promise(resolve => {
                insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 8);
            });
            
            if (insertionSortPaused) return;
            
            j--; // 繼續向左比較
        } else {
            // 找到適當位置，不需要再交換
            statusText.textContent = `${compareBar.value} <= ${key}，保持位置`;
            
            // 等待一段時間以便觀察
            await new Promise(resolve => {
                insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 8);
            });
            
            if (insertionSortPaused) return;
            break;
        }
    }
    
    if (insertionSortPaused) return;
    
    // 將當前元素添加到已排序位置列表
    const finalPosition = currentBar.position;
    if (!sortedPositions.includes(finalPosition)) {
        sortedPositions.push(finalPosition);
    }
    
    // 重置當前元素和比較元素索引
    currentElementIndex = -1;
    comparingElementIndex = -1;
    
    // 顯示已排序的元素
    renderInsertionArray();
    
    // 等待一段時間以便觀察
    await new Promise(resolve => {
        insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 5);
    });
}

// 開始插入排序
function startInsertionSort() {
    if (!insertionSortRunning) {
        insertionSortRunning = true;
        insertionSortPaused = false;
        
        // 設置第一個元素為已排序
        sortedPositions = [0];
        
        // 更新按鈕狀態
        updateButtonStatus();
        
        // 開始執行動畫
        insertionSortAlgorithm();
    } else if (insertionSortPaused) {
        // 如果是暫停狀態，繼續執行
        insertionSortPaused = false;
        updateButtonStatus();
        
        // 繼續排序
        insertionSortAlgorithm();
    }
}

// 暫停/繼續排序
function togglePauseInsertionSort() {
    if (insertionSortRunning) {
        insertionSortPaused = !insertionSortPaused;
        
        // 更新狀態文字
        const statusText = document.getElementById('insertion-status');
        if (insertionSortPaused) {
            // 添加暫停提示
            statusText.textContent = statusText.textContent + ' (已暫停)';
        } else {
            // 移除暫停提示，繼續執行
            statusText.textContent = statusText.textContent.replace(' (已暫停)', '');
            insertionSortAlgorithm();
        }
        
        // 更新按鈕狀態
        updateButtonStatus();
    }
}

// 更新按鈕狀態
function updateButtonStatus() {
    document.getElementById('insertion-generate').disabled = insertionSortRunning && !insertionSortPaused;
    document.getElementById('insertion-start').disabled = (insertionSortRunning && !insertionSortPaused) || insertionArray.length === 0;
    document.getElementById('insertion-pause').disabled = !insertionSortRunning || insertionSortPaused;
    document.getElementById('insertion-reset').disabled = insertionArray.length === 0;
}

// 重置排序
function resetInsertionSort() {
    // 停止正在執行的動畫
    if (insertionAnimationTimer) {
        clearTimeout(insertionAnimationTimer);
        insertionAnimationTimer = null;
    }
    
    // 重置狀態
    insertionSortRunning = false;
    insertionSortPaused = false;
    insertionArray = [];
    currentElementIndex = -1;
    comparingElementIndex = -1;
    sortedPositions = [];
    
    // 清空視覺化區域
    initSvg();
    
    // 重置狀態文字
    document.getElementById('insertion-status').textContent = '請點擊「生成數組」按鈕開始';
    
    // 更新按鈕狀態
    document.getElementById('insertion-generate').disabled = false;
    document.getElementById('insertion-start').disabled = true;
    document.getElementById('insertion-pause').disabled = true;
    document.getElementById('insertion-reset').disabled = true;
}

// 插入排序算法實現
async function insertionSortAlgorithm() {
    if (!insertionArray || insertionArray.length === 0 || insertionSortPaused) return;
    
    const statusText = document.getElementById('insertion-status');
    const n = insertionArray.length;
    
    // 執行插入排序
    for (let i = 1; i < n; i++) {
        if (insertionSortPaused) return;
        
        // 執行一步排序（選擇當前元素並插入到已排序部分）
        await insertionSortStep(i);
        
        if (insertionSortPaused) return;
        
        // 更新狀態文字
        statusText.textContent = `第 ${i} 個元素已插入正確位置`;
        
        // 等待一段時間以便觀察
        await new Promise(resolve => {
            insertionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('insertion-speed').value) * 5);
        });
    }
    
    // 排序完成
    statusText.textContent = '排序完成！';
    
    insertionSortRunning = false;
    updateButtonStatus();
}