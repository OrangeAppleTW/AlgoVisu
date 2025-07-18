// 比較演示的主控制器
class ComparisonController {
    constructor() {
        this.recursionTree = new TreeVisualization('recursion-tree', 'recursion');
        this.dpTree = new TreeVisualization('dp-tree', 'dp');
        
        this.recursionViz = new RecursionVisualizer(this.recursionTree);
        this.dpViz = new DynamicProgrammingVisualizer(this.dpTree);
        
        this.currentN = 5;
        this.currentStep = 0;
        this.maxSteps = 0;
        this.isAutoPlaying = false;
        this.autoPlayInterval = null;
        this.animationSpeed = 1500;
        
        this.initializeControls();
        this.initializeVisualization();
    }

    initializeControls() {
        // 數值輸入控制
        const nInput = document.getElementById('nValue');
        nInput.addEventListener('change', (e) => {
            const newN = parseInt(e.target.value);
            if (newN >= 1 && newN <= 8) {
                this.currentN = newN;
                this.resetVisualization();
            }
        });

        // 重置按鈕
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetVisualization();
        });

        // 步驟控制按鈕
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextStep();
        });

        // 自動播放控制
        document.getElementById('autoBtn').addEventListener('click', () => {
            this.startAutoPlay();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseAutoPlay();
        });

        // 速度控制
        const speedSlider = document.getElementById('speedSlider');
        const speedDisplay = document.getElementById('speedDisplay');
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            speedDisplay.textContent = `${(this.animationSpeed / 1000).toFixed(1)}s`;
            
            // 如果正在自動播放，重新啟動以應用新速度
            if (this.isAutoPlaying) {
                this.pauseAutoPlay();
                this.startAutoPlay();
            }
        });
    }

    initializeVisualization() {
        this.resetVisualization();
    }

    resetVisualization() {
        this.pauseAutoPlay();
        
        // 清除所有視覺化
        this.recursionViz.reset();
        this.dpViz.reset();
        
        // 重新生成步驟
        const recursionSteps = this.recursionViz.generateSteps(this.currentN);
        const dpSteps = this.dpViz.generateSteps(this.currentN);
        
        // 設置最大步驟數（取兩者較大值）
        this.maxSteps = Math.max(recursionSteps.length, dpSteps.length);
        this.currentStep = 0;
        
        // 更新控制按鈕狀態
        this.updateControlButtons();
        
        // 重置計數器
        this.updateCounters();
        
        // 更新步驟說明
        this.updateStepDescription();
    }

    nextStep() {
        if (this.currentStep < this.maxSteps) {
            // 執行遞迴步驟
            if (this.currentStep < this.recursionViz.getTotalSteps()) {
                this.recursionViz.executeStep(this.currentStep);
            }
            
            // 執行動態規劃步驟
            if (this.currentStep < this.dpViz.getTotalSteps()) {
                this.dpViz.executeStep(this.currentStep);
            }
            
            this.currentStep++;
            this.updateControlButtons();
            this.updateCounters();
            this.updateStepDescription();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            
            // 重置並重新執行到當前步驟
            this.recursionViz.reset();
            this.dpViz.reset();
            
            // 重新生成步驟
            this.recursionViz.generateSteps(this.currentN);
            this.dpViz.generateSteps(this.currentN);
            
            // 執行到當前步驟
            for (let i = 0; i < this.currentStep; i++) {
                if (i < this.recursionViz.getTotalSteps()) {
                    this.recursionViz.executeStep(i);
                }
                if (i < this.dpViz.getTotalSteps()) {
                    this.dpViz.executeStep(i);
                }
            }
            
            this.updateControlButtons();
            this.updateCounters();
            this.updateStepDescription();
        }
    }

    startAutoPlay() {
        if (this.isAutoPlaying) return;
        
        this.isAutoPlaying = true;
        document.getElementById('autoBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStep >= this.maxSteps) {
                this.pauseAutoPlay();
                return;
            }
            this.nextStep();
        }, this.animationSpeed);
    }

    pauseAutoPlay() {
        this.isAutoPlaying = false;
        document.getElementById('autoBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    updateControlButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentStep <= 0;
        nextBtn.disabled = this.currentStep >= this.maxSteps;
        
        // 如果演示結束，停止自動播放
        if (this.currentStep >= this.maxSteps && this.isAutoPlaying) {
            this.pauseAutoPlay();
        }
    }

    updateCounters() {
        const recursionCount = this.recursionTree.getComputeCount();
        const dpCount = this.dpTree.getComputeCount();
        
        document.getElementById('recursion-count').textContent = recursionCount;
        document.getElementById('dp-count').textContent = dpCount;
    }

    updateStepDescription() {
        const stepText = document.getElementById('step-text');
        
        if (this.currentStep === 0) {
            stepText.textContent = '點擊「下一步」開始演示';
        } else if (this.currentStep >= this.maxSteps) {
            const recursionCount = this.recursionTree.getComputeCount();
            const dpCount = this.dpTree.getComputeCount();
            
            stepText.innerHTML = `
                演示完成！<br>
                遞迴方法計算了 ${recursionCount} 次，動態規劃只需要 ${dpCount} 次。<br>
                動態規劃提升效率約 ${Math.round(recursionCount / dpCount * 100) / 100} 倍！
            `;
        } else {
            // 顯示當前步驟的說明
            let description = '';
            
            if (this.currentStep <= this.recursionViz.getTotalSteps()) {
                const recursionDesc = this.recursionViz.getCurrentStepDescription();
                description += `<strong>遞迴:</strong> ${recursionDesc}<br>`;
            }
            
            if (this.currentStep <= this.dpViz.getTotalSteps()) {
                const dpDesc = this.dpViz.getCurrentStepDescription();
                description += `<strong>動態規劃:</strong> ${dpDesc}`;
            }
            
            stepText.innerHTML = description || '步驟執行中...';
        }
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const controller = new ComparisonController();
    
    // 導出到全域以便調試
    window.comparisonController = controller;
});