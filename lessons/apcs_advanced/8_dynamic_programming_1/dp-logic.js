// 重新設計的動態規劃演算法邏輯和視覺化
class DynamicProgrammingVisualizer {
    constructor(treeViz) {
        this.tree = treeViz;
        this.steps = [];
        this.currentStep = 0;
        this.memoTable = new Map();
        this.nodePositions = new Map();
        this.nodeCounter = 0; // 用來生成唯一的節點ID
        this.computedNodes = new Map(); // 儲存已計算的節點
    }

    generateSteps(n) {
        this.steps = [];
        this.currentStep = 0;
        this.memoTable.clear();
        this.nodePositions.clear();
        this.nodeCounter = 0;
        this.computedNodes.clear();
        
        // 計算所有可能的節點位置
        this.calculateAllNodePositions(n);
        
        // 生成動態規劃步驟
        this.generateDPSteps(n);
        
        return this.steps;
    }

    calculateAllNodePositions(n) {
        const containerWidth = 1000;
        const containerHeight = 650;
        
        // 讓f(8)距離頂部約20px
        // f(8)在第6層(8-2=6)，每層間距50px
        // 所以f(8)位置應該是20px，baseY應該是：20 + (6 * 50) = 320px
        const f8TargetY = 20; // f(8)距離頂部的目標位置
        const maxLevel = n - 2; // f(8)在第6層
        const baseY = f8TargetY + (maxLevel * 50); // 計算底部節點位置：20 + 300 = 320px
        
        // f(1)在左下方，f(2)在f(3)的右下方
        // f(3)在x=180位置，所以f(2)應該在其右下方
        this.nodePositions.set('1-base', { x: 80, y: baseY });
        this.nodePositions.set('2-base', { x: 280, y: baseY }); // 調整f(2)到(280, 320)
        
        // 為每個目標值計算節點位置
        for (let target = 3; target <= n; target++) {
            const level = target - 2; // f(3)在第1層，f(4)在第2層等
            const x = 80 + (level * 100);  // 水平間距100px
            const y = baseY - (level * 50);  // 垂直間距50px，往上生長
            
            // f(8)的位置現在是：320 - (6 * 50) = 20px
            // 正好距離頂部20px
            
            // 目標節點位置
            this.nodePositions.set(`${target}-target`, { x, y });
            
            // 右邊子節點位置（新增的節點）
            if (target > 3) {
                const rightValue = target - 2;
                const rightX = x + 100;
                const rightY = y + 30; // 縮小偏移量從40改為30
                this.nodePositions.set(`${rightValue}-right-${target}`, { x: rightX, y: rightY });
            }
        }
    }

    generateDPSteps(n) {
        // 步驟1：創建基礎情況
        this.steps.push({
            type: 'create_base_nodes',
            description: '初始化基礎情況：f(1) = 1, f(2) = 1'
        });

        // 從 f(3) 開始逐步建構
        for (let target = 3; target <= n; target++) {
            this.generateStepsForTarget(target);
        }
    }

    generateStepsForTarget(target) {
        const left = target - 1;
        const right = target - 2;
        
        // 步驟1：宣告目標
        this.steps.push({
            type: 'announce_target',
            target: target,
            description: `開始計算 f(${target}) = f(${left}) + f(${right})`
        });

        // 步驟2：顯示右節點、創建目標節點、連接節點
        this.steps.push({
            type: 'create_and_connect',
            target: target,
            left: left,
            right: right,
            result: this.fibonacci(target),
            description: `創建 f(${target}) 節點並連接到其子節點`
        });

        // 對於f(3)以外的情況，新增標記重用步驟
        if (target > 3) {
            // 步驟3：標記重用、顯示「已計算過」提示
            this.steps.push({
                type: 'mark_reuse',
                target: target,
                value: right,
                description: `f(${right}) 已經計算過，直接重用結果`
            });
        }

        // 步驟4：儲存結果，同時在目標節點顯示記錄於DP表格
        this.steps.push({
            type: 'store_result',
            target: target,
            result: this.fibonacci(target),
            description: `將 f(${target}) = ${this.fibonacci(target)} 儲存到DP表格`
        });
    }

    executeStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return false;

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        switch (step.type) {
            case 'create_base_nodes':
                this.createBaseNodes();
                break;

            case 'announce_target':
                // 步驟1：宣告目標，添加視覺提示
                this.announceTarget(step.target, step.description);
                break;

            case 'create_and_connect':
                // 步驟2：同時顯示右節點、創建目標節點、連接節點
                this.createAndConnectNodes(step.target, step.left, step.right, step.result);
                break;

            case 'mark_reuse':
                // 步驟3：標記重用、顯示「已計算過」提示
                this.markNodeReuse(step.target, step.value);
                break;

            case 'store_result':
                // 步驟4：儲存結果，同時在目標節點顯示記錄於DP表格
                this.storeResultAndUpdateTable(step.target, step.result);
                break;
        }

        return true;
    }

    createBaseNodes() {
        // 創建 f(1) 和 f(2) 基礎節點
        const pos1 = this.nodePositions.get('1-base');
        const pos2 = this.nodePositions.get('2-base');
        
        const node1Id = this.createNode(1, pos1.x, pos1.y);
        const node2Id = this.createNode(2, pos2.x, pos2.y);
        
        this.computedNodes.set('1-base', node1Id);
        this.computedNodes.set('2-base', node2Id);
        
        // 標記為已計算
        setTimeout(() => {
            this.tree.markComputed(node1Id);
            this.tree.markComputed(node2Id);
            
            // 更新DP表格
            if (window.toggleComparisonController) {
                window.toggleComparisonController.updateDPTableCell(1, 1, 'computed');
                window.toggleComparisonController.updateDPTableCell(2, 2, 'computed'); // f(2) = 2
            }
        }, 200);
        
        this.memoTable.set(1, 1);
        this.memoTable.set(2, 2); // f(2) = 2
    }

    announceTarget(target, description) {
        // 步驟1：宣告目標的視覺提示
        console.log(`宣告目標: ${description}`);
        
        // 清除之前的目標標記
        document.querySelectorAll('.dp-table td').forEach(cell => {
            cell.classList.remove('target');
        });
        
        // 高亮當前目標在DP表格中的位置
        if (window.toggleComparisonController) {
            window.toggleComparisonController.updateDPTableCell(target, '?', 'target');
        }
        
        // 可以加入短暂的動畫效果或提示
        setTimeout(() => {
            console.log(`準備計算 f(${target})`);
        }, 300);
    }

    createAndConnectNodes(target, left, right, result) {
        // 步驟2：同時顯示右節點、創建目標節點、連接節點
        
        // 移除目標標記，改為計算中狀態
        if (window.toggleComparisonController) {
            window.toggleComparisonController.updateDPTableCell(target, '?', 'computing');
        }
        
        // 1. 先創建右節點（如果需要）
        if (target > 3) {
            const rightValue = right;
            const posKey = `${rightValue}-right-${target}`;
            const pos = this.nodePositions.get(posKey);
            
            if (pos) {
                const nodeId = this.createNode(rightValue, pos.x, pos.y);
                this.computedNodes.set(posKey, nodeId);
                // 標記為已計算過（因為是重用的）
                setTimeout(() => {
                    this.tree.markComputed(nodeId);
                }, 100);
            }
        }
        
        // 2. 創建目標節點
        const posKey = `${target}-target`;
        const pos = this.nodePositions.get(posKey);
        
        if (pos) {
            const nodeId = this.createNode(target, pos.x, pos.y);
            this.computedNodes.set(posKey, nodeId);
            
            // 標記為計算中
            this.tree.highlightNode(nodeId, 'computing');
        }
        
        // 3. 連接節點
        setTimeout(() => {
            this.connectNodes(target, left, right);
        }, 200);
    }

    markNodeReuse(target, value) {
        // 步驟3：標記重用、顯示「已計算過」提示
        
        // 標記右節點為重用
        const rightNodeId = this.computedNodes.get(`${value}-right-${target}`);
        if (rightNodeId) {
            this.tree.markReused(rightNodeId);
            
            // 不需要額外的橘色提示，紫色標記已經足夠
            // this.showReuseMessage(rightNodeId, value);
        }
        
        // 高亮記憶表使用
        this.highlightMemoUsage(value);
    }

    storeResultAndUpdateTable(target, result) {
        // 步驟4：儲存結果，同時在目標節點顯示記錄於DP表格
        
        // 取得目標節點
        const targetNodeId = this.computedNodes.get(`${target}-target`);
        
        if (targetNodeId) {
            // 節點保持顯示 f(target) 即可，不需要顯示結果值
            // const nodeElement = this.tree.nodes.get(targetNodeId)?.element;
            // if (nodeElement) {
            //     nodeElement.textContent = `f(${target})=${result}`;
            // }
            
            // 標記為已完成
            setTimeout(() => {
                this.tree.markComputed(targetNodeId);
            }, 300);
        }
        
        // 儲存到記憶表
        this.memoTable.set(target, result);
        
        // 更新DP表格並顯示"儲存結果"動畫
        if (window.toggleComparisonController) {
            // 先顯示為更新中
            window.toggleComparisonController.updateDPTableCell(target, result, 'computing');
            
            // 然後標記為已完成
            setTimeout(() => {
                window.toggleComparisonController.updateDPTableCell(target, result, 'computed');
            }, 400);
        }
    }

    highlightMemoUsage(value) {
        // 高亮記憶表使用，顯示重用既有結果
        if (window.toggleComparisonController) {
            window.toggleComparisonController.updateDPTableCell(value, this.memoTable.get(value), 'used');
        }
    }

    connectNodes(target, left, right) {
        const targetNodeId = this.computedNodes.get(`${target}-target`);
        
        // 左節點使用已有的節點（上一次的目標節點）
        let leftNodeId;
        if (left === target - 1) {
            // 尋找上一次計算的目標節點
            if (left <= 2) {
                leftNodeId = this.computedNodes.get(`${left}-base`);
            } else {
                leftNodeId = this.computedNodes.get(`${left}-target`);
            }
        }
        
        // 右節點處理：對f(3)的特殊情況
        let rightNodeId;
        if (target === 3) {
            // f(3)的情況：直接連接到基礎節點 f(1)
            rightNodeId = this.computedNodes.get(`${right}-base`);
        } else {
            // f(4)以後：使用新創建的節點
            rightNodeId = this.computedNodes.get(`${right}-right-${target}`);
        }
        
        // 創建連線
        if (targetNodeId && leftNodeId) {
            this.tree.createEdge(leftNodeId, targetNodeId);
        }
        
        if (targetNodeId && rightNodeId) {
            this.tree.createEdge(rightNodeId, targetNodeId);
        }
    }

    createNode(value, x, y) {
        const nodeId = `dp-${value}-${this.nodeCounter++}`;
        const nodeElement = document.createElement('div');
        
        nodeElement.className = 'tree-node dp-node';
        nodeElement.id = nodeId;
        nodeElement.textContent = `f(${value})`;
        nodeElement.style.left = `${x}px`;
        nodeElement.style.top = `${y}px`;
        
        this.tree.container.appendChild(nodeElement);
        
        this.tree.nodes.set(nodeId, {
            element: nodeElement,
            value: value,
            x: x,
            y: y,
            parentId: null,
            computed: false,
            repeated: false
        });
        
        return nodeId;
    }

    fibonacci(n) {
        if (n === 1) return 1;
        if (n === 2) return 2;
        let a = 1, b = 2;
        for (let i = 3; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    }

    getCurrentStepDescription() {
        if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            return this.steps[this.currentStep].description;
        }
        return "演示結束";
    }

    reset() {
        this.tree.clear();
        this.currentStep = 0;
        this.memoTable.clear();
        this.nodePositions.clear();
        this.nodeCounter = 0;
        this.computedNodes.clear();
    }

    getTotalSteps() {
        return this.steps.length;
    }

    getCurrentStep() {
        return this.currentStep;
    }
}
