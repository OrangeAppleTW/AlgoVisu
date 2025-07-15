// 組合枚舉樹狀圖視覺化 - 修正版本
class CombinationTreeVisualizer {
    constructor(parent) {
        this.parent = parent;
    }

    // 創建簡潔的二元決策樹
    createTreeStructure() {
        this.parent.combinationTree.innerHTML = '';
        this.parent.treeNodes = {};
        this.parent.treeEdges = [];
        
        // 計算節點位置 - 使用簡潔的佈局
        const nodePositions = this.calculateSimpleTreePositions();
        
        // 創建所有節點
        this.createAllNodes(nodePositions);
        
        // 創建所有邊
        this.createAllEdges(nodePositions);
        
        // 添加簡潔的圖例
        this.addSimpleLegend();
    }

    // 計算樹狀圖位置 - 支援不同模式的尺寸設定
    calculateSimpleTreePositions() {
        const positions = {};
        
        // 檢查是否為專注模式（根據容器的類名或父元素屬性判斷）
        const isFocusMode = this.parent.combinationTree.closest('.focus-container') !== null;
        
        // 專注模式：固定尺寸，普通模式：縮小尺寸
        const config = isFocusMode ? {
            levelHeight: 120,  // 層間距
            baseWidth: 900,    // 基本寬度
            startY: 80,        // 起始Y位置
            horizontalSpacing: 150 // 水平間距
        } : {
            levelHeight: 80,   // 縮小層間距
            baseWidth: 600,    // 縮小基本寬度
            startY: 60,        // 縮小起始Y位置
            horizontalSpacing: 100 // 縮小水平間距
        };
        
        const centerX = config.baseWidth / 2;
        
        // 重新設計組合枚舉樹的節點結構，使用動態間距
        const levels = [
            [{ id: 'root', combination: [], x: centerX }], // 第0層: 根節點
            [  // 第1層: 考慮元素1 (選擇或跳過)
                { id: '1_s', combination: [1], x: centerX - config.horizontalSpacing }, 
                { id: '1_n', combination: [], x: centerX + config.horizontalSpacing }
            ],
            [  // 第2層: 考慮元素2
                { id: '1s_2s', combination: [1, 2], x: centerX - config.horizontalSpacing * 1.67 }, // 選擇1且選擇2
                { id: '1s_2n', combination: [1], x: centerX - config.horizontalSpacing * 0.67 },    // 選擇1但跳過2  
                { id: '1n_2s', combination: [2], x: centerX + config.horizontalSpacing * 0.67 },    // 跳過1但選擇2
                { id: '1n_2n', combination: [], x: centerX + config.horizontalSpacing * 1.67 }     // 跳過1且跳過2
            ],
            [  // 第3層: 考慮元素3
                { id: '1s_2s_3s', combination: [1, 2, 3], x: centerX - config.horizontalSpacing * 2.13 }, // {1,2}選擇3 -> {1,2,3}
                { id: '1s_2s_3n', combination: [1, 2], x: centerX - config.horizontalSpacing * 1.33 },     // {1,2}跳過3 -> {1,2}
                { id: '1s_2n_3s', combination: [1, 3], x: centerX - config.horizontalSpacing * 0.8 },     // {1}選擇3 -> {1,3}
                { id: '1s_2n_3n', combination: [1], x: centerX - config.horizontalSpacing * 0.27 },         // {1}跳過3 -> {1}
                { id: '1n_2s_3s', combination: [2, 3], x: centerX + config.horizontalSpacing * 0.27 },      // {2}選擇3 -> {2,3}
                { id: '1n_2s_3n', combination: [2], x: centerX + config.horizontalSpacing * 0.8 },        // {2}跳過3 -> {2}
                { id: '1n_2n_3s', combination: [3], x: centerX + config.horizontalSpacing * 1.33 },        // {}選擇3 -> {3}
                { id: '1n_2n_3n', combination: [], x: centerX + config.horizontalSpacing * 2.13 }          // {}跳過3 -> {}
            ]
        ];

        // 生成位置
        levels.forEach((level, levelIndex) => {
            level.forEach(node => {
                positions[node.id] = {
                    x: node.x,
                    y: config.startY + levelIndex * config.levelHeight,
                    combination: node.combination,
                    level: levelIndex
                };
            });
        });

        return positions;
    }

    // 創建所有節點
    createAllNodes(positions) {
        Object.keys(positions).forEach(nodeId => {
            const pos = positions[nodeId];
            this.createNode(nodeId, pos);
        });
    }

