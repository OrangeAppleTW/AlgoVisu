// Dijkstra Algorithm Logic
class DijkstraAlgorithm {
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
            description: '初始化：設定起點 A 的距離為 0，其他節點距離為無限大',
            currentNode: 'A',
            updates: [],
            distances: { ...this.data.distances },
            previous: { ...this.data.previous },
            visited: new Set(this.data.visited),
            unvisited: new Set(this.data.unvisited),
            consideringEdges: []
        });

        // 模擬演算法執行
        const tempData = {
            distances: { ...this.data.distances },
            previous: { ...this.data.previous },
            visited: new Set(),
            unvisited: new Set(this.data.unvisited)
        };

        while (tempData.unvisited.size > 0) {
            // 找到距離最小的未訪問節點
            let minDistance = Infinity;
            let currentNode = null;
            
            for (const node of tempData.unvisited) {
                if (tempData.distances[node] < minDistance) {
                    minDistance = tempData.distances[node];
                    currentNode = node;
                }
            }

            if (currentNode === null || tempData.distances[currentNode] === Infinity) {
                break; // 沒有可達的節點
            }

            // 選擇當前節點
            this.steps.push({
                type: 'select',
                description: `選擇距離最小的未處理節點：${currentNode} (距離: ${tempData.distances[currentNode]})`,
                currentNode: currentNode,
                updates: [],
                distances: { ...tempData.distances },
                previous: { ...tempData.previous },
                visited: new Set(tempData.visited),
                unvisited: new Set(tempData.unvisited),
                consideringEdges: []
            });

            // 獲取鄰居節點
            const neighbors = this.data.getNeighbors(currentNode);
            
            if (neighbors.length > 0) {
                // 顯示正在考慮的邊
                const consideringEdges = neighbors.map(neighbor => ({
                    from: currentNode,
                    to: neighbor.node,
                    weight: neighbor.weight
                }));

                this.steps.push({
                    type: 'consider',
                    description: `探訪節點 ${currentNode} 的鄰居：${neighbors.map(n => `${n.node}(權重:${n.weight})`).join(', ')}`,
                    currentNode: currentNode,
                    updates: [],
                    distances: { ...tempData.distances },
                    previous: { ...tempData.previous },
                    visited: new Set(tempData.visited),
                    unvisited: new Set(tempData.unvisited),
                    consideringEdges: consideringEdges
                });

                // 計算鄰居的新距離（顯示計算過程）
                const calculations = [];
                neighbors.forEach(neighbor => {
                    const currentDistance = tempData.distances[currentNode];
                    const edgeWeight = neighbor.weight;
                    calculations.push({
                        node: neighbor.node,
                        calculation: `${currentDistance} + ${edgeWeight}`,
                        result: currentDistance + edgeWeight,
                        currentBest: tempData.distances[neighbor.node]
                    });
                });

                console.log(`產生計算步驟給節點 ${currentNode}, 鄰居:`, calculations);

                this.steps.push({
                    type: 'calculate',
                    description: `計算新距離：${calculations.map(c => `${c.node}: ${c.calculation} = ${c.result}`).join(', ')}`,
                    currentNode: currentNode,
                    updates: [],
                    distances: { ...tempData.distances },
                    previous: { ...tempData.previous },
                    visited: new Set(tempData.visited),
                    unvisited: new Set(tempData.unvisited),
                    consideringEdges: consideringEdges,
                    calculations: calculations
                });

                // 更新鄰居的距離
                const updates = [];
                neighbors.forEach(neighbor => {
                    const newDistance = tempData.distances[currentNode] + neighbor.weight;
                    if (newDistance < tempData.distances[neighbor.node]) {
                        const oldDistance = tempData.distances[neighbor.node];
                        tempData.distances[neighbor.node] = newDistance;
                        tempData.previous[neighbor.node] = currentNode;
                        
                        updates.push({
                            node: neighbor.node,
                            oldDistance: oldDistance,
                            newDistance: newDistance,
                            via: currentNode
                        });
                    }
                });

                if (updates.length > 0) {
                    this.steps.push({
                        type: 'update',
                        description: `更新距離：${updates.map(u => `${u.node}: ${this.formatDistance(u.oldDistance)} → ${u.newDistance} (經由 ${u.via})`).join(', ')}`,
                        currentNode: currentNode,
                        updates: updates,
                        distances: { ...tempData.distances },
                        previous: { ...tempData.previous },
                        visited: new Set(tempData.visited),
                        unvisited: new Set(tempData.unvisited),
                        consideringEdges: []
                    });
                } else {
                    this.steps.push({
                        type: 'no_update',
                        description: `沒有更短的路徑，距離保持不變`,
                        currentNode: currentNode,
                        updates: [],
                        distances: { ...tempData.distances },
                        previous: { ...tempData.previous },
                        visited: new Set(tempData.visited),
                        unvisited: new Set(tempData.unvisited),
                        consideringEdges: []
                    });
                }
            }

            // 標記節點為已訪問
            tempData.visited.add(currentNode);
            tempData.unvisited.delete(currentNode);

            this.steps.push({
                type: 'visit',
                description: `將節點 ${currentNode} 標記為已處理，其最短距離已確定`,
                currentNode: currentNode,
                updates: [],
                distances: { ...tempData.distances },
                previous: { ...tempData.previous },
                visited: new Set(tempData.visited),
                unvisited: new Set(tempData.unvisited),
                consideringEdges: []
            });
        }

        // 最終步驟
        this.steps.push({
            type: 'complete',
            description: '演算法完成！所有節點的最短距離都已計算完畢',
            currentNode: null,
            updates: [],
            distances: { ...tempData.distances },
            previous: { ...tempData.previous },
            visited: new Set(tempData.visited),
            unvisited: new Set(tempData.unvisited),
            consideringEdges: []
        });
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
        this.data.distances = { ...step.distances };
        this.data.previous = { ...step.previous };
        this.data.visited = new Set(step.visited);
        this.data.unvisited = new Set(step.unvisited);
        this.data.currentNode = step.currentNode;
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
            updates: step.updates,
            consideringEdges: step.consideringEdges,
            calculations: step.calculations  // 添加計算資料
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