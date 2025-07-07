/**
 * 自動演示模式的控制邏輯
 */

class AutoDemoController {
    constructor() {
        this.visualizer = null;
        this.currentCase = 'best';
        this.currentDirection = 'ascending';
        this.isRunning = false;
        this.theoreticalData = null;
        
        this.initVisualizer();
        this.bindEvents();
        this.loadInitialData();
    }
    
    initVisualizer() {
        this.visualizer = new BubbleSortVisualizer('bubble-sort-container', {
            width: 800,
            height: 300,
            onUpdate: (stats) => this.updateStats(stats),
            onComplete: (stats) => this.onSortComplete(stats),
            onStep: (result) => this.onStep(result)
        });
    }
    
    bindEvents() {
        // 案例選擇按鈕
        document.querySelectorAll('.case-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectCase(e.target.dataset.case);
            });
        });
        
        // 方向選擇按鈕
        document.querySelectorAll('.direction-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectDirection(e.target.dataset.direction);
            });
        });
        
        // 控制按鈕
        document.getElementById('start-btn').addEventListener('click', () => this.startSort());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseSort());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSort());
        document.getElementById('generate-btn').addEventListener('click', () => this.generateNewData());
        
        // 速度控制
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.updateSpeed(parseInt(e.target.value));
        });
        
        // 初始化速度顯示
        this.updateSpeed(50);
    }
    
    selectCase(caseType) {
        if (this.isRunning) return;
        
        this.currentCase = caseType;
        
        // 更新按鈕狀態
        document.querySelectorAll('.case-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-case="${caseType}"]`).classList.add('active');
        
        // 載入新資料
        this.loadInitialData();
    }
    
    selectDirection(direction) {
        if (this.isRunning) return;
        
        this.currentDirection = direction;
        this.visualizer.setDirection(direction);
        
        // 更新按鈕狀態
        document.querySelectorAll('.direction-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-direction="${direction}"]`).classList.add('active');
        
        // 重新載入資料，因為最佳/最差情況會根據方向改變
        this.loadInitialData();
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = `排序方向：${direction === 'ascending' ? '由小到大' : '由大到小'}`;
    }
    
    loadInitialData() {
        const data = this.visualizer.generateTestData(this.currentCase, 8);
        this.visualizer.setData(data, this.getCaseDisplayName(this.currentCase));
        this.visualizer.setDirection(this.currentDirection);
        
        // 計算理論值
        this.theoreticalData = this.visualizer.calculateTheoretical(this.currentCase, data.length);
        this.updateTheoreticalComparison();
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = `已載入${this.getCaseDisplayName(this.currentCase)}資料`;
        
        // 清除操作記錄
        document.getElementById('operation-log').innerHTML = '<div style="color: #888; font-style: italic;">等待開始...</div>';
    }
    
    generateNewData() {
        if (this.isRunning) return;
        
        this.loadInitialData();
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = '已重新生成資料';
    }
    
    async startSort() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonStates();
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = '排序執行中...';
        
        // 清除操作記錄並加入開始記錄
        const logContainer = document.getElementById('operation-log');
        logContainer.innerHTML = '<div class="log-entry log-pass">🚀 開始排序...</div>';
        
        await this.visualizer.autoSort();
        
        this.isRunning = false;
        this.updateButtonStates();
    }
    
    pauseSort() {
        if (!this.isRunning) return;
        
        this.visualizer.pause();
        this.isRunning = false;
        this.updateButtonStates();
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = '排序已暫停';
        
        // 加入暫停記錄
        const logContainer = document.getElementById('operation-log');
        logContainer.innerHTML += '<div class="log-entry log-pass">⏸ 排序已暫停</div>';
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    resetSort() {
        this.visualizer.reset();
        this.isRunning = false;
        this.updateButtonStates();
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = '已重置排序';
        
        // 清除操作記錄
        document.getElementById('operation-log').innerHTML = '<div style="color: #888; font-style: italic;">等待開始...</div>';
    }
    
    updateSpeed(value) {
        // 將 1-100 的滑桿值轉換為 1000-10 毫秒的延遲
        const speed = 1010 - (value * 10);
        this.visualizer.setSpeed(speed);
        
        // 更新速度顯示
        let speedText = '';
        if (value < 25) speedText = '很慢';
        else if (value < 50) speedText = '慢';
        else if (value < 75) speedText = '中等';
        else if (value < 90) speedText = '快';
        else speedText = '很快';
        
        document.getElementById('speed-display').textContent = speedText;
    }
    
    updateStats(stats) {
        // 原有的統計更新（為了相容性保留）
        if (document.getElementById('comparisons-count')) {
            document.getElementById('comparisons-count').textContent = formatNumber(stats.comparisons);
        }
        if (document.getElementById('swaps-count')) {
            document.getElementById('swaps-count').textContent = formatNumber(stats.swaps);
        }
        if (document.getElementById('passes-count')) {
            document.getElementById('passes-count').textContent = formatNumber(stats.passes);
        }
        if (document.getElementById('progress-percentage')) {
            document.getElementById('progress-percentage').textContent = Math.round(stats.progress) + '%';
        }
        
        // 新的右側邊欄統計更新
        document.getElementById('sidebar-comparisons').textContent = formatNumber(stats.comparisons);
        document.getElementById('sidebar-swaps').textContent = formatNumber(stats.swaps);
        document.getElementById('sidebar-passes').textContent = formatNumber(stats.passes);
        
        // 更新進度條
        const progressPercentage = Math.round(stats.progress);
        document.getElementById('sidebar-progress-text').textContent = progressPercentage + '%';
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = progressPercentage + '%';
        progressFill.textContent = progressPercentage + '%';
        
        // 更新實際值（為了相容性保留）
        if (document.getElementById('actual-comparisons')) {
            document.getElementById('actual-comparisons').textContent = formatNumber(stats.comparisons);
        }
        if (document.getElementById('actual-swaps')) {
            document.getElementById('actual-swaps').textContent = formatNumber(stats.swaps);
        }
        
        // 計算差異
        if (this.theoreticalData) {
            this.updateDifferences(stats);
        }
    }
    
    updateTheoreticalComparison() {
        if (!this.theoreticalData) return;
        
        // 更新新的右側邊欄
        document.getElementById('theoretical-comparisons-sidebar').textContent = 
            formatNumber(this.theoreticalData.comparisons);
        document.getElementById('theoretical-swaps-sidebar').textContent = 
            formatNumber(this.theoreticalData.swaps);
        document.getElementById('time-complexity-sidebar').textContent = 
            this.theoreticalData.timeComplexity;
            
        // 更新舚版本（為了相容性保留）
        if (document.getElementById('theoretical-comparisons')) {
            document.getElementById('theoretical-comparisons').textContent = 
                formatNumber(this.theoreticalData.comparisons);
        }
        if (document.getElementById('theoretical-swaps')) {
            document.getElementById('theoretical-swaps').textContent = 
                formatNumber(this.theoreticalData.swaps);
        }
        if (document.getElementById('time-complexity')) {
            document.getElementById('time-complexity').textContent = 
                this.theoreticalData.timeComplexity;
        }
    }
    
    updateDifferences(stats) {
        if (!this.theoreticalData) return;
        
        const comparisonsDiff = calculatePercentageDifference(
            stats.comparisons, 
            this.theoreticalData.comparisons
        );
        const swapsDiff = calculatePercentageDifference(
            stats.swaps, 
            this.theoreticalData.swaps
        );
        
        document.getElementById('comparisons-diff').textContent = 
            stats.isCompleted ? `${comparisonsDiff.toFixed(1)}%` : '-';
        document.getElementById('swaps-diff').textContent = 
            stats.isCompleted ? `${swapsDiff.toFixed(1)}%` : '-';
    }
    
    onStep(result) {
        let message = '';
        let logEntry = '';
        
        if (result.action === 'compare') {
            message = `比較位置 ${result.indices[0]} 和 ${result.indices[1]}: ${result.values[0]} vs ${result.values[1]}`;
            logEntry = `<div class="log-entry log-compare">比較 [${result.indices[0]}] 和 [${result.indices[1]}]: ${result.values[0]} vs ${result.values[1]}</div>`;
        } else if (result.action === 'swap') {
            message = `交換位置 ${result.indices[0]} 和 ${result.indices[1]}: ${result.values[1]} ↔ ${result.values[0]}`;
            logEntry = `<div class="log-entry log-swap">交換 [${result.indices[0]}] 和 [${result.indices[1]}]: ${result.values[1]} ↔ ${result.values[0]}</div>`;
        } else if (result.action === 'pass_completed') {
            message = `第 ${result.pass} 輪完成`;
            logEntry = `<div class="log-entry log-pass">=== 第 ${result.pass} 輪完成 ===</div>`;
        }
        
        // 更新當前操作顯示
        if (message) {
            document.getElementById('current-operation').textContent = message;
        }
        
        // 更新操作記錄
        if (logEntry) {
            const logContainer = document.getElementById('operation-log');
            
            // 清除初始提示
            if (logContainer.innerHTML.includes('等待開始')) {
                logContainer.innerHTML = '';
            }
            
            logContainer.innerHTML += logEntry;
            
            // 保持最新記錄在最上方（最多保留 20 筆記錄）
            const entries = logContainer.querySelectorAll('.log-entry');
            if (entries.length > 20) {
                entries[0].remove();
            }
            
            // 自動捲動到底部
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
    
    onSortComplete(stats) {
        this.isRunning = false;
        this.updateButtonStates();
        
        const efficiency = this.calculateEfficiency(stats);
        const message = `排序完成！效率評估：${efficiency}`;
        
        // 更新當前操作顯示
        document.getElementById('current-operation').textContent = message;
        
        // 加入完成記錄
        const logContainer = document.getElementById('operation-log');
        logContainer.innerHTML += `<div class="log-entry log-pass">🎉 排序完成！效率：${efficiency}</div>`;
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // 顯示完成總結
        this.showCompletionSummary(stats);
    }
    
    calculateEfficiency(stats) {
        if (!this.theoreticalData) return '良好';
        
        const comparisonEfficiency = (this.theoreticalData.comparisons / Math.max(stats.comparisons, 1)) * 100;
        const swapEfficiency = this.theoreticalData.swaps === 0 ? 
            (stats.swaps === 0 ? 100 : 0) : 
            (this.theoreticalData.swaps / Math.max(stats.swaps, 1)) * 100;
        
        const avgEfficiency = (comparisonEfficiency + swapEfficiency) / 2;
        
        if (avgEfficiency >= 95) return '優秀';
        if (avgEfficiency >= 85) return '良好';
        if (avgEfficiency >= 70) return '一般';
        return '需改進';
    }
    
    showCompletionSummary(stats) {
        if (!this.theoreticalData) return;
        
        const summaryData = {
            case: this.getCaseDisplayName(this.currentCase),
            direction: this.currentDirection === 'ascending' ? '由小到大' : '由大到小',
            actualComparisons: stats.comparisons,
            theoreticalComparisons: this.theoreticalData.comparisons,
            actualSwaps: stats.swaps,
            theoreticalSwaps: this.theoreticalData.swaps,
            timeComplexity: this.theoreticalData.timeComplexity
        };
        
        console.log('排序完成總結:', summaryData);
    }
    
    updateButtonStates() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const generateBtn = document.getElementById('generate-btn');
        
        if (this.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = true;
            generateBtn.disabled = true;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            generateBtn.disabled = false;
        }
    }
    
    updateStatus(message) {
        document.getElementById('status-display').textContent = message;
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
        document.getElementById('bubble-sort-container').innerHTML = 
            '<p style="text-align: center; color: red;">視覺化載入失敗，請重新整理頁面</p>';
        return;
    }
    
    // 檢查 BubbleSortVisualizer 是否可用
    if (typeof BubbleSortVisualizer === 'undefined') {
        console.error('BubbleSortVisualizer 未正確載入');
        document.getElementById('bubble-sort-container').innerHTML = 
            '<p style="text-align: center; color: red;">排序視覺化元件載入失敗</p>';
        return;
    }
    
    // 初始化控制器
    try {
        window.autoDemoController = new AutoDemoController();
        console.log('自動演示模式初始化成功');
    } catch (error) {
        console.error('初始化失敗:', error);
        document.getElementById('bubble-sort-container').innerHTML = 
            '<p style="text-align: center; color: red;">初始化失敗：' + error.message + '</p>';
    }
});

// 頁面卸載時清理
window.addEventListener('beforeunload', function() {
    if (window.autoDemoController && window.autoDemoController.visualizer) {
        window.autoDemoController.visualizer.pause();
    }
});
