// Bellman-Ford Algorithm Controller
class BellmanFordController {
    constructor() {
        this.data = new BellmanFordData();
        this.algorithm = new BellmanFordAlgorithm(this.data);
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
        this.currentRoundSpan = document.getElementById('current-round');
        this.totalRoundsSpan = document.getElementById('total-rounds');

        // 設定總輪數 (V-1 = 7-1 = 6)
        this.totalRoundsSpan.textContent = this.data.maxRounds;

        // 初始化渲染器
        this.renderer = new BellmanFordRenderer(this.svg, this.data);

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
        this.updateRoundInfo();
        this.updateControlButtons();
        this.renderer.updateVisualization();
        this.highlightCurrentEdge();
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

    updateRoundInfo() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo) {
            this.currentRoundSpan.textContent = stepInfo.round;
        } else {
            this.currentRoundSpan.textContent = '0';
        }
    }

    updateDistanceTable() {
        const tbody = this.distanceTable.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const stepInfo = this.algorithm.getCurrentStepInfo();
        
        rows.forEach(row => {
            const nodeId = row.getAttribute('data-node');
            const distanceCell = row.querySelector('.distance');
            const predecessorCell = row.querySelector('.predecessor');
            const pathCell = row.querySelector('.path');
            
            // 移除所有狀態類別
            row.classList.remove('start-node', 'relaxing-node', 'updated-node', 'negative-cycle-node');
            distanceCell.classList.remove('updated', 'calculation');
            predecessorCell.classList.remove('updated');
            
            // 更新值
            const distance = this.data.distances[nodeId];
            const formattedDistance = this.data.formatDistance(distance);
            
            // 檢查是否為計算步驟（包括負環檢測步驟）
            if (stepInfo && (stepInfo.type === 'consider_edge' || stepInfo.type === 'negative_cycle_edge') && 
                stepInfo.calculation && stepInfo.calculation.to === nodeId) {
                const calc = stepInfo.calculation;
                if (calc.currentDistance !== Infinity) {
                    const calcText = `${calc.currentDistance}+(${calc.weight})=${calc.newDistance}`;
                    distanceCell.textContent = calcText;
                    distanceCell.classList.add('calculation');
                } else {
                    distanceCell.textContent = formattedDistance;
                }
            } else {
                distanceCell.textContent = formattedDistance;
            }
            
            predecessorCell.textContent = this.data.predecessors[nodeId] || '-';
            pathCell.textContent = this.data.formatPath(nodeId);
            
            // 添加狀態類別
            if (nodeId === this.data.startNode) {
                row.classList.add('start-node');
            } else if (stepInfo && stepInfo.hasNegativeCycle && 
                      stepInfo.relaxingEdge && stepInfo.relaxingEdge.to === nodeId) {
                row.classList.add('negative-cycle-node');
            } else if (this.data.isNodeUpdated(nodeId)) {
                row.classList.add('updated-node');
            } else if (this.data.relaxingEdge && 
                      (this.data.relaxingEdge.from === nodeId || this.data.relaxingEdge.to === nodeId)) {
                row.classList.add('relaxing-node');
            }
            
            // 檢查是否有更新
            if (stepInfo && stepInfo.updates && stepInfo.updates.length > 0) {
                const update = stepInfo.updates.find(u => u.node === nodeId);
                if (update) {
                    if (!distanceCell.classList.contains('calculation')) {
                        distanceCell.classList.add('updated');
                    }
                    predecessorCell.classList.add('updated');
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

    highlightCurrentEdge() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo && stepInfo.relaxingEdge) {
            this.renderer.highlightRelaxingEdge(stepInfo.relaxingEdge);
        } else {
            this.renderer.clearHighlights();
        }
    }

    animateStep() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo && stepInfo.updates && stepInfo.updates.length > 0) {
            stepInfo.updates.forEach(update => {
                this.renderer.animateNodeUpdate(update.node);
            });
        }
    }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
    new BellmanFordController();
});