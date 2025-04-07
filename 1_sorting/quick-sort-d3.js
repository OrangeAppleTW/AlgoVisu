// 快速排序D3.js視覺化實現
let quickArray = [];
let quickSortRunning = false;
let quickSortPaused = false;
let quickSortAnimationTimer = null;

// 初始化快速排序視覺化
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const generateBtn = document.getElementById('quick-generate');
    const startBtn = document.getElementById('quick-start');
    const pauseBtn = document.getElementById('quick-pause');
    const resetBtn = document.getElementById('quick-reset');
    const speedSlider = document.getElementById('quick-speed');
    const statusText = document.getElementById('quick-status');
    
    // 初始化按鈕事件
    generateBtn.addEventListener('click', generateQuickArray);
    startBtn.addEventListener('click', startQuickSort);
    pauseBtn.addEventListener('click', togglePauseQuickSort);
    resetBtn.addEventListener('click', resetQuickSort);
    
    // 初始化SVG
    initSvg();
    
    // 監聽窗口大小改變事件，以便重新繪製SVG
    window.addEventListener('resize', function() {
        if (quickArray.length > 0) {
            renderQuickArray();
        }
    });
});

// 初始化SVG圖表
function initSvg() {
    // 清空SVG內容
    d3.select('#quick-svg').selectAll('*').remove();
    
    // 設置邊界 - 足夠的邊距讓視覺效果美觀
    const margin = { top: 30, right: 80, bottom: 70, left: 80 }; // 增加底部邊距以顯示指針
    const svg = d3.select('#quick-svg');
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 280;
    
    // 添加一個圖形容器，用於繪製柱狀圖
    svg.append('g')
       .attr('class', 'bars-container')
       .attr('transform', `translate(${margin.left}, ${margin.top})`);
       
    // 添加一個容器用於顯示指針
    svg.append('g')
       .attr('class', 'pointers-container')
       .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 20})`);
}

// 生成隨機數組
function generateQuickArray() {
    resetQuickSort();
    const length = 15; // 數組長度
    const min = 5;     // 最小值
    const max = 100;   // 最大值
    
    // 生成隨機數組並添加位置和ID信息
    quickArray = Array.from({ length }, (_, i) => ({
        id: i,  // 唯一標識符
        value: Math.floor(Math.random() * (max - min + 1)) + min,
        position: i,  // 初始位置 = 索引
        state: 'unsorted'  // 狀態: unsorted, comparing, swapping, pivot, sorted
    }));
    
    // 渲染數組
    renderQuickArray();
    
    // 更新按鈕狀態
    document.getElementById('quick-start').disabled = false;
    document.getElementById('quick-reset').disabled = false;
    document.getElementById('quick-status').textContent = '數組已生成，點擊「開始排序」按鈕開始';
}

// 使用D3.js渲染數組，並顯示 i 和 j 指針位置
function renderQuickArray(comparingPos = [], swappingPos = [], pivotPos = -1, sortedPos = [], i = -2, j = -2) {
    if (!quickArray || quickArray.length === 0) return;
    
    // 設置SVG基本參數
    const svg = d3.select('#quick-svg');
    const margin = { top: 30, right: 80, bottom: 70, left: 80 }; // 增加底部邊距以顯示指針
    const width = parseInt(svg.style('width')) || 800;
    const height = parseInt(svg.style('height')) || 280;
    const contentWidth = width - margin.left - margin.right;
    const contentHeight = height - margin.top - margin.bottom;
    
    // 建立比例尺 - 適中的柱子寬度和間距
    const xScale = d3.scaleBand()
        .domain(d3.range(quickArray.length))
        .range([0, contentWidth * 0.7]) // 只使用中間70%的空間
        .padding(0.25);  // 中等的padding
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(quickArray, d => d.value) * 1.1])
        .range([contentHeight, 0]); // 反轉Y軸，值越大柱子越高
    
    // 選擇容器
    const container = svg.select('.bars-container');
    
    // 計算中心偏移量，使柱子居中
    const centerOffset = (contentWidth - xScale.range()[1]) / 2;
    
    // 更新元素狀態 (不修改原始數組的狀態)
    quickArray.forEach(item => {
        item.state = 'unsorted';
        if (pivotPos !== -1 && item.position === pivotPos) {
            item.state = 'pivot';
        } else if (swappingPos.includes(item.position)) {
            item.state = 'swapping';
        } else if (comparingPos.includes(item.position)) {
            item.state = 'comparing';
        } else if (sortedPos.includes(item.position)) {
            item.state = 'sorted';
        }
    });
    
    // 按position排序數組以便正確渲染
    const sortedArray = [...quickArray].sort((a, b) => a.position - b.position);
    
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
        .attr('class', 'value-text')
        .attr('x', xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5) // 文字位於柱子上方
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .attr('font-size', '11px') 
        .text(d => d.value);
    
    // 更新現有元素（包括動畫）
    const duration = (101 - document.getElementById('quick-speed').value) * 5;
    
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
    bars.select('.value-text')
        .transition()
        .duration(duration)
        .attr('y', d => yScale(d.value) - 5);
    
    // 渲染指針 i 和 j
    renderPointers(xScale, centerOffset, i, j);
}

// 渲染 i 和 j 指針 - 使用符號代替線條，分別在不同行顯示
function renderPointers(xScale, centerOffset, i, j) {
    const svg = d3.select('#quick-svg');
    const pointersContainer = svg.select('.pointers-container');
    
    // 清空指針容器
    pointersContainer.selectAll('*').remove();
    
    // 如果 i 或 j 不在範圍內，不渲染
    if (i < -1 && j < 0) return;
    
    // 繪製 i 指針 (圓形)
    if (i >= -1) {
        // 計算指針位置
        let iPos = i;
        if (i === -1) {
            // 如果 i 是 -1，將指針放在左邊緣前方
            iPos = -0.5;
        }
        
        const iPosX = centerOffset + xScale(iPos) + xScale.bandwidth() / 2;
        
        // 繪製指針背景
        pointersContainer.append('circle')
            .attr('cx', iPosX)
            .attr('cy', 15)  // 第一行
            .attr('r', 12)
            .attr('fill', 'white')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 2);
        
        // 添加 i 指針文字
        pointersContainer.append('text')
            .attr('class', 'pointer-text')
            .attr('x', iPosX)
            .attr('y', 19)  // 第一行
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('fill', '#e74c3c')
            .attr('font-size', '14px')
            .text('i');
            
        // 添加位置標籤
        pointersContainer.append('text')
            .attr('x', iPosX)
            .attr('y', 35)  // 第一行下方
            .attr('text-anchor', 'middle')
            .attr('fill', '#555')
            .attr('font-size', '10px')
            .text(`(${i})`);
    }
    
    // 繪製 j 指針 (三角形)
    if (j >= 0) {
        const jPosX = centerOffset + xScale(j) + xScale.bandwidth() / 2;
        
        // 繪製三角形指針
        const triangleSize = 10;
        const trianglePoints = [
            `${jPosX},${45 - triangleSize}`, // 頂點
            `${jPosX - triangleSize},${45}`,  // 左下角
            `${jPosX + triangleSize},${45}`   // 右下角
        ].join(' ');
        
        // 繪製三角形背景
        pointersContainer.append('polygon')
            .attr('points', trianglePoints)
            .attr('fill', 'white')
            .attr('stroke', '#3498db')
            .attr('stroke-width', 2);
        
        // 添加 j 指針文字
        pointersContainer.append('text')
            .attr('class', 'pointer-text')
            .attr('x', jPosX)
            .attr('y', 50)  // 第二行
            .attr('text-anchor', 'middle')
            .attr('font-weight', 'bold')
            .attr('fill', '#3498db')
            .attr('font-size', '14px')
            .text('j');
            
        // 添加位置標籤
        pointersContainer.append('text')
            .attr('x', jPosX)
            .attr('y', 65)  // 第二行下方
            .attr('text-anchor', 'middle')
            .attr('fill', '#555')
            .attr('font-size', '10px')
            .text(`(${j})`);
    }
}

// 根據柱子狀態獲取顏色
function getBarColor(state) {
    switch (state) {
        case 'pivot': return '#e74c3c';   // 基準元素 - 紅色
        case 'comparing': return '#f39c12'; // 正在比較 - 橙色
        case 'swapping': return '#9b59b6';  // 正在交換 - 紫色
        case 'sorted': return '#2ecc71';    // 已排序 - 綠色
        default: return '#3498db';          // 未排序 - 藍色
    }
}

// 設置柱子狀態
function setBarStates(comparingPos = [], swappingPos = [], pivotPos = -1, sortedPos = [], i = -2, j = -2) {
    quickArray.forEach(bar => {
        if (pivotPos !== -1 && bar.position === pivotPos) {
            bar.state = 'pivot';
        } else if (swappingPos.includes(bar.position)) {
            bar.state = 'swapping';
        } else if (comparingPos.includes(bar.position)) {
            bar.state = 'comparing';
        } else if (sortedPos.includes(bar.position)) {
            bar.state = 'sorted';
        } else {
            bar.state = 'unsorted';
        }
    });
    renderQuickArray(comparingPos, swappingPos, pivotPos, sortedPos, i, j);
}

// 交換兩個位置的柱子
function swapBars(pos1, pos2) {
    // 找到位於這兩個位置的柱子
    const bar1 = quickArray.find(bar => bar.position === pos1);
    const bar2 = quickArray.find(bar => bar.position === pos2);
    
    if (bar1 && bar2) {
        // 交換位置
        [bar1.position, bar2.position] = [bar2.position, bar1.position];
    }
}

// 開始快速排序
function startQuickSort() {
    if (!quickSortRunning) {
        quickSortRunning = true;
        quickSortPaused = false;
        
        // 更新按鈕狀態
        updateButtonStatus();
        
        // 開始執行動畫
        quickSortAlgorithm(0, quickArray.length - 1, []);
    } else if (quickSortPaused) {
        // 如果是暫停狀態，繼續執行
        quickSortPaused = false;
        updateButtonStatus();
        
        // 繼續排序
        quickSortAlgorithm();
    }
}

// 暫停/繼續排序
function togglePauseQuickSort() {
    if (quickSortRunning) {
        quickSortPaused = !quickSortPaused;
        
        // 更新狀態文字
        const statusText = document.getElementById('quick-status');
        if (statusText) {
            if (quickSortPaused) {
                // 添加暫停提示
                statusText.textContent = statusText.textContent + ' (已暫停)';
            } else {
                // 移除暫停提示，繼續執行
                statusText.textContent = statusText.textContent.replace(' (已暫停)', '');
                quickSortAlgorithm();
            }
        }
        
        // 更新按鈕狀態
        updateButtonStatus();
    }
}

// 更新按鈕狀態
function updateButtonStatus() {
    document.getElementById('quick-generate').disabled = quickSortRunning && !quickSortPaused;
    document.getElementById('quick-start').disabled = (quickSortRunning && !quickSortPaused) || quickArray.length === 0;
    document.getElementById('quick-pause').disabled = !quickSortRunning || quickSortPaused;
    document.getElementById('quick-reset').disabled = quickArray.length === 0;
}

// 重置排序
function resetQuickSort() {
    // 停止正在執行的動畫
    if (quickSortAnimationTimer) {
        clearTimeout(quickSortAnimationTimer);
        quickSortAnimationTimer = null;
    }
    
    // 重置狀態
    quickSortRunning = false;
    quickSortPaused = false;
    quickArray = [];
    
    // 清空視覺化區域
    initSvg();
    
    // 重置狀態文字
    document.getElementById('quick-status').textContent = '請點擊「生成數組」按鈕開始';
    
    // 更新按鈕狀態
    document.getElementById('quick-generate').disabled = false;
    document.getElementById('quick-start').disabled = true;
    document.getElementById('quick-pause').disabled = true;
    document.getElementById('quick-reset').disabled = true;
}

// 執行分區過程，返回基準元素的最終位置
async function partition(low, high, sortedPos) {
    const pivotPos = high;
    const statusText = document.getElementById('quick-status');
    const pivotItem = quickArray.find(item => item.position === pivotPos);
    
    if (!pivotItem) return -1;
    
    // 顯示選擇基準元素
    statusText.textContent = `選擇基準元素: ${pivotItem.value}（位於最右側）`;
    setBarStates([], [], pivotPos, sortedPos);
    
    // 等待觀察
    await new Promise(resolve => {
        quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
    });
    
    if (quickSortPaused) return -1;
    
    // 初始化 i 指針（小於等於基準的元素區域的邊界）
    let i = low - 1;
    
    // 描述 i 和 j 的作用
    statusText.textContent = `i = ${i}（小於等於基準的元素區域邊界），開始遍歷數組尋找小於等於基準的元素`;
    setBarStates([], [], pivotPos, sortedPos, i, -1);
    
    await new Promise(resolve => {
        quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 15);
    });
    
    if (quickSortPaused) return -1;
    
    // 遍歷數組，將小於等於基準的元素移到左側
    for (let j = low; j < high; j++) {
        if (quickSortPaused) return -1;
        
        // 顯示當前 j 的位置及其作用
        statusText.textContent = `j = ${j}，比較元素 ${quickArray.find(item => item.position === j)?.value} 和基準 ${pivotItem.value}`;
        setBarStates([j], [], pivotPos, sortedPos, i, j);
        
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
        });
        
        if (quickSortPaused) return -1;
        
        // 取得當前元素
        const currentItem = quickArray.find(item => item.position === j);
        if (!currentItem) continue;
        
        // 如果當前元素小於等於基準
        if (currentItem.value <= pivotItem.value) {
            i++;
            
            // 更新 i 的位置
            statusText.textContent = `${currentItem.value} <= ${pivotItem.value}，i增加到 ${i}`;
            setBarStates([j], [], pivotPos, sortedPos, i, j);
            
            await new Promise(resolve => {
                quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 8);
            });
            
            if (quickSortPaused) return -1;
            
            // 找到在i位置的元素
            const iItem = quickArray.find(item => item.position === i);
            if (!iItem) continue;
            
            // 如果 i 和 j 不相同，交換元素
            if (i !== j) {
                statusText.textContent = `交換 i (${i}) 和 j (${j}) 位置的元素：${iItem.value} 和 ${currentItem.value}`;
                setBarStates([], [i, j], pivotPos, sortedPos, i, j);
                
                await new Promise(resolve => {
                    quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 8);
                });
                
                if (quickSortPaused) return -1;
                
                // 執行交換
                swapBars(i, j);
                
                // 顯示交換後
                statusText.textContent = `交換完成，現在 i (${i}) 位置上是 ${quickArray.find(item => item.position === i)?.value}`;
                setBarStates([], [], pivotPos, sortedPos, i, j);
                
                await new Promise(resolve => {
                    quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 5);
                });
                
                if (quickSortPaused) return -1;
            } else {
                statusText.textContent = `i 和 j 相同位置 (${i})，無需交換`;
                await new Promise(resolve => {
                    quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 5);
                });
                
                if (quickSortPaused) return -1;
            }
        } else {
            statusText.textContent = `${currentItem.value} > ${pivotItem.value}，i 不變 (${i})，繼續尋找小於等於基準的元素`;
            await new Promise(resolve => {
                quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 8);
            });
            
            if (quickSortPaused) return -1;
        }
    }
    
    // 將基準元素放到 i+1 位置
    const newPivotPos = i + 1;
    const newPivotItem = quickArray.find(item => item.position === newPivotPos);
    
    statusText.textContent = `遍歷完成，將基準元素 ${pivotItem.value} 放到 i+1 (${newPivotPos}) 的位置`;
    setBarStates([], [], pivotPos, sortedPos, i, -1);
    
    await new Promise(resolve => {
        quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 15);
    });
    
    if (quickSortPaused) return -1;
    
    if (newPivotItem && newPivotPos !== pivotPos) {
        statusText.textContent = `交換基準元素 ${pivotItem.value} 和位置 ${newPivotPos} 的元素 ${newPivotItem.value}`;
        setBarStates([], [newPivotPos, pivotPos], pivotPos, sortedPos, i, -1);
        
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
        });
        
        if (quickSortPaused) return -1;
        
        // 交換位置
        swapBars(newPivotPos, pivotPos);
        
        // 展示交換後的結果
        statusText.textContent = `基準元素 ${pivotItem.value} 已就位於 ${newPivotPos}，左側全部 <= ${pivotItem.value}，右側全部 > ${pivotItem.value}`;
        setBarStates([], [], newPivotPos, sortedPos, i, -1);
        
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 15);
        });
        
        if (quickSortPaused) return -1;
    } else {
        statusText.textContent = `基準元素 ${pivotItem.value} 已經在正確位置 ${pivotPos}`;
        setBarStates([], [], pivotPos, sortedPos, i, -1);
        
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
        });
        
        if (quickSortPaused) return -1;
    }
    
    return newPivotPos;
}

// 快速排序算法實現
async function quickSortAlgorithm(low = 0, high = quickArray.length - 1, sortedPos = []) {
    if (quickSortPaused) return;
    
    // 基本情況：如果子數組只有一個元素或已經排序
    if (low >= high) {
        if (low >= 0 && low < quickArray.length && !sortedPos.includes(low)) {
            const statusText = document.getElementById('quick-status');
            statusText.textContent = `位置 ${low} 上的元素已經排序好`;
            sortedPos.push(low);
            setBarStates([], [], -1, sortedPos);
            
            await new Promise(resolve => {
                quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 5);
            });
        }
        return;
    }
    
    // 顯示當前正在處理的子數組
    const statusText = document.getElementById('quick-status');
    statusText.textContent = `開始對子數組 [${low}, ${high}] 進行排序`;
    setBarStates([], [], -1, sortedPos);
    
    await new Promise(resolve => {
        quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
    });
    
    if (quickSortPaused) return;
    
    // 分區過程
    const pivotPos = await partition(low, high, sortedPos);
    if (pivotPos === -1 || quickSortPaused) return; // 如果分區過程中暫停了
    
    // 標記基準元素為已排序
    sortedPos.push(pivotPos);
    statusText.textContent = `基準元素已排序，開始遞迴處理左右子數組`;
    setBarStates([], [], -1, sortedPos);
    
    await new Promise(resolve => {
        quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 10);
    });
    
    if (quickSortPaused) return;
    
    // 遞迴排序左子數組
    if (low < pivotPos - 1) {
        statusText.textContent = `遞迴處理左子數組 [${low}, ${pivotPos - 1}]`;
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 5);
        });
        
        if (quickSortPaused) return;
        await quickSortAlgorithm(low, pivotPos - 1, sortedPos);
    }
    
    // 遞迴排序右子數組
    if (pivotPos + 1 < high) {
        statusText.textContent = `遞迴處理右子數組 [${pivotPos + 1}, ${high}]`;
        await new Promise(resolve => {
            quickSortAnimationTimer = setTimeout(resolve, (101 - document.getElementById('quick-speed').value) * 5);
        });
        
        if (quickSortPaused) return;
        await quickSortAlgorithm(pivotPos + 1, high, sortedPos);
    }
    
    // 檢查是否完成整個排序
    if (low === 0 && high === quickArray.length - 1 && !quickSortPaused) {
        statusText.textContent = '排序完成！';
        setBarStates([], [], -1, Array.from({length: quickArray.length}, (_, i) => i));
        quickSortRunning = false;
        updateButtonStatus();
    }
}
