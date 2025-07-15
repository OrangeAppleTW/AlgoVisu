/**
 * BFS 演算法實作類別
 * 實現廣度優先搜尋演算法的視覺化
 */
class BFSAlgorithm {
    constructor(graphStructure, svgRenderer, queueRenderer) {
        this.graph = graphStructure;
        this.svgRenderer = svgRenderer;
        this.queueRenderer = queueRenderer;
        this.isRunning = false;
        this.isPaused = false;
        this.steps = [];
        this.currentStep = 0;
        this.speed = 1000; // 毫秒
        this.visitOrder = [];
        this.timeoutId = null;
    }

    /**
     * 開始 BFS 演算法
     */
    async start(startNode = 'S') {
        if (this.isRunning) return;

        this.reset();
        this.isRunning = true;
        this.visitOrder = [];
        
        // 生成 BFS 步驟
        this.generateSteps(startNode);
        
        // 更新狀態顯示
        this.updateStatus('BFS 開始執行...');
        
        // 開始執行步驟
        await this.executeSteps();
    }

    /**
     * 獲取節點的顯示名稱（使用固定標籤）
     */
    getDisplayName(nodeId) {
        const node = this.graph.getNode(nodeId);
        return node && node.label ? node.label : nodeId;
    }

    /**
     * 獲取Queue的顯示陣列
     */
    getDisplayQueue(queue) {
        return queue.map(nodeId => this.getDisplayName(nodeId));
    }

    /**
     * 生成 BFS 演算法的所有步驟
     */
    generateSteps(startNode) {
        this.steps = [];
        const visited = new Set();
        const queue = [startNode];
        const adjacencyList = this.graph.getAdjacencyList();
        let labelCounter = 0; // 用於分配 A-F 標籤
        const nodeLabels = new Map(); // 儲存節點標籤映射
        const labeledNodes = new Set(); // 追蹤已經顯示標籤的節點

        // S節點一開始就顯示
        labeledNodes.add(startNode);

        // 初始化步驟
        this.steps.push({
            type: 'init',
            description: `初始化：將起始節點 ${this.getDisplayName(startNode)} 加入 Queue`,
            queue: [this.getDisplayName(startNode)],
            currentNode: null,
            action: 'enqueue',
            nodeState: { [startNode]: 'inQueue' },
            nodeLabels: new Map(),
            showLabels: new Set([startNode]) // S節點一開始就顯示
        });

        while (queue.length > 0) {
            const currentNode = queue.shift();

            if (!visited.has(currentNode)) {
                // 從 Queue 取出節點
                const currentDisplayName = nodeLabels.get(currentNode) || this.getDisplayName(currentNode);
                this.steps.push({
                    type: 'dequeue',
                    description: `從 Queue 前端取出節點 ${currentDisplayName}`,
                    queue: queue.map(nodeId => nodeLabels.get(nodeId) || this.getDisplayName(nodeId)),
                    currentNode: currentDisplayName,
                    action: 'dequeue',
                    nodeState: { [currentNode]: 'current' },
                    nodeLabels: new Map(nodeLabels),
                    showLabels: new Set(labeledNodes)
                });

                // 標記為已訪問
                visited.add(currentNode);
                this.visitOrder.push(currentDisplayName);

                this.steps.push({
                    type: 'visit',
                    description: `標記節點 ${currentDisplayName} 為已訪問`,
                    queue: queue.map(nodeId => nodeLabels.get(nodeId) || this.getDisplayName(nodeId)),
                    currentNode: currentDisplayName,
                    action: 'visit',
                    nodeState: { [currentNode]: 'visited' },
                    visitOrder: [...this.visitOrder],
                    nodeLabels: new Map(nodeLabels),
                    showLabels: new Set(labeledNodes)
                });

                // 探索鄰接節點（按照從左到右的順序）
                const neighbors = adjacencyList[currentNode] || [];
                
                // 按照 x 座標排序（從左到右），優先處理左邊的節點
                const sortedNeighbors = neighbors.filter(neighbor => !visited.has(neighbor) && !queue.includes(neighbor))
                    .sort((a, b) => {
                        const nodeA = this.graph.getNode(a);
                        const nodeB = this.graph.getNode(b);
                        return nodeA.x - nodeB.x; // 按 x 座標排序（左到右）
                    });

                if (sortedNeighbors.length > 0) {
                    // 為新鄰接節點分配標籤並加入queue
                    const newlyLabeledNodes = [];
                    sortedNeighbors.forEach(neighbor => {
                        if (!nodeLabels.has(neighbor) && neighbor !== startNode) {
                            const label = String.fromCharCode(65 + labelCounter); // A, B, C...
                            nodeLabels.set(neighbor, label);
                            labeledNodes.add(neighbor); // 加入Queue時立即顯示標籤
                            newlyLabeledNodes.push(neighbor);
                            labelCounter++;
                        }
                        queue.push(neighbor);
                    });

                    const neighborDisplayNames = sortedNeighbors.map(n => nodeLabels.get(n) || this.getDisplayName(n));
                    
                    this.steps.push({
                        type: 'explore',
                        description: `將 ${currentDisplayName} 的鄰接節點 [${neighborDisplayNames.join(', ')}] 加入 Queue`,
                        queue: queue.map(nodeId => nodeLabels.get(nodeId) || this.getDisplayName(nodeId)),
                        currentNode: currentDisplayName,
                        action: 'explore',
                        neighbors: sortedNeighbors,
                        nodeState: Object.fromEntries(sortedNeighbors.map(n => [n, 'inQueue'])),
                        visitOrder: [...this.visitOrder],
                        nodeLabels: new Map(nodeLabels),
                        showLabels: new Set(labeledNodes), // 新加入Queue的節點現在顯示標籤
                        newlyDiscovered: sortedNeighbors // 新發現的節點
                    });
                }
            }
        }

        // 完成步驟
        this.steps.push({
            type: 'complete',
            description: 'BFS 演算法執行完成！',
            queue: [],
            currentNode: null,
            action: 'complete',
            visitOrder: [...this.visitOrder],
            nodeLabels: new Map(nodeLabels),
            showLabels: new Set(labeledNodes)
        });
    }

