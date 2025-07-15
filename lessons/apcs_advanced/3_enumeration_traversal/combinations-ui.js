// UI更新相關功能
class UIUpdater {
    constructor(parent) {
        this.parent = parent;
    }

    updateDisplay() {
        this.updateCombinationSlots();
        this.updateStartPosition();
        this.updateCombinationCount();
        this.updatePruningInfo();
        this.updateElementsArray();
    }

    updateCombinationSlots() {
        // 更新插槽數量
        while (this.parent.combinationSlots.children.length < this.parent.m) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.textContent = '?';
            this.parent.combinationSlots.appendChild(slot);
        }
        while (this.parent.combinationSlots.children.length > this.parent.m) {
            this.parent.combinationSlots.removeChild(this.parent.combinationSlots.lastChild);
        }
        
        // 更新插槽內容
        for (let i = 0; i < this.parent.m; i++) {
            const slot = this.parent.combinationSlots.children[i];
            slot.className = 'slot';
            
            if (i < this.parent.currentCombination.length) {
                slot.textContent = this.parent.currentCombination[i];
                slot.classList.add('filled');
            } else {
                slot.textContent = '?';
            }
        }
    }

    updateElementsArray() {
        const elementsDisplay = document.querySelector('.elements-display');
        const cells = elementsDisplay.children;
        
        for (let i = 0; i < this.parent.elements.length; i++) {
            const cell = cells[i];
            cell.className = 'element-item';
            
            // 移除舊的選擇指示器
            const oldIndicator = cell.querySelector('.choice-indicator');
            if (oldIndicator) {
                oldIndicator.remove();
            }
            
            if (!this.parent.currentStep) continue;
            
            // 根據當前步驟設置狀態
            if (this.parent.currentStep.index === i) {
                if (this.parent.currentStep.type === 'select' || this.parent.currentStep.type === 'set_select') {
                    cell.classList.add('current');
                    const indicator = document.createElement('div');
                    indicator.className = 'choice-indicator select';
                    indicator.textContent = '選擇';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '-25px';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%)';
                    indicator.style.fontSize = '0.8em';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.padding = '2px 6px';
                    indicator.style.borderRadius = '10px';
                    indicator.style.background = '#2ecc71';
                    indicator.style.color = 'white';
                    cell.style.position = 'relative';
                    cell.appendChild(indicator);
                } else if (this.parent.currentStep.type === 'skip') {
                    cell.classList.add('current');
                    const indicator = document.createElement('div');
                    indicator.className = 'choice-indicator skip';
                    indicator.textContent = '跳過';
                    indicator.style.position = 'absolute';
                    indicator.style.top = '-25px';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%)';
                    indicator.style.fontSize = '0.8em';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.padding = '2px 6px';
                    indicator.style.borderRadius = '10px';
                    indicator.style.background = '#e74c3c';
                    indicator.style.color = 'white';
                    cell.style.position = 'relative';
                    cell.appendChild(indicator);
                }
            } else if (this.parent.currentStep.index > i) {
                // 已經決定的元素
                if (this.parent.currentCombination.includes(this.parent.elements[i])) {
                    cell.classList.add('selected');
                } else {
                    cell.classList.add('excluded');
                }
            }
        }
    }

    updateStartPosition() {
        if (this.parent.currentStep) {
            this.parent.startPosition.textContent = this.parent.currentStep.index || 0;
        } else {
            this.parent.startPosition.textContent = '0';
        }
    }

    updateCombinationCount() {
        let count = 0;
        if (this.parent.currentStep && this.parent.currentStep.type === 'solution') {
            count = this.parent.currentStep.solutionIndex;
        } else {
            // 計算到目前為止找到的組合數量
            for (let i = 0; i <= this.parent.stepIndex; i++) {
                if (this.parent.recursionSteps[i] && this.parent.recursionSteps[i].type === 'solution') {
                    count = this.parent.recursionSteps[i].solutionIndex;
                }
            }
        }
        const totalCombinations = this.parent.calculateCombinations(this.parent.elements.length, this.parent.m);
        this.parent.combinationCount.textContent = `${count} / ${totalCombinations}`;
    }

    updatePruningInfo() {
        if (this.parent.showPruning) {
            this.parent.pruningInfo.classList.add('show');
        } else {
            this.parent.pruningInfo.classList.remove('show');
        }
    }
}

// 將UI更新功能添加到主類
CombinationsEnumeration.prototype.updateDisplay = function() {
    const uiUpdater = new UIUpdater(this);
    uiUpdater.updateDisplay();
};