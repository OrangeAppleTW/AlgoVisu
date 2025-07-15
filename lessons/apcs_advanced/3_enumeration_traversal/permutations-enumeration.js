class PermutationsEnumeration {
    constructor() {
        this.elements = [0, 1, 2, 3, 4];
        this.n = this.elements.length;
        this.currentPermutation = [null, null, null, null, null];
        this.usedArray = [false, false, false, false, false];
        this.allPermutations = [];
        this.isRunning = false;
        this.isAutoMode = false;
        this.autoInterval = null;
        this.recursionSteps = [];
        this.stepIndex = 0;
        this.maxDisplay = 20; // 最多顯示的排列數量
        
        this.initializeElements();
        this.bindEvents();
        this.generateAllSteps();
        this.updateDisplay();
    }

    initializeElements() {
        this.elementsRow = document.getElementById('elements-row');
        this.permutationSlots = document.getElementById('permutation-slots');
        this.usedStatus = document.getElementById('used-status');
        this.currentPosition = document.getElementById('current-position');
        this.status = document.getElementById('status');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.permutationCount = document.getElementById('permutation-count');
        this.permutationsList = document.getElementById('permutations-list');
        this.stepProgress = document.getElementById('step-progress');
        this.totalSteps = document.getElementById('total-steps');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.autoBtn.addEventListener('click', () => this.toggleAuto());
    }

    // 預先生成所有步驟（限制在前50個排列以免太複雜）
    generateAllSteps() {
        this.recursionSteps = [];
        this.allPermutations = [];
        this.generateStepsRecursive(0, [null, null, null, null, null], [false, false, false, false, false]);
    }

    generateStepsRecursive(pos, currentPerm, currentUsed) {
        // 記錄進入函式的步驟
        const enterStep = {
            type: 'enter',
            position: pos,
            permutation: [...currentPerm],
            used: [...currentUsed],
            description: `進入 backtrack(${pos})`
        };
        this.recursionSteps.push(enterStep);

        // 檢查終止條件：已填滿所有位置
        if (pos === this.n) {
            const permutation = [...currentPerm];
            this.allPermutations.push(permutation);
            
            const solutionStep = {
                type: 'solution',
                position: pos,
                permutation: permutation,
                used: [...currentUsed],
                description: `找到排列: [${permutation.join(', ')}]`,
                solutionIndex: this.allPermutations.length
            };
            this.recursionSteps.push(solutionStep);

            // 限制生成的排列數量以避免過度複雜
            if (this.allPermutations.length >= 50) {
                return true; // 停止生成
            }
            return false;
        }

        // 嘗試放入每一個尚未使用的元素
        for (let i = 0; i < this.n; i++) {
            if (!currentUsed[i]) { // 如果元素 elements[i] 尚未被使用
                // 記錄嘗試元素的步驟
                const tryStep = {
                    type: 'try',
                    position: pos,
                    elementIndex: i,
                    element: this.elements[i],
                    permutation: [...currentPerm],
                    used: [...currentUsed],
                    description: `在位置${pos}嘗試元素${this.elements[i]}`
                };
                this.recursionSteps.push(tryStep);

                // 標記為已使用並設置到排列中
                currentUsed[i] = true;
                currentPerm[pos] = this.elements[i];
                
                const setStep = {
                    type: 'set',
                    position: pos,
                    elementIndex: i,
                    element: this.elements[i],
                    permutation: [...currentPerm],
                    used: [...currentUsed],
                    description: `設置 perm[${pos}] = ${this.elements[i]}，標記為已使用`
                };
                this.recursionSteps.push(setStep);

                // 遞迴處理下一個位置
                const shouldStop = this.generateStepsRecursive(pos + 1, currentPerm, currentUsed);
                if (shouldStop) return true;

                // 回溯：復原標記
                currentUsed[i] = false;
                currentPerm[pos] = null;
                
                const backtrackStep = {
                    type: 'backtrack',
                    position: pos,
                    elementIndex: i,
                    element: this.elements[i],
                    permutation: [...currentPerm],
                    used: [...currentUsed],
                    description: `回溯：復原 used[${i}] = false，移除 perm[${pos}]`
                };
                this.recursionSteps.push(backtrackStep);
            }
        }

        return false;
    }

    start() {
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stepBtn.disabled = false;
        this.autoBtn.disabled = false;
        this.status.textContent = '開始排列枚舉...';
        this.totalSteps.textContent = this.recursionSteps.length;
        this.updateDisplay();
    }

    nextStep() {
        if (this.stepIndex >= this.recursionSteps.length) {
            this.status.textContent = '演示完成！（顯示前50個排列的生成過程）';
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            return;
        }

        const step = this.recursionSteps[this.stepIndex];
        this.executeStep(step);
        this.stepIndex++;
        this.updateDisplay();
    }

    executeStep(step) {
        this.currentStep = step;
        
        switch (step.type) {
            case 'enter':
                this.status.textContent = step.description;
                this.currentPos = step.position;
                break;
            case 'try':
                this.status.textContent = step.description;
                this.currentTryIndex = step.elementIndex;
                break;
            case 'set':
                this.status.textContent = step.description;
                this.currentPermutation = [...step.permutation];
                this.usedArray = [...step.used];
                break;
            case 'backtrack':
                this.status.textContent = step.description;
                this.currentPermutation = [...step.permutation];
                this.usedArray = [...step.used];
                break;
            case 'solution':
                this.status.textContent = step.description;
                this.addPermutationToDisplay(step.permutation, step.solutionIndex);
                break;
        }
    }

    addPermutationToDisplay(permutation, index) {
        if (index <= this.maxDisplay) {
            const permutationElement = document.createElement('div');
            permutationElement.className = 'solution-item';
            permutationElement.innerHTML = `
                <span class="solution-number">${index}</span>
                <span>[${permutation.join(', ')}]</span>
            `;
            this.permutationsList.appendChild(permutationElement);
        }
    }

    toggleAuto() {
        if (this.isAutoMode) {
            this.stopAuto();
        } else {
            this.startAuto();
        }
    }

    startAuto() {
        this.isAutoMode = true;
        this.autoBtn.textContent = '暫停自動';
        this.stepBtn.disabled = true;
        
        this.autoInterval = setInterval(() => {
            this.nextStep();
            if (this.stepIndex >= this.recursionSteps.length) {
                this.stopAuto();
            }
        }, 800);
    }

    stopAuto() {
        this.isAutoMode = false;
        this.autoBtn.textContent = '自動執行';
        this.stepBtn.disabled = false;
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    reset() {
        this.stopAuto();
        this.currentPermutation = [null, null, null, null, null];
        this.usedArray = [false, false, false, false, false];
        this.currentStep = null;
        this.stepIndex = 0;
        this.isRunning = false;
        this.currentPos = 0;
        this.currentTryIndex = -1;
        
        this.startBtn.disabled = false;
        this.stepBtn.disabled = true;
        this.autoBtn.disabled = true;
        this.autoBtn.textContent = '自動執行';
        
        this.status.textContent = '準備開始排列枚舉';
        this.permutationsList.innerHTML = '';
        
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateElementsRow();
        this.updatePermutationSlots();
        this.updateUsedStatus();
        this.updateCurrentPosition();
        this.updatePermutationCount();
        this.updateStepProgress();
    }

    updateElementsRow() {
        const elements = this.elementsRow.children;
        for (let i = 0; i < this.n; i++) {
            const element = elements[i];
            element.className = 'element-item';
            
            // 移除舊的使用指示器
            const oldIndicator = element.querySelector('.used-indicator');
            if (oldIndicator) {
                oldIndicator.remove();
            }
            
            if (this.usedArray[i]) {
                element.classList.add('used');
                const indicator = document.createElement('div');
                indicator.className = 'used-indicator';
                indicator.textContent = '已用';
                element.appendChild(indicator);
            } else if (this.currentStep && this.currentStep.type === 'try' && this.currentStep.elementIndex === i) {
                element.classList.add('current');
            } else {
                element.classList.add('available');
            }
        }
    }

    updatePermutationSlots() {
        const slots = this.permutationSlots.children;
        for (let i = 0; i < this.n; i++) {
            const slot = slots[i];
            slot.className = 'slot';
            
            if (this.currentPermutation[i] !== null) {
                slot.firstChild.textContent = this.currentPermutation[i];
                slot.classList.add('filled');
            } else if (this.currentStep && this.currentStep.position === i && this.currentStep.type === 'try') {
                slot.firstChild.textContent = this.currentStep.element;
                slot.classList.add('current');
            } else {
                slot.firstChild.textContent = '?';
            }
        }
    }

    updateUsedStatus() {
        const cells = this.usedStatus.children;
        for (let i = 0; i < this.n; i++) {
            const cell = cells[i];
            cell.textContent = this.usedArray[i] ? 'T' : 'F';
            cell.className = `used-cell ${this.usedArray[i] ? 'true' : 'false'}`;
        }
    }

    updateCurrentPosition() {
        if (this.currentStep) {
            this.currentPosition.textContent = this.currentStep.position || 0;
        } else {
            this.currentPosition.textContent = '0';
        }
    }

    updatePermutationCount() {
        let count = 0;
        if (this.currentStep && this.currentStep.type === 'solution') {
            count = this.currentStep.solutionIndex;
        } else {
            // 計算到目前為止找到的排列數量
            for (let i = 0; i <= this.stepIndex; i++) {
                if (this.recursionSteps[i] && this.recursionSteps[i].type === 'solution') {
                    count = this.recursionSteps[i].solutionIndex;
                }
            }
        }
        this.permutationCount.textContent = count;
    }

    updateStepProgress() {
        this.stepProgress.textContent = this.stepIndex;
        this.totalSteps.textContent = this.recursionSteps.length;
    }


}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    new PermutationsEnumeration();
});