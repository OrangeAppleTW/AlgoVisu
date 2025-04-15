// 選擇排序D3.js視覺化實現
let selectionArray = [];
let selectionSortRunning = false;
let selectionSortPaused = false;
let selectionAnimationTimer = null;

// 初始化選擇排序視覺化
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const generateBtn = document.getElementById('selection-generate');
    const startBtn = document.getElementById('selection-start');
    const pauseBtn = document.getElementById('selection-pause');
    const resetBtn = document.getElementById('selection-reset');
    const speedSlider = document.getElementById('selection-speed');
    const statusText = document.getElementById('selection-status');
    
    // 初始化按鈕事件
    generateBtn.addEventListener('click', generateSelectionArray);
    startBtn.addEventListener('click', startSelectionSort);
    pauseBtn.addEventListener('click', togglePauseSelectionSort);
    resetBtn.addEventListener('click', resetSelectionSort);
    
    // 初始化SVG
    initSvg();
    
    // 監聽窗口大小改變事件，以便重新繪製SVG
    window.addEventListener('resize', function() {
        if (selectionArray.length > 0) {
            renderSelectionArray();
        }
    });
});

// 初始化SVG圖表
function initSvg() {
    // 清空SVG內容
    d3.select('#selection-svg').selectAll('*').remove();
    
    // 設置邊界 - 足夠的邊距讓視覺效果美觀
    const margin = { top: 30, right: 80, bottom: 30, left: 80 };
    const svg = d3.select('#selection-svg');
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    
    // 添加一個圖形容器，用於繪製柱狀圖
    svg.append('g')
       .attr('class', 'bars-container')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

// 生成隨機數組
function generateSelectionArray() {
    resetSelectionSort();
    const length = 15; // 數組長度
    const min = 5;     // 最小值
    const max = 100;   // 最大值
    
    // 生成隨機數組
    selectionArray = Array.from({ length }, (_, i) => ({
        id: i,  // 唯一標識符
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        position: i,  // 初始位置 = 索引
        state: 'unsorted'  // 狀態: unsorted, current, min, sorted
    }));
    
    // 渲染數組
    renderSelectionArray();
    
    // 更新按鈕狀態
    document.getElementById('selection-start').disabled = false;
    document.getElementById('selection-reset').disabled = false;
    document.getElementById('selection-status').textContent = '數組已生成，點擊「開始排序」按鈕開始';
}

// 根據柱子狀態獲取顏色
function getBarColor(state) {
    switch (state) {
        case 'current': return '#f39c12'; // 當前掃描元素
        case 'min': return '#9b59b6';     // 當前最小值
        case 'sorted': return '#2ecc71';  // 已排序
        default: return '#3498db';        // 未排序
    }
}

// 使用D3.js渲染數組
function renderSelectionArray() {
    if (!selectionArray || selectionArray.length === 0) return;
    
    // 設置SVG基本參數
    const svg = d3.select('#selection-svg');
    const margin = { top: 30, right: 80, bottom: 30, left: 80 }; // 增加左右邊距
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    // 建立比例尺 - 適中的柱子寬度和間距
    const xScale = d3.scaleBand()
        .domain(d3.range(selectionArray.length))
        .range([0, contentWidth * 0.7]) // 只使用中間70%的空間
        .padding(0.25);  // 中等的padding
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(selectionArray, d => d.value) * 1.1])
        .range([contentHeight, 0]); // 反轉Y軸，值越大柱子越高
    
    // 選擇容器
    const container = svg.select('.bars-container');
    
    // 計算中心偏移量，使柱子居中
    const centerOffset = (contentWidth - xScale.range()[1]) / 2;
    
    // 按position排序數組以便正確渲染
    const sortedArray = [...selectionArray].sort((a, b) => a.position - b.position);
    
    // 數據綁定 - 使用id作為key（重要！這樣D3可以正確追蹤元素）
    const bars = container.selectAll('.bar')
        .data(sortedArray, d => d.id);
    
    // 刪除不需要的元素
    bars.exit().remove();
    
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
        .attr('fill', d => getBarColor(d.state))
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
    
    // 更新現有元素（包括動畫）
    const duration = (101 - document.getElementById('selection-speed').value) * 5;
    
    // 更新柱子位置
    bars.transition()
        .duration(duration)
        .attr('transform', d => `translate(${centerOffset + xScale(d.position)}, 0)`);
    
    // 更新矩形
    bars.select('rect')
        .transition()
        .duration(duration)
        .attr('fill', d => getBarColor(d.state))
        .attr('y', d => yScale(d.value))
        .attr('height', d => contentHeight - yScale(d.value));
    
    // 更新文字位置
    bars.select('text')
        .transition()
        .duration(duration)
        .attr('y', d => yScale(d.value) - 5);
}