    /**
     * 執行所有步驟
     */
    async executeSteps() {
        for (let i = 0; i < this.steps.length && this.isRunning; i++) {
            if (this.isPaused) {
                await this.waitForResume();
            }

            this.currentStep = i;
            await this.executeStep(this.steps[i]);
            
            if (i < this.steps.length - 1) {
                await this.delay(this.speed);
            }
        }

        if (this.isRunning) {
            this.isRunning = false;
            this.updateStatus('BFS 演算法執行完成！');
        }
    }

    /**
     * 執行單個步驟
     */
    async executeStep(step) {
        // 更新狀態描述
        this.updateStatus(step.description);

        // 重置所有節點狀態
        this.graph.getNodes().forEach(node => {
            node.visited = false;
            node.inQueue = false;
            node.current = false;
        });

        // 根據步驟更新標籤顯示狀態
        if (step.showLabels) {
            this.graph.getNodes().forEach(node => {
                if (step.showLabels.has(node.id)) {
                    this.graph.showNodeLabel(node.id);
                } else if (!node.isStartNode) {
                    this.graph.hideNodeLabel(node.id);
                }
            });
        }

        // 設置節點狀態
        if (step.nodeState) {
            Object.entries(step.nodeState).forEach(([nodeId, state]) => {
                this.graph.setNodeState(nodeId, state);
            });
        }

        // 設置所有已訪問的節點
        if (step.visitOrder) {
            step.visitOrder.forEach(nodeDisplayName => {
                // 找到對應的節點 ID
                const nodeId = this.findNodeIdByDisplayName(nodeDisplayName);
                if (nodeId && (!step.nodeState || !step.nodeState[nodeId])) {
                    this.graph.setNodeState(nodeId, 'visited');
                }
            });
        }

        // 設置佇列中的節點狀態
        if (step.queue) {
            step.queue.forEach(nodeDisplayName => {
                const nodeId = this.findNodeIdByDisplayName(nodeDisplayName);
                if (nodeId && (!step.nodeState || !step.nodeState[nodeId])) {
                    if (!step.visitOrder || !step.visitOrder.includes(nodeDisplayName)) {
                        this.graph.setNodeState(nodeId, 'inQueue');
                    }
                }
            });
        }

        // 更新佇列顯示
        this.queueRenderer.updateQueue(step.queue, step.currentNode);

        // 更新圖形顯示
        this.svgRenderer.render();

        // 更新訪問順序顯示
        if (step.visitOrder) {
            this.updateVisitOrder(step.visitOrder, step.currentNode);
        }
    }

