/**
 * 複雜度分析工具的控制邏輯
 */

class ComplexityAnalysisController {
    constructor() {
        this.currentSize = 8;
        this.currentCase = 'best';
        this.analysisData = [];
        this.chartSvg = null;
        this.visualizer = null;
        this.isManualMode = true;
        this.stepHistory = [];
        this.currentStepIndex = -1;
        this.isAutoRunning = false;
        
        this.initVisualizer();
        this.initChart();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initVisualizer() {
        // 確保有視覺化容器
        let container = document.getElementById('complexity-visualizer');
        if (!container) {
            // 創建視覺化容器
            container = document.createElement('div');
            container.id = 'complexity-visualizer';
            container.style.cssText = `
                width: 100%;
                height: 300px;
                background-color: #fafafa;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                margin: 20px 0;
            `;
            
            // 在圖表容器之前插入
            const chartContainer = document.querySelector('.chart-container');
            chartContainer.parentNode.insertBefore(container, chartContainer);
        }
        
        this.visualizer = new BubbleSortVisualizer('complexity-visualizer', {
            width: 800,
            height: 280,
            onUpdate: (stats) => this.updateVisualizerStats(stats),
            onComplete: (stats) => this.onVisualizerComplete(stats),
            onStep: (result) => this.onVisualizerStep(result)
        });
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
        
        // 控制模式按鈕
        this.addControlButtons();
        
        // 執行分析按鈕
        document.getElementById('run-analysis').addEventListener('click', () => {
            this.runAnalysis();
        });
    }
    
    addControlButtons() {
        // 創建控制按鈕容器
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'complexity-controls';
        controlsContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
            flex-wrap: wrap;
        `;
        
        // 模式切換按鈕
        const modeToggle = document.createElement('button');
        modeToggle.id = 'mode-toggle';
        modeToggle.className = 'test-button active';
        modeToggle.textContent = '📋 手動模式';
        modeToggle.addEventListener('click', () => this.toggleMode());
        
        // 手動模式控制按鈕
        const nextStepBtn = document.createElement('button');
        nextStepBtn.id = 'next-step';
        nextStepBtn.className = 'test-button';
        nextStepBtn.textContent = '▶ 下一步';
        nextStepBtn.addEventListener('click', () => this.nextStep());
        
        const prevStepBtn = document.createElement('button');
        prevStepBtn.id = 'prev-step';
        prevStepBtn.className = 'test-button';
        prevStepBtn.textContent = '◀ 上一步';
        prevStepBtn.addEventListener('click', () => this.prevStep());
        
        // 自動模式控制按鈕
        const autoCompleteBtn = document.createElement('button');
        autoCompleteBtn.id = 'auto-complete';
        autoCompleteBtn.className = 'test-button';
        autoCompleteBtn.textContent = '⏩ 自動執行';
        autoCompleteBtn.addEventListener('click', () => this.autoComplete());
        
        // 重置按鈕
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-demo';
        resetBtn.className = 'test-button';
        resetBtn.textContent = '🔄 重置';
        resetBtn.addEventListener('click', () => this.resetDemo());
        
        controlsContainer.appendChild(modeToggle);
        controlsContainer.appendChild(nextStepBtn);
        controlsContainer.appendChild(prevStepBtn);
        controlsContainer.appendChild(autoCompleteBtn);
        controlsContainer.appendChild(resetBtn);
        
        // 在視覺化容器後插入控制按鈕
        const visualizer = document.getElementById('complexity-visualizer');
        visualizer.parentNode.insertBefore(controlsContainer, visualizer.nextSibling);
        
        // 添加狀態顯示
        const statusContainer = document.createElement('div');
        statusContainer.className = 'complexity-status';
        statusContainer.style.cssText = `
            background-color: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        `;
        statusContainer.innerHTML = `
            <div id="current-operation" style="font-weight: bold; color: #333; margin-bottom: 10px;">準備開始複雜度分析...</div>
            <div id="step-description" style="color: #666; font-size: 0.9em;">選擇測試案例並點擊"下一步"開始</div>
        `;
        
        controlsContainer.parentNode.insertBefore(statusContainer, controlsContainer.nextSibling);
        
        this.updateControlButtons();
    }
    
    selectCase(caseType) {
        this.currentCase = caseType;
        
        // 更新按鈕狀態
        document.querySelectorAll('.test-button[data-case]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-case="${caseType}"]`).classList.add('active');
        
        this.updateDisplay();
        this.loadTestData();
    }
    
