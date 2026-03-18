// Ticket Problem Controller - Main Application Logic
class TicketProblemController {
    constructor() {
        this.data = new TicketProblemData();
        this.algorithm = new TicketProblemAlgorithm(this.data);
        this.renderer = null;
        
        this.autoPlayInterval = null;
        this.isAutoPlaying = false;
        
        this.init();
    }

    init() {
        // 初始化渲染器
        this.renderer = new TicketProblemRenderer(null, this.data);
        
        // 綁定事件
        this.initializeEventListeners();
        
        // 初始化顯示
        this.updateDisplay();
        this.algorithm.generateAllSteps();
        this.algorithm.reset();
    }

    initializeEventListeners() {
        // 城市數量更新
        document.getElementById('update-cities-btn').addEventListener('click', () => {
            const count = parseInt(document.getElementById('city-count').value);
            this.updateCityCount(count);
        });

        // 套用費用矩陣
        document.getElementById('apply-matrix-btn').addEventListener('click', () => {
            this.applyCostMatrix();
        });

        // 載入範例
        document.getElementById('load-example-btn').addEventListener('click', () => {
            this.loadExample();
        });

        // 控制按鈕
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetAlgorithm();
        });

        document.getElementById('next-step-btn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prev-step-btn').addEventListener('click', () => {
            this.prevStep();
        });

        document.getElementById('auto-play-btn').addEventListener('click', () => {
            this.toggleAutoPlay();
        });

        // 路線查詢
        document.getElementById('query-path-btn').addEventListener('click', () => {
            this.queryPath();
        });
    }

    updateCityCount(count) {
        this.data.setCityCount(count);
        this.renderer.renderInputMatrix(this.data);
        this.renderer.updateCitySelectors(this.data);
        this.resetAlgorithm();
    }

    applyCostMatrix() {
        const matrix = [];
        
        for (let i = 0; i < this.data.cityCount; i++) {
            const row = [];
            for (let j = 0; j < this.data.cityCount; j++) {
                if (i === j) {
                    row.push(-1); // 輸入時對角線為-1
                } else {
                    const input = document.getElementById(`cost-${i}-${j}`);
                    const value = parseInt(input.value) || -1;
                    row.push(value);
                }
            }
            matrix.push(row);
        }
        
        this.data.setCostMatrix(matrix);
        this.algorithm = new TicketProblemAlgorithm(this.data);
        this.resetAlgorithm();
    }

    loadExample() {
        // 載入圖片中的範例1
        document.getElementById('city-count').value = 3;
        this.data.loadExample(1);
        this.renderer.renderInputMatrix(this.data);
        this.algorithm = new TicketProblemAlgorithm(this.data);
        this.resetAlgorithm();
    }

    resetAlgorithm() {
        this.stopAutoPlay();
        this.algorithm.reset();
        this.updateDisplay();
        this.updateStepInfo();
        this.updateStepDetails(); // 清空步驟記錄
        
        // 清空路線查詢結果
        const resultDiv = document.getElementById('path-result');
        if (resultDiv) {
            resultDiv.innerHTML = '請選擇出發城市和目的城市';
            resultDiv.className = 'path-result';
        }
    }

    nextStep() {
        this.stopAutoPlay();
        
        if (this.algorithm.nextStep()) {
            this.updateDisplay();
            this.updateStepInfo();
            this.updateTransferInfo();
            this.updateStepDetails(); // 更新步驟記錄
        }
    }

    prevStep() {
        this.stopAutoPlay();
        
        if (this.algorithm.prevStep()) {
            this.updateDisplay();
            this.updateStepInfo();
            this.updateTransferInfo();
            this.updateStepDetails(); // 更新步驟記錄
        }
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        const autoPlayBtn = document.getElementById('auto-play-btn');
        if (autoPlayBtn) {
            autoPlayBtn.textContent = '停止播放';
        }
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.algorithm.nextStep()) {
                this.stopAutoPlay();
            } else {
                this.updateDisplay();
                this.updateStepInfo();
                this.updateTransferInfo();
                this.updateStepDetails(); // 更新步驟記錄
            }
        }, 1500);
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        const autoPlayBtn = document.getElementById('auto-play-btn');
        if (autoPlayBtn) {
            autoPlayBtn.textContent = '自動播放';
        }
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    updateDisplay() {
        // 更新費用矩陣表格
        this.renderer.renderCostMatrix(this.data);
        
        // 如果演算法完成，顯示結果
        if (this.data.isCompleted) {
            this.renderer.renderResultTable(this.data);
        }
        
        // 更新城市選擇器
        this.renderer.updateCitySelectors(this.data);
    }

    updateStepInfo() {
        const stepDescription = document.getElementById('step-description');
        const currentStep = this.algorithm.getCurrentStep();
        
        if (stepDescription && currentStep) {
            stepDescription.textContent = currentStep.description;
        }
    }
    
    updateStepDetails() {
        const container = document.getElementById('step-details-container');
        if (!container) return;
        
        const steps = this.algorithm.steps;
        if (!steps || steps.length <= 1) {
            container.innerHTML = '<div class="no-steps">還未開始演算法</div>';
            return;
        }
        
        container.innerHTML = '';
        
        // 顯示所有更新步驟（跳過初始化）
        for (let i = 1; i < steps.length; i++) {
            const step = steps[i];
            if (step.type === 'complete') continue;
            
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item-detail';
            stepDiv.id = `step-${i}`; // 為每個步驟加入ID
            
            if (i === this.algorithm.currentStep) {
                stepDiv.classList.add('current');
            }
            
            if (step.updated) {
                stepDiv.classList.add('updated');
            }
            
            stepDiv.innerHTML = `
                <div class="step-title">步驟 ${i}: ${step.description}</div>
                <div class="step-calculation">${step.calculation}</div>
            `;
            
            container.appendChild(stepDiv);
        }
        
        // 在右側步驟記錄容器內自動滾動到當前步驟，不影響整個網頁
        setTimeout(() => {
            const currentStepElement = container.querySelector('.current');
            if (currentStepElement) {
                // 使用容器的scrollTop屬性，確保只在容器內滾動，不影響網頁
                const containerRect = container.getBoundingClientRect();
                const elementRect = currentStepElement.getBoundingClientRect();
                const elementTop = currentStepElement.offsetTop;
                const containerHeight = container.clientHeight;
                
                // 計算目標滾動位置（讓當前步驟置中顯示）
                const targetScrollTop = elementTop - (containerHeight / 2) + (currentStepElement.offsetHeight / 2);
                
                // 平滑滾動到目標位置，只影響容器內滾動
                container.scrollTo({
                    top: Math.max(0, targetScrollTop),
                    behavior: 'smooth'
                });
            }
        }, 100); // 小延遲確保DOM更新完成
    }

    updateTransferInfo() {
        const transferInfo = document.getElementById('current-transfer');
        if (!transferInfo) return;
        
        if (this.data.currentK >= 0) {
            transferInfo.textContent = this.data.cities[this.data.currentK];
        } else {
            transferInfo.textContent = '-';
        }
    }

    queryPath() {
        const fromCity = document.getElementById('from-city').value;
        const toCity = document.getElementById('to-city').value;
        
        if (!fromCity || !toCity) {
            const resultDiv = document.getElementById('path-result');
            if (resultDiv) {
                resultDiv.innerHTML = '請選擇出發城市和目的城市';
                resultDiv.className = 'path-result';
            }
            return;
        }
        
        if (fromCity === toCity) {
            const resultDiv = document.getElementById('path-result');
            if (resultDiv) {
                resultDiv.innerHTML = '出發城市和目的城市不能相同';
                resultDiv.className = 'path-result';
            }
            return;
        }
        
        const routeInfo = this.algorithm.getRouteInfo(fromCity, toCity);
        this.renderer.showRouteResult(routeInfo);
    }
}

// 初始化應用程式
let ticketController;

document.addEventListener('DOMContentLoaded', function() {
    ticketController = new TicketProblemController();
});