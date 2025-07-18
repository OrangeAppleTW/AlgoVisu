// 分開控制的遞迴 vs 動態規劃比較控制器
class SeparateComparisonController {
    constructor() {
        this.recursionTree = new TreeVisualization('recursion-tree', 'recursion');
        this.dpTree = new TreeVisualization('dp-tree', 'dp');
        
        this.recursionViz = new RecursionVisualizer(this.recursionTree);
        this.dpViz = new DynamicProgrammingVisualizer(this.dpTree);
        
        this.currentN = 5;
        
        // 遞迴控制狀態
        this.recursionState = {
            currentStep: 0,
            maxSteps: 0,
            isAutoPlaying: false,
            autoPlayInterval: null,
            animationSpeed: 1500
        };
        
        // 動態規劃控制狀態
        this.dpState = {
            currentStep: 0,
            maxSteps: 0,
            isAutoPlaying: false,
            autoPlayInterval: null,
            animationSpeed: 1500
        };
        
        this.initializeControls();
        this.initializeVisualization();
    }

    initializeControls() {
        // 全域控制
        const nInput = document.getElementById('nValue');
        nInput.addEventListener('change', (e) => {
            const newN = parseInt(e.target.value);
            if (newN >= 3 && newN <= 7) {
                this.currentN = newN;
                this.resetBoth();
            }
        });

        document.getElementById('resetAllBtn').addEventListener('click', () => {
            this.resetBoth();
        });

        // 遞迴控制
        this.initializeRecursionControls();
        
        // 動態規劃控制
        this.initializeDPControls();
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
        this.resetBoth();
    }

    resetBoth() {
        this.resetRecursion();
        this.resetDP();
        this.updateEfficiencyComparison();
    }

    resetRecursion() {
        this.pauseRecursionAutoPlay();
        this.recursionViz.reset();
        
        const steps = this.recursionViz.generateSteps(this.currentN);
        this.recursionState.maxSteps = steps.length;
        this.recursionState.currentStep = 0;
        
        this.updateRecursionControls();
        this.updateRecursionStepText();
        this.updateRecursionCount();
    }

    resetDP() {
        this.pauseDPAutoPlay();
        this.dpViz.reset();
        
        const steps = this.dpViz.generateSteps(this.currentN);
        this.dpState.maxSteps = steps.length;
        this.dpState.currentStep = 0;
        
        this.updateDPControls();
        this.updateDPStepText();
        this.updateDPCount();
    }

    // 遞迴相關方法
    recursionNextStep() {
        if (this.recursionState.currentStep < this.recursionState.maxSteps) {
            this.recursionViz.executeStep(this.recursionState.currentStep);
            this.recursionState.currentStep++;
            this.updateRecursionControls();
            this.updateRecursionStepText();
            this.updateRecursionCount();
            this.updateEfficiencyComparison();
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
            this.updateEfficiencyComparison();
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
            stepText.textContent = `遞迴演示完成！總共進行了 ${count} 次計算。`;
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
            this.updateEfficiencyComparison();
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
            this.updateEfficiencyComparison();
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
            stepText.textContent = `動態規劃演示完成！總共進行了 ${count} 次計算。`;
        } else {
            const description = this.dpViz.getCurrentStepDescription();
            stepText.textContent = description || '執行中...';
        }
    }

    updateDPCount() {
        const count = this.dpTree.getComputeCount();
        document.getElementById('dp-count').textContent = count;
    }

    updateEfficiencyComparison() {
        const recursionCount = this.recursionTree.getComputeCount();
        const dpCount = this.dpTree.getComputeCount();
        const comparisonElement = document.getElementById('efficiency-comparison');
        
        if (recursionCount > 0 && dpCount > 0) {
            const improvement = Math.round(recursionCount / dpCount * 100) / 100;
            comparisonElement.innerHTML = `
                遞迴：${recursionCount} 次計算<br>
                動態規劃：${dpCount} 次計算<br>
                <strong>效率提升：${improvement} 倍</strong>
            `;
        } else if (recursionCount > 0) {
            comparisonElement.textContent = `遞迴：${recursionCount} 次計算`;
        } else if (dpCount > 0) {
            comparisonElement.textContent = `動態規劃：${dpCount} 次計算`;
        } else {
            comparisonElement.textContent = '開始演示後顯示效率對比';
        }
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new SeparateComparisonController();
    
    // 導出到全域以便調試
    window.separateComparisonController = controller;
});