class CombinationsEnumeration {
    constructor() {
        this.elements = [1, 2, 3]; // 改為3個元素
        this.m = 2; // 要選擇的元素數量改為2
        this.currentCombination = [];
        this.allCombinations = [];
        this.isRunning = false;
        this.isAutoMode = false;
        this.autoInterval = null;
        this.recursionSteps = [];
        this.stepIndex = 0;
        this.treeNodes = {};
        this.treeEdges = [];
        this.currentPath = [];
        
        this.initializeElements();
        this.bindEvents();
        this.updateCombinationFormula();
        this.generateAllSteps();
        this.createTreeStructure();
        this.updateDisplay();
    }

    initializeElements() {
        this.combinationSlots = document.getElementById('combination-slots');
        this.startPosition = document.getElementById('start-position');
        this.status = document.getElementById('status');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.combinationCount = document.getElementById('combination-count');
        this.combinationsList = document.getElementById('combinations-list');
        this.combinationTree = document.getElementById('combination-tree');
        this.pruningInfo = document.getElementById('pruning-info');
        this.mSelector = document.getElementById('m-selector');
        this.combinationFormula = document.getElementById('combination-formula');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.autoBtn.addEventListener('click', () => this.toggleAuto());
        this.mSelector.addEventListener('change', () => this.onMChanged());
    }

    onMChanged() {
        this.m = parseInt(this.mSelector.value);
        this.updateCombinationFormula();
        this.reset();
        this.generateAllSteps();
        this.createTreeStructure();
        this.updateDisplay();
    }

    updateCombinationFormula() {
        const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
        this.combinationFormula.textContent = `C(${this.elements.length},${this.m}) = ${totalCombinations}`;
    }

    calculateCombinations(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    start() {
        this.isRunning = true;
        this.stepIndex = 0;
        this.currentStep = null;
        this.startBtn.disabled = true;
        this.stepBtn.disabled = false;
        this.autoBtn.disabled = false;
        this.mSelector.disabled = true;
        this.status.textContent = `開始 C(${this.elements.length},${this.m}) 組合枚舉...`;
        this.updateDisplay();
    }

    nextStep() {
        if (this.stepIndex >= this.recursionSteps.length) {
            const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
            this.status.textContent = `枚舉完成！找到所有 ${totalCombinations} 個組合`;
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            return;
        }

        const step = this.recursionSteps[this.stepIndex];
        this.executeStep(step);
        this.stepIndex++;
        this.updateDisplay();
    }

    executeStep(step) {
        this.currentStep = step;
        
        // 重置樹狀圖高亮
        this.resetTreeHighlights();
        
        switch (step.type) {
            case 'enter':
                this.status.textContent = step.description;
                this.currentStart = step.index;
                this.highlightCurrentPath(step.path);
                break;
            case 'select':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'set_select':
                this.status.textContent = step.description;
                this.currentCombination = [...step.combination];
                this.highlightCurrentPath(step.path);
                break;
            case 'backtrack':
                this.status.textContent = step.description;
                this.currentCombination = [...step.combination];
                this.highlightCurrentPath(step.path);
                break;
            case 'skip':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'prune':
                this.status.textContent = step.description;
                this.showPruning = true;
                this.highlightPrunedPath(step.path);
                break;
            case 'solution':
                this.status.textContent = step.description;
                this.addCombinationToDisplay(step.combination, step.solutionIndex);
                this.showPruning = false;
                this.highlightSolutionPath(step.path);
                break;
            default:
                this.showPruning = false;
                break;
        }
    }

    addCombinationToDisplay(combination, index) {
        const combinationElement = document.createElement('div');
        combinationElement.className = 'solution-item';
        combinationElement.innerHTML = `
            <span class="solution-number">${index}</span>
            <span>[${combination.join(', ')}]</span>
        `;
        this.combinationsList.appendChild(combinationElement);
    }

    toggleAuto() {
        if (this.isAutoMode) {
            this.stopAuto();
        } else {
            this.startAuto();
        }
    }

    startAuto() {
        this.isAutoMode = true;
        this.autoBtn.textContent = '暫停自動';
        this.stepBtn.disabled = true;
        
        this.autoInterval = setInterval(() => {
            this.nextStep();
            if (this.stepIndex >= this.recursionSteps.length) {
                this.stopAuto();
            }
        }, 1000);
    }

    stopAuto() {
        this.isAutoMode = false;
        this.autoBtn.textContent = '自動執行';
        this.stepBtn.disabled = false;
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    reset() {
        this.stopAuto();
        this.currentCombination = [];
        this.currentStep = null;
        this.stepIndex = 0;
        this.isRunning = false;
        this.currentStart = 0;
        this.showPruning = false;
        
        this.startBtn.disabled = false;
        this.stepBtn.disabled = true;
        this.autoBtn.disabled = true;
        this.autoBtn.textContent = '自動執行';
        this.mSelector.disabled = false;
        
        const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
        this.status.textContent = `準備開始 C(${this.elements.length},${this.m}) 組合枚舉`;
        this.combinationsList.innerHTML = '';
        
        // 重新創建樹狀結構
        this.createTreeStructure();
        this.updateDisplay();
    }

    // 高亮當前路徑
    highlightCurrentPath(path) {
        if (this.treeVisualizer) {
            this.treeVisualizer.highlightCurrentPath(path);
        }
    }

    // 高亮解路徑
    highlightSolutionPath(path) {
        if (this.treeVisualizer) {
            this.treeVisualizer.highlightCurrentPath(path);
            // 可以為解路徑添加特殊樣式
        }
    }

    // 高亮剪枝路徑
    highlightPrunedPath(path) {
        if (this.treeVisualizer) {
            this.treeVisualizer.highlightCurrentPath(path);
            // 可以為剪枝路徑添加特殊樣式
        }
    }

    // 重置樹狀圖高亮
    resetTreeHighlights() {
        if (this.treeVisualizer) {
            this.treeVisualizer.resetTreeHighlights();
        }
    }
}