    // 創建單個節點 - 支援不同模式的節點大小
    createNode(id, position) {
        const node = document.createElement('div');
        node.className = this.getNodeClasses(id, position);
        node.id = `node-${id}`;
        
        // 檢查是否為專注模式
        const isFocusMode = this.parent.combinationTree.closest('.focus-container') !== null;
        
        // 根據模式調整節點大小
        const isRoot = id === 'root';
        const nodeSize = isFocusMode ? 
            (isRoot ? 70 : 60) :  // 專注模式：根節點 70px，其他 60px
            (isRoot ? 50 : 45);   // 普通模式：根節點 50px，其他 45px
        const offset = nodeSize / 2; // 中心對齊的偏移量
        
        node.style.left = `${position.x - offset}px`;
        node.style.top = `${position.y - offset}px`;
        
        // 節點顯示內容 - 修正顯示邏輯，確保正確顯示所有組合
        if (id === 'root') {
            node.textContent = '{}';
        } else {
            const combination = position.combination;
            if (combination.length === 0) {
                node.textContent = '∅'; // 空集符號
            } else {
                // 所有非空組合都顯示完整內容
                node.textContent = `{${combination.join(',')}}`;
            }
        }
        
        this.parent.combinationTree.appendChild(node);
        this.parent.treeNodes[id] = { element: node, position };
    }

    // 獲取節點樣式類
    getNodeClasses(id, position) {
        let classes = ['tree-node'];
        
        if (id === 'root') {
            classes.push('root');
        } else {
            classes.push(`level-${position.level}`);
            
            // 初始狀態都是未遍歷 (unvisited)
            classes.push('unvisited');
            
            // 檢查是否為有效組合
            if (this.isValidCombination(position.combination)) {
                classes.push('solution');
            }
            // 檢查是否需要剪枝
            else if (!this.canStillFormValidCombination(position.combination, position.level)) {
                classes.push('pruned');
            }
        }
        
        return classes.join(' ');
    }

    // 創建所有邊 - 修正邊的連接邏輯
    createAllEdges(positions) {
        const edges = [
            // 第1層連接
            { from: 'root', to: '1_s', type: 'select', element: 1 },
            { from: 'root', to: '1_n', type: 'skip', element: 1 },
            
            // 第2層連接
            { from: '1_s', to: '1s_2s', type: 'select', element: 2 },
            { from: '1_s', to: '1s_2n', type: 'skip', element: 2 },
            { from: '1_n', to: '1n_2s', type: 'select', element: 2 },
            { from: '1_n', to: '1n_2n', type: 'skip', element: 2 },
            
            // 第3層連接 - 修正所有連接關係
            { from: '1s_2s', to: '1s_2s_3s', type: 'select', element: 3 }, // {1,2} -> {1,2,3}
            { from: '1s_2s', to: '1s_2s_3n', type: 'skip', element: 3 },   // {1,2} -> {1,2}
            { from: '1s_2n', to: '1s_2n_3s', type: 'select', element: 3 }, // {1} -> {1,3}
            { from: '1s_2n', to: '1s_2n_3n', type: 'skip', element: 3 },   // {1} -> {1}
            { from: '1n_2s', to: '1n_2s_3s', type: 'select', element: 3 }, // {2} -> {2,3}
            { from: '1n_2s', to: '1n_2s_3n', type: 'skip', element: 3 },   // {2} -> {2}
            { from: '1n_2n', to: '1n_2n_3s', type: 'select', element: 3 }, // {} -> {3}
            { from: '1n_2n', to: '1n_2n_3n', type: 'skip', element: 3 }    // {} -> {}
        ];

        edges.forEach(edge => {
            if (positions[edge.from] && positions[edge.to]) {
                this.createEdge(edge.from, edge.to, positions, edge.type, edge.element);
            }
        });
    }

    // 創建單條邊
    createEdge(fromId, toId, positions, type, element) {
        const fromPos = positions[fromId];
        const toPos = positions[toId];
        
        const edge = document.createElement('div');
        edge.className = `tree-edge ${type}`;
        edge.id = `edge-${fromId}-${toId}`;
        
        // 計算邊的位置和角度
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        edge.style.left = `${fromPos.x}px`;
        edge.style.top = `${fromPos.y}px`;
        edge.style.width = `${length}px`;
        edge.style.transform = `rotate(${angle}deg)`;
        edge.style.transformOrigin = '0 50%';
        
        this.parent.combinationTree.appendChild(edge);
        this.parent.treeEdges.push({ 
            element: edge, 
            from: fromId, 
            to: toId, 
            type: type,
            elementNumber: element
        });
    }

    // 添加簡潔的圖例 - 專注模式移除圖例
    addSimpleLegend() {
        // 專注教學模式不顯示圖例，保持介面簡潔
        // 移除左下角的顏色提示部分
        console.log('專注模式：已移除圖例顯示');
    }

