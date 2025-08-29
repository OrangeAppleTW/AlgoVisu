// Floyd-Warshall Algorithm Logic
class FloydWarshallAlgorithm {
    constructor(data) {
        this.data = data;
        this.steps = [];
        this.currentStepIndex = -1;
        this.generateSteps();
    }

    generateSteps() {
        this.steps = [];
        
        // 重置數據狀態
        this.data.reset();
        
        // 步驟 0: 初始化
        this.steps.push({
            type: 'initialize',
            description: '初始化：建立距離矩陣，設定直接相鄰的距離，其他為無限大',
            k: -1,
            i: -1,
            j: -1,
            matrix: this.copyMatrix(this.data.distanceMatrix),
            nextMatrix: this.copyMatrix(this.data.nextMatrix),
            updates: [],
            calculation: null
        });

        // 模擬演算法執行 - 三層巢狀迴圈
        const tempMatrix = this.copyMatrix(this.data.distanceMatrix);
        const tempNext = this.copyMatrix(this.data.nextMatrix);

        for (let k = 0; k < this.data.nodeCount; k++) {
            const kNode = this.data.getNodeByIndex(k);
            
            // 開始新的k輪
            this.steps.push({
                type: 'start_k',
                description: `開始第 ${k + 1} 輪：以節點 ${kNode.id} 作為中繼點`,
                k: k,
                i: -1,
                j: -1,
                matrix: this.copyMatrix(tempMatrix),
                nextMatrix: this.copyMatrix(tempNext),
                updates: [],
                calculation: null
            });

            const roundUpdates = [];

            for (let i = 0; i < this.data.nodeCount; i++) {
                for (let j = 0; j < this.data.nodeCount; j++) {
                    if (i !== j) {
                        const iNode = this.data.getNodeByIndex(i);
                        const jNode = this.data.getNodeByIndex(j);
                        
                        const directDistance = tempMatrix[i][j];
                        const viaKDistance = tempMatrix[i][k] + tempMatrix[k][j];
                        
                        // 顯示計算步驟
                        this.steps.push({
                            type: 'calculate',
                            description: `檢查 ${iNode.id} → ${jNode.id}：直接距離 ${this.formatDistance(directDistance)} vs 經由 ${kNode.id} 距離 ${this.formatDistance(tempMatrix[i][k])} + ${this.formatDistance(tempMatrix[k][j])} = ${this.formatDistance(viaKDistance)}`,
                            k: k,
                            i: i,
                            j: j,
                            matrix: this.copyMatrix(tempMatrix),
                            nextMatrix: this.copyMatrix(tempNext),
                            updates: [],
                            calculation: {
                                direct: directDistance,
                                viaK: viaKDistance,
                                ikDistance: tempMatrix[i][k],
                                kjDistance: tempMatrix[k][j]
                            }
                        });

                        // 如果經由k的路徑更短，則更新
                        if (viaKDistance < directDistance) {
                            const oldDistance = tempMatrix[i][j];
                            tempMatrix[i][j] = viaKDistance;
                            tempNext[i][j] = tempNext[i][k];
                            
                            roundUpdates.push({
                                i: i,
                                j: j,
                                oldDistance: oldDistance,
                                newDistance: viaKDistance
                            });

                            this.steps.push({
                                type: 'update',
                                description: `更新 ${iNode.id} → ${jNode.id} 的距離：${this.formatDistance(oldDistance)} → ${this.formatDistance(viaKDistance)} (經由 ${kNode.id})`,
                                k: k,
                                i: i,
                                j: j,
                                matrix: this.copyMatrix(tempMatrix),
                                nextMatrix: this.copyMatrix(tempNext),
                                updates: [{ i, j, oldDistance, newDistance: viaKDistance }],
                                calculation: null
                            });
                        } else {
                            this.steps.push({
                                type: 'no_update',
                                description: `${iNode.id} → ${jNode.id} 保持原距離 ${this.formatDistance(directDistance)}`,
                                k: k,
                                i: i,
                                j: j,
                                matrix: this.copyMatrix(tempMatrix),
                                nextMatrix: this.copyMatrix(tempNext),
                                updates: [],
                                calculation: null
                            });
                        }
                    }
                }
            }

            // 完成這一輪k
            if (roundUpdates.length > 0) {
                this.steps.push({
                    type: 'complete_k',
                    description: `完成第 ${k + 1} 輪，共更新了 ${roundUpdates.length} 個距離`,
                    k: k,
                    i: -1,
                    j: -1,
                    matrix: this.copyMatrix(tempMatrix),
                    nextMatrix: this.copyMatrix(tempNext),
                    updates: roundUpdates,
                    calculation: null
                });
            } else {
                this.steps.push({
                    type: 'complete_k',
                    description: `完成第 ${k + 1} 輪，沒有距離需要更新`,
                    k: k,
                    i: -1,
                    j: -1,
                    matrix: this.copyMatrix(tempMatrix),
                    nextMatrix: this.copyMatrix(tempNext),
                    updates: [],
                    calculation: null
                });
            }
        }

        // 最終步驟 - 負環檢測
        let negativeCycleNodes = [];
        for (let i = 0; i < this.data.nodeCount; i++) {
            if (tempMatrix[i][i] < 0) {
                negativeCycleNodes.push(i);
            }
        }

        if (negativeCycleNodes.length > 0) {
            this.steps.push({
                type: 'negative_cycle_found',
                description: `發現負權重環！節點 ${negativeCycleNodes.map(i => this.data.getNodeByIndex(i).id).join(', ')} 到自己的距離為負數`,
                k: -1,
                i: -1,
                j: -1,
                matrix: this.copyMatrix(tempMatrix),
                nextMatrix: this.copyMatrix(tempNext),
                updates: [],
                calculation: null,
                hasNegativeCycle: true,
                negativeCycleNodes: negativeCycleNodes
            });
        } else {
            this.steps.push({
                type: 'complete',
                description: '演算法完成！沒有負權重環，所有節點對之間的最短距離都已計算完畢',
                k: -1,
                i: -1,
                j: -1,
                matrix: this.copyMatrix(tempMatrix),
                nextMatrix: this.copyMatrix(tempNext),
                updates: [],
                calculation: null,
                hasNegativeCycle: false
            });
        }
    }

    copyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }

    formatDistance(distance) {
        return distance === Infinity ? '∞' : distance.toString();
    }

    getCurrentStep() {
        if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
            return this.steps[this.currentStepIndex];
        }
        return null;
    }

    nextStep() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.applyStep(this.steps[this.currentStepIndex]);
            return true;
        }
        return false;
    }

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.applyStep(this.steps[this.currentStepIndex]);
            return true;
        }
        return false;
    }

    applyStep(step) {
        // 更新數據狀態
        this.data.distanceMatrix = this.copyMatrix(step.matrix);
        this.data.nextMatrix = this.copyMatrix(step.nextMatrix);
        this.data.currentK = step.k;
        this.data.currentI = step.i;
        this.data.currentJ = step.j;
        this.data.hasNegativeCycle = step.hasNegativeCycle || false;
        this.data.negativeCycleNodes = step.negativeCycleNodes || [];
    }

    reset() {
        this.currentStepIndex = -1;
        this.data.reset();
    }

    canGoNext() {
        return this.currentStepIndex < this.steps.length - 1;
    }

    canGoPrev() {
        return this.currentStepIndex > 0;
    }

    isComplete() {
        return this.currentStepIndex === this.steps.length - 1;
    }

    getCurrentStepInfo() {
        const step = this.getCurrentStep();
        if (!step) return null;

        return {
            stepNumber: this.currentStepIndex + 1,
            totalSteps: this.steps.length,
            description: step.description,
            type: step.type,
            k: step.k,
            i: step.i,
            j: step.j,
            updates: step.updates,
            calculation: step.calculation
        };
    }

    autoPlay(callback, speed = 1500) {
        if (this.isComplete()) {
            this.reset();
        }

        const playNextStep = () => {
            if (this.nextStep()) {
                callback();
                if (!this.isComplete()) {
                    setTimeout(playNextStep, speed);
                }
            }
        };

        if (this.currentStepIndex === -1) {
            this.nextStep();
            callback();
            if (!this.isComplete()) {
                setTimeout(playNextStep, speed);
            }
        } else {
            playNextStep();
        }
    }
}