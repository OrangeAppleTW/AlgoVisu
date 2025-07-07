// 複雜度分析模組
// 管理氣泡排序的時間複雜度視覺化和統計

// 全域變數
let complexityData = {
    swaps: 0,
    comparisons: 0,
    rounds: 0,
    arraySize: 0,
    swapHistory: [],
    comparisonHistory: []
};

// 初始化複雜度分析功能
function initComplexityAnalysis() {
    // 初始化複雜度分析選項卡
    initComplexityTabs();
    
    // 初始化交換次數圖表
    initSwapChart();
    
    // 重置統計數據
    resetComplexityStats();
}

// 複雜度分析選項卡切換功能
function initComplexityTabs() {
    const complexityTabs = document.querySelectorAll('.complexity-tab');
    
    complexityTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const complexityId = tab.getAttribute('data-complexity');
            
            // 移除所有活動狀態
            complexityTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.complexity-content').forEach(content => content.classList.remove('active'));
            
            // 設置活動狀態
            tab.classList.add('active');
            document.getElementById(complexityId).classList.add('active');
            
            // 如果切換到比較圖表，繪製複雜度圖表
            if (complexityId === 'comparison') {
                drawComplexityChart();
            }
        });
    });
}

// 重置複雜度統計數據
function resetComplexityStats() {
    complexityData = {
        swaps: 0,
        comparisons: 0,
        rounds: 0,
        arraySize: 0,
        swapHistory: [],
        comparisonHistory: []
    };
    
    updateStatsDisplay();
    updateTheoreticalValues();
    clearSwapChart();
}

// 更新統計數據顯示
function updateStatsDisplay() {
    document.getElementById('swap-count').textContent = complexityData.swaps;
    document.getElementById('comparison-count').textContent = complexityData.comparisons;
    document.getElementById('round-count').textContent = complexityData.rounds;
    document.getElementById('array-size').textContent = complexityData.arraySize;
    
    // 更新實時統計區域
    document.getElementById('actual-swaps').textContent = complexityData.swaps;
    document.getElementById('actual-comparisons').textContent = complexityData.comparisons;
    
    // 計算當前複雜度（簡化表示）
    const n = complexityData.arraySize;
    if (n === 0) {
        document.getElementById('current-complexity').textContent = 'O(1)';
    } else if (complexityData.comparisons <= n) {
        document.getElementById('current-complexity').textContent = 'O(n)';
    } else {
        document.getElementById('current-complexity').textContent = 'O(n²)';
    }
}

// 更新理論預期值
function updateTheoreticalValues() {
    const n = complexityData.arraySize;
    if (n > 0) {
        const worstCaseSwaps = Math.floor(n * (n - 1) / 2);
        const worstCaseComparisons = Math.floor(n * (n - 1) / 2);
        
        document.getElementById('worst-case-swaps').textContent = worstCaseSwaps;
        document.getElementById('worst-case-comparisons').textContent = worstCaseComparisons;
        document.getElementById('average-case').textContent = `O(n²) ≈ ${Math.floor(worstCaseSwaps / 2)}`;
    } else {
        document.getElementById('worst-case-swaps').textContent = '0';
        document.getElementById('worst-case-comparisons').textContent = '0';
        document.getElementById('average-case').textContent = 'O(n²)';
    }
}

// 設置數組大小
function setArraySize(size) {
    complexityData.arraySize = size;
    updateStatsDisplay();
    updateTheoreticalValues();
}

// 記錄比較操作
function recordComparison() {
    complexityData.comparisons++;
    complexityData.comparisonHistory.push({
        step: complexityData.comparisons + complexityData.swaps,
        comparisons: complexityData.comparisons
    });
    updateStatsDisplay();
}

// 記錄交換操作
function recordSwap() {
    complexityData.swaps++;
    complexityData.swapHistory.push({
        step: complexityData.comparisons + complexityData.swaps,
        swaps: complexityData.swaps
    });
    updateStatsDisplay();
    updateSwapChart();
}

// 記錄完成一輪排序
function recordRound() {
    complexityData.rounds++;
    updateStatsDisplay();
}

