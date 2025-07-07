/**
 * 複雜度分析工具的控制邏輯
 */

class ComplexityAnalysisController {
    constructor() {
        this.currentSize = 8;
        this.currentCase = 'best';
        this.analysisData = [];
        this.chartSvg = null;
        
        this.initChart();
        this.bindEvents();
        this.updateDisplay();
    }
    
    bindEvents() {
        // 陣列大小滑桿
        const sizeSlider = document.getElementById('array-size-slider');
        sizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.updateDisplay();
        });
        
        // 測試案例按鈕
        document.querySelectorAll('.test-button[data-case]').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectCase(e.target.dataset.case);
            });
        });
        
        // 執行分析按鈕
        document.getElementById('run-analysis').addEventListener('click', () => {
            this.runAnalysis();
        });
    }
    
    selectCase(caseType) {
        this.currentCase = caseType;
        
        // 更新按鈕狀態
        document.querySelectorAll('.test-button[data-case]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-case="${caseType}"]`).classList.add('active');
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        // 更新大小顯示
        document.getElementById('current-size').textContent = this.currentSize;
        
        // 計算並顯示理論值
        const theoretical = this.calculateTheoretical(this.currentCase, this.currentSize);
        document.getElementById('theoretical-comparisons').textContent = formatNumber(theoretical.comparisons);
        document.getElementById('theoretical-formula').textContent = theoretical.formula;
        
        // 重置實際值顯示
        document.getElementById('actual-comparisons').textContent = '-';
        document.getElementById('actual-formula').textContent = '點擊執行分析';
        document.getElementById('accuracy-percentage').textContent = '-';
        document.getElementById('accuracy-status').textContent = '待測量';
    }
    
    async runAnalysis() {
        // 顯示分析中狀態
        document.getElementById('actual-comparisons').textContent = '分析中...';
        document.getElementById('actual-formula').textContent = '執行中...';
        
        try {
            // 執行氣泡排序並收集數據
            const result = await this.performBubbleSort();
            
            // 更新顯示
            this.updateResults(result);
            
            // 更新圖表
            this.updateChart();
            
            // 更新比較表格
            this.updateComparisonTable();
            
        } catch (error) {
            console.error('分析過程發生錯誤:', error);
            document.getElementById('actual-comparisons').textContent = '錯誤';
            document.getElementById('actual-formula').textContent = '分析失敗';
        }
    }
    
    async performBubbleSort() {
        // 創建臨時視覺化器來執行排序
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        
        const visualizer = new BubbleSortVisualizer(container.id, {
            width: 100,
            height: 100
        });
        
        // 設定資料
        const data = visualizer.generateTestData(this.currentCase, this.currentSize);
        visualizer.setData(data);
        
        // 記錄開始時間
        const startTime = performance.now();
        
        // 執行排序直到完成
        while (!visualizer.getStats().isCompleted) {
            visualizer.bubbleSortStep();
        }
        
        // 記錄結束時間
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        // 獲取結果
        const stats = visualizer.getStats();
        
        // 清理
        document.body.removeChild(container);
        
        return {
            ...stats,
            executionTime: executionTime,
            arraySize: this.currentSize,
            case: this.currentCase
        };
    }
    
    updateResults(result) {
        // 更新實際值
        document.getElementById('actual-comparisons').textContent = formatNumber(result.comparisons);
        document.getElementById('actual-formula').textContent = `實測: ${result.comparisons}`;
        
        // 計算準確度
        const theoretical = this.calculateTheoretical(this.currentCase, this.currentSize);
        const accuracy = this.calculateAccuracy(theoretical.comparisons, result.comparisons);
        
        document.getElementById('accuracy-percentage').textContent = accuracy.percentage + '%';
        document.getElementById('accuracy-status').textContent = accuracy.status;
        
        // 更新詳細指標
        document.getElementById('metric-comparisons').textContent = formatNumber(result.comparisons);
        document.getElementById('metric-swaps').textContent = formatNumber(result.swaps);
        document.getElementById('metric-passes').textContent = formatNumber(result.passes);
        
        // 儲存分析數據
        this.analysisData.push(result);
    }
    
    calculateTheoretical(caseType, size) {
        const n = size;
        
        switch (caseType) {
            case 'best':
                return {
                    comparisons: n - 1,
                    swaps: 0,
                    formula: `${n - 1} (n-1)`,
                    complexity: 'O(n)'
                };
                
            case 'worst':
                return {
                    comparisons: n * (n - 1) / 2,
                    swaps: n * (n - 1) / 2,
                    formula: `${n * (n - 1) / 2} (n(n-1)/2)`,
                    complexity: 'O(n²)'
                };
                
            case 'average':
                return {
                    comparisons: n * (n - 1) / 2,
                    swaps: n * (n - 1) / 4,
                    formula: `${n * (n - 1) / 2} (n(n-1)/2)`,
                    complexity: 'O(n²)'
                };
                
            default:
                return {
                    comparisons: 0,
                    swaps: 0,
                    formula: '未知',
                    complexity: 'O(?)'
                };
        }
    }
    
    calculateAccuracy(theoretical, actual) {
        if (theoretical === 0) {
            return {
                percentage: actual === 0 ? 100 : 0,
                status: actual === 0 ? '完全符合' : '不符合'
            };
        }
        
        const accuracy = Math.round((1 - Math.abs(theoretical - actual) / theoretical) * 100);
        const clampedAccuracy = Math.max(0, Math.min(100, accuracy));
        
        let status = '';
        if (clampedAccuracy >= 95) status = '極佳';
        else if (clampedAccuracy >= 85) status = '良好';
        else if (clampedAccuracy >= 70) status = '一般';
        else status = '偏差較大';
        
        return {
            percentage: clampedAccuracy,
            status: status
        };
    }
    
    initChart() {
        const container = document.getElementById('complexity-chart');
        const width = container.clientWidth - 40;
        const height = 320;
        const margin = { top: 20, right: 80, bottom: 60, left: 80 };
        
        this.chartSvg = d3.select('#complexity-chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 初始化空圖表
        this.chartSvg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .attr('font-size', '16px')
            .text('點擊「執行分析」開始測量複雜度');
    }
    
    updateChart() {
        if (this.analysisData.length === 0) return;
        
        const container = document.getElementById('complexity-chart');
        const width = container.clientWidth - 40;
        const height = 320;
        const margin = { top: 20, right: 80, bottom: 60, left: 80 };
        
        // 清除舊圖表
        this.chartSvg.selectAll('*').remove();
        
        // 準備資料 - 顯示不同陣列大小的比較
        const sizes = [5, 8, 10, 12, 15, 18, 20];
        const theoreticalData = sizes.map(size => ({
            size: size,
            value: this.calculateTheoretical(this.currentCase, size).comparisons
        }));
        
        // 比例尺
        const xScale = d3.scaleLinear()
            .domain([5, 20])
            .range([margin.left, width - margin.right]);
        
        const maxValue = Math.max(...theoreticalData.map(d => d.value));
        const yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([height - margin.bottom, margin.top]);
        
        // 軸
        const xAxis = d3.axisBottom(xScale).tickFormat(d => d);
        const yAxis = d3.axisLeft(yScale).tickFormat(d => formatNumber(d));
        
        this.chartSvg.append('g')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(xAxis);
        
        this.chartSvg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(yAxis);
        
        // 軸標籤
        this.chartSvg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .attr('font-size', '12px')
            .text('陣列大小 (n)');
        
        this.chartSvg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .attr('font-size', '12px')
            .text('比較次數');
        
        // 理論曲線
        const line = d3.line()
            .x(d => xScale(d.size))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        this.chartSvg.append('path')
            .datum(theoreticalData)
            .attr('fill', 'none')
            .attr('stroke', '#333')
            .attr('stroke-width', 2)
            .attr('d', line);
        
        // 理論點
        this.chartSvg.selectAll('.theoretical-point')
            .data(theoreticalData)
            .enter()
            .append('circle')
            .attr('class', 'theoretical-point')
            .attr('cx', d => xScale(d.size))
            .attr('cy', d => yScale(d.value))
            .attr('r', 4)
            .attr('fill', '#333');
        
        // 實際測量點（如果有的話）
        const actualData = this.analysisData.filter(d => d.case === this.currentCase);
        if (actualData.length > 0) {
            this.chartSvg.selectAll('.actual-point')
                .data(actualData)
                .enter()
                .append('circle')
                .attr('class', 'actual-point')
                .attr('cx', d => xScale(d.arraySize))
                .attr('cy', d => yScale(d.comparisons))
                .attr('r', 6)
                .attr('fill', '#e74c3c')
                .attr('stroke', 'white')
                .attr('stroke-width', 2);
        }
        
        // 圖例
        const legend = this.chartSvg.append('g')
            .attr('transform', `translate(${width - 150}, 30)`);
        
        legend.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        
        legend.append('text')
            .attr('x', 25)
            .attr('y', 5)
            .attr('fill', '#333')
            .attr('font-size', '12px')
            .text('理論值');
        
        if (actualData.length > 0) {
            legend.append('circle')
                .attr('cx', 10)
                .attr('cy', 20)
                .attr('r', 4)
                .attr('fill', '#e74c3c');
            
            legend.append('text')
                .attr('x', 25)
                .attr('y', 25)
                .attr('fill', '#333')
                .attr('font-size', '12px')
                .text('實測值');
        }
        
        // 標題
        this.chartSvg.append('text')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text(`氣泡排序複雜度分析 - ${this.getCaseDisplayName(this.currentCase)}`);
    }
    
    updateComparisonTable() {
        const tbody = document.getElementById('comparison-table-body');
        tbody.innerHTML = '';
        
        // 生成不同大小的比較資料
        const sizes = [5, 8, 10, 12, 15];
        
        sizes.forEach(size => {
            const theoretical = this.calculateTheoretical(this.currentCase, size);
            const actualData = this.analysisData.find(d => d.arraySize === size && d.case === this.currentCase);
            
            const row = tbody.insertRow();
            row.insertCell(0).textContent = size;
            row.insertCell(1).textContent = formatNumber(theoretical.comparisons);
            row.insertCell(2).textContent = actualData ? formatNumber(actualData.comparisons) : '-';
            row.insertCell(3).textContent = formatNumber(theoretical.swaps);
            row.insertCell(4).textContent = actualData ? formatNumber(actualData.swaps) : '-';
            row.insertCell(5).textContent = theoretical.complexity;
        });
    }
    
    getCaseDisplayName(caseType) {
        const names = {
            'best': '最佳情況',
            'worst': '最差情況',
            'average': '平均情況'
        };
        return names[caseType] || caseType;
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查 D3.js 是否載入
    if (typeof d3 === 'undefined') {
        console.error('D3.js 未正確載入');
        document.getElementById('complexity-chart').innerHTML = 
            '<p style="text-align: center; color: red;">圖表載入失敗，請重新整理頁面</p>';
        return;
    }
    
    // 檢查 BubbleSortVisualizer 是否可用
    if (typeof BubbleSortVisualizer === 'undefined') {
        console.error('BubbleSortVisualizer 未正確載入');
        document.getElementById('complexity-chart').innerHTML = 
            '<p style="text-align: center; color: red;">排序視覺化元件載入失敗</p>';
        return;
    }
    
    // 初始化控制器
    try {
        window.complexityAnalysisController = new ComplexityAnalysisController();
        console.log('複雜度分析工具初始化成功');
    } catch (error) {
        console.error('初始化失敗:', error);
        document.getElementById('complexity-chart').innerHTML = 
            '<p style="text-align: center; color: red;">初始化失敗：' + error.message + '</p>';
    }
});

// 視窗大小改變時重繪圖表
window.addEventListener('resize', function() {
    if (window.complexityAnalysisController) {
        setTimeout(() => {
            window.complexityAnalysisController.updateChart();
        }, 100);
    }
});