    /**
     * 根據顯示名稱找到節點 ID
     */
    findNodeIdByDisplayName(displayName) {
        // 先檢查是否是起始節點 S
        if (displayName === 'S') {
            return 'S';
        }
        
        // 然後檢查其他節點的 fixedLabel
        const nodes = this.graph.getNodes();
        const node = nodes.find(n => n.fixedLabel === displayName);
        return node ? node.id : null;
    }

    /**
     * 單步執行
     */
    async step() {
        if (this.steps.length === 0) {
            // 如果還沒有生成步驟，先生成
            this.generateSteps('S');
        }
        
        if (this.currentStep < this.steps.length) {
            await this.executeStep(this.steps[this.currentStep]);
            this.currentStep++;
            
            if (this.currentStep >= this.steps.length) {
                this.isRunning = false;
                this.updateStatus('BFS 演算法執行完成！');
            }
        }
    }

    /**
     * 暫停執行
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * 繼續執行
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * 重置演算法
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.steps = [];
        this.visitOrder = [];
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        this.graph.resetGraph();
        this.queueRenderer.clear();
        this.svgRenderer.render();
        this.updateStatus('點擊「開始 BFS」開始搜尋演算法演示');
        this.clearVisitOrder();
    }

    /**
     * 設置執行速度
     */
    setSpeed(speed) {
        // speed 範圍 1-10，轉換為毫秒（速度越高，延遲越短）
        this.speed = 2000 - (speed * 180); // 從 1820ms 到 200ms
    }

    /**
     * 延遲函數
     */
    delay(ms) {
        return new Promise(resolve => {
            this.timeoutId = setTimeout(resolve, ms);
        });
    }

    /**
     * 等待恢復執行
     */
    waitForResume() {
        return new Promise(resolve => {
            const checkResume = () => {
                if (!this.isPaused) {
                    resolve();
                } else {
                    setTimeout(checkResume, 100);
                }
            };
            checkResume();
        });
    }

    /**
     * 更新狀態顯示
     */
    updateStatus(message) {
        const statusElement = document.getElementById('bfs-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * 更新訪問順序顯示
     */
    updateVisitOrder(visitOrder, currentNode = null) {
        const container = document.getElementById('bfs-visit-order');
        if (!container) return;

        container.innerHTML = '';

        visitOrder.forEach((node, index) => {
            if (index > 0) {
                const arrow = document.createElement('span');
                arrow.className = 'visit-arrow';
                arrow.textContent = '→';
                container.appendChild(arrow);
            }

            const nodeElement = document.createElement('span');
            nodeElement.className = 'visit-node';
            if (node === currentNode) {
                nodeElement.classList.add('current');
            }
            nodeElement.textContent = node;
            container.appendChild(nodeElement);
        });
    }

    /**
     * 清除訪問順序顯示
     */
    clearVisitOrder() {
        const container = document.getElementById('bfs-visit-order');
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * 檢查是否正在運行
     */
    getIsRunning() {
        return this.isRunning;
    }

    /**
     * 檢查是否已暫停
     */
    getIsPaused() {
        return this.isPaused;
    }

    /**
     * 獲取當前步驟
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * 獲取總步驟數
     */
    getTotalSteps() {
        return this.steps.length;
    }
}