// 執行選擇排序的一步（尋找最小值）
async function findMinimumStep(startIdx, i) {
    const statusText = document.getElementById('selection-status');
    
    // 將所有未排序部分設為unsorted，除了當前最小值
    selectionArray.forEach(bar => {
        if (bar.position >= i && bar.state !== 'min') {
            bar.state = 'unsorted';
        }
    });
    
    // 假設起始索引處的元素是最小的
    let minBar = selectionArray.find(bar => bar.position === i);
    if (!minBar) return i; // 如果找不到，直接返回
    
    minBar.state = 'min';
    let minIdx = i;
    
    // 渲染初始狀態
    renderSelectionArray();
    
    // 從 startIdx 遍歷到數組末尾
    for (let j = startIdx; j < selectionArray.length; j++) {
        if (selectionSortPaused) return minIdx;
        
        // 獲取當前比較的元素
        const currentBar = selectionArray.find(bar => bar.position === j);
        if (!currentBar) continue;
        
        // 設置當前元素狀態
        if (currentBar.position !== minIdx) {
            currentBar.state = 'current';
        }
        
        // 更新狀態文字
        statusText.textContent = `比較元素: ${currentBar.value} 與當前最小值: ${minBar.value}`;
        
        // 渲染並等待
        renderSelectionArray();
        await new Promise(resolve => {
            selectionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('selection-speed').value) * 10);
        });
        
        if (selectionSortPaused) return minIdx;
        
        // 如果找到新的最小值
        if (currentBar.value < minBar.value) {
            // 更改原最小值的狀態
            minBar.state = 'unsorted';
            
            // 更新最小值
            minBar = currentBar;
            minIdx = j;
            minBar.state = 'min';
            
            // 更新狀態文字
            statusText.textContent = `找到新的最小值: ${minBar.value} 位於索引 ${j}`;
            
            // 渲染並等待
            renderSelectionArray();
            await new Promise(resolve => {
                selectionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('selection-speed').value) * 10);
            });
        }
        
        // 重置當前比較元素的狀態（如果不是最小值）
        if (currentBar.position !== minIdx) {
            currentBar.state = 'unsorted';
        }
    }
    
    return minIdx;
}

// 執行選擇排序的一步（交換最小值到正確位置）
async function swapMinimumStep(minIdx, i) {
    const statusText = document.getElementById('selection-status');
    
    // 如果最小值不在正確位置，需要交換
    if (minIdx !== i) {
        // 獲取要交換的兩個元素
        const minBar = selectionArray.find(bar => bar.position === minIdx);
        const iBar = selectionArray.find(bar => bar.position === i);
        
        if (!minBar || !iBar) return;
        
        // 更新狀態文字
        statusText.textContent = `交換元素: ${minBar.value} 與 ${iBar.value}`;
        
        // 交換位置
        const tempPos = minBar.position;
        minBar.position = iBar.position;
        iBar.position = tempPos;
        
        // 渲染並等待
        renderSelectionArray();
        await new Promise(resolve => {
            selectionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('selection-speed').value) * 20);
        });
    }
    
    // 標記當前索引位置的元素為已排序
    const sortedBar = selectionArray.find(bar => bar.position === i);
    if (sortedBar) {
        sortedBar.state = 'sorted';
    }
    
    // 更新狀態文字
    statusText.textContent = `第 ${i+1} 個元素 (值: ${sortedBar ? sortedBar.value : '未知'}) 已排序`;
    
    // 渲染並等待
    renderSelectionArray();
    await new Promise(resolve => {
        selectionAnimationTimer = setTimeout(resolve, (101 - document.getElementById('selection-speed').value) * 10);
    });
}

