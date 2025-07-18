// 切換式遞迴 vs 動態規劃比較控制器
class ToggleComparisonController {
    constructor() {
        this.currentN = 8; // 固定為8
        this.currentMethod = 'dp'; // 與HTML預設顯示一致
        
        // 創建兩個獨立的樹狀圖
        this.recursionTree = new TreeVisualization('recursion-tree', 'recursion');
        this.dpTree = new TreeVisualization('dp-tree', 'dp');
        
        this.recursionViz = new RecursionVisualizer(this.recursionTree);
        this.dpViz = new DynamicProgrammingVisualizer(this.dpTree);
        
        // 遞迴控制狀態
        this.recursionState = {
            currentStep: 0,
            maxSteps: 0,
            isAutoPlaying: false,
            autoPlayInterval: null,
            animationSpeed: 1000
        };
        
        // 動態規劃控制狀態
        this.dpState = {
            currentStep: 0,
            maxSteps: 0,
            isAutoPlaying: false,
            autoPlayInterval: null,
            animationSpeed: 1000
        };
        
        this.initializeControls();
        this.initializeVisualization();
    }

    initializeControls() {
        // 方法切換按鈕
        document.getElementById('show-recursion').addEventListener('click', () => {
            this.switchToMethod('recursion');
        });

        document.getElementById('show-dp').addEventListener('click', () => {
            this.switchToMethod('dp');
        });

        // 遞迴控制
        this.initializeRecursionControls();
        
        // 動態規劃控制
        this.initializeDPControls();
    }

