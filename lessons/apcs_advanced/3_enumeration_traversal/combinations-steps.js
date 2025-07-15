// 組合枚舉步驟生成器 - 簡潔版本（參考子集枚舉）
class CombinationStepGenerator {
    constructor(parent) {
        this.parent = parent;
    }

    // 預先生成所有步驟 - 簡潔的二元決策樹
    generateAllSteps() {
        this.parent.recursionSteps = [];
        this.parent.allCombinations = [];
        this.generateStepsRecursive(0, [], []);
    }

    generateStepsRecursive(index, currentCombination, currentPath) {
        // 進入步驟
        const enterStep = {
            type: 'enter',
            index: index,
            combination: [...currentCombination],
            path: [...currentPath],
            description: `考慮元素 ${index < this.parent.elements.length ? this.parent.elements[index] : '（完成）'}`
        };
        this.parent.recursionSteps.push(enterStep);

        // 終止條件：已選滿 m 個元素
        if (currentCombination.length === this.parent.m) {
            const combination = [...currentCombination];
            this.parent.allCombinations.push(combination);
            
            const solutionStep = {
                type: 'solution',
                index: index,
                combination: combination,
                path: [...currentPath],
                description: `找到組合: {${combination.join(', ')}}`,
                solutionIndex: this.parent.allCombinations.length
            };
            this.parent.recursionSteps.push(solutionStep);
            return;
        }

        // 檢查是否已經遍歷完所有元素
        if (index >= this.parent.elements.length) {
            return;
        }

        // 剪枝檢查
        const remaining = this.parent.elements.length - index;
        const needed = this.parent.m - currentCombination.length;
        if (remaining < needed) {
            const pruneStep = {
                type: 'prune',
                index: index,
                combination: [...currentCombination],
                path: [...currentPath],
                description: `剪枝：剩餘元素不足`
            };
            this.parent.recursionSteps.push(pruneStep);
            return;
        }

        const currentElement = this.parent.elements[index];

        // 情況1：選取當前元素
        const selectStep = {
            type: 'select',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath, 'select'],
            description: `選擇元素 ${currentElement}`
        };
        this.parent.recursionSteps.push(selectStep);

        // 加入組合
        currentCombination.push(currentElement);
        
        // 遞迴處理下一個元素（選擇分支）
        this.generateStepsRecursive(index + 1, currentCombination, [...currentPath, 'select']);

        // 回溯：移除剛加入的元素
        currentCombination.pop();
        
        const backtrackStep = {
            type: 'backtrack',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath],
            description: `回溯：移除 ${currentElement}`
        };
        this.parent.recursionSteps.push(backtrackStep);

        // 情況2：不選取當前元素
        const skipStep = {
            type: 'skip',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath, 'skip'],
            description: `跳過元素 ${currentElement}`
        };
        this.parent.recursionSteps.push(skipStep);

        // 遞迴處理下一個元素（跳過分支）
        this.generateStepsRecursive(index + 1, currentCombination, [...currentPath, 'skip']);
    }
}

// 更新 CombinationsEnumeration 類，使用新的步驟生成器
if (typeof CombinationsEnumeration !== 'undefined') {
    CombinationsEnumeration.prototype.generateAllSteps = function() {
        if (!this.stepGenerator) {
            this.stepGenerator = new CombinationStepGenerator(this);
        }
        this.stepGenerator.generateAllSteps();
    };
}