// 初始化交換次數圖表
function initSwapChart() {
    const svg = d3.select('#swap-chart');
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = parseInt(svg.style('width')) - margin.left - margin.right;
    const height = parseInt(svg.style('height')) - margin.top - margin.bottom;
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // 添加座標軸容器
    g.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${height})`);
    g.append('g').attr('class', 'y-axis');
    
    // 添加軸標籤
    g.append('text')
        .attr('class', 'x-label')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .text('操作步驟');
    
    g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .text('累計交換次數');
}

// 更新交換次數圖表
function updateSwapChart() {
    if (complexityData.swapHistory.length === 0) return;
    
    const svg = d3.select('#swap-chart');
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = parseInt(svg.style('width')) - margin.left - margin.right;
    const height = parseInt(svg.style('height')) - margin.top - margin.bottom;
    const g = svg.select('g');
    
    // 更新比例尺
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(complexityData.swapHistory, d => d.step) || 1])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(complexityData.swapHistory, d => d.swaps) || 1])
        .range([height, 0]);
    
    // 更新座標軸
    g.select('.x-axis').call(d3.axisBottom(xScale));
    g.select('.y-axis').call(d3.axisLeft(yScale));
    
    // 線條生成器
    const line = d3.line()
        .x(d => xScale(d.step))
        .y(d => yScale(d.swaps))
        .curve(d3.curveMonotoneX);
    
    // 更新線條
    const path = g.selectAll('.swap-line').data([complexityData.swapHistory]);
    
    path.enter()
        .append('path')
        .attr('class', 'swap-line')
        .attr('fill', 'none')
        .attr('stroke', '#2B6CB0')
        .attr('stroke-width', 2)
        .merge(path)
        .attr('d', line);
    
    // 更新數據點
    const circles = g.selectAll('.swap-point').data(complexityData.swapHistory);
    
    circles.enter()
        .append('circle')
        .attr('class', 'swap-point')
        .attr('r', 3)
        .attr('fill', '#2B6CB0')
        .merge(circles)
        .attr('cx', d => xScale(d.step))
        .attr('cy', d => yScale(d.swaps));
}

// 清空交換次數圖表
function clearSwapChart() {
    const svg = d3.select('#swap-chart');
    const g = svg.select('g');
    
    g.selectAll('.swap-line').remove();
    g.selectAll('.swap-point').remove();
    
    // 重置座標軸
    g.select('.x-axis').call(d3.axisBottom(d3.scaleLinear().domain([0, 1]).range([0, 300])));
    g.select('.y-axis').call(d3.axisLeft(d3.scaleLinear().domain([0, 1]).range([160, 0])));
}

// 繪製複雜度比較圖表
function drawComplexityChart() {
    const svg = d3.select('#complexity-chart');
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const width = parseInt(svg.style('width')) - margin.left - margin.right;
    const height = parseInt(svg.style('height')) - margin.top - margin.bottom;
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // 數據：不同數組大小的理論複雜度
    const data = [];
    for (let n = 5; n <= 50; n += 5) {
        data.push({
            n: n,
            worstCase: n * (n - 1) / 2,  // O(n²)
            averageCase: n * (n - 1) / 4, // O(n²/2)
            bestCase: n - 1             // O(n)
        });
    }
    
    // 比例尺
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.n))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.worstCase)])
        .range([height, 0]);
    
    // 線條生成器
    const worstLine = d3.line()
        .x(d => xScale(d.n))
        .y(d => yScale(d.worstCase))
        .curve(d3.curveMonotoneX);
    
    const avgLine = d3.line()
        .x(d => xScale(d.n))
        .y(d => yScale(d.averageCase))
        .curve(d3.curveMonotoneX);
    
    const bestLine = d3.line()
        .x(d => xScale(d.n))
        .y(d => yScale(d.bestCase))
        .curve(d3.curveMonotoneX);
    
    // 繪製座標軸
    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 35)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('數組大小 (n)');
    
    g.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('x', -height / 2)
        .attr('fill', 'black')
        .style('text-anchor', 'middle')
        .text('操作次數');
    
    // 繪製線條
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 2)
        .attr('d', worstLine);
    
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#4ecdc4')
        .attr('stroke-width', 2)
        .attr('d', avgLine);
    
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#45b7d1')
        .attr('stroke-width', 2)
        .attr('d', bestLine);
    
    // 添加圖例
    const legend = g.append('g')
        .attr('transform', `translate(${width - 100}, 20)`);
    
    const legendData = [
        { color: '#ff6b6b', label: '最壞情況 O(n²)' },
        { color: '#4ecdc4', label: '平均情況 O(n²/2)' },
        { color: '#45b7d1', label: '最好情況 O(n)' }
    ];
    
    legendData.forEach((d, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);
        
        legendItem.append('line')
            .attr('x1', 0)
            .attr('x2', 15)
            .attr('stroke', d.color)
            .attr('stroke-width', 2);
        
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 4)
            .attr('fill', 'black')
            .style('font-size', '12px')
            .text(d.label);
    });
    
    // 如果當前有執行數據，顯示當前位置
    if (complexityData.arraySize > 0 && complexityData.swaps > 0) {
        g.append('circle')
            .attr('cx', xScale(complexityData.arraySize))
            .attr('cy', yScale(complexityData.swaps))
            .attr('r', 6)
            .attr('fill', '#e74c3c')
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
        
        g.append('text')
            .attr('x', xScale(complexityData.arraySize))
            .attr('y', yScale(complexityData.swaps) - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#e74c3c')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text('當前執行');
    }
}

// 匯出函數供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initComplexityAnalysis,
        resetComplexityStats,
        setArraySize,
        recordComparison,
        recordSwap,
        recordRound,
        updateStatsDisplay
    };
}