// Bellman-Ford Algorithm Logic with Progressive Step Visualization
class BellmanFordAlgorithm {
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
            description: `初始化：設定起點 ${this.data.startNode} 的距離為 0，其他節點距離為無限大`,
            round: 0,
            edgeIndex: -1,
            relaxingEdge: null,
            updates: [],
            distances: { ...this.data.distances },
            predecessors: { ...this.data.predecessors },
            calculation: null,
            updatedNodes: new Set()
        });

        // 模擬演算法執行 - 使用漸進式邏輯
        const tempDistances = { ...this.data.distances };
        const tempPredecessors = { ...this.data.predecessors };
        let newlyUpdatedNodes = new Set([this.data.startNode]); // 追蹤每輪新更新的節點

        // V-1 輪鬆弛操作
        for (let round = 1; round <= this.data.maxRounds; round++) {
            // 開始新的一輪
            this.steps.push({
                type: 'start_round',
                description: `開始第 ${round} 輪鬆弛操作（共 ${this.data.maxRounds} 輪）`,
                round: round,
                edgeIndex: -1,
                relaxingEdge: null,
                updates: [],
                distances: { ...tempDistances },
                predecessors: { ...tempPredecessors },
                calculation: null,
                updatedNodes: new Set()
            });

            let roundHasUpdates = false;
            let currentRoundUpdated = new Set();
            let roundUpdates = [];

            // 只檢查從「上輪新更新節點」出發的邊
            this.data.edges.forEach((edge, edgeIndex) => {
                const { from, to, weight } = edge;
                
                // 只有當起點在上輪被更新時，才考慮這條邊
                if (newlyUpdatedNodes.has(from) && tempDistances[from] !== Infinity) {
                    const newDistance = tempDistances[from] + weight;
                    
                    // 創建考慮邊的步驟
                    this.steps.push({
                        type: 'consider_edge',
                        description: `第 ${round} 輪：考慮邊 ${from} → ${to}（權重 ${weight}）`,
                        round: round,
                        edgeIndex: edgeIndex,
                        relaxingEdge: edge,
                        updates: [],
                        distances: { ...tempDistances },
                        predecessors: { ...tempPredecessors },
                        calculation: {
                            from: from,
                            to: to,
                            weight: weight,
                            currentDistance: tempDistances[to],
                            newDistance: newDistance
                        },
                        updatedNodes: new Set()
                    });
                    
                    if (newDistance < tempDistances[to]) {
                        // 執行更新
                        const oldDistance = tempDistances[to];
                        tempDistances[to] = newDistance;
                        tempPredecessors[to] = from;
                        currentRoundUpdated.add(to);
                        roundHasUpdates = true;
                        
                        roundUpdates.push({
                            node: to,
                            oldDistance: oldDistance,
                            newDistance: newDistance,
                            via: from
                        });
                        
                        // 創建更新距離的步驟
                        this.steps.push({
                            type: 'update_distance',
                            description: `✅ 更新成功！${to} = ${newDistance}（經由 ${from}）`,
                            round: round,
                            edgeIndex: edgeIndex,
                            relaxingEdge: edge,
                            updates: [{
                                node: to,
                                oldDistance: oldDistance,
                                newDistance: newDistance,
                                via: from
                            }],
                            distances: { ...tempDistances },
                            predecessors: { ...tempPredecessors },
                            calculation: {
                                from: from,
                                to: to,
                                weight: weight,
                                currentDistance: oldDistance,
                                newDistance: newDistance
                            },
                            updatedNodes: new Set([to])
                        });
                    } else {
                        // 無需更新
                        this.steps.push({
                            type: 'no_update',
                            description: `❌ 無法改善：${newDistance} ≥ ${tempDistances[to]}，保持原距離`,
                            round: round,
                            edgeIndex: edgeIndex,
                            relaxingEdge: edge,
                            updates: [],
                            distances: { ...tempDistances },
                            predecessors: { ...tempPredecessors },
                            calculation: {
                                from: from,
                                to: to,
                                weight: weight,
                                currentDistance: tempDistances[to],
                                newDistance: newDistance
                            },
                            updatedNodes: new Set()
                        });
                    }
                }
            });

            // 輪次完成
            if (roundHasUpdates) {
                this.steps.push({
                    type: 'round_complete',
                    description: `第 ${round} 輪完成：更新了節點 ${Array.from(currentRoundUpdated).join(', ')}`,
                    round: round,
                    edgeIndex: -1,
                    relaxingEdge: null,
                    updates: roundUpdates,
                    distances: { ...tempDistances },
                    predecessors: { ...tempPredecessors },
                    calculation: null,
                    updatedNodes: currentRoundUpdated
                });
                
                // 為下一輪準備
                newlyUpdatedNodes = currentRoundUpdated;
            } else {
                this.steps.push({
                    type: 'round_complete',
                    description: `第 ${round} 輪完成：沒有更新，算法提前收斂`,
                    round: round,
                    edgeIndex: -1,
                    relaxingEdge: null,
                    updates: [],
                    distances: { ...tempDistances },
                    predecessors: { ...tempPredecessors },
                    calculation: null,
                    updatedNodes: new Set()
                });
                break;
            }
        }

        // 負環檢測（第 V 輪）
        this.steps.push({
            type: 'negative_cycle_check',
            description: '開始負環檢測：檢查是否還有邊可以被鬆弛',
            round: this.data.maxRounds + 1,
            edgeIndex: -1,
            relaxingEdge: null,
            updates: [],
            distances: { ...tempDistances },
            predecessors: { ...tempPredecessors },
            calculation: null,
            updatedNodes: new Set()
        });

        let hasNegativeCycle = false;
        const negativeCycleEdges = [];

        this.data.edges.forEach(edge => {
            const { from, to, weight } = edge;
            if (tempDistances[from] !== Infinity && tempDistances[from] + weight < tempDistances[to]) {
                hasNegativeCycle = true;
                negativeCycleEdges.push(edge);
            }
        });

        if (hasNegativeCycle) {
            this.steps.push({
                type: 'negative_cycle_detected',
                description: `⚠️ 發現負權重環！以下邊仍可被鬆弛：${negativeCycleEdges.map(e => `${e.from}→${e.to}`).join(', ')}`,
                round: this.data.maxRounds + 1,
                edgeIndex: -1,
                relaxingEdge: null,
                updates: [],
                distances: { ...tempDistances },
                predecessors: { ...tempPredecessors },
                calculation: null,
                updatedNodes: new Set(),
                hasNegativeCycle: true,
                negativeCycleEdges: negativeCycleEdges
            });
        } else {
            this.steps.push({
                type: 'algorithm_complete',
                description: '✅ 算法完成！沒有發現負權重環，所有最短距離已找到',
                round: this.data.maxRounds + 1,
                edgeIndex: -1,
                relaxingEdge: null,
                updates: [],
                distances: { ...tempDistances },
                predecessors: { ...tempPredecessors },
                calculation: null,
                updatedNodes: new Set(),
                hasNegativeCycle: false
            });
        }
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
        if (this.currentStepIndex > -1) {
            this.currentStepIndex--;
            if (this.currentStepIndex >= 0) {
                this.applyStep(this.steps[this.currentStepIndex]);
            } else {
                // 回到初始狀態
                this.data.reset();
            }
            return true;
        }
        return false;
    }

    applyStep(step) {
        // 更新數據狀態
        this.data.distances = { ...step.distances };
        this.data.predecessors = { ...step.predecessors };
        this.data.currentRound = step.round;
        this.data.relaxingEdge = step.relaxingEdge;
        this.data.hasNegativeCycle = step.hasNegativeCycle || false;
        
        // 更新已更新節點的集合
        if (step.updatedNodes) {
            this.data.updatedNodes = new Set(step.updatedNodes);
        }
    }

    reset() {
        this.currentStepIndex = -1;
        this.data.reset();
    }

    getCurrentStepInfo() {
        if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
            const step = this.steps[this.currentStepIndex];
            return {
                stepNumber: this.currentStepIndex + 1,
                totalSteps: this.steps.length,
                description: step.description,
                type: step.type,
                round: step.round,
                relaxingEdge: step.relaxingEdge,
                updates: step.updates,
                calculation: step.calculation,
                hasNegativeCycle: step.hasNegativeCycle || false
            };
        }
        return null;
    }

    canGoNext() {
        return this.currentStepIndex < this.steps.length - 1;
    }

    canGoPrev() {
        return this.currentStepIndex >= 0;
    }

    isComplete() {
        return this.currentStepIndex >= this.steps.length - 1;
    }

    autoPlay(callback, delay = 1000) {
        const playStep = () => {
            if (this.nextStep()) {
                callback();
                if (!this.isComplete()) {
                    setTimeout(playStep, delay);
                }
            }
        };
        playStep();
    }
}
