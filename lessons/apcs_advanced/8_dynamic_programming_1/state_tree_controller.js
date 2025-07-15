/**
 * 狀態轉移樹頁面的控制器
 */

class StateTreeController {
    constructor() {
        this.currentN = 6;
        this.animationTimer = null;
        this.isAnimating = false;
        this.animationSteps = [];
        this.currentStep = 0;
    }

    /**
     * 初始化控制器
     */
    initialize() {
        this.bindElements();
        this.bindEvents();
        stateTreeRenderer.initialize();
        this.buildInitialTree();
    }

    /**
     * 綁定DOM元素
     */
    bindElements() {
        this.elements = {
            treeN: document.getElementById('tree-n'),
            buildTree: document.getElementById('build-tree'),
            animateTree: document.getElementById('animate-tree'),
            resetTree: document.getElementById('reset-tree'),
            showDuplicates: document.getElementById('show-duplicates'),
            showMemoization: document.getElementById('show-memoization'),
            showCallOrder: document.getElementById('show-call-order'),
            traceTarget: document.getElementById('trace-target'),
            tracePathBtn: document.getElementById('trace-path'),
            clearTraceBtn: document.getElementById('clear-trace'),
            animationControls: document.getElementById('animation-controls'),
            pauseAnimation: document.getElementById('pause-animation'),
            resumeAnimation: document.getElementById('resume-animation'),
            stepAnimation: document.getElementById('step-animation')
        };
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 建構樹按鈕
        this.elements.buildTree.addEventListener('click', () => {
            this.buildTree();
        });

        // 動畫演示按鈕
        this.elements.animateTree.addEventListener('click', () => {
            this.startAnimation();
        });

        // 重置按鈕
        this.elements.resetTree.addEventListener('click', () => {
            this.resetTree();
        });

        // N值變更
        this.elements.treeN.addEventListener('change', () => {
            this.updateN();
        });

        // 選項變更
        [this.elements.showDuplicates, this.elements.showMemoization, this.elements.showCallOrder]
            .forEach(checkbox => {
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        this.updateTreeDisplay();
                    });
                }
            });

        // 路徑追蹤
        if (this.elements.tracePathBtn) {
            this.elements.tracePathBtn.addEventListener('click', () => {
                this.tracePath();
            });
        }

        if (this.elements.clearTraceBtn) {
            this.elements.clearTraceBtn.addEventListener('click', () => {
                this.clearTrace();
            });
        }

        // 動畫控制
        if (this.elements.pauseAnimation) {
            this.elements.pauseAnimation.addEventListener('click', () => {
                this.pauseAnimation();
            });
        }

        if (this.elements.resumeAnimation) {
            this.elements.resumeAnimation.addEventListener('click', () => {
                this.resumeAnimation();
            });
        }

        if (this.elements.stepAnimation) {
            this.elements.stepAnimation.addEventListener('click', () => {
                this.stepAnimation();
            });
        }
    }

    /**
     * 建構初始樹
     */
    buildInitialTree() {
        this.currentN = parseInt(this.elements.treeN.value) || 6;
        this.buildTree();
    }

    /**
     * 建構樹
     */
    buildTree() {
        try {
            const n = this.currentN;
            
            // 建構樹數據
            const treeData = stateTreeData.buildStateTree(n);
            
            // 獲取統計信息
            const stats = stateTreeData.calculateStatistics();
            
            // 渲染樹
            this.renderTree(treeData);
            
            // 更新統計信息
            stateTreeRenderer.updateStatistics(stats);
            
            // 渲染重複計算矩陣
            const matrix = stateTreeData.getDuplicationMatrix();
            stateTreeRenderer.renderDuplicationMatrix(matrix);
            
            // 更新追蹤目標選項
            stateTreeRenderer.updateTraceTargets(n);
            
            this.showSuccess('樹狀圖建構完成！');
            
        } catch (error) {
            console.error('建構樹時出錯:', error);
            this.showError('建構樹失敗，請重試');
        }
    }

    /**
     * 渲染樹
     */
    renderTree(treeData) {
        const options = {
            showDuplicates: this.elements.showDuplicates.checked,
            showMemoization: this.elements.showMemoization.checked,
            showCallOrder: this.elements.showCallOrder.checked
        };
        
        stateTreeRenderer.renderTree(treeData, options);
    }

    /**
     * 更新樹顯示
     */
    updateTreeDisplay() {
        if (stateTreeData.treeData) {
            this.renderTree(stateTreeData.treeData);
        }
    }

    /**
     * 開始動畫
     */
    startAnimation() {
        if (this.isAnimating) {
            this.stopAnimation();
            return;
        }

        try {
            // 生成動畫步驟
            this.animationSteps = stateTreeData.generateAnimationSteps();
            this.currentStep = 0;
            this.isAnimating = true;

            // 顯示動畫控制面板
            this.elements.animationControls.style.display = 'block';
            
            // 更新按鈕狀態
            this.elements.animateTree.textContent = '停止動畫';
            this.elements.animateTree.style.background = '#dc3545';

            // 開始動畫循環
            this.runAnimationLoop();
            
        } catch (error) {
            console.error('開始動畫時出錯:', error);
            this.showError('動畫啟動失敗');
        }
    }

    /**
     * 運行動畫循環
     */
    runAnimationLoop() {
        if (!this.isAnimating || this.currentStep >= this.animationSteps.length) {
            this.stopAnimation();
            return;
        }

        const step = this.animationSteps[this.currentStep];
        
        // 更新動畫信息
        stateTreeRenderer.showAnimationInfo(step.message);
        
        // 更新進度
        stateTreeRenderer.updateAnimationProgress(this.currentStep + 1, this.animationSteps.length);
        
        // 高亮當前節點
        if (step.node) {
            stateTreeRenderer.highlightNode(step.node);
        }

        this.currentStep++;

        // 設置下一次動畫
        this.animationTimer = setTimeout(() => {
            this.runAnimationLoop();
        }, 1500); // 1.5秒間隔
    }

    /**
     * 停止動畫
     */
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }

        // 重置按鈕狀態
        this.elements.animateTree.textContent = '動畫演示';
        this.elements.animateTree.style.background = '#28a745';

        // 隱藏動畫控制面板
        this.elements.animationControls.style.display = 'none';

        stateTreeRenderer.clearHighlights();
    }

    /**
     * 暫停動畫
     */
    pauseAnimation() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        this.elements.pauseAnimation.style.display = 'none';
        this.elements.resumeAnimation.style.display = 'inline-block';
    }

    /**
     * 繼續動畫
     */
    resumeAnimation() {
        this.runAnimationLoop();
        this.elements.pauseAnimation.style.display = 'inline-block';
        this.elements.resumeAnimation.style.display = 'none';
    }

    /**
     * 單步動畫
     */
    stepAnimation() {
        if (this.currentStep < this.animationSteps.length) {
            const step = this.animationSteps[this.currentStep];
            stateTreeRenderer.showAnimationInfo(step.message);
            stateTreeRenderer.updateAnimationProgress(this.currentStep + 1, this.animationSteps.length);
            
            if (step.node) {
                stateTreeRenderer.highlightNode(step.node);
            }
            
            this.currentStep++;
        }
    }

    /**
     * 重置樹
     */
    resetTree() {
        this.stopAnimation();
        this.elements.treeN.value = 6;
        this.currentN = 6;
        
        // 重置選項
        this.elements.showDuplicates.checked = true;
        this.elements.showMemoization.checked = true;
        this.elements.showCallOrder.checked = false;
        
        // 重新建構
        this.buildTree();
        
        // 清除追蹤
        this.clearTrace();
    }

    /**
     * 更新N值
     */
    updateN() {
        let n = parseInt(this.elements.treeN.value);
        
        // 限制範圍
        if (n < 3) {
            n = 3;
            this.elements.treeN.value = 3;
        } else if (n > 10) {
            n = 10;
            this.elements.treeN.value = 10;
            this.showWarning('為了視覺清晰度，最大值限制為10');
        }
        
        this.currentN = n;
    }

    /**
     * 追蹤路徑
     */
    tracePath() {
        const targetValue = parseInt(this.elements.traceTarget.value);
        if (targetValue) {
            stateTreeRenderer.tracePath(targetValue);
            this.showSuccess(`已追蹤到 f(${targetValue}) 的路徑`);
        }
    }

    /**
     * 清除追蹤
     */
    clearTrace() {
        stateTreeRenderer.clearTrace();
    }

    /**
     * 顯示成功訊息
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * 顯示警告訊息
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    }

    /**
     * 顯示提示訊息
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        toast.style.background = colors[type] || colors.info;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 獲取當前狀態
     */
    getCurrentStatus() {
        return {
            n: this.currentN,
            isAnimating: this.isAnimating,
            currentStep: this.currentStep,
            totalSteps: this.animationSteps.length,
            options: {
                showDuplicates: this.elements.showDuplicates.checked,
                showMemoization: this.elements.showMemoization.checked,
                showCallOrder: this.elements.showCallOrder.checked
            }
        };
    }
}

// 全域控制器實例
const stateTreeController = new StateTreeController();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    stateTreeController.initialize();
});