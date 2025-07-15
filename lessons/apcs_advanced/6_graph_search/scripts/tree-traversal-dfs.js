/**
 * 樹遍歷 DFS 演算法實作類別
 * 實現前序、中序、後序三種遍歷方式
 */
class TreeTraversalDFS {
    constructor(treeStructure, svgRenderer, stackRenderer) {
        this.tree = treeStructure;
        this.svgRenderer = svgRenderer;
        this.stackRenderer = stackRenderer;
        this.isRunning = false;
        this.isPaused = false;
        this.steps = [];
        this.currentStep = 0;
        this.speed = 1000; // 毫秒
        this.visitOrder = [];
        this.timeoutId = null;
        this.traversalType = 'preorder'; // 預設前序
    }

    /**
     * 設置遍歷類型
     */
    setTraversalType(type) {
        this.traversalType = type;
    }

    /**
     * 開始樹遍歷
     */
    async start(startNode = 'S') {
        if (this.isRunning) return;

        this.reset();
        this.isRunning = true;
        this.visitOrder = [];
        
        // 根據遍歷類型生成步驟
        this.generateTraversalSteps(startNode);
        
        // 更新狀態顯示
        this.updateStatus(`${this.getTraversalName()} 開始執行...`);
        
        // 開始執行步驟
        await this.executeSteps();
    }

    /**
     * 獲取遍歷名稱
     */
    getTraversalName() {
        const names = {
            'preorder': '前序遍歷',
            'inorder': '中序遍歷',
            'postorder': '後序遍歷'
        };
        return names[this.traversalType] || '樹遍歷';
    }

    /**
     * 獲取節點的顯示名稱
     */
    getDisplayName(nodeId) {
        if (nodeId === 'S') return 'S';
        const node = this.tree.getNode(nodeId);
        return node && node.label ? node.label : nodeId;
    }

    /**
     * 根據標籤映射獲取節點的顯示名稱
     */
    getDisplayNameWithLabels(nodeId, labelMap) {
        if (nodeId === 'S') return 'S';
        return labelMap.get(nodeId) || nodeId;
    }

    /**
     * 根據標籤映射獲取Stack的顯示陣列
     */
    getDisplayStackWithLabels(stack, labelMap) {
        return stack.map(nodeId => this.getDisplayNameWithLabels(nodeId, labelMap));
    }

    /**
     * 生成遍歷步驟
     */
    generateTraversalSteps(startNode) {
        this.steps = [];
        const nodeLabels = new Map();
        let visitCounter = 0;

        // 根據遍歷類型選擇算法
        if (this.traversalType === 'preorder') {
            this.generatePreorderSteps(startNode, nodeLabels, visitCounter);
        } else if (this.traversalType === 'inorder') {
            this.generateInorderSteps(startNode, nodeLabels, visitCounter);
        } else if (this.traversalType === 'postorder') {
            this.generatePostorderSteps(startNode, nodeLabels, visitCounter);
        }

        // 完成步驟
        this.steps.push({
            type: 'complete',
            description: `${this.getTraversalName()} 演算法執行完成！`,
            stack: [],
            currentNode: null,
            action: 'complete',
            visitOrder: [...this.visitOrder],
            nodeLabels: new Map(nodeLabels)
        });
    }

    /**
     * 生成前序遍歷步驟（遞迴模擬）
     */
    generatePreorderSteps(startNode, nodeLabels, visitCounter) {
        const stack = [startNode];
        
        // 初始化步驟
        this.steps.push({
            type: 'init',
            description: `前序遍歷：根 → 左 → 右`,
            stack: [startNode],
            currentNode: null,
            action: 'init',
            nodeState: { [startNode]: 'inStack' },
            nodeLabels: new Map(nodeLabels)
        });

        while (stack.length > 0) {
            const currentNode = stack.pop();

            // 訪問當前節點
            if (currentNode !== startNode && !nodeLabels.has(currentNode)) {
                const label = String.fromCharCode(65 + visitCounter);
                nodeLabels.set(currentNode, label);
                visitCounter++;
            }

            this.steps.push({
                type: 'visit',
                description: `訪問節點 ${this.getDisplayNameWithLabels(currentNode, nodeLabels)}`,
                stack: this.getDisplayStackWithLabels([...stack], nodeLabels),
                currentNode: this.getDisplayNameWithLabels(currentNode, nodeLabels),
                action: 'visit',
                nodeState: { [currentNode]: 'current' },
                nodeLabels: new Map(nodeLabels)
            });

            this.visitOrder.push(this.getDisplayNameWithLabels(currentNode, nodeLabels));

            this.steps.push({
                type: 'visited',
                description: `完成訪問節點 ${this.getDisplayNameWithLabels(currentNode, nodeLabels)}`,
                stack: this.getDisplayStackWithLabels([...stack], nodeLabels),
                currentNode: this.getDisplayNameWithLabels(currentNode, nodeLabels),
                action: 'visited',
                nodeState: { [currentNode]: 'visited' },
                visitOrder: [...this.visitOrder],
                nodeLabels: new Map(nodeLabels)
            });

            // 前序：先右子樹再左子樹（因為堆疊後進先出）
            const rightChild = this.tree.getRightChild(currentNode);
            const leftChild = this.tree.getLeftChild(currentNode);

            if (rightChild) {
                stack.push(rightChild);
                if (!nodeLabels.has(rightChild)) {
                    const label = String.fromCharCode(65 + visitCounter);
                    nodeLabels.set(rightChild, label);
                    visitCounter++;
                }
            }
            if (leftChild) {
                stack.push(leftChild);
                if (!nodeLabels.has(leftChild)) {
                    const label = String.fromCharCode(65 + visitCounter);
                    nodeLabels.set(leftChild, label);
                    visitCounter++;
                }
            }

            if (stack.length > 0) {
                this.steps.push({
                    type: 'push',
                    description: `將子節點加入堆疊`,
                    stack: this.getDisplayStackWithLabels([...stack], nodeLabels),
                    currentNode: null,
                    action: 'push',
                    nodeState: Object.fromEntries(stack.map(n => [n, 'inStack'])),
                    visitOrder: [...this.visitOrder],
                    nodeLabels: new Map(nodeLabels)
                });
            }
        }
    }