    switchToMethod(method) {
        console.log(`切換到方法: ${method}`);
        
        // 暫停當前的自動播放
        this.pauseRecursionAutoPlay();
        this.pauseDPAutoPlay();
        
        // 更新選擇器按鈕
        document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.getElementById(`show-${method}`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            console.log(`設定按鈕 active: show-${method}`);
        } else {
            console.error(`找不到按鈕: show-${method}`);
        }
        
        // 切換顯示區域
        document.querySelectorAll('.method-display').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // 強制隱藏
            console.log(`隱藏區域: ${section.id}`);
        });
        
        const targetSection = document.getElementById(`${method}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block'; // 強制顯示
            console.log(`顯示區域: ${method}-section`);
        } else {
            console.error(`找不到區域: ${method}-section`);
        }
        
        this.currentMethod = method;
        
        // 確保每次切換時都有正確的初始化
        if (method === 'recursion') {
            this.initializeRecursion();
        } else if (method === 'dp') {
            this.initializeDP();
        }
    }

    initializeRecursionControls() {
        document.getElementById('recursion-prevBtn').addEventListener('click', () => {
            this.recursionPreviousStep();
        });

        document.getElementById('recursion-nextBtn').addEventListener('click', () => {
            this.recursionNextStep();
        });

        document.getElementById('recursion-autoBtn').addEventListener('click', () => {
            this.startRecursionAutoPlay();
        });

        document.getElementById('recursion-pauseBtn').addEventListener('click', () => {
            this.pauseRecursionAutoPlay();
        });

        document.getElementById('recursion-resetBtn').addEventListener('click', () => {
            this.resetRecursion();
        });
    }

    initializeDPControls() {
        document.getElementById('dp-prevBtn').addEventListener('click', () => {
            this.dpPreviousStep();
        });

        document.getElementById('dp-nextBtn').addEventListener('click', () => {
            this.dpNextStep();
        });

        document.getElementById('dp-autoBtn').addEventListener('click', () => {
            this.startDPAutoPlay();
        });

        document.getElementById('dp-pauseBtn').addEventListener('click', () => {
            this.pauseDPAutoPlay();
        });

        document.getElementById('dp-resetBtn').addEventListener('click', () => {
            this.resetDP();
        });
    }

    initializeVisualization() {
        // 默認初始化動態規劃方法（與HTML顯示一致）
        this.initializeDP();
        
        // 確保方法選擇器按鈕狀態正確
        this.updateMethodSelector();
    }
    
    updateMethodSelector() {
        console.log(`更新選擇器, 當前方法: ${this.currentMethod}`);
        
        // 更新選擇器按鈕的active狀態
        document.querySelectorAll('.selector-btn').forEach(btn => btn.classList.remove('active'));
        const currentBtn = document.getElementById(`show-${this.currentMethod}`);
        if (currentBtn) {
            currentBtn.classList.add('active');
            console.log(`設定按鈕 active: show-${this.currentMethod}`);
        }
        
        // 顯示方法選擇器（預設是隱藏的）
        const methodSelector = document.querySelector('.method-selector');
        if (methodSelector) {
            methodSelector.style.display = 'flex';
            console.log('方法選擇器顯示');
        }
        
        // 確保當前方法的區域顯示
        document.querySelectorAll('.method-display').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const currentSection = document.getElementById(`${this.currentMethod}-section`);
        if (currentSection) {
            currentSection.classList.add('active');
            currentSection.style.display = 'block';
            console.log(`顯示區域: ${this.currentMethod}-section`);
        }
    }

    initializeRecursion() {
        this.recursionViz.reset();
        const steps = this.recursionViz.generateSteps(this.currentN);
        this.recursionState.maxSteps = steps.length;
        this.recursionState.currentStep = 0;
        
        this.updateRecursionControls();
        this.updateRecursionStepText();
        this.updateRecursionCount();
    }

    initializeDP() {
        this.dpViz.reset();
        const steps = this.dpViz.generateSteps(this.currentN);
        this.dpState.maxSteps = steps.length;
        this.dpState.currentStep = 0;
        
        // 初始化DP表格
        this.initializeDPTable();
        
        this.updateDPControls();
        this.updateDPStepText();
        this.updateDPCount();
    }
    
    initializeDPTable() {
        // 不需要初始化，因為HTML中已經有了表格結構
        // 只需要重設所有儲存格的值為預設狀態
        for (let i = 1; i <= this.currentN; i++) {
            const cell = document.getElementById(`dp-val-${i}`);
            if (cell) {
                cell.textContent = '?';
                cell.className = ''; // 移除所有狀態類別，包括 target
            }
        }
    }
    
    updateDPTableCell(value, result, status) {
        const cell = document.getElementById(`dp-val-${value}`);
        if (!cell) return;
        
        if (result !== undefined) {
            cell.textContent = result;
        }
        
        // 移除所有狀態類別
        cell.classList.remove('computing', 'computed', 'used', 'reused', 'target');
        
        switch (status) {
            case 'target':
                cell.classList.add('target');
                break;
            case 'computing':
                cell.classList.add('computing');
                break;
            case 'computed':
                cell.classList.add('computed');
                break;
            case 'used':
                cell.classList.add('used');
                setTimeout(() => {
                    cell.classList.remove('used');
                    cell.classList.add('computed');
                }, 1000);
                break;
            case 'reused':
                cell.classList.add('reused');
                break;
            default:
                cell.className = '';
        }
    }

    resetRecursion() {
        this.pauseRecursionAutoPlay();
        this.initializeRecursion();
    }

    resetDP() {
        this.pauseDPAutoPlay();
        this.initializeDP();
    }

    // 遞迴相關方法
    recursionNextStep() {
        if (this.recursionState.currentStep < this.recursionState.maxSteps) {
            this.recursionViz.executeStep(this.recursionState.currentStep);
            this.recursionState.currentStep++;
            this.updateRecursionControls();
            this.updateRecursionStepText();
            this.updateRecursionCount();
        }
    }

    recursionPreviousStep() {
        if (this.recursionState.currentStep > 0) {
            this.recursionState.currentStep--;
            
            // 重置並重新執行到當前步驟
            this.recursionViz.reset();
            this.recursionViz.generateSteps(this.currentN);
            
            for (let i = 0; i < this.recursionState.currentStep; i++) {
                this.recursionViz.executeStep(i);
            }
            
            this.updateRecursionControls();
            this.updateRecursionStepText();
            this.updateRecursionCount();
        }
    }

    startRecursionAutoPlay() {
        if (this.recursionState.isAutoPlaying) return;
        
        this.recursionState.isAutoPlaying = true;
        document.getElementById('recursion-autoBtn').disabled = true;
        document.getElementById('recursion-pauseBtn').disabled = false;
        
        this.recursionState.autoPlayInterval = setInterval(() => {
            if (this.recursionState.currentStep >= this.recursionState.maxSteps) {
                this.pauseRecursionAutoPlay();
                return;
            }
            this.recursionNextStep();
        }, this.recursionState.animationSpeed);
    }

    pauseRecursionAutoPlay() {
        this.recursionState.isAutoPlaying = false;
        document.getElementById('recursion-autoBtn').disabled = false;
        document.getElementById('recursion-pauseBtn').disabled = true;
        
        if (this.recursionState.autoPlayInterval) {
            clearInterval(this.recursionState.autoPlayInterval);
            this.recursionState.autoPlayInterval = null;
        }
    }

    updateRecursionControls() {
        const prevBtn = document.getElementById('recursion-prevBtn');
        const nextBtn = document.getElementById('recursion-nextBtn');
        
        prevBtn.disabled = this.recursionState.currentStep <= 0;
        nextBtn.disabled = this.recursionState.currentStep >= this.recursionState.maxSteps;
        
        if (this.recursionState.currentStep >= this.recursionState.maxSteps && this.recursionState.isAutoPlaying) {
            this.pauseRecursionAutoPlay();
        }
    }

    updateRecursionStepText() {
        const stepText = document.getElementById('recursion-step-text');
        
        if (this.recursionState.currentStep === 0) {
            stepText.textContent = '點擊「下一步」開始遞迴演示';
        } else if (this.recursionState.currentStep >= this.recursionState.maxSteps) {
            const count = this.recursionTree.getComputeCount();
            stepText.textContent = `遞迴演示完成！總共進行了 ${count} 次計算，可以看到大量的重複計算（紅色節點）。`;
        } else {
            const description = this.recursionViz.getCurrentStepDescription();
            stepText.textContent = description || '執行中...';
        }
    }

    updateRecursionCount() {
        const count = this.recursionTree.getComputeCount();
        document.getElementById('recursion-count').textContent = count;
    }

    // 動態規劃相關方法
    dpNextStep() {
        if (this.dpState.currentStep < this.dpState.maxSteps) {
            this.dpViz.executeStep(this.dpState.currentStep);
            this.dpState.currentStep++;
            this.updateDPControls();
            this.updateDPStepText();
            this.updateDPCount();
        }
    }

    dpPreviousStep() {
        if (this.dpState.currentStep > 0) {
            this.dpState.currentStep--;
            
            // 重置並重新執行到當前步驟
            this.dpViz.reset();
            this.dpViz.generateSteps(this.currentN);
            
            for (let i = 0; i < this.dpState.currentStep; i++) {
                this.dpViz.executeStep(i);
            }
            
            this.updateDPControls();
            this.updateDPStepText();
            this.updateDPCount();
        }
    }

    startDPAutoPlay() {
        if (this.dpState.isAutoPlaying) return;
        
        this.dpState.isAutoPlaying = true;
        document.getElementById('dp-autoBtn').disabled = true;
        document.getElementById('dp-pauseBtn').disabled = false;
        
        this.dpState.autoPlayInterval = setInterval(() => {
            if (this.dpState.currentStep >= this.dpState.maxSteps) {
                this.pauseDPAutoPlay();
                return;
            }
            this.dpNextStep();
        }, this.dpState.animationSpeed);
    }

    pauseDPAutoPlay() {
        this.dpState.isAutoPlaying = false;
        document.getElementById('dp-autoBtn').disabled = false;
        document.getElementById('dp-pauseBtn').disabled = true;
        
        if (this.dpState.autoPlayInterval) {
            clearInterval(this.dpState.autoPlayInterval);
            this.dpState.autoPlayInterval = null;
        }
    }

    updateDPControls() {
        const prevBtn = document.getElementById('dp-prevBtn');
        const nextBtn = document.getElementById('dp-nextBtn');
        
        prevBtn.disabled = this.dpState.currentStep <= 0;
        nextBtn.disabled = this.dpState.currentStep >= this.dpState.maxSteps;
        
        if (this.dpState.currentStep >= this.dpState.maxSteps && this.dpState.isAutoPlaying) {
            this.pauseDPAutoPlay();
        }
    }

    updateDPStepText() {
        const stepText = document.getElementById('dp-step-text');
        
        if (this.dpState.currentStep === 0) {
            stepText.textContent = '點擊「下一步」開始動態規劃演示';
        } else if (this.dpState.currentStep >= this.dpState.maxSteps) {
            const count = this.dpTree.getComputeCount();
            stepText.textContent = `動態規劃演示完成！總共進行了 ${count} 次計算，每個子問題只計算一次。`;
        } else {
            const description = this.dpViz.getCurrentStepDescription();
            stepText.textContent = description || '執行中...';
        }
    }

    updateDPCount() {
        const count = this.dpTree.getComputeCount();
        document.getElementById('dp-count').textContent = count;
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ToggleComparisonController();
    
    // 導出到全域以便調試
    window.toggleComparisonController = controller;
});