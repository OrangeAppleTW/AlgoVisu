// 遞迴演算法邏輯和視覺化 - 層級式展示
class RecursionVisualizer {
    constructor(treeViz) {
        this.tree = treeViz;
        this.steps = [];
        this.currentStep = 0;
        this.allNodes = []; // 儲存所有節點信息
        this.nodesByLevel = new Map(); // 按層級組織節點
        this.maxLevel = 0;
    }

    generateSteps(n) {
        this.steps = [];
        this.currentStep = 0;
        this.allNodes = [];
        this.nodesByLevel.clear();
        this.maxLevel = 0;
        
        // 預先計算整個二叉樹結構
        this.buildCompleteTree(n);
        
        // 生成層級式步驟
        this.generateLevelSteps();
        
        return this.steps;
    }

    buildCompleteTree(n) {
        // 使用 BFS 方式建構完整的二叉樹
        const queue = [{ value: n, level: 0, position: 0, parent: null }];
        
        while (queue.length > 0) {
            const current = queue.shift();
            const { value, level, position, parent } = current;
            
            // 計算節點位置
            const pos = this.calculateNodePosition(value, level, position);
            
            // 創建節點信息
            const nodeInfo = {
                value: value,
                level: level,
                position: position,
                x: pos.x,
                y: pos.y,
                scale: pos.scale,
                parent: parent,
                id: `node-${value}-${level}-${position}`
            };
            
            this.allNodes.push(nodeInfo);
            
            // 按層級組織
            if (!this.nodesByLevel.has(level)) {
                this.nodesByLevel.set(level, []);
            }
            this.nodesByLevel.get(level).push(nodeInfo);
            
            this.maxLevel = Math.max(this.maxLevel, level);
            
            // 如果不是基礎情況，加入子節點到隊列
            if (value > 2) {
                // 左子節點 f(n-1)
                queue.push({
                    value: value - 1,
                    level: level + 1,
                    position: position * 2,
                    parent: nodeInfo
                });
                
                // 右子節點 f(n-2)
                queue.push({
                    value: value - 2,
                    level: level + 1,
                    position: position * 2 + 1,
                    parent: nodeInfo
                });
            }
        }
    }

    generateLevelSteps() {
        // 為每一層生成一個步驟
        for (let level = 0; level <= this.maxLevel; level++) {
            const nodesInLevel = this.nodesByLevel.get(level) || [];
            
            if (nodesInLevel.length > 0) {
                this.steps.push({
                    type: 'show_level',
                    level: level,
                    nodes: nodesInLevel,
                    description: this.getLevelDescription(level, nodesInLevel)
                });
            }
        }
    }

    getLevelDescription(level, nodes) {
        if (level === 0) {
            return `開始：顯示根節點 f(${nodes[0].value})`;
        } else if (level === this.maxLevel) {
            const baseNodes = nodes.filter(n => n.value <= 2);
            if (baseNodes.length > 0) {
                return `第${level + 1}層：到達基礎情況 f(1) 和 f(2)`;
            }
        }
        
        const values = [...new Set(nodes.map(n => n.value))].sort((a, b) => b - a);
        return `第${level + 1}層：展開 ${values.map(v => `f(${v})`).join(', ')} 的子節點`;
    }

    calculateNodePosition(value, level, position) {
        const containerWidth = 900;
        const containerHeight = 420;
        
        // 計算該層級的節點數量
        const nodesInLevel = Math.pow(2, level);
        
        // 固定節點大小，不做縮放
        const scaleFactor = 1;
        
        // 特殊處理根節點 f(8) - 置中
        if (level === 0) {
            const x = containerWidth / 2;
            const y = 30;
            return { x, y, scale: scaleFactor };
        }
        
        // 重新計算置中的x位置
        // 使用更精確的置中計算
        const totalWidth = containerWidth * 0.85; // 總寬度減少到85%
        const nodeSpacing = totalWidth / nodesInLevel; // 每個節點的寬度
        const startX = (containerWidth - totalWidth) / 2; // 開始位置
        const x = startX + nodeSpacing * position + nodeSpacing / 2; // 節點中心位置
        
        // 計算垂直位置
        const estimatedMaxLevels = 6;
        const layerSpacing = Math.min(55, Math.max(45, (containerHeight - 60) / estimatedMaxLevels));
        const y = 30 + level * layerSpacing;
        
        return { 
            x: x, 
            y: Math.min(containerHeight - 30, y),
            scale: scaleFactor
        };
    }

    executeStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return false;

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        switch (step.type) {
            case 'show_level':
                this.showLevel(step);
                break;
        }

        return true;
    }

    showLevel(step) {
        const { level, nodes } = step;
        
        // 創建一個Map來追蹤已出現的值
        const appearedValues = new Map();
        
        // 收集在當前步驟之前已經出現的所有節點值
        for (let i = 0; i < this.currentStep; i++) {
            const prevStep = this.steps[i];
            if (prevStep.type === 'show_level') {
                prevStep.nodes.forEach(node => {
                    if (!appearedValues.has(node.value)) {
                        appearedValues.set(node.value, []);
                    }
                    appearedValues.get(node.value).push(node);
                });
            }
        }
        
        // 為這一層的每個節點創建視覺元素
        nodes.forEach((nodeInfo, index) => {
            // 延遲創建節點，產生動畫效果
            setTimeout(() => {
                const nodeId = this.tree.createNode(
                    nodeInfo.value,
                    nodeInfo.x,
                    nodeInfo.y,
                    nodeInfo.parent ? nodeInfo.parent.actualNodeId : null,
                    nodeInfo.scale,
                    level
                );
                
                // 記錄實際的節點ID
                nodeInfo.actualNodeId = nodeId;
                
                // 檢查是否是重複計算
                const isRepeated = appearedValues.has(nodeInfo.value) && nodeInfo.value > 2;
                
                if (nodeInfo.value <= 2) {
                    // 基礎情況，標記為已計算（綠色）
                    setTimeout(() => {
                        this.tree.highlightNode(nodeId, 'computed');
                    }, 200);
                } else if (isRepeated) {
                    // 重複計算，標記為紅色
                    setTimeout(() => {
                        this.tree.highlightNode(nodeId, 'repeated');
                    }, 300);
                } else {
                    // 第一次出現這個值，標記為正在計算（橘色）
                    setTimeout(() => {
                        this.tree.highlightNode(nodeId, 'computing');
                    }, 300);
                }
                
                // 將當前節點加入已出現值的記錄中
                if (!appearedValues.has(nodeInfo.value)) {
                    appearedValues.set(nodeInfo.value, []);
                }
                appearedValues.get(nodeInfo.value).push(nodeInfo);
                
            }, index * 200); // 同層節點依序出現
        });
    }

    getCurrentStepDescription() {
        if (this.currentStep >= 0 && this.currentStep < this.steps.length) {
            return this.steps[this.currentStep].description;
        }
        return "層級展示完成 - 可以看到遞迴樹的龐大複雜性！";
    }

    reset() {
        this.tree.clear();
        this.currentStep = 0;
        this.allNodes = [];
        this.nodesByLevel.clear();
        this.maxLevel = 0;
    }

    getTotalSteps() {
        return this.steps.length;
    }

    getCurrentStep() {
        return this.currentStep;
    }

    // 計算費波那契數值（用於比較）
    fibonacci(n) {
        if (n <= 2) return 1;
        let a = 1, b = 1;
        for (let i = 3; i <= n; i++) {
            [a, b] = [b, a + b];
        }
        return b;
    }
}