    /**
     * 生成中序遍歷步驟
     */
    generateInorderSteps(startNode, nodeLabels, visitCounter) {
        // 中序遍歷的實作 (左 → 根 → 右)
        // 這裡簡化實作，實際應該模擬遞迴過程
        const result = [];
        this.inorderTraversal(startNode, result);
        
        this.steps.push({
            type: 'init',
            description: `中序遍歷：左 → 根 → 右`,
            stack: [],
            currentNode: null,
            action: 'init',
            nodeState: {},
            nodeLabels: new Map(nodeLabels)
        });

        result.forEach((nodeId, index) => {
            if (nodeId !== startNode && !nodeLabels.has(nodeId)) {
                const label = String.fromCharCode(65 + visitCounter);
                nodeLabels.set(nodeId, label);
                visitCounter++;
            }

            this.visitOrder.push(this.getDisplayNameWithLabels(nodeId, nodeLabels));

            this.steps.push({
                type: 'visit',
                description: `中序訪問節點 ${this.getDisplayNameWithLabels(nodeId, nodeLabels)}`,
                stack: [],
                currentNode: this.getDisplayNameWithLabels(nodeId, nodeLabels),
                action: 'visit',
                nodeState: { [nodeId]: 'current' },
                visitOrder: [...this.visitOrder],
                nodeLabels: new Map(nodeLabels)
            });

            this.steps.push({
                type: 'visited',
                description: `完成訪問節點 ${this.getDisplayNameWithLabels(nodeId, nodeLabels)}`,
                stack: [],
                currentNode: this.getDisplayNameWithLabels(nodeId, nodeLabels),
                action: 'visited',
                nodeState: { [nodeId]: 'visited' },
                visitOrder: [...this.visitOrder],
                nodeLabels: new Map(nodeLabels)
            });
        });
    }

    /**
     * 中序遍歷輔助函數
     */
    inorderTraversal(nodeId, result) {
        if (!nodeId) return;
        
        const leftChild = this.tree.getLeftChild(nodeId);
        const rightChild = this.tree.getRightChild(nodeId);
        
        if (leftChild) this.inorderTraversal(leftChild, result);
        result.push(nodeId);
        if (rightChild) this.inorderTraversal(rightChild, result);
    }

    /**
     * 生成後序遍歷步驟
     */
    generatePostorderSteps(startNode, nodeLabels, visitCounter) {
        // 後序遍歷的實作 (左 → 右 → 根)
        const result = [];
        const counterObj = { value: visitCounter };
        this.postorderTraversal(startNode, result, nodeLabels, counterObj);
        
        this.steps.push({
            type: 'init',
            description: `後序遍歷：左 → 右 → 根`,
            stack: [],
            currentNode: null,
            action: 'init',
            nodeState: {},
            nodeLabels: new Map(nodeLabels)
        });

        result.forEach((nodeId, index) => {
            this.visitOrder.push(this.getDisplayNameWithLabels(nodeId, nodeLabels));

            this.steps.push({
                type: 'visit',
                description: `後序訪問節點 ${this.getDisplayNameWithLabels(nodeId, nodeLabels)}`,
                stack: [],
                currentNode: this.getDisplayNameWithLabels(nodeId, nodeLabels),
                action: 'visit',
                nodeState: { [nodeId]: 'current' },
                visitOrder: [...this.visitOrder],
                nodeLabels: new Map(nodeLabels)
            });

            this.steps.push({
                type: 'visited',
                description: `完成訪問節點 ${this.getDisplayNameWithLabels(nodeId, nodeLabels)}`,
                stack: [],
                currentNode: this.getDisplayNameWithLabels(nodeId, nodeLabels),
                action: 'visited',
                nodeState: { [nodeId]: 'visited' },
                visitOrder: [...this.visitOrder],
                nodeLabels: new Map(nodeLabels)
            });
        });
    }