// 開始選擇排序
function startSelectionSort() {
    if (!selectionSortRunning) {
        selectionSortRunning = true;
        selectionSortPaused = false;
        
        // 更新按鈕狀態
        updateButtonStatus();
        
        // 開始執行動畫
        selectionSortAlgorithm();
    } else if (selectionSortPaused) {
        // 如果是暫停狀態，繼續執行
        selectionSortPaused = false;
        updateButtonStatus();
        
        // 繼續排序
        selectionSortAlgorithm();
    }
}

// 暫停/繼續排序
function togglePauseSelectionSort() {
    if (selectionSortRunning) {
        selectionSortPaused = !selectionSortPaused;
        
        // 更新狀態文字
        const statusText = document.getElementById('selection-status');
        if (selectionSortPaused) {
            // 添加暫停提示
            statusText.textContent = statusText.textContent + ' (已暫停)';
        } else {
            // 移除暫停提示，繼續執行
            statusText.textContent = statusText.textContent.replace(' (已暫停)', '');
            selectionSortAlgorithm();
        }
        
        // 更新按鈕狀態
        updateButtonStatus();
    }
}

// 更新按鈕狀態
function updateButtonStatus() {
    document.getElementById('selection-generate').disabled = selectionSortRunning && !selectionSortPaused;
    document.getElementById('selection-start').disabled = (selectionSortRunning && !selectionSortPaused) || selectionArray.length === 0;
    document.getElementById('selection-pause').disabled = !selectionSortRunning || selectionSortPaused;
    document.getElementById('selection-reset').disabled = selectionArray.length === 0;
}

// 重置排序
function resetSelectionSort() {
    // 停止正在執行的動畫
    if (selectionAnimationTimer) {
        clearTimeout(selectionAnimationTimer);
        selectionAnimationTimer = null;
    }
    
    // 重置狀態
    selectionSortRunning = false;
    selectionSortPaused = false;
    selectionArray = [];
    
    // 清空視覺化區域
    initSvg();
    
    // 重置狀態文字
    document.getElementById('selection-status').textContent = '請點擊「生成數組」按鈕開始';
    
    // 更新按鈕狀態
    document.getElementById('selection-generate').disabled = false;
    document.getElementById('selection-start').disabled = true;
    document.getElementById('selection-pause').disabled = true;
    document.getElementById('selection-reset').disabled = true;
}

// 選擇排序算法實現
async function selectionSortAlgorithm() {
    if (!selectionArray || selectionArray.length === 0 || selectionSortPaused) return;
    
    const statusText = document.getElementById('selection-status');
    const n = selectionArray.length;
    
    // 執行選擇排序
    for (let i = 0; i < n - 1; i++) {
        if (selectionSortPaused) return;
        
        // 更新狀態文字
        statusText.textContent = `正在從位置 ${i} 到 ${n-1} 尋找最小元素`;
        
        // 尋找未排序部分的最小值
        const minIdx = await findMinimumStep(i + 1, i);
        
        if (selectionSortPaused) return;
        
        // 交換最小值到當前位置
        await swapMinimumStep(minIdx, i);
        
        if (selectionSortPaused) return;
    }
    
    // 標記最後一個元素為已排序
    const lastBar = selectionArray.find(bar => bar.position === n - 1);
    if (lastBar) {
        lastBar.state = 'sorted';
    }
    
    // 渲染最終狀態
    renderSelectionArray();
    
    // 排序完成
    statusText.textContent = '排序完成！';
    selectionSortRunning = false;
    updateButtonStatus();
}
