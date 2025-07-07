/**
 * 手動步進模式的控制邏輯
 */

class ManualDemoController {
    constructor() {
        this.visualizer = null;
        this.currentCase = 'best';
        this.stepHistory = [];
        this.currentStepIndex = -1;
        this.isAutoCompleting = false;
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
        
        // 控制按鈕
        document.getElementById('next-step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step-btn').addEventListener('click', () => this.prevStep());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetDemo());
        document.getElementById('auto-complete-btn').addEventListener('click', () => this.autoComplete());
        
        // 自訂資料輸入
        document.getElementById('apply-custom').addEventListener('click', () => this.applyCustomData());
        document.getElementById('custom-data').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyCustomData();
            }
        });
    }
    
    selectCase(caseType) {
        if (this.isAutoCompleting) return;
        
        this.currentCase = caseType;
        
        // 更新按鈕狀態
        document.querySelectorAll('.case-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-case="${caseType}"]`).classList.add('active');
        
        // 顯示/隱藏自訂輸入
        const customInput = document.getElementById('custom-input');
        if (caseType === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
            this.loadInitialData();
        }
        
        this.updateStepDescription(`已選擇${this.getCaseDisplayName(caseType)}`);
    }
    
    loadInitialData() {
        const data = this.visualizer.generateTestData(this.currentCase, 8);
        this.visualizer.setData(data, this.getCaseDisplayName(this.currentCase));
        
        // 重置步驟歷史
        this.stepHistory = [];
        this.currentStepIndex = -1;
        
        // 儲存初始狀態
        this.saveCurrentState('初始狀態', 'start');
        
        // 計算理論值
        this.theoreticalData = this.visualizer.calculateTheoretical(this.currentCase, data.length);
        
        this.updateStepDescription('已載入測試資料，點擊「下一步」開始排序');
        this.updateCurrentOperation('等待開始...');
        this.updateButtonStates();
    }
    
    applyCustomData() {
        const input = document.getElementById('custom-data').value.trim();
        if (!input) {
            alert('請輸入數字');
            return;
        }
        
        try {
            const numbers = input.split(/\s+/).map(num => {
                const parsed = parseInt(num);
                if (isNaN(parsed)) {
                    throw new Error(`"${num}" 不是有效的數字`);
                }
                return parsed;
            });
            
            if (numbers.length < 2) {
                alert('至少需要輸入2個數字');
                return;
            }
            
            if (numbers.length > 12) {
                alert('最多只能輸入12個數字');
                return;
            }
            
            // 使用自訂資料
            this.visualizer.setData(numbers, '自訂資料');
            
            // 重置步驟歷史
            this.stepHistory = [];
            this.currentStepIndex = -1;
            
            // 儲存初始狀態
            this.saveCurrentState('自訂資料初始狀態', 'start');
            
            // 計算理論值（假設為平均情況）
            this.theoreticalData = this.visualizer.calculateTheoretical('average', numbers.length);
            
            this.updateStepDescription('已載入自訂資料，點擊「下一步」開始排序');
            this.updateCurrentOperation('等待開始...');
            this.updateButtonStates();
            
        } catch (error) {
            alert('輸入格式錯誤: ' + error.message);
        }
    }
    
    nextStep() {
        if (this.isAutoCompleting) return;
        
        // 如果可以前進到下一個已記錄的步驟
        if (this.currentStepIndex < this.stepHistory.length - 1) {
            this.currentStepIndex++;
            this.restoreState(this.stepHistory[this.currentStepIndex]);
            this.updateButtonStates();
            return;
        }
        
        // 執行新的步驟
        const result = this.visualizer.bubbleSortStep();
        this.visualizer.updateVisualization();
        
        if (result.finished) {
            this.saveCurrentState('排序完成', 'completed');
            this.updateStepDescription('🎉 排序已完成！所有元素都已正確排序。');
            this.updateCurrentOperation('排序完成');
        } else {
            const stepDescription = this.generateStepDescription(result);
            const operationText = this.generateOperationText(result);
            
            this.saveCurrentState(stepDescription, result.action, result);
            this.updateStepDescription(stepDescription);
            this.updateCurrentOperation(operationText);
        }
        
        this.updateButtonStates();
    }
    
    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.restoreState(this.stepHistory[this.currentStepIndex]);
            this.updateButtonStates();
        }
    }
    
    resetDemo() {
        if (this.isAutoCompleting) {
            this.isAutoCompleting = false;
        }
        
        this.loadInitialData();
    }
    
    async autoComplete() {
        if (this.isAutoCompleting) return;
        
        this.isAutoCompleting = true;
        this.updateButtonStates();
        
        try {
            while (!this.visualizer.getStats().isCompleted) {
                this.nextStep();
                await this.sleep(300); // 較快的自動執行速度
                
                if (!this.isAutoCompleting) break; // 允許中斷
            }
        } catch (error) {
            console.error('自動完成時發生錯誤:', error);
        }
        
        this.isAutoCompleting = false;
        this.updateButtonStates();
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
        this.updateStepDescription(state.description);
        this.updateCurrentOperation(this.generateOperationText(state.result));
        this.updateStats(state.stats);
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
    
    updateStats(stats) {
        document.getElementById('comparisons-count').textContent = formatNumber(stats.comparisons);
        document.getElementById('swaps-count').textContent = formatNumber(stats.swaps);
        document.getElementById('passes-count').textContent = formatNumber(stats.passes);
        
        // 更新進度
        const progress = Math.min(stats.progress, 100);
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('progress-text').textContent = Math.round(progress) + '%';
        
        // 計算當前輪次進度
        const n = this.visualizer.data.length;
        const currentPassProgress = stats.passes < n - 1 ? 
            Math.round((stats.currentStep % (n - 1 - stats.passes)) / (n - 1 - stats.passes) * 100) : 100;
        document.getElementById('current-pass-progress').textContent = currentPassProgress + '%';
    }
    
    updateButtonStates() {
        const nextBtn = document.getElementById('next-step-btn');
        const prevBtn = document.getElementById('prev-step-btn');
        const resetBtn = document.getElementById('reset-btn');
        const autoCompleteBtn = document.getElementById('auto-complete-btn');
        
        const isCompleted = this.visualizer.getStats().isCompleted;
        const canGoNext = this.currentStepIndex < this.stepHistory.length - 1 || !isCompleted;
        const canGoPrev = this.currentStepIndex > 0;
        
        nextBtn.disabled = this.isAutoCompleting || !canGoNext;
        prevBtn.disabled = this.isAutoCompleting || !canGoPrev;
        resetBtn.disabled = this.isAutoCompleting;
        autoCompleteBtn.disabled = this.isAutoCompleting || isCompleted;
        
        // 更新按鈕文字
        if (this.isAutoCompleting) {
            autoCompleteBtn.textContent = '⏸ 停止自動';
            autoCompleteBtn.disabled = false;
            autoCompleteBtn.onclick = () => {
                this.isAutoCompleting = false;
                this.updateButtonStates();
            };
        } else {
            autoCompleteBtn.textContent = '⏩ 自動完成';
            autoCompleteBtn.onclick = () => this.autoComplete();
        }
    }
    
    updateStepDescription(text) {
        document.getElementById('step-description').textContent = text;
    }
    
    updateCurrentOperation(text) {
        document.getElementById('current-operation').textContent = text;
    }
    
    onStep(result) {
        // 由 nextStep 方法處理
    }
    
    onSortComplete(stats) {
        this.updateStepDescription('🎉 排序已完成！所有元素都已正確排序。');
        this.updateCurrentOperation('排序完成');
        this.updateButtonStates();
        
        // 顯示完成總結
        if (this.theoreticalData) {
            const efficiency = this.calculateEfficiency(stats);
            console.log('排序完成總結:', {
                case: this.getCaseDisplayName(this.currentCase),
                actualComparisons: stats.comparisons,
                theoreticalComparisons: this.theoreticalData.comparisons,
                actualSwaps: stats.swaps,
                theoreticalSwaps: this.theoreticalData.swaps,
                efficiency: efficiency
            });
        }
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
    
    getCaseDisplayName(caseType) {
        const names = {
            'best': '最佳情況',
            'worst': '最差情況',
            'average': '平均情況',
            'custom': '自訂資料'
        };
        return names[caseType] || caseType;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        window.manualDemoController = new ManualDemoController();
        console.log('手動步進模式初始化成功');
    } catch (error) {
        console.error('初始化失敗:', error);
        document.getElementById('bubble-sort-container').innerHTML = 
            '<p style="text-align: center; color: red;">初始化失敗：' + error.message + '</p>';
    }
});

// 頁面卸載時清理
window.addEventListener('beforeunload', function() {
    if (window.manualDemoController) {
        window.manualDemoController.isAutoCompleting = false;
    }
});
