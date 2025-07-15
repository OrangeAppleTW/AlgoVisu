/**
 * 爬樓梯問題的控制器和事件處理
 */

class StairClimbingController {
    constructor() {
        this.animationTimer = null;
        this.isStepByStep = false;
        this.elements = {};
    }

    /**
     * 初始化控制器
     */
    initialize() {
        this.bindElements();
        this.bindEvents();
        this.initializeVisualization();
        
        // 初始化渲染器
        stairClimbingRenderer.initialize();
    }

    /**
     * 綁定DOM元素
     */
    bindElements() {
        this.elements = {
            stairCount: document.getElementById('stair-count'),
            startAnimation: document.getElementById('start-animation'),
            resetAnimation: document.getElementById('reset-animation'),
            stepByStep: document.getElementById('step-by-step'),
            animationSpeed: document.getElementById('animation-speed'),
            speedDisplay: document.getElementById('speed-display'),
            prevStep: document.getElementById('prev-step'),
            nextStep: document.getElementById('next-step'),
            stepInfo: document.getElementById('step-info'),
            currentStepDetail: document.getElementById('current-step-detail')
        };
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 開始動畫按鈕
        this.elements.startAnimation.addEventListener('click', () => {
            this.startAnimation();
        });

        // 重置按鈕
        this.elements.resetAnimation.addEventListener('click', () => {
            this.resetVisualization();
        });

        // 逐步執行按鈕
        this.elements.stepByStep.addEventListener('click', () => {
            this.stepByStepExecution();
        });

        // 樓梯數量變更
        this.elements.stairCount.addEventListener('change', () => {
            this.updateStairCount();
        });

        // 動畫速度變更
        this.elements.animationSpeed.addEventListener('input', () => {
            this.updateAnimationSpeed();
        });

        // 步驟導航按鈕
        this.elements.prevStep.addEventListener('click', () => {
            this.previousStep();
        });

        this.elements.nextStep.addEventListener('click', () => {
            this.nextStep();
        });

        // 鍵盤事件支持
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
    }

    /**
     * 初始化視覺化
     */
    initializeVisualization() {
        const n = parseInt(this.elements.stairCount.value) || 5;
        stairClimbingData.initialize(n);
        this.updateVisualization();
        this.updateComplexityComparison();
        
        // 更新步驟導航
        this.updateStepNavigation();
    }

    /**
     * 開始動畫
     */
    startAnimation() {
        if (stairClimbingData.isAnimating) {
            this.stopAnimation();
            return;
        }

        // 重置到開始狀態
        stairClimbingData.reset();
        this.isStepByStep = false;
        
        // 更新按鈕狀態
        this.elements.startAnimation.textContent = '停止動畫';
        this.elements.startAnimation.style.background = '#dc3545';
        this.elements.stepByStep.disabled = true;
        
        // 開始動畫循環
        stairClimbingData.isAnimating = true;
        this.runAnimationLoop();
    }

    /**
     * 運行動畫循環
     */
    runAnimationLoop() {
        if (!stairClimbingData.isAnimating) return;

        const currentStep = stairClimbingData.getCurrentStep();
        if (!currentStep) {
            // 動畫完成
            this.stopAnimation();
            return;
        }

        // 更新視覺化
        this.updateVisualizationWithStep(currentStep);
        
        // 高亮當前DP步驟
        this.highlightCurrentDPStep(currentStep);

        // 前進到下一步
        stairClimbingData.nextStep();

        // 設置下一次動畫
        this.animationTimer = setTimeout(() => {
            this.runAnimationLoop();
        }, stairClimbingData.animationSpeed);
    }

    /**
     * 停止動畫
     */
    stopAnimation() {
        stairClimbingData.isAnimating = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }

        // 重置按鈕狀態
        this.elements.startAnimation.textContent = '開始動畫';
        this.elements.startAnimation.style.background = '#28a745';
        this.elements.stepByStep.disabled = false;
    }

    /**
     * 逐步執行
     */
    stepByStepExecution() {
        if (stairClimbingData.isAnimating) {
            this.stopAnimation();
        }

        this.isStepByStep = true;
        const nextStep = stairClimbingData.nextStep();
        
        if (nextStep) {
            this.updateVisualizationWithStep(nextStep);
            this.highlightCurrentDPStep(nextStep);
        } else {
            // 已經完成
            this.elements.stepByStep.disabled = true;
            stairClimbingRenderer.updateCurrentCalculation({
                message: '所有步驟已完成！',
                details: `成功計算出爬 ${stairClimbingData.n} 階樓梯的方法數：${stairClimbingData.dpTable[stairClimbingData.n]}`
            });
        }
    }

    /**
     * 重置視覺化
     */
    resetVisualization() {
        this.stopAnimation();
        stairClimbingData.reset();
        this.isStepByStep = false;
        
        // 重置按鈕狀態
        this.elements.stepByStep.disabled = false;
        
        // 重置視覺化
        stairClimbingRenderer.resetVisualization();
        this.updateVisualization();
        
        // 重置步驟導航
        this.updateStepNavigation();
    }

    /**
     * 更新樓梯數量
     */
    updateStairCount() {
        const n = parseInt(this.elements.stairCount.value) || 5;
        
        // 限制範圍
        if (n < 1) {
            this.elements.stairCount.value = 1;
            return;
        }
        if (n > 15) {
            this.elements.stairCount.value = 15;
            return;
        }

        // 重新初始化
        this.stopAnimation();
        stairClimbingData.initialize(n);
        this.updateVisualization();
        this.updateComplexityComparison();
        
        // 更新步驟導航
        this.updateStepNavigation();
    }

    /**
     * 更新動畫速度
     */
    updateAnimationSpeed() {
        const speed = parseInt(this.elements.animationSpeed.value);
        this.elements.speedDisplay.textContent = speed;
        stairClimbingData.setAnimationSpeed(speed);
    }

    /**
     * 處理鍵盤輸入
     */
    handleKeyboardInput(event) {
        switch(event.key) {
            case ' ': // 空格鍵 - 開始/停止動畫
                event.preventDefault();
                if (stairClimbingData.isAnimating) {
                    this.stopAnimation();
                } else {
                    this.startAnimation();
                }
                break;
            case 'ArrowRight': // 右箭頭 - 下一步
                event.preventDefault();
                if (!stairClimbingData.isAnimating) {
                    this.stepByStepExecution();
                }
                break;
            case 'r': // R鍵 - 重置
                event.preventDefault();
                this.resetVisualization();
                break;
        }
    }

    /**
     * 更新視覺化
     */
    updateVisualization() {
        const dpState = stairClimbingData.getDPTableState();
        const treeData = stairClimbingData.generateStateTree(stairClimbingData.n);
        
        // 渲染DP表格
        stairClimbingRenderer.renderDPTable(stairClimbingData.n, dpState);
        
        // 渲染狀態轉移樹
        stairClimbingRenderer.renderStateTree(treeData);
        
        // 更新步驟導航
        this.updateStepNavigation();
    }

    /**
     * 根據步驟更新視覺化
     * @param {Object} stepInfo - 步驟信息
     */
    updateVisualizationWithStep(stepInfo) {
        const dpState = stepInfo.dpState;
        const treeData = stairClimbingData.generateStateTree(stairClimbingData.n);
        
        // 渲染DP表格
        stairClimbingRenderer.renderDPTable(stairClimbingData.n, dpState, stepInfo);
        
        // 更新當前計算說明
        stairClimbingRenderer.updateCurrentCalculation(stepInfo);
        
        // 渲染狀態轉移樹
        stairClimbingRenderer.renderStateTree(treeData, stepInfo);
        
        // 更新步驟導航
        this.updateStepNavigation();

        // 如果是計算步驟，添加表格動畫
        if (stepInfo.type === 'calculate') {
            setTimeout(() => {
                stairClimbingRenderer.animateTableUpdate(stepInfo.currentIndex, stepInfo.result);
            }, 200);
        }
    }

    /**
     * 高亮當前DP步驟
     * @param {Object} stepInfo - 步驟信息
     */
    highlightCurrentDPStep(stepInfo) {
        let stepId = null;
        
        switch(stepInfo.type) {
            case 'init':
                stepId = 'step-3'; // 初始條件
                break;
            case 'prepare':
            case 'calculate':
                stepId = 'step-2'; // 轉移公式
                break;
            case 'complete':
                stepId = 'step-1'; // 狀態定義
                break;
        }
        
        if (stepId) {
            stairClimbingRenderer.highlightDPStep(stepId);
        }
    }

    /**
     * 更新複雜度比較
     */
    updateComplexityComparison() {
        const comparisonData = stairClimbingData.getComplexityComparison();
        stairClimbingRenderer.renderComplexityComparison(comparisonData);
    }

    /**
     * 上一步
     */
    previousStep() {
        if (stairClimbingData.isAnimating) {
            this.stopAnimation();
        }

        if (stairClimbingData.currentStep > 0) {
            stairClimbingData.currentStep--;
            const currentStep = stairClimbingData.getCurrentStep();
            if (currentStep) {
                this.updateVisualizationWithStep(currentStep);
                this.highlightCurrentDPStep(currentStep);
            }
        }
        this.updateStepNavigation();
    }

    /**
     * 下一步
     */
    nextStep() {
        if (stairClimbingData.isAnimating) {
            this.stopAnimation();
        }

        const nextStep = stairClimbingData.nextStep();
        if (nextStep) {
            this.updateVisualizationWithStep(nextStep);
            this.highlightCurrentDPStep(nextStep);
        }
        this.updateStepNavigation();
    }

    /**
     * 更新步驟導航狀態
     */
    updateStepNavigation() {
        const totalSteps = stairClimbingData.calculationSteps.length;
        const currentStepIndex = stairClimbingData.currentStep;
        const currentStep = stairClimbingData.getCurrentStep();

        // 更新步驟資訊
        if (this.elements.stepInfo) {
            this.elements.stepInfo.textContent = `步驟 ${currentStepIndex} / ${totalSteps}`;
        }

        // 更新按鈕狀態
        if (this.elements.prevStep) {
            this.elements.prevStep.disabled = currentStepIndex === 0;
        }
        if (this.elements.nextStep) {
            this.elements.nextStep.disabled = currentStepIndex >= totalSteps;
        }

        // 更新步驟詳細資訊
        this.updateStepDetail(currentStep);
    }

    /**
     * 更新步驟詳細資訊
     */
    updateStepDetail(stepInfo) {
        if (!this.elements.currentStepDetail) return;

        if (!stepInfo) {
            this.elements.currentStepDetail.innerHTML = '<p>點擊「開始動畫」或「逐步執行」來觀察計算過程</p>';
            return;
        }

        let html = `<h4>${stepInfo.message}</h4>`;
        
        if (stepInfo.type === 'init') {
            html += `
                <div class="step-explanation">
                    設定基礎情況：
                    <div class="step-formula">dp[1] = 1（只有1種方法）</div>
                    <div class="step-formula">dp[2] = 2（有2種方法：1+1或直接2步）</div>
                    這些是動態規劃的起始點，後續的計算都會基於這些值。
                </div>
            `;
        } else if (stepInfo.type === 'prepare') {
            html += `
                <div class="step-explanation">
                    準備計算 <span class="step-highlight">dp[${stepInfo.currentIndex}]</span>，根據轉移公式：
                    <div class="step-formula">dp[${stepInfo.currentIndex}] = dp[${stepInfo.currentIndex-1}] + dp[${stepInfo.currentIndex-2}]</div>
                    需要先知道 dp[${stepInfo.currentIndex-1}] 和 dp[${stepInfo.currentIndex-2}] 的值。
                </div>
            `;
        } else if (stepInfo.type === 'calculate') {
            const i = stepInfo.currentIndex;
            const prev1 = stepInfo.dpState[i-1];
            const prev2 = stepInfo.dpState[i-2];
            html += `
                <div class="step-explanation">
                    計算完成！
                    <div class="step-formula">dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${prev1} + ${prev2} = ${stepInfo.result}</div>
                    現在我們知道爬到第 ${i} 階有 <span class="step-highlight">${stepInfo.result}</span> 種不同的方法。
                    這個值已經被儲存在DP表格中，後續需要時可直接使用。
                </div>
            `;
        } else if (stepInfo.type === 'complete') {
            html += `
                <div class="step-explanation">
                    🎉 所有計算完成！爬 ${stairClimbingData.n} 階樓梯共有 <span class="step-highlight">${stepInfo.dpState[stairClimbingData.n]}</span> 種方法。
                    <br><br>
                    動態規劃成功避免了重複計算，時間複雜度為 O(n)。
                </div>
            `;
        }

        this.elements.currentStepDetail.innerHTML = html;
    }

    /**
     * 顯示提示信息
     * @param {string} message - 提示信息
     * @param {string} type - 提示類型 ('info', 'success', 'warning', 'error')
     */
    showToast(message, type = 'info') {
        // 創建提示元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加到頁面
        document.body.appendChild(toast);
        
        // 顯示動畫
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // 自動隱藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    /**
     * 獲取當前狀態信息
     */
    getCurrentStatus() {
        return {
            n: stairClimbingData.n,
            currentStep: stairClimbingData.currentStep,
            totalSteps: stairClimbingData.calculationSteps.length,
            isAnimating: stairClimbingData.isAnimating,
            isStepByStep: this.isStepByStep,
            dpTable: stairClimbingData.getDPTableState()
        };
    }
}

// 全域控制器實例
const stairClimbingController = new StairClimbingController();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    stairClimbingController.initialize();
    
    // 顯示鍵盤快捷鍵提示
    stairClimbingController.showToast('提示：使用空格鍵開始/停止動畫，右箭頭鍵逐步執行，R鍵重置', 'info');
});