    // 檢查是否為有效組合
    isValidCombination(combination) {
        return combination.length === this.parent.m;
    }

    // 檢查是否還能形成有效組合
    canStillFormValidCombination(currentCombination, currentLevel) {
        const currentCount = currentCombination.length;
        const remainingElements = this.parent.elements.length - currentLevel;
        return currentCount + remainingElements >= this.parent.m;
    }

    // 重置樹狀圖高亮 - 重置為初始狀態（白色）
    resetTreeHighlights() {
        Object.values(this.parent.treeNodes).forEach(nodeInfo => {
            // 移除所有狀態類，保留基本的節點和層級類
            nodeInfo.element.classList.remove('current', 'completed', 'exploring', 'active', 'visited', 'backtracked');
            
            // 確保非根節點重置為未遍歷狀態（白色）
            if (!nodeInfo.element.classList.contains('root')) {
                nodeInfo.element.classList.add('unvisited');
            }
        });
        
        this.parent.treeEdges.forEach(edgeInfo => {
            edgeInfo.element.classList.remove('active', 'completed');
        });
    }

    // 設定節點為已遍歷狀態
    setNodeVisited(nodeId) {
        if (this.parent.treeNodes[nodeId]) {
            const node = this.parent.treeNodes[nodeId].element;
            node.classList.remove('unvisited', 'current', 'backtracked');
            node.classList.add('visited');
        }
    }

    // 設定節點為當前狀態
    setNodeCurrent(nodeId) {
        if (this.parent.treeNodes[nodeId]) {
            const node = this.parent.treeNodes[nodeId].element;
            node.classList.remove('unvisited', 'visited', 'backtracked');
            node.classList.add('current');
        }
    }

    // 設定節點為回溯狀態
    setNodeBacktracked(nodeId) {
        if (this.parent.treeNodes[nodeId]) {
            const node = this.parent.treeNodes[nodeId].element;
            node.classList.remove('unvisited', 'visited', 'current');
            node.classList.add('backtracked');
        }
    }

    // 高亮當前路徑 - 簡化版本
    highlightCurrentPath(path) {
        this.resetTreeHighlights();
        
        if (!path || path.length === 0) {
            this.setNodeCurrent('root');
            return;
        }

        // 根據路徑找到對應的節點ID
        let nodeId = this.pathToNodeId(path);
        
        // 高亮路徑上的所有節點和邊
        this.highlightPathToNode(nodeId);
    }

    // 將路徑轉換為節點ID
    pathToNodeId(path) {
        let nodeId = 'root';
        
        for (let i = 0; i < path.length && i < this.parent.elements.length; i++) {
            const action = path[i];
            const element = this.parent.elements[i];
            
            if (action === 'select') {
                nodeId += `_${element}s`;
            } else if (action === 'skip') {
                nodeId += `_${element}n`;
            }
        }
        
        // 簡化節點ID格式
        nodeId = nodeId.replace('root_', '');
        if (nodeId === 'root') nodeId = 'root';
        else nodeId = this.simplifyNodeId(nodeId, path);
        
        return nodeId;
    }

    // 簡化節點ID
    simplifyNodeId(nodeId, path) {
        if (path.length === 1) {
            return path[0] === 'select' ? '1_s' : '1_n';
        } else if (path.length === 2) {
            const prefix = path[0] === 'select' ? '1s' : '1n';
            const suffix = path[1] === 'select' ? '2s' : '2n';
            return `${prefix}_${suffix}`;
        } else if (path.length === 3) {
            const p1 = path[0] === 'select' ? '1s' : '1n';
            const p2 = path[1] === 'select' ? '2s' : '2n';
            const p3 = path[2] === 'select' ? '3s' : '3n';
            return `${p1}_${p2}_${p3}`;
        }
        return nodeId;
    }

    // 高亮到節點的路徑
    highlightPathToNode(targetNodeId) {
        if (this.parent.treeNodes[targetNodeId]) {
            this.setNodeCurrent(targetNodeId);
        }
        
        // 高亮相關的邊
        this.parent.treeEdges.forEach(edgeInfo => {
            if (edgeInfo.to === targetNodeId) {
                edgeInfo.element.classList.add('active');
            }
        });
    }

    // 高亮節點
    highlightNode(nodeId, className) {
        if (this.parent.treeNodes[nodeId]) {
            this.parent.treeNodes[nodeId].element.classList.add(className);
        }
    }
}

// 更新 CombinationsEnumeration 類
if (typeof CombinationsEnumeration !== 'undefined') {
    CombinationsEnumeration.prototype.createTreeStructure = function() {
        if (!this.treeVisualizer) {
            this.treeVisualizer = new CombinationTreeVisualizer(this);
        }
        this.treeVisualizer.createTreeStructure();
    };
}