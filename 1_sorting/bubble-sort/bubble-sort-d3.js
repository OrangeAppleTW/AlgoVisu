// 氣泡排序D3.js視覺化實現
let bubbleArray = [];
let bubbleSortRunning = false;
let bubbleSortPaused = false;
let animationTimer = null;

// 初始化氣泡排序視覺化
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const generateBtn = document.getElementById('bubble-generate');
    const startBtn = document.getElementById('bubble-start');
    const pauseBtn = document.getElementById('bubble-pause');
    const resetBtn = document.getElementById('bubble-reset');
    const speedSlider = document.getElementById('bubble-speed');
    const statusText = document.getElementById('bubble-status');
    
    // 初始化按鈕事件
    generateBtn.addEventListener('click', generateBubbleArray);
    startBtn.addEventListener('click', startBubbleSort);
    pauseBtn.addEventListener('click', togglePauseBubbleSort);
    resetBtn.addEventListener('click', resetBubbleSort);
    
    // 初始化SVG
    initSvg();
    
    // 監聽窗口大小改變事件，以便重新繪製SVG
    window.addEventListener('resize', function() {
        if (bubbleArray.length > 0) {
            renderBubbleArray();
        }
    });
});

// 初始化SVG圖表
function initSvg() {
    // 清空SVG內容
    d3.select('#bubble-svg').selectAll('*').remove();
    
    // 設置邊界 - 足夠的邊距讓視覺效果美觀
    const margin = { top: 30, right: 80, bottom: 30, left: 80 };
    const svg = d3.select('#bubble-svg');
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    
    // 添加一個圖形容器，用於繪製柱狀圖
    svg.append('g')
       .attr('class', 'bars-container')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

// 生成隨機數組
function generateBubbleArray() {
    resetBubbleSort();
    const length = 15; // 數組長度
    const min = 5;     // 最小值
    const max = 100;   // 最大值
    
    // 生成隨機數組
    bubbleArray = Array.from({ length }, (_, i) => ({
        id: i,  // 唯一標識符
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        position: i,  // 初始位置 = 索引
        state: 'unsorted'  // 狀態: unsorted, comparing, swapping, sorted
    }));
    
    // 渲染數組
    renderBubbleArray();
    
    // 更新按鈕狀態
    document.getElementById('bubble-start').disabled = false;
    document.getElementById('bubble-reset').disabled = false;
    document.getElementById('bubble-status').textContent = '數組已生成，點擊「開始排序」按鈕開始';
}

// 使用D3.js渲染數組
function renderBubbleArray() {
    if (!bubbleArray || bubbleArray.length === 0) return;
    
    // 設置SVG基本參數
    const svg = d3.select('#bubble-svg');
    const margin = { top: 30, right: 80, bottom: 30, left: 80 }; // 增加左右邊距
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 240;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    // 建立比例尺 - 適中的柱子寬度和間距
    const xScale = d3.scaleBand()
        .domain(d3.range(bubbleArray.length))
        .range([0, contentWidth * 0.7]) // 只使用中間70%的空間
        .padding(0.25);  // 中等的padding
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(bubbleArray, d => d.value) * 1.1])
        .range([contentHeight, 0]); // 反轉Y軸，值越大柱子越高
    
    // 選擇容器
    const container = svg.select('.bars-container');
    
    // 計算中心偏移量，使柱子居中
    const centerOffset = (contentWidth - xScale.range()[1]) / 2;
    
    // 按position排序數組以便正確渲染
    const sortedArray = [...bubbleArray].sort((a, b) => a.position - b.position);
    
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
    const duration = (101 - document.getElementById('bubble-speed').value) * 5;
    
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

// 根據柱子狀態獲取顏色
function getBarColor(state) {
    switch (state) {
        case 'comparing': return '#4A5568'; // 正在比較 - 深藍灰色
        case 'swapping': return '#2B6CB0';  // 正在交換 - 深藍色
        case 'sorted': return '#1A365D';    // 已排序 - 深藏青色
        default: return '#A0AEC0';          // 未排序 - 冷調灰藍色
    }
}

// 設置柱子狀態
function setBarStates(comparingPos = [], swappingPos = [], sortedPos = []) {
    bubbleArray.forEach(bar => {
        if (swappingPos.includes(bar.position)) {
            bar.state = 'swapping';
        } else if (comparingPos.includes(bar.position)) {
            bar.state = 'comparing';
        } else if (sortedPos.includes(bar.position)) {
            bar.state = 'sorted';
        } else {
            bar.state = 'unsorted';
        }
    });
    renderBubbleArray();
}

// 交換兩個位置的柱子
function swapBars(pos1, pos2) {
    // 找到位於這兩個位置的柱子
    const bar1 = bubbleArray.find(bar => bar.position === pos1);
    const bar2 = bubbleArray.find(bar => bar.position === pos2);
    
    if (bar1 && bar2) {
        // 交換位置
        [bar1.position, bar2.position] = [bar2.position, bar1.position];
    }
}

