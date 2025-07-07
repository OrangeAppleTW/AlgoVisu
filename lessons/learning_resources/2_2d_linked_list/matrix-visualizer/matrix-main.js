// 矩陣視覺化工具 - 主控制模組
// 負責初始化和協調所有模組

class MatrixVisualizer {
    constructor() {
        this.core = null;
        this.ui = null;
        this.d3 = null;
        this.initialized = false;
    }

    // 初始化應用程式
    initialize() {
        try {
            console.log('Initializing Matrix Visualizer...');

            // 初始化核心模組
            this.core = new MatrixCore();
            console.log('Matrix Core initialized');

            // 初始化UI模組
            this.ui = new MatrixUI(this.core);
            this.ui.initialize();
            console.log('Matrix UI initialized');

            // 初始化D3模組
            this.d3 = new MatrixD3();
            // 將D3實例設為全局可訪問，供UI模組使用
            window.matrixD3 = this.d3;
            console.log('Matrix D3 initialized');

            // 綁定模組間的通信
            this.bindModuleCommunication();

            this.initialized = true;
            console.log('Matrix Visualizer fully initialized');

            // 載入初始範例（可選）
            // this.loadInitialExample();

        } catch (error) {
            console.error('Failed to initialize Matrix Visualizer:', error);
            this.handleInitializationError(error);
        }
    }

