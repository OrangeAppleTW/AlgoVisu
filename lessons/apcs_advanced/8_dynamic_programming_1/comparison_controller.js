/**
 * 比較分析頁面的控制器
 */

class ComparisonController {
    constructor() {
        this.currentN = 6;
        this.currentMethod = 'both';
    }

    /**
     * 初始化控制器
     */
    initialize() {
        this.bindElements();
        this.bindEvents();
        comparisonRenderer.initialize();
        this.runInitialComparison();
    }

    /**
     * 綁定DOM元素
     */
    bindElements() {
        this.elements = {
            comparisonN: document.getElementById('comparison-n'),
            runComparison: document.getElementById('run-comparison'),
            resetComparison: document.getElementById('reset-comparison'),
            methodRadios: document.querySelectorAll('input[name="method"]')
        };
    }

    /**
     * 綁定事件監聽器
     */
    bindEvents() {
        // 執行比較按鈕
        this.elements.runComparison.addEventListener('click', () => {
            this.runComparison();
        });

        // 重置按鈕
        this.elements.resetComparison.addEventListener('click', () => {
            this.resetComparison();
        });

        // N值變更
        this.elements.comparisonN.addEventListener('change', () => {
            this.updateN();
        });

        // 方法選擇
        this.elements.methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateMethod();
            });
        });
    }

    /**
     * 執行初始比較
     */
    runInitialComparison() {
        this.currentN = parseInt(this.elements.comparisonN.value) || 6;
        this.runComparison();
    }

    /**
     * 執行比較分析
     */
    runComparison() {
        const n = this.currentN;
        
        // 顯示載入狀態
        this.showLoading();
        
        // 模擬異步處理
        setTimeout(() => {
            try {
                // 獲取效能數據
                const performanceData = comparisonData.getPerformanceComparison(n);
                
                // 獲取調用序列
                const callSequence = comparisonData.simulateRecursiveSequence(n);
                
                // 獲取重複計算統計
                const duplicationStats = comparisonData.getDuplicationStats(n);
                
                // 獲取成長數據
                const growthData = comparisonData.getComplexityGrowthData(Math.min(n + 2, 10));
                
                // 更新視覺化
                this.updateVisualization(performanceData, callSequence, duplicationStats, growthData);
                
                this.hideLoading();
                this.showSuccess();
                
            } catch (error) {
                console.error('比較分析出錯:', error);
                this.hideLoading();
                this.showError('比較分析失敗，請重試');
            }
        }, 500);
    }

    /**
     * 更新視覺化
     */
    updateVisualization(performanceData, callSequence, duplicationStats, growthData) {
        // 更新效能統計
        comparisonRenderer.updatePerformanceStats(performanceData);
        
        // 渲染調用序列
        comparisonRenderer.renderCallSequence(callSequence);
        
        // 渲染DP表格
        comparisonRenderer.renderDPTable(this.currentN);
        
        // 渲染重複計算分析
        comparisonRenderer.renderDuplicationAnalysis(duplicationStats);
        
        // 渲染複雜度成長圖
        comparisonRenderer.renderGrowthChart(growthData);
        
        // 模擬DP執行步驟
        comparisonRenderer.animateDPExecution(this.currentN);
        
        // 根據選擇的方法顯示對應視覺化
        comparisonRenderer.showMethodComparison(this.currentMethod);
    }

    /**
     * 重置比較
     */
    resetComparison() {
        // 重置輸入值
        this.elements.comparisonN.value = 6;
        this.currentN = 6;
        
        // 重置方法選擇
        document.querySelector('input[value="both"]').checked = true;
        this.currentMethod = 'both';
        
        // 清空統計顯示
        this.clearStatistics();
        
        // 重新執行比較
        this.runComparison();
    }

    /**
     * 更新N值
     */
    updateN() {
        let n = parseInt(this.elements.comparisonN.value);
        
        // 限制範圍
        if (n < 1) {
            n = 1;
            this.elements.comparisonN.value = 1;
        } else if (n > 12) {
            n = 12;
            this.elements.comparisonN.value = 12;
            this.showWarning('為了性能考慮，最大值限制為12');
        }
        
        this.currentN = n;
    }

    /**
     * 更新方法選擇
     */
    updateMethod() {
        const selectedRadio = document.querySelector('input[name="method"]:checked');
        if (selectedRadio) {
            this.currentMethod = selectedRadio.value;
            comparisonRenderer.showMethodComparison(this.currentMethod);
        }
    }

    /**
     * 清空統計顯示
     */
    clearStatistics() {
        const statElements = [
            'recursive-calls', 'recursive-time', 'dp-calls', 
            'dp-time', 'speed-improvement', 'call-reduction'
        ];
        
        statElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });
    }

    /**
     * 顯示載入狀態
     */
    showLoading() {
        this.elements.runComparison.disabled = true;
        this.elements.runComparison.textContent = '分析中...';
        this.elements.runComparison.style.background = '#6c757d';
    }

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        this.elements.runComparison.disabled = false;
        this.elements.runComparison.textContent = '執行比較';
        this.elements.runComparison.style.background = '#007bff';
    }

    /**
     * 顯示成功訊息
     */
    showSuccess() {
        this.showToast('比較分析完成！', 'success');
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
        // 創建提示元素
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
        
        // 設置顏色
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        toast.style.background = colors[type] || colors.info;
        toast.textContent = message;
        
        // 添加到頁面
        document.body.appendChild(toast);
        
        // 顯示動畫
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自動隱藏
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
            method: this.currentMethod,
            performanceData: comparisonData.getPerformanceComparison(this.currentN)
        };
    }
}

// 全域控制器實例
const comparisonController = new ComparisonController();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    comparisonController.initialize();
});