// 執行氣泡排序的一步（比較和可能的交換）
async function bubbleSortStep(pos1, pos2, sortedPositions) {
    const statusText = document.getElementById('bubble-status');
    const bar1 = bubbleArray.find(bar => bar.position === pos1);
    const bar2 = bubbleArray.find(bar => bar.position === pos2);
    
    if (!bar1 || !bar2) return false;
    
    // 顯示比較狀態
    statusText.textContent = `比較元素 ${bar1.value} 和 ${bar2.value}`;
    setBarStates([pos1, pos2], [], sortedPositions);
    
    // 等待一段時間以便觀察
    await new Promise(resolve => {
        animationTimer = setTimeout(resolve, (101 - document.getElementById('bubble-speed').value) * 10);
    });
    
    if (bubbleSortPaused) return false;
    
    // 如果需要交換
    if (bar1.value > bar2.value) {
        // 顯示交換狀態
        statusText.textContent = `交換元素 ${bar1.value} 和 ${bar2.value}`;
        setBarStates([], [pos1, pos2], sortedPositions);
        
        // 等待一段時間以便觀察
        await new Promise(resolve => {
            animationTimer = setTimeout(resolve, (101 - document.getElementById('bubble-speed').value) * 5);
        });
        
        if (bubbleSortPaused) return false;
        
        // 執行交換
        swapBars(pos1, pos2);
        
        // 顯示交換後狀態
        setBarStates([], [], sortedPositions);
        
        // 等待一段時間以便觀察
        await new Promise(resolve => {
            animationTimer = setTimeout(resolve, (101 - document.getElementById('bubble-speed').value) * 5);
        });
        
        return true; // 發生了交換
    }
    
    return false; // 沒有發生交換
}

// 開始氣泡排序
function startBubbleSort() {
    if (!bubbleSortRunning) {
        bubbleSortRunning = true;
        bubbleSortPaused = false;
        
        // 更新按鈕狀態
        updateButtonStatus();
        
        // 開始執行動畫
        bubbleSortAlgorithm();
    } else if (bubbleSortPaused) {
        // 如果是暫停狀態，繼續執行
        bubbleSortPaused = false;
        updateButtonStatus();
        
        // 繼續排序
        bubbleSortAlgorithm();
    }
}

// 暫停/繼續排序
function togglePauseBubbleSort() {
    if (bubbleSortRunning) {
        bubbleSortPaused = !bubbleSortPaused;
        
        // 更新狀態文字
        const statusText = document.getElementById('bubble-status');
        if (bubbleSortPaused) {
            // 添加暫停提示
            statusText.textContent = statusText.textContent + ' (已暫停)';
        } else {
            // 移除暫停提示，繼續執行
            statusText.textContent = statusText.textContent.replace(' (已暫停)', '');
            bubbleSortAlgorithm();
        }
        
        // 更新按鈕狀態
        updateButtonStatus();
    }
}

// 更新按鈕狀態
function updateButtonStatus() {
    document.getElementById('bubble-generate').disabled = bubbleSortRunning && !bubbleSortPaused;
    document.getElementById('bubble-start').disabled = (bubbleSortRunning && !bubbleSortPaused) || bubbleArray.length === 0;
    document.getElementById('bubble-pause').disabled = !bubbleSortRunning || bubbleSortPaused;
    document.getElementById('bubble-reset').disabled = bubbleArray.length === 0;
}

// 重置排序
function resetBubbleSort() {
    // 停止正在執行的動畫
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    
    // 重置狀態
    bubbleSortRunning = false;
    bubbleSortPaused = false;
    bubbleArray = [];
    
    // 清空視覺化區域
    initSvg();
    
    // 重置狀態文字
    document.getElementById('bubble-status').textContent = '請點擊「生成數組」按鈕開始';
    
    // 更新按鈕狀態
    document.getElementById('bubble-generate').disabled = false;
    document.getElementById('bubble-start').disabled = true;
    document.getElementById('bubble-pause').disabled = true;
    document.getElementById('bubble-reset').disabled = true;
}

// 氣泡排序算法實現
async function bubbleSortAlgorithm() {
    if (!bubbleArray || bubbleArray.length === 0 || bubbleSortPaused) return;
    
    const statusText = document.getElementById('bubble-status');
    const n = bubbleArray.length;
    const sortedPositions = [];
    
    // 執行氣泡排序
    for (let i = 0; i < n; i++) {
        if (bubbleSortPaused) return;
        
        let swapped = false;
        
        for (let j = 0; j < n - i - 1; j++) {
            if (bubbleSortPaused) return;
            
            // 執行一步排序（比較並可能交換）
            const wasSwapped = await bubbleSortStep(j, j + 1, sortedPositions);
            
            if (wasSwapped) {
                swapped = true;
            }
            
            if (bubbleSortPaused) return;
        }
        
        // 該輪結束後，最右邊的元素已經排序好
        const lastPosition = n - i - 1;
        sortedPositions.push(lastPosition);
        
        // 更新狀態文字
        const sortedBar = bubbleArray.find(bar => bar.position === lastPosition);
        statusText.textContent = `第 ${i + 1} 輪排序完成，元素 ${sortedBar ? sortedBar.value : ''} 已到達最終位置`;
        
        // 顯示該輪結束的狀態
        setBarStates([], [], sortedPositions);
        
        // 等待一段時間以便觀察
        await new Promise(resolve => {
            animationTimer = setTimeout(resolve, (101 - document.getElementById('bubble-speed').value) * 15);
        });
        
        if (!swapped) {
            // 如果該輪沒有交換，則說明數組已經排序完成
            break;
        }
    }
    
    // 排序完成
    statusText.textContent = '排序完成！';
    
    // 將所有元素標記為已排序
    const allPositions = Array.from({ length: n }, (_, i) => i);
    setBarStates([], [], allPositions);
    
    bubbleSortRunning = false;
    updateButtonStatus();
}
