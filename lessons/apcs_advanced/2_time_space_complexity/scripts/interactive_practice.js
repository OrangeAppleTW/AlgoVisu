/**
 * 互動練習模式的控制邏輯
 */

class InteractivePracticeController {
    constructor() {
        this.visualizer = null;
        this.currentNumbers = [];
        this.predictions = {};
        this.practicePhase = 'input'; // 'input', 'prediction', 'sorting', 'completed'
        this.isAutoCompleting = false;
        
        this.bindEvents();
        this.initializeInputValidation();
    }
    
    bindEvents() {
        // 數字輸入驗證
        document.querySelectorAll('.number-input').forEach(input => {
            input.addEventListener('input', () => this.validateInputs());
            input.addEventListener('blur', () => this.validateInputs());
        });
        
        // 快速填入按鈕
        document.querySelectorAll('.quick-fill-btn[data-values]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const values = e.target.dataset.values.split(',').map(v => parseInt(v));
                this.fillNumbers(values);
            });
        });
        
        document.getElementById('random-fill').addEventListener('click', () => this.generateRandomNumbers());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAllInputs());
        
        // 練習控制按鈕
        document.getElementById('start-practice-btn').addEventListener('click', () => this.startPractice());
        document.getElementById('reset-practice-btn').addEventListener('click', () => this.resetPractice());
        
        // 預測確認
        document.getElementById('confirm-predictions-btn').addEventListener('click', () => this.confirmPredictions());
        
        // 排序控制按鈕
        document.getElementById('next-step-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('auto-finish-btn').addEventListener('click', () => this.autoFinish());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartSorting());
        
        // 完成後的按鈕
        document.getElementById('try-again-btn').addEventListener('click', () => this.tryAgain());
        document.getElementById('new-numbers-btn').addEventListener('click', () => this.useNewNumbers());
    }
    
    initializeInputValidation() {
        // 限制輸入只能是數字
        document.querySelectorAll('.number-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    validateInputs() {
        const inputs = document.querySelectorAll('.number-input');
        const values = [];
        let allValid = true;
        
        inputs.forEach(input => {
            const value = parseInt(input.value);
            input.classList.remove('error', 'valid');
            
            if (input.value === '') {
                allValid = false;
                return;
            }
            
            if (isNaN(value) || value < 1 || value > 99) {
                input.classList.add('error');
                allValid = false;
                return;
            }
            
            if (values.includes(value)) {
                input.classList.add('error');
                allValid = false;
                return;
            }
            
            values.push(value);
            input.classList.add('valid');
        });
        
        document.getElementById('start-practice-btn').disabled = !allValid || values.length !== 5;
        
        if (allValid && values.length === 5) {
            this.currentNumbers = values;
        }
    }
    
    fillNumbers(values) {
        const inputs = document.querySelectorAll('.number-input');
        values.forEach((value, index) => {
            if (inputs[index]) {
                inputs[index].value = value;
            }
        });
        this.validateInputs();
    }
    
    generateRandomNumbers() {
        const numbers = [];
        while (numbers.length < 5) {
            const num = Math.floor(Math.random() * 99) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        this.fillNumbers(numbers);
    }
    
    clearAllInputs() {
        document.querySelectorAll('.number-input').forEach(input => {
            input.value = '';
            input.classList.remove('error', 'valid');
        });
        document.getElementById('start-practice-btn').disabled = true;
    }
    
    startPractice() {
        if (this.currentNumbers.length !== 5) return;
        
        this.practicePhase = 'prediction';
        this.showPredictionSection();
    }
    
    showPredictionSection() {
        document.getElementById('challenge-section').style.display = 'block';
        document.getElementById('challenge-section').scrollIntoView({ behavior: 'smooth' });
        
        // 提供一些提示
        const theoretical = this.calculateTheoreticalValues();
        const hint = `提示：對於5個數字的氣泡排序，理論上最多需要 ${theoretical.maxComparisons} 次比較和 ${theoretical.maxSwaps} 次交換`;
        
        document.querySelector('.challenge-description').innerHTML = 
            `在開始排序之前，試著預測一下需要多少次比較和交換<br><small style="color: #666;">${hint}</small>`;
    }
    
    confirmPredictions() {
        const comparisons = parseInt(document.getElementById('predicted-comparisons').value);
        const swaps = parseInt(document.getElementById('predicted-swaps').value);
        const passes = parseInt(document.getElementById('predicted-passes').value);
        
        if (isNaN(comparisons) || isNaN(swaps) || isNaN(passes)) {
            alert('請填入所有預測值');
            return;
        }
        
        this.predictions = { comparisons, swaps, passes };
        this.practicePhase = 'sorting';
        this.initializeSorting();
    }
    
    initializeSorting() {
        // 初始化視覺化器
        this.visualizer = new BubbleSortVisualizer('bubble-sort-container', {
            width: 700,
            height: 300,
            onUpdate: (stats) => this.updateStats(stats),
            onComplete: (stats) => this.onSortComplete(stats),
            onStep: (result) => this.onStep(result)
        });
        
        this.visualizer.setData(this.currentNumbers, '你的數字');
        
        // 顯示排序相關界面
        document.getElementById('visualization-area').style.display = 'block';
        document.getElementById('step-guidance').style.display = 'block';
        document.getElementById('sorting-controls').style.display = 'flex';
        document.getElementById('stats-display').style.display = 'grid';
        
        // 隱藏預測界面
        document.getElementById('challenge-section').style.display = 'none';
        
        this.updateGuidance('點擊「下一步」開始第一次比較');
    }
    
    nextStep() {
        if (this.isAutoCompleting) return;
        
        const result = this.visualizer.bubbleSortStep();
        this.visualizer.updateVisualization();
        
        if (result.finished) {
            this.onSortComplete(this.visualizer.getStats());
        } else {
            this.updateGuidanceFromResult(result);
        }
    }
    
    async autoFinish() {
        if (this.isAutoCompleting) return;
        
        this.isAutoCompleting = true;
        document.getElementById('auto-finish-btn').disabled = true;
        document.getElementById('next-step-btn').disabled = true;
        
        try {
            while (!this.visualizer.getStats().isCompleted) {
                this.nextStep();
                await this.sleep(400); // 適中的速度
                
                if (!this.isAutoCompleting) break;
            }
        } catch (error) {
            console.error('自動完成時發生錯誤:', error);
        }
        
        this.isAutoCompleting = false;
        document.getElementById('auto-finish-btn').disabled = false;
        document.getElementById('next-step-btn').disabled = false;
    }
    
    restartSorting() {
        if (this.visualizer) {
            this.visualizer.reset();
            this.updateGuidance('點擊「下一步」重新開始排序');
        }
    }
    
    updateStats(stats) {
        document.getElementById('current-comparisons').textContent = stats.comparisons;
        document.getElementById('current-swaps').textContent = stats.swaps;
        document.getElementById('current-passes').textContent = stats.passes;
        document.getElementById('progress-percent').textContent = Math.round(stats.progress) + '%';
    }
    
    updateGuidanceFromResult(result) {
        let guidance = '';
        
        switch (result.action) {
            case 'compare':
                guidance = `正在比較位置 ${result.indices[0]} 和 ${result.indices[1]}: ${result.values[0]} vs ${result.values[1]}`;
                if (result.swapped) {
                    guidance += ' → 需要交換';
                } else {
                    guidance += ' → 順序正確';
                }
                break;
                
            case 'swap':
                guidance = `交換完成: ${result.values[1]} ↔ ${result.values[0]}`;
                break;
                
            case 'pass_completed':
                guidance = `第 ${result.pass} 輪完成！繼續下一輪...`;
                break;
                
            default:
                guidance = '繼續排序...';
        }
        
        this.updateGuidance(guidance);
    }
    
    updateGuidance(text) {
        document.getElementById('guidance-text').textContent = text;
    }
    
    onStep(result) {
        // 主要邏輯在 updateGuidanceFromResult 中處理
    }
    
    onSortComplete(stats) {
        this.practicePhase = 'completed';
        this.showResults(stats);
        this.updateGuidance('🎉 排序完成！快來看看你的預測準確度如何');
        
        // 隱藏排序控制按鈕
        document.getElementById('sorting-controls').style.display = 'none';
    }
    
    showResults(stats) {
        // 顯示結果區域
        document.getElementById('results-section').style.display = 'block';
        
        // 填入實際結果
        document.getElementById('actual-comparisons-result').textContent = stats.comparisons;
        document.getElementById('actual-swaps-result').textContent = stats.swaps;
        document.getElementById('actual-passes-result').textContent = stats.passes;
        
        // 計算準確度
        const comparisonsAccuracy = this.calculateAccuracy(this.predictions.comparisons, stats.comparisons);
        const swapsAccuracy = this.calculateAccuracy(this.predictions.swaps, stats.swaps);
        const passesAccuracy = this.calculateAccuracy(this.predictions.passes, stats.passes);
        
        // 設定準確度指示器
        this.setAccuracyIndicator('comparisons-accuracy', comparisonsAccuracy);
        this.setAccuracyIndicator('swaps-accuracy', swapsAccuracy);
        this.setAccuracyIndicator('passes-accuracy', passesAccuracy);
        
        // 計算總分
        const totalScore = Math.round((comparisonsAccuracy.score + swapsAccuracy.score + passesAccuracy.score) / 3);
        
        // 顯示慶祝界面
        this.showCelebration(totalScore);
    }
    
    calculateAccuracy(predicted, actual) {
        if (predicted === actual) {
            return { score: 100, level: 'perfect', text: '完全正確！' };
        }
        
        const error = Math.abs(predicted - actual);
        const errorRate = error / Math.max(actual, 1);
        
        if (errorRate <= 0.2) {
            return { score: 85, level: 'good', text: '很接近！' };
        } else if (errorRate <= 0.5) {
            return { score: 60, level: 'fair', text: '還不錯' };
        } else {
            return { score: 30, level: 'poor', text: '需要改進' };
        }
    }
    
    setAccuracyIndicator(elementId, accuracy) {
        const element = document.getElementById(elementId);
        element.textContent = accuracy.text;
        element.className = 'accuracy-indicator';
        
        switch (accuracy.level) {
            case 'perfect':
                element.classList.add('accuracy-perfect');
                break;
            case 'good':
                element.classList.add('accuracy-good');
                break;
            default:
                element.classList.add('accuracy-poor');
        }
    }
    
    showCelebration(score) {
        document.getElementById('total-score').textContent = `總分：${score}分`;
        document.getElementById('completion-celebration').style.display = 'block';
        
        // 滾動到慶祝區域
        setTimeout(() => {
            document.getElementById('completion-celebration').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }
    
    tryAgain() {
        // 重置預測並重新開始排序
        this.resetPredictions();
        this.practicePhase = 'prediction';
        this.showPredictionSection();
        this.hideResults();
    }
    
    useNewNumbers() {
        // 完全重置，回到輸入階段
        this.resetPractice();
        this.generateRandomNumbers();
    }
    
    resetPractice() {
        this.practicePhase = 'input';
        this.isAutoCompleting = false;
        this.predictions = {};
        
        // 重置所有界面
        this.hideAllSections();
        this.resetPredictions();
        this.clearStats();
        
        // 重新驗證輸入
        this.validateInputs();
    }
    
    hideAllSections() {
        document.getElementById('challenge-section').style.display = 'none';
        document.getElementById('visualization-area').style.display = 'none';
        document.getElementById('step-guidance').style.display = 'none';
        document.getElementById('sorting-controls').style.display = 'none';
        document.getElementById('stats-display').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('completion-celebration').style.display = 'none';
    }
    
    hideResults() {
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('completion-celebration').style.display = 'none';
    }
    
    resetPredictions() {
        document.getElementById('predicted-comparisons').value = '';
        document.getElementById('predicted-swaps').value = '';
        document.getElementById('predicted-passes').value = '';
    }
    
    clearStats() {
        document.getElementById('current-comparisons').textContent = '0';
        document.getElementById('current-swaps').textContent = '0';
        document.getElementById('current-passes').textContent = '0';
        document.getElementById('progress-percent').textContent = '0%';
    }
    
    calculateTheoreticalValues() {
        const n = 5; // 固定5個數字
        return {
            maxComparisons: n * (n - 1) / 2, // 最差情況
            maxSwaps: n * (n - 1) / 2,       // 最差情況
            minComparisons: n - 1,           // 最佳情況
            minSwaps: 0,                     // 最佳情況
            maxPasses: n - 1                 // 最多輪次
        };
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
        document.getElementById('practice-container').innerHTML = 
            '<p style="text-align: center; color: red;">視覺化載入失敗，請重新整理頁面</p>';
        return;
    }
    
    // 檢查 BubbleSortVisualizer 是否可用
    if (typeof BubbleSortVisualizer === 'undefined') {
        console.error('BubbleSortVisualizer 未正確載入');
        document.getElementById('practice-container').innerHTML = 
            '<p style="text-align: center; color: red;">排序視覺化元件載入失敗</p>';
        return;
    }
    
    // 初始化控制器
    try {
        window.interactivePracticeController = new InteractivePracticeController();
        console.log('互動練習模式初始化成功');
    } catch (error) {
        console.error('初始化失敗:', error);
        document.getElementById('practice-container').innerHTML = 
            '<p style="text-align: center; color: red;">初始化失敗：' + error.message + '</p>';
    }
});

// 頁面卸載時清理
window.addEventListener('beforeunload', function() {
    if (window.interactivePracticeController) {
        window.interactivePracticeController.isAutoCompleting = false;
    }
});
