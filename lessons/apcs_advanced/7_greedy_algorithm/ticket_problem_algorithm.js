// Ticket Problem Algorithm Implementation with Transfer Discount
class TicketProblemAlgorithm {
    constructor(data) {
        this.data = data;
        this.steps = [];
        this.currentStep = -1;
        this.isRunning = false;
        this.transferDiscount = 50; // 轉機折扣
    }

    // 生成所有演算法步驟
    generateAllSteps() {
        this.steps = [];
        this.currentStep = -1;
        
        const n = this.data.cityCount;
        const tempMatrix = this.data.copyMatrix(this.data.originalMatrix);
        const tempPathMatrix = this.data.copyMatrix(this.data.pathMatrix);
        
        // 初始狀態
        this.steps.push({
            type: 'init',
            matrix: this.data.copyMatrix(tempMatrix),
            pathMatrix: this.data.copyMatrix(tempPathMatrix),
            description: '初始化：建立城市間機票費用矩陣',
            k: -1,
            i: -1,
            j: -1,
            calculation: '設定初始的直達機票費用，開始尋找更便宜的轉機路線。',
            updated: false
        });

        // Floyd-Warshall 主要迴圈，利用中繼點特性實現轉機折扣
        for (let k = 0; k < n; k++) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j && i !== k && j !== k) { // 確保不是同一城市
                        const currentCost = tempMatrix[i][j];
                        const pathCost = tempMatrix[i][k] + tempMatrix[k][j];
                        
                        let calculation = '';
                        let updated = false;
                        
                        calculation = `計算 ${this.data.cities[i]} 到 ${this.data.cities[j]} 的最低費用：\n`;
                        calculation += `目前最低費用: ${this.formatCost(currentCost)}\n`;
                        
                        if (tempMatrix[i][k] !== Infinity && tempMatrix[k][j] !== Infinity) {
                            calculation += `經由 ${this.data.cities[k]} 的路線費用:\n`;
                            calculation += `  ${this.data.cities[i]} → ${this.data.cities[k]}: ${this.formatCost(tempMatrix[i][k])}\n`;
                            calculation += `  ${this.data.cities[k]} → ${this.data.cities[j]}: ${this.formatCost(tempMatrix[k][j])}\n`;
                            calculation += `  小計: ${this.formatCost(tempMatrix[i][k])} + ${this.formatCost(tempMatrix[k][j])} = ${pathCost}\n`;
                            
                            // 直接計算折扣後的費用並比較
                            const discountedCost = pathCost - this.transferDiscount;
                            calculation += `應用轉機折扣: ${pathCost} - ${this.transferDiscount} = ${discountedCost}\n`;
                            calculation += `比較: min(${this.formatCost(currentCost)}, ${discountedCost})`;
                            
                            if (discountedCost < currentCost) {
                                tempMatrix[i][j] = discountedCost;
                                tempPathMatrix[i][j] = k; // 記錄中轉城市
                                updated = true;
                                calculation += ` = ${discountedCost} → 更新！`;
                            } else {
                                calculation += ` = ${this.formatCost(currentCost)} → 不變`;
                            }
                        } else {
                            if (tempMatrix[i][k] === Infinity) {
                                calculation += `${this.data.cities[i]} 到 ${this.data.cities[k]} 無法到達，無法經由 ${this.data.cities[k]} 轉機`;
                            } else if (tempMatrix[k][j] === Infinity) {
                                calculation += `${this.data.cities[k]} 到 ${this.data.cities[j]} 無法到達，無法經由 ${this.data.cities[k]} 轉機`;
                            }
                        }

                        this.steps.push({
                            type: 'update',
                            matrix: this.data.copyMatrix(tempMatrix),
                            pathMatrix: this.data.copyMatrix(tempPathMatrix),
                            description: `考慮經由城市${this.data.cities[k]}從${this.data.cities[i]}到${this.data.cities[j]}`,
                            k: k,
                            i: i,
                            j: j,
                            calculation: calculation,
                            updated: updated
                        });
                    }
                }
            }
        }

        // 完成狀態
        this.steps.push({
            type: 'complete',
            matrix: this.data.copyMatrix(tempMatrix),
            pathMatrix: this.data.copyMatrix(tempPathMatrix),
            description: '演算法完成：已找到所有城市間的最低機票費用',
            k: -1,
            i: -1,
            j: -1,
            calculation: '所有可能的轉機路線都已檢查完畢，所有轉機都自動享有50元折扣，只有更便宜的才會被採用。',
            updated: false
        });
    }

    formatCost(cost) {
        return cost === Infinity ? '∞' : cost.toString();
    }

    // 執行下一步
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.applyCurrentStep();
            return true;
        }
        return false;
    }

    // 執行上一步
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.applyCurrentStep();
            return true;
        }
        return false;
    }

    // 應用當前步驟到數據
    applyCurrentStep() {
        if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            const step = this.steps[this.currentStep];
            this.data.costMatrix = this.data.copyMatrix(step.matrix);
            this.data.pathMatrix = this.data.copyMatrix(step.pathMatrix);
            this.data.currentK = step.k;
            this.data.currentI = step.i;
            this.data.currentJ = step.j;
            this.data.isCompleted = (step.type === 'complete');
        }
    }

    getCurrentStep() {
        if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            return this.steps[this.currentStep];
        }
        return null;
    }

    reset() {
        this.currentStep = -1;
        this.data.reset();
        this.generateAllSteps();
        if (this.steps.length > 0) {
            this.currentStep = 0;
            this.applyCurrentStep();
        }
    }

    // 自動播放
    async autoPlay(onStepCallback = null, speed = 1000) {
        this.isRunning = true;
        
        while (this.isRunning && this.currentStep < this.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, speed));
            
            if (!this.isRunning) break;
            
            this.nextStep();
            if (onStepCallback) {
                onStepCallback();
            }
        }
        
        this.isRunning = false;
    }

    stopAutoPlay() {
        this.isRunning = false;
    }

    // 獲取最終結果的摘要
    getResults() {
        const results = [];
        
        for (let i = 0; i < this.data.cityCount; i++) {
            for (let j = 0; j < this.data.cityCount; j++) {
                if (i !== j) {
                    const cost = this.data.costMatrix[i][j];
                    const path = this.data.getPath(i, j);
                    
                    results.push({
                        from: this.data.cities[i],
                        to: this.data.cities[j],
                        cost: cost,
                        path: path.map(index => this.data.cities[index]).join(' → '),
                        hasPath: cost !== Infinity
                    });
                }
            }
        }
        
        return results;
    }

    // 獲取特定路線的詳細資訊
    getRouteInfo(fromCity, toCity) {
        const fromIndex = this.data.getCityIndex(fromCity);
        const toIndex = this.data.getCityIndex(toCity);
        
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
            return null;
        }
        
        const cost = this.data.costMatrix[fromIndex][toIndex];
        const path = this.data.getPath(fromIndex, toIndex);
        
        return {
            from: fromCity,
            to: toCity,
            cost: cost,
            path: path.map(index => this.data.cities[index]).join(' → '),
            hasPath: cost !== Infinity,
            isDirectFlight: path.length === 2 && this.data.hasDirectFlight(fromIndex, toIndex)
        };
    }
}