    /**
     * 後序遍歷輔助函數
     */
    postorderTraversal(nodeId, result, nodeLabels, visitCounter) {
        if (!nodeId) return;
        
        const leftChild = this.tree.getLeftChild(nodeId);
        const rightChild = this.tree.getRightChild(nodeId);
        
        if (leftChild) this.postorderTraversal(leftChild, result, nodeLabels, visitCounter);
        if (rightChild) this.postorderTraversal(rightChild, result, nodeLabels, visitCounter);
        
        // 為節點分配標籤
        if (nodeId !== 'S' && !nodeLabels.has(nodeId)) {
            const label = String.fromCharCode(65 + visitCounter.value);
            nodeLabels.set(nodeId, label);
            visitCounter.value++;
        }
        
        result.push(nodeId);
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
            this.updateStatus(`${this.getTraversalName()} 演算法執行完成！`);
        }
    }

    /**
     * 執行單個步驟
     */
    async executeStep(step) {
        // 更新狀態描述
        this.updateStatus(step.description);

        // 重置所有節點狀態和標籤
        this.tree.getNodes().forEach(node => {
            node.visited = false;
            node.inStack = false;
            node.current = false;
            // 清空非起始節點的標籤
            if (!node.isStartNode) {
                node.label = '';
            }
        });

        // 重置所有邊線狀態
        this.tree.getEdges().forEach(edge => {
            edge.active = false;
            edge.traversed = false;
        });

        // 根據步驟的標籤映射更新節點標籤
        if (step.nodeLabels) {
            step.nodeLabels.forEach((label, nodeId) => {
                this.tree.addNodeLabelDirectly(nodeId, label);
            });
        }

        // 設置節點狀態
        if (step.nodeState) {
            Object.entries(step.nodeState).forEach(([nodeId, state]) => {
                this.tree.setNodeState(nodeId, state);
            });
        }

        // 設置所有已訪問的節點和邊線
        if (step.visitOrder) {
            step.visitOrder.forEach((displayName, index) => {
                // 找到對應的節點 ID
                const nodeId = this.findNodeIdByDisplayName(displayName, step.nodeLabels);
                if (nodeId && (!step.nodeState || !step.nodeState[nodeId])) {
                    this.tree.setNodeState(nodeId, 'visited');
                }
            });
            
            // 設置已遍歷的邊線（根據樹的父子關係）
            this.setTraversedEdges(step.visitOrder, step.nodeLabels, step.currentNode);
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
    findNodeIdByDisplayName(displayName, nodeLabels) {
        if (displayName === 'S') return 'S';
        
        // 在標籤映射中查找
        for (let [nodeId, label] of nodeLabels) {
            if (label === displayName) {
                return nodeId;
            }
        }
        
        return null;
    }

    /**
     * 設置已遍歷的邊線（根據樹的父子關係）
     */
    setTraversedEdges(visitOrder, nodeLabels, currentNode) {
        const visitedNodes = new Set();
        
        visitOrder.forEach(displayName => {
            const nodeId = this.findNodeIdByDisplayName(displayName, nodeLabels);
            if (nodeId) {
                visitedNodes.add(nodeId);
                
                // 查找父節點，如果父節點也已訪問，則設置邊線為已遍歷
                const parentId = this.findParentNode(nodeId);
                if (parentId && visitedNodes.has(parentId)) {
                    // 如果是當前節點，設為 active，否則設為 traversed
                    const isCurrentEdge = (displayName === currentNode);
                    this.tree.setEdgeState(parentId, nodeId, isCurrentEdge ? 'active' : 'traversed');
                }
            }
        });
    }

    /**
     * 找到節點的父節點
     */
    findParentNode(nodeId) {
        // 根據樹結構找到父節點
        const parentMap = {
            'node_A': 'S',
            'node_B': 'S', 
            'node_C': 'node_A',
            'node_D': 'node_B',
            'node_E': 'node_B'
        };
        
        return parentMap[nodeId] || null;
    }

    /**
     * 單步執行
     */
    async step() {
        if (this.steps.length === 0) {
            this.generateTraversalSteps('S');
        }
        
        if (this.currentStep < this.steps.length) {
            await this.executeStep(this.steps[this.currentStep]);
            this.currentStep++;
            
            if (this.currentStep >= this.steps.length) {
                this.isRunning = false;
                this.updateStatus(`${this.getTraversalName()} 演算法執行完成！`);
            }
        }
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

        this.tree.resetTree();
        this.stackRenderer.clear();
        this.svgRenderer.render();
        this.updateStatus(`點擊「開始${this.getTraversalName()}」開始演算法演示`);
        this.clearVisitOrder();
    }

    /**
     * 設置執行速度
     */
    setSpeed(speed) {
        this.speed = 2000 - (speed * 180);
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
}