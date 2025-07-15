// Dijkstra Algorithm Controller
class DijkstraController {
    constructor() {
        this.data = new DijkstraData();
        this.algorithm = new DijkstraAlgorithm(this.data);
        this.renderer = null;
        this.isAutoPlaying = false;
        this.init();
    }

    init() {
        // 獲取 DOM 元素
        this.svg = document.getElementById('graph-svg');
        this.nextBtn = document.getElementById('next-step-btn');
        this.prevBtn = document.getElementById('prev-step-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.autoPlayBtn = document.getElementById('auto-play-btn');
        this.stepDescription = document.getElementById('step-description');
        this.distanceTable = document.getElementById('distance-table');

        // 初始化渲染器
        this.renderer = new DijkstraRenderer(this.svg, this.data);

        // 綁定事件
        this.bindEvents();

        // 初始化界面
        this.updateUI();
    }

    bindEvents() {
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevStep();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.reset();
            }
        });
    }

    nextStep() {
        if (this.isAutoPlaying) return;

        if (this.algorithm.nextStep()) {
            this.updateUI();
            this.animateStep();
        }
    }

    prevStep() {
        if (this.isAutoPlaying) return;

        if (this.algorithm.prevStep()) {
            this.updateUI();
        }
    }

    reset() {
        this.stopAutoPlay();
        this.algorithm.reset();
        this.renderer.clearHighlights();
        this.updateUI();
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
        this.autoPlayBtn.textContent = '停止播放';
        this.autoPlayBtn.style.background = '#e74c3c';
        
        // 禁用其他按鈕
        this.nextBtn.disabled = true;
        this.prevBtn.disabled = true;
        this.resetBtn.disabled = true;

        this.algorithm.autoPlay(() => {
            this.updateUI();
            this.animateStep();
        }, 2000);

        // 當自動播放完成時重新啟用按鈕
        setTimeout(() => {
            if (this.algorithm.isComplete()) {
                this.stopAutoPlay();
            }
        }, this.algorithm.steps.length * 2000 + 1000);
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        this.autoPlayBtn.textContent = '自動播放';
        this.autoPlayBtn.style.background = '#ecf0f1';
        
        // 重新啟用按鈕
        this.nextBtn.disabled = false;
        this.prevBtn.disabled = false;
        this.resetBtn.disabled = false;
        
        this.updateControlButtons();
    }

    updateUI() {
        this.updateStepDescription();
        this.updateDistanceTable();
        this.updateControlButtons();
        this.renderer.updateVisualization();
        this.highlightConsideringEdges();
    }

    updateStepDescription() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo) {
            this.stepDescription.innerHTML = `
                <strong>步驟 ${stepInfo.stepNumber}/${stepInfo.totalSteps}:</strong> 
                ${stepInfo.description}
            `;
        } else {
            this.stepDescription.textContent = '點擊「下一步」開始演算法';
        }
    }

    updateDistanceTable() {
        const tbody = this.distanceTable.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const stepInfo = this.algorithm.getCurrentStepInfo();
        
        rows.forEach(row => {
            const nodeId = row.getAttribute('data-node');
            const weightCell = row.querySelector('.weight');
            const resultCell = row.querySelector('.result');
            const pathCell = row.querySelector('.path');
            
            // 移除所有狀態類別
            row.classList.remove('current-node', 'visited-node', 'start-node');
            weightCell.classList.remove('updated', 'calculation');
            resultCell.classList.remove('updated');
            
            // 更新值
            const distance = this.data.distances[nodeId];
            const formattedDistance = this.data.formatDistance(distance);
            
            // 預設值
            weightCell.textContent = formattedDistance;
            
            // 檢查是否為計算步驟
            if (stepInfo && stepInfo.type === 'calculate' && stepInfo.calculations) {
                const calculation = stepInfo.calculations.find(c => c.node === nodeId);
                if (calculation) {
                    weightCell.textContent = calculation.calculation;
                    weightCell.classList.add('calculation');
                }
            }
            
            resultCell.textContent = formattedDistance;
            pathCell.textContent = this.data.formatPath(nodeId);
            
            // 添加狀態類別
            if (nodeId === this.data.startNode) {
                row.classList.add('start-node');
            } else if (nodeId === this.data.currentNode) {
                row.classList.add('current-node');
            } else if (this.data.visited.has(nodeId)) {
                row.classList.add('visited-node');
            }
            
            // 檢查是否有更新
            if (stepInfo && stepInfo.updates) {
                const update = stepInfo.updates.find(u => u.node === nodeId);
                if (update) {
                    if (!weightCell.classList.contains('calculation')) {
                        weightCell.classList.add('updated');
                    }
                    resultCell.classList.add('updated');
                }
            }
        });
    }

    updateControlButtons() {
        if (!this.isAutoPlaying) {
            this.nextBtn.disabled = !this.algorithm.canGoNext();
            this.prevBtn.disabled = !this.algorithm.canGoPrev();
        }
    }

    highlightConsideringEdges() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo && stepInfo.consideringEdges && stepInfo.consideringEdges.length > 0) {
            this.renderer.highlightConsideringEdges(stepInfo.consideringEdges);
        } else {
            this.renderer.clearHighlights();
        }
    }

    animateStep() {
        // 移除節點彈跳動畫
        // const stepInfo = this.algorithm.getCurrentStepInfo();
        // if (stepInfo && stepInfo.updates) {
        //     stepInfo.updates.forEach(update => {
        //         this.renderer.animateNodeUpdate(update.node);
        //     });
        // }
    }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
    new DijkstraController();
});