    loadTestData() {
        if (!this.visualizer) return;
        
        const data = this.visualizer.generateTestData(this.currentCase, this.currentSize);
        this.visualizer.setData(data, this.getCaseDisplayName(this.currentCase));
        
        // 重置步驟歷史
        this.stepHistory = [];
        this.currentStepIndex = -1;
        this.saveCurrentState('載入測試資料', 'start');
        
        this.updateCurrentOperation(`已載入${this.getCaseDisplayName(this.currentCase)}測試資料 (n=${this.currentSize})`);
        this.updateStepDescription('點擊"下一步"開始單步執行，或切換至自動模式');
        this.updateControlButtons();
    }
    
    toggleMode() {
        this.isManualMode = !this.isManualMode;
        const modeBtn = document.getElementById('mode-toggle');
        
        if (this.isManualMode) {
            modeBtn.textContent = '📋 手動模式';
            modeBtn.classList.add('active');
        } else {
            modeBtn.textContent = '🚀 自動模式';
            modeBtn.classList.remove('active');
        }
        
        this.updateControlButtons();
    }
    
    nextStep() {
        if (!this.isManualMode || this.isAutoRunning) return;
        
        // 如果可以前進到下一個已記錄的步驟
        if (this.currentStepIndex < this.stepHistory.length - 1) {
            this.currentStepIndex++;
            this.restoreState(this.stepHistory[this.currentStepIndex]);
            this.updateControlButtons();
            return;
        }
        
        // 執行新的步驟
        const result = this.visualizer.bubbleSortStep();
        this.visualizer.updateVisualization();
        
        if (result.finished) {
            this.saveCurrentState('排序完成', 'completed');
            this.updateCurrentOperation('🎉 排序完成！');
            this.updateStepDescription('已完成所有步驟，可以檢視結果或重置');
        } else {
            const stepDescription = this.generateStepDescription(result);
            const operationText = this.generateOperationText(result);
            
            this.saveCurrentState(stepDescription, result.action, result);
            this.updateCurrentOperation(operationText);
            this.updateStepDescription(stepDescription);
        }
        
        this.updateControlButtons();
    }
    
