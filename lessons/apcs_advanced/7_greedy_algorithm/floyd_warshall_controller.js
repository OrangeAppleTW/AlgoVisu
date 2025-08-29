// Floyd-Warshall Algorithm Controller
class FloydWarshallController {
    constructor() {
        this.data = new FloydWarshallData();
        this.algorithm = new FloydWarshallAlgorithm(this.data);
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
        this.distanceMatrix = document.getElementById('distance-matrix');
        this.currentKSpan = document.getElementById('current-k');

        // 初始化渲染器
        this.renderer = new FloydWarshallRenderer(this.svg, this.data);

        // 綁定事件
        this.bindEvents();

        // 初始化界面
        this.updateUI();
        this.initializeTable();
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

    initializeTable() {
        const tbody = this.distanceMatrix.querySelector('tbody');
        tbody.innerHTML = '';

        // 創建矩陣表格
        for (let i = 0; i < this.data.nodeCount; i++) {
            const row = document.createElement('tr');
            
            // 行標題
            const headerCell = document.createElement('th');
            headerCell.textContent = this.data.nodes[i].id;
            row.appendChild(headerCell);
            
            // 數據格
            for (let j = 0; j < this.data.nodeCount; j++) {
                const cell = document.createElement('td');
                cell.setAttribute('data-i', i);
                cell.setAttribute('data-j', j);
                cell.textContent = this.data.formatDistance(this.data.distanceMatrix[i][j]);
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        }
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
        this.initializeTable();
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
        this.updateDistanceMatrix();
        this.updateCurrentK();
        this.updateControlButtons();
        this.renderer.updateVisualization();
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

    updateCurrentK() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo && stepInfo.k >= 0) {
            const kNode = this.data.getNodeByIndex(stepInfo.k);
            this.currentKSpan.textContent = kNode.id;
        } else {
            this.currentKSpan.textContent = '-';
        }
    }

    updateDistanceMatrix() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        
        // 更新所有格子的值
        for (let i = 0; i < this.data.nodeCount; i++) {
            for (let j = 0; j < this.data.nodeCount; j++) {
                const cell = this.distanceMatrix.querySelector(`td[data-i="${i}"][data-j="${j}"]`);
                if (!cell) continue;

                // 移除所有狀態類別
                cell.classList.remove('cell-intermediate', 'cell-source', 'cell-destination', 
                                   'cell-considering', 'cell-updated', 'cell-calculation');

                // 更新值
                const distance = this.data.distanceMatrix[i][j];
                
                // 如果是計算步驟，顯示計算過程
                if (stepInfo && stepInfo.type === 'calculate' && stepInfo.calculation && 
                    stepInfo.i === i && stepInfo.j === j) {
                    const calc = stepInfo.calculation;
                    if (calc.viaK < Infinity && calc.ikDistance < Infinity && calc.kjDistance < Infinity) {
                        cell.textContent = `${calc.ikDistance}+${calc.kjDistance}=${calc.viaK}`;
                        cell.classList.add('cell-calculation');
                    } else {
                        cell.textContent = this.data.formatDistance(distance);
                    }
                } else {
                    cell.textContent = this.data.formatDistance(distance);
                }

                // 添加狀態類別
                if (stepInfo) {
                    // 中繼點相關的行和列
                    if (stepInfo.k >= 0 && (i === stepInfo.k || j === stepInfo.k)) {
                    cell.classList.add('cell-intermediate');
                    }
                    
                    // 當前考慮的格子
                    if (stepInfo.i >= 0 && stepInfo.j >= 0 && i === stepInfo.i && j === stepInfo.j) {
                    cell.classList.add('cell-considering');
                    }
                
                // 負環節點的對角線元素
                if (stepInfo.hasNegativeCycle && stepInfo.negativeCycleNodes && 
                    stepInfo.negativeCycleNodes.includes(i) && i === j) {
                    cell.classList.add('cell-negative-cycle');
                }
                    
                    // 檢查是否有更新
                    if (stepInfo.updates && stepInfo.updates.length > 0) {
                        const update = stepInfo.updates.find(u => u.i === i && u.j === j);
                        if (update) {
                            cell.classList.add('cell-updated');
                        }
                    }
                }
            }
        }
    }

    updateControlButtons() {
        if (!this.isAutoPlaying) {
            this.nextBtn.disabled = !this.algorithm.canGoNext();
            this.prevBtn.disabled = !this.algorithm.canGoPrev();
        }
    }

    animateStep() {
        const stepInfo = this.algorithm.getCurrentStepInfo();
        if (stepInfo && stepInfo.updates && stepInfo.updates.length > 0) {
            stepInfo.updates.forEach(update => {
                this.renderer.animateMatrixUpdate(update.i, update.j);
            });
        }
    }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', () => {
    new FloydWarshallController();
});