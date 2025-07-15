/**
 * DFS 演算法實作類別
 * 實現深度優先搜尋演算法的視覺化
 */
class DFSAlgorithm {
    constructor(graphStructure, svgRenderer, stackRenderer) {
        this.graph = graphStructure;
        this.svgRenderer = svgRenderer;
        this.stackRenderer = stackRenderer;
        this.isRunning = false;
        this.isPaused = false;
        this.steps = [];
        this.currentStep = 0;
        this.speed = 1000; // 毫秒
        this.visitOrder = [];
        this.timeoutId = null;
    }

    /**
     * 開始 DFS 演算法
     */
    async start(startNode = 'S') {
        if (this.isRunning) return;

        this.reset();
        this.isRunning = true;
        this.visitOrder = [];
        
        // 生成 DFS 步驟
        this.generateSteps(startNode);
        
        // 更新狀態顯示
        this.updateStatus('DFS 開始執行...');
        
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
     * 獲取Stack的顯示陣列
     */
    getDisplayStack(stack) {
        return stack.map(nodeId => this.getDisplayName(nodeId));
    }

    /**
     * 生成 DFS 演算法的所有步驟
     */
    generateSteps(startNode) {
        this.steps = [];
        const visited = new Set();
        const stack = [startNode];
        const adjacencyList = this.graph.getAdjacencyList();

        // 初始化步驟
        this.steps.push({
            type: 'init',
            description: `初始化：將起始節點 ${this.getDisplayName(startNode)} 加入 Stack`,
            stack: this.getDisplayStack([startNode]),
            currentNode: null,
            action: 'push',
            nodeState: { [startNode]: 'inStack' }
        });

        while (stack.length > 0) {
            const currentNode = stack.pop();

            if (!visited.has(currentNode)) {
                // 從 Stack 取出節點
                this.steps.push({
                    type: 'pop',
                    description: `從 Stack 頂端取出節點 ${this.getDisplayName(currentNode)}`,
                    stack: this.getDisplayStack([...stack]),
                    currentNode: this.getDisplayName(currentNode),
                    action: 'pop',
                    nodeState: { [currentNode]: 'current' }
                });

                // 標記為已訪問
                visited.add(currentNode);
                this.visitOrder.push(this.getDisplayName(currentNode));

                this.steps.push({
                    type: 'visit',
                    description: `標記節點 ${this.getDisplayName(currentNode)} 為已訪問`,
                    stack: this.getDisplayStack([...stack]),
                    currentNode: this.getDisplayName(currentNode),
                    action: 'visit',
                    nodeState: { [currentNode]: 'visited' },
                    visitOrder: [...this.visitOrder]
                });

                // 探索鄰接節點（注意：DFS通常以相反順序推入堆疊）
                const neighbors = adjacencyList[currentNode] || [];
                const newNeighbors = neighbors.filter(neighbor => !visited.has(neighbor));

                if (newNeighbors.length > 0) {
                    // 反序推入，這樣字母順序較小的會最先被處理
                    const reversedNeighbors = [...newNeighbors].reverse();
                    reversedNeighbors.forEach(neighbor => {
                        if (!stack.includes(neighbor)) {
                            stack.push(neighbor);
                        }
                    });

                    this.steps.push({
                        type: 'explore',
                        description: `將 ${this.getDisplayName(currentNode)} 的鄰接節點 [${newNeighbors.map(n => this.getDisplayName(n)).join(', ')}] 加入 Stack`,
                        stack: this.getDisplayStack([...stack]),
                        currentNode: this.getDisplayName(currentNode),
                        action: 'explore',
                        neighbors: newNeighbors,
                        nodeState: Object.fromEntries(newNeighbors.map(n => [n, 'inStack'])),
                        visitOrder: [...this.visitOrder]
                    });
                }
            }
        }

        // 完成步驟
        this.steps.push({
            type: 'complete',
            description: 'DFS 演算法執行完成！',
            stack: [],
            currentNode: null,
            action: 'complete',
            visitOrder: [...this.visitOrder]
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
            this.updateStatus('DFS 演算法執行完成！');
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
            node.inStack = false;
            node.current = false;
        });

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

        // 設置堆疊中的節點狀態
        if (step.stack) {
            step.stack.forEach(nodeDisplayName => {
                const nodeId = this.findNodeIdByDisplayName(nodeDisplayName);
                if (nodeId && (!step.nodeState || !step.nodeState[nodeId])) {
                    if (!step.visitOrder || !step.visitOrder.includes(nodeDisplayName)) {
                        this.graph.setNodeState(nodeId, 'inStack');
                    }
                }
            });
        }

        // 更新堆疊顯示
        this.stackRenderer.updateStack(step.stack, step.currentNode);

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
        const nodes = this.graph.getNodes();
        const node = nodes.find(n => this.getDisplayName(n.id) === displayName);
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
                this.updateStatus('DFS 演算法執行完成！');
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

        this.graph.resetGraph(); // 這會清空動態標籤
        this.stackRenderer.clear();
        this.svgRenderer.render();
        this.updateStatus('點擊「開始 DFS」開始搜尋演算法演示');
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
        const statusElement = document.getElementById('dfs-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * 更新訪問順序顯示
     */
    updateVisitOrder(visitOrder, currentNode = null) {
        const container = document.getElementById('dfs-visit-order');
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
        const container = document.getElementById('dfs-visit-order');
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