    // 綁定模組間的通信
    bindModuleCommunication() {
        // 當UI載入矩陣時，同步到D3模組
        const originalSetMatrices = this.core.setMatrices.bind(this.core);
        this.core.setMatrices = (matrices) => {
            originalSetMatrices(matrices);
            if (this.d3 && matrices.length > 0) {
                // 使用 requestAnimationFrame 替代 setTimeout 以適應繪制循環
                requestAnimationFrame(() => {
                    this.d3.setMatrices(matrices);
                });
            }
        };

        // 監聽窗口大小變化，重新渲染D3視覺化
        this.handleResize = () => {
            if (this.d3 && this.core.getMatrices().length > 0) {
                // 使用 debounce 來優化視窗大小變化事件
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.d3.renderCurrentMatrix();
                }, 150);
            }
        };
        window.addEventListener('resize', this.handleResize);

        // 監聽頁面可見性變化，暫停/恢復動畫
        this.handleVisibilityChange = () => {
            if (this.d3) {
                if (document.hidden && this.d3.animationRunning) {
                    this.d3.stopAnimation();
                }
            }
        };
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // 載入初始範例
    loadInitialExample() {
        if (this.ui) {
            setTimeout(() => {
                this.ui.handleLoadExample();
            }, 500);
        }
    }

    // 處理初始化錯誤
    handleInitializationError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'initialization-error';
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #f8d7da;
            color: #721c24;
            padding: 20px;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
            max-width: 400px;
        `;
        errorMessage.innerHTML = `
            <h3>初始化失敗</h3>
            <p>矩陣視覺化工具初始化時發生錯誤。</p>
            <p><strong>錯誤訊息：</strong>${error.message}</p>
            <button onclick="location.reload()" style="
                background-color: #333333;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            ">重新載入頁面</button>
        `;
        document.body.appendChild(errorMessage);
    }

    // 獲取所有模組的狀態
    getStatus() {
        if (!this.initialized) {
            return { initialized: false };
        }

        return {
            initialized: true,
            core: {
                matricesCount: this.core.getMatrices().length,
                maxMatrices: this.core.maxMatrices
            },
            ui: {
                currentStatus: this.ui.getCurrentStatus()
            },
            d3: this.d3 ? this.d3.getCurrentState() : null
        };
    }

    // 重置所有模組
    reset() {
        if (this.core) {
            this.core.clearMatrices();
        }
        if (this.ui) {
            this.ui.handleClear();
        }
        if (this.d3) {
            this.d3.resetView();
        }
        console.log('Matrix Visualizer reset');
    }

    // 清理資源
    cleanup() {
        if (this.d3) {
            this.d3.cleanup();
        }
        
        // 移除事件監聽器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 清空全局變數
        if (window.matrixD3) {
            delete window.matrixD3;
        }
        
        console.log('Matrix Visualizer cleaned up');
    }

    // 主題切換（預留功能）
    setTheme(theme) {
        // 這裡可以實現主題切換功能
        console.log('Theme switching not implemented yet:', theme);
    }

    // 設定更新（預留功能）
    updateSettings(settings) {
        // 這裡可以實現設定更新功能
        console.log('Settings update not implemented yet:', settings);
    }
}

// 全局實例
let matrixVisualizer = null;

// DOM內容載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Matrix Visualizer...');
    
    // 檢查依賴項目
    const dependencies = [
        { name: 'D3.js', check: () => typeof d3 !== 'undefined' },
        { name: 'MatrixCore', check: () => typeof MatrixCore !== 'undefined' },
        { name: 'MatrixUI', check: () => typeof MatrixUI !== 'undefined' },
        { name: 'MatrixD3', check: () => typeof MatrixD3 !== 'undefined' }
    ];
    
    const missingDeps = dependencies.filter(dep => !dep.check());
    
    if (missingDeps.length > 0) {
        const errorMsg = `缺少必要的依賴項目: ${missingDeps.map(d => d.name).join(', ')}`;
        console.error(errorMsg);
        
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = errorMsg;
            statusElement.className = 'status-message status-error';
            statusElement.style.display = 'block';
        }
        return;
    }
    
    // 延遲初始化，確保所有資源都已載入
    setTimeout(() => {
        try {
            matrixVisualizer = new MatrixVisualizer();
            matrixVisualizer.initialize();
            
            // 將全局實例設為全局可訪問（供除錯使用）
            window.matrixVisualizer = matrixVisualizer;
            
            // 可選的自動載入功能（目前停用以避免初始化問題）
            // const matrixInput = document.getElementById('matrix-input');
            // if (matrixInput && matrixInput.value.trim()) {
            //     console.log('Auto-loading default matrix data...');
            //     setTimeout(() => {
            //         if (matrixVisualizer && matrixVisualizer.ui) {
            //             matrixVisualizer.ui.handleVisualize();
            //         }
            //     }, 500);
            // }
            
        } catch (error) {
            console.error('矩陣視覺化工具初始化失敗:', error);
            
            // 顯示友好的錯誤訊息
            const statusElement = document.getElementById('status-message');
            if (statusElement) {
                statusElement.textContent = `初始化失敗：${error.message}`;
                statusElement.className = 'status-message status-error';
                statusElement.style.display = 'block';
            }
        }
        
    }, 300);
});

// 頁面卸載時清理資源
window.addEventListener('beforeunload', function() {
    if (matrixVisualizer) {
        matrixVisualizer.cleanup();
    }
});

// 全局錯誤處理
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // 如果是初始化相關錯誤，顯示友好的錯誤訊息
    if (event.error && event.error.message.includes('Matrix')) {
        const errorDisplay = document.getElementById('status-message');
        if (errorDisplay) {
            errorDisplay.textContent = `系統錯誤：${event.error.message}`;
            errorDisplay.className = 'status-message status-error';
            errorDisplay.style.display = 'block';
        }
    }
});

// 提供給外部使用的API
window.MatrixVisualizerAPI = {
    // 獲取狀態
    getStatus: () => matrixVisualizer ? matrixVisualizer.getStatus() : null,
    
    // 重置
    reset: () => matrixVisualizer ? matrixVisualizer.reset() : null,
    
    // 載入矩陣數據
    loadMatrixData: (data) => {
        if (matrixVisualizer && matrixVisualizer.ui) {
            const input = document.getElementById('matrix-input');
            if (input) {
                input.value = data;
                matrixVisualizer.ui.handleVisualize();
            }
        }
    },
    
    // 獲取當前矩陣數據
    getCurrentMatrices: () => {
        return matrixVisualizer && matrixVisualizer.core ? 
            matrixVisualizer.core.getMatrices() : [];
    },
    
    // 開始動畫
    startAnimation: (type) => {
        if (matrixVisualizer && matrixVisualizer.d3) {
            const matrices = matrixVisualizer.core.getMatrices();
            matrixVisualizer.d3.startAnimation(type, matrices);
        }
    },
    
    // 停止動畫
    stopAnimation: () => {
        if (matrixVisualizer && matrixVisualizer.d3) {
            matrixVisualizer.d3.stopAnimation();
        }
    }
};

// 除錯用的控制台命令
if (typeof console !== 'undefined') {
    console.log('%c矩陣視覺化工具已載入', 'color: #3498db; font-weight: bold; font-size: 14px;');
    console.log('%c使用 window.MatrixVisualizerAPI 來訪問 API', 'color: #666; font-size: 12px;');
    console.log('%c使用 window.matrixVisualizer 來訪問內部實例', 'color: #666; font-size: 12px;');
}