    prevStep() {
        if (!this.isManualMode || this.isAutoRunning) return;
        
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.restoreState(this.stepHistory[this.currentStepIndex]);
            this.updateControlButtons();
        }
    }
    
    async autoComplete() {
        if (this.isAutoRunning) {
            this.isAutoRunning = false;
            this.updateControlButtons();
            return;
        }
        
        this.isAutoRunning = true;
        this.updateControlButtons();
        
        try {
            while (!this.visualizer.getStats().isCompleted && this.isAutoRunning) {
                this.nextStep();
                await this.sleep(400); // 較快的執行速度
            }
        } catch (error) {
            console.error('自動執行時發生錯誤:', error);
        }
        
        this.isAutoRunning = false;
        this.updateControlButtons();
    }
    
    resetDemo() {
        if (this.isAutoRunning) {
            this.isAutoRunning = false;
        }
        
        this.loadTestData();
    }
    
    saveCurrentState(description, action, result = null) {
        const state = {
            description: description,
            action: action,
            result: result,
            data: [...this.visualizer.data],
            stats: { ...this.visualizer.getStats() },
            visualizerState: {
                currentStep: this.visualizer.currentStep,
                comparisons: this.visualizer.comparisons,
                swaps: this.visualizer.swaps,
                passes: this.visualizer.passes,
                currentI: this.visualizer.currentI,
                currentJ: this.visualizer.currentJ
            }
        };
        
        // 如果當前不在歷史記錄的末尾，則刪除後續記錄
        if (this.currentStepIndex < this.stepHistory.length - 1) {
            this.stepHistory = this.stepHistory.slice(0, this.currentStepIndex + 1);
        }
        
        this.stepHistory.push(state);
        this.currentStepIndex = this.stepHistory.length - 1;
    }
    
    restoreState(state) {
        // 恢復資料
        this.visualizer.data = [...state.data];
        
        // 恢復視覺化器狀態
        this.visualizer.currentStep = state.visualizerState.currentStep;
        this.visualizer.comparisons = state.visualizerState.comparisons;
        this.visualizer.swaps = state.visualizerState.swaps;
        this.visualizer.passes = state.visualizerState.passes;
        this.visualizer.currentI = state.visualizerState.currentI;
        this.visualizer.currentJ = state.visualizerState.currentJ;
        
        // 更新視覺化
        this.visualizer.render();
        
        // 如果有比較中的元素，突出顯示
        if (state.visualizerState.currentI >= 0 && state.visualizerState.currentJ >= 0) {
            if (state.action === 'swap') {
                this.visualizer.highlightSwapping(state.visualizerState.currentI, state.visualizerState.currentJ);
            } else if (state.action === 'compare') {
                this.visualizer.highlightComparing(state.visualizerState.currentI, state.visualizerState.currentJ);
            }
        }
        
        // 標記已排序區域
        if (state.visualizerState.passes > 0) {
            this.visualizer.markSorted(this.visualizer.data.length - state.visualizerState.passes);
        }
        
        // 更新界面
        this.updateCurrentOperation(this.generateOperationText(state.result));
        this.updateStepDescription(state.description);
        this.updateVisualizerStats(state.stats);
    }
    
    generateStepDescription(result) {
        switch (result.action) {
            case 'compare':
                const comparisonResult = result.swapped ? '需要交換' : '順序正確';
                return `🔍 比較位置 ${result.indices[0]} 和 ${result.indices[1]}: ${result.values[0]} vs ${result.values[1]} → ${comparisonResult}`;
            
            case 'swap':
                return `🔄 交換位置 ${result.indices[0]} 和 ${result.indices[1]}: ${result.values[1]} ↔ ${result.values[0]}`;
            
            case 'pass_completed':
                return `✅ 第 ${result.pass} 輪完成，最大值已移至正確位置`;
            
            default:
                return '執行氣泡排序步驟...';
        }
    }
    
    generateOperationText(result) {
        if (!result) return '等待開始...';
        
        switch (result.action) {
            case 'compare':
                return `比較: arr[${result.indices[0]}] vs arr[${result.indices[1]}] → ${result.values[0]} vs ${result.values[1]}`;
            
            case 'swap':
                return `交換: arr[${result.indices[0]}] ↔ arr[${result.indices[1]}] → ${result.values[1]} ↔ ${result.values[0]}`;
            
            case 'pass_completed':
                return `第 ${result.pass} 輪完成`;
                
            case 'completed':
                return '排序完成';
            
            default:
                return '執行中...';
        }
    }
    
    updateControlButtons() {
        const nextBtn = document.getElementById('next-step');
        const prevBtn = document.getElementById('prev-step');
        const autoBtn = document.getElementById('auto-complete');
        const resetBtn = document.getElementById('reset-demo');
        
        if (!nextBtn || !prevBtn || !autoBtn || !resetBtn) return;
        
        const isCompleted = this.visualizer ? this.visualizer.getStats().isCompleted : false;
        const canGoNext = this.currentStepIndex < this.stepHistory.length - 1 || !isCompleted;
        const canGoPrev = this.currentStepIndex > 0;
        
        if (this.isManualMode) {
            nextBtn.style.display = 'inline-block';
            prevBtn.style.display = 'inline-block';
            nextBtn.disabled = this.isAutoRunning || !canGoNext;
            prevBtn.disabled = this.isAutoRunning || !canGoPrev;
        } else {
            nextBtn.style.display = 'none';
            prevBtn.style.display = 'none';
        }
        
        autoBtn.disabled = isCompleted && !this.isAutoRunning;
        resetBtn.disabled = this.isAutoRunning;
        
        // 更新自動按鈕文字
        if (this.isAutoRunning) {
            autoBtn.textContent = '⏸ 停止';
        } else if (this.isManualMode) {
            autoBtn.textContent = '⏩ 自動完成';
        } else {
            autoBtn.textContent = '⏩ 自動執行';
        }
    }
    
    updateCurrentOperation(text) {
        const element = document.getElementById('current-operation');
        if (element) element.textContent = text;
    }
    
    updateStepDescription(text) {
        const element = document.getElementById('step-description');
        if (element) element.textContent = text;
    }
    
    updateVisualizerStats(stats) {
        // 更新複雜度分析指標
        this.updateResults({
            comparisons: stats.comparisons,
            swaps: stats.swaps,
            passes: stats.passes,
            executionTime: 0, // 這裡不需要實際時間
            arraySize: this.currentSize,
            case: this.currentCase
        });
    }
    
    onVisualizerStep(result) {
        // 由手動控制器處理
    }
    
    onVisualizerComplete(stats) {
        this.updateCurrentOperation('🎉 排序完成！');
        this.updateStepDescription('複雜度分析完成，可以檢視結果');
        this.updateControlButtons();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        document.getElementById('actual-formula').textContent = '開始步驟執行';
        document.getElementById('accuracy-percentage').textContent = '-';
        document.getElementById('accuracy-status').textContent = '待測量';
        
        // 重新載入測試資料
        if (this.visualizer) {
            this.loadTestData();
        }
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
