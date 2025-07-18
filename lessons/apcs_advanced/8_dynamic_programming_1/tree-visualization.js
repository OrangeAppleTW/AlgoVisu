// 樹狀圖視覺化核心邏輯
class TreeVisualization {
    constructor(containerId, type = 'recursion') {
        this.container = document.getElementById(containerId);
        this.type = type;
        this.nodes = new Map();
        this.edges = [];
        this.nodeId = 0;
        this.computeCount = 0;
        
        // 確保容器樣式設定
        if (this.container) {
            this.container.style.position = 'relative';
            this.container.style.overflow = 'hidden';
        } else {
            console.error(`找不到容器元素: ${containerId}`);
        }
    }

    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.nodes.clear();
        this.edges = [];
        this.nodeId = 0;
        this.computeCount = 0;
    }

    createNode(value, x, y, parentId = null, scale = 1, level = 0) {
        // 使用當前時間戳來確保 ID 的唯一性
        const timestamp = Date.now() + Math.random();
        const nodeId = `${this.type}-${value}-${timestamp}`;
        const nodeElement = document.createElement('div');
        
        // 為遞迴節點設定固定尺寸和位置
        if (this.type === 'recursion') {
            const nodeSize = 50; // 固定尺寸
            const fontSize = 12; // 固定字體大小
            
            nodeElement.className = `tree-node recursion-node`;
            // 確保位置和尺寸都是固定的，不受CSS類別影響
            nodeElement.style.position = 'absolute';
            nodeElement.style.width = `${nodeSize}px`;
            nodeElement.style.height = `${nodeSize}px`;
            nodeElement.style.fontSize = `${fontSize}px`;
            nodeElement.style.left = `${x - nodeSize/2}px`;
            nodeElement.style.top = `${y - nodeSize/2}px`;
            nodeElement.style.zIndex = `${10 + level}`;
            // 移除所有可能影響位置的樣式
            nodeElement.style.transform = 'none';
            nodeElement.style.transition = 'none';
        } else {
            // DP 節點保持原本的尺寸
            nodeElement.className = `tree-node ${this.type === 'dp' ? 'dp-node' : ''}`;
            nodeElement.style.left = `${x}px`;
            nodeElement.style.top = `${y}px`;
        }
        
        nodeElement.id = nodeId;
        nodeElement.textContent = `f(${value})`;
        nodeElement.setAttribute('data-value', value);
        nodeElement.setAttribute('data-level', level);
        
        this.container.appendChild(nodeElement);

        this.nodes.set(nodeId, {
            element: nodeElement,
            value: value,
            x: x,
            y: y,
            parentId: parentId,
            computed: false,
            repeated: false,
            scale: 1, // 固定為 1
            level: level || 0,
            size: this.type === 'recursion' ? 50 : 55 // 固定尺寸
        });

        // 如果有父節點，創建連線
        if (parentId && this.nodes.has(parentId)) {
            this.createEdge(parentId, nodeId);
        }

        return nodeId;
    }

    createEdge(parentId, childId) {
        const parent = this.nodes.get(parentId);
        const child = this.nodes.get(childId);
        
        if (!parent || !child) return;

        const edgeElement = document.createElement('div');
        edgeElement.className = 'tree-edge';
        
        // 計算連線位置和角度
        const dx = child.x - parent.x;
        const dy = child.y - parent.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // 根據節點類型計算連線起點
        let startX, startY;
        if (this.type === 'recursion') {
            // 遞迴節點使用中心位置
            startX = parent.x;
            startY = parent.y;
        } else {
            // DP 節點使用偽移置置（原本的行為）
            startX = parent.x + 25;
            startY = parent.y + 25;
        }
        
        // 設置連線樣式
        edgeElement.style.position = 'absolute';
        edgeElement.style.left = `${startX}px`;
        edgeElement.style.top = `${startY}px`;
        edgeElement.style.width = `${length}px`;
        edgeElement.style.height = '2px';
        edgeElement.style.background = '#666';
        edgeElement.style.transform = `rotate(${angle}deg)`;
        edgeElement.style.transformOrigin = '0 50%';
        edgeElement.style.zIndex = '1';
        
        this.container.appendChild(edgeElement);

        this.edges.push({
            element: edgeElement,
            parentId: parentId,
            childId: childId
        });
    }

    highlightNode(nodeId, className = 'computing') {
        const node = this.nodes.get(nodeId);
        if (node) {
            if (this.type === 'recursion') {
                // 為遞迴節點添加樣式類別，但確保不改變位置
                node.element.classList.add(className);
                
                // 強制保持位置和尺寸不變
                const nodeSize = 50;
                node.element.style.position = 'absolute';
                node.element.style.width = `${nodeSize}px`;
                node.element.style.height = `${nodeSize}px`;
                node.element.style.left = `${node.x - nodeSize/2}px`;
                node.element.style.top = `${node.y - nodeSize/2}px`;
                node.element.style.transform = 'none';
                node.element.style.transition = 'none';
                
                if (className === 'repeated') {
                    node.repeated = true;
                    this.computeCount++;
                } else if (className === 'computing' && !node.computed) {
                    this.computeCount++;
                } else if (className === 'computed') {
                    node.computed = true;
                }
            } else {
                // DP 節點保持原本行為
                node.element.classList.add(className);
                if (className === 'repeated') {
                    node.repeated = true;
                    this.computeCount++;
                } else if (className === 'computing' && !node.computed) {
                    this.computeCount++;
                }
            }
        }
    }

    markComputed(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) {
            if (this.type === 'recursion') {
                // 遞迴節點也要添加 computed 類別，但確保位置不變
                node.element.classList.remove('computing');
                node.element.classList.add('computed');
                node.computed = true;
                
                // 強制保持位置和尺寸不變
                const nodeSize = 50;
                node.element.style.position = 'absolute';
                node.element.style.width = `${nodeSize}px`;
                node.element.style.height = `${nodeSize}px`;
                node.element.style.left = `${node.x - nodeSize/2}px`;
                node.element.style.top = `${node.y - nodeSize/2}px`;
                node.element.style.transform = 'none';
                node.element.style.transition = 'none';
            } else {
                // DP 節點保持原本行為
                node.element.classList.remove('computing');
                node.element.classList.add('computed');
                node.computed = true;
            }
        }
    }

    // 遞迴專用的視覺效果方法 - 已禁用避免位置偏移
    addRepeatWarning(node) {
        // 已禁用：避免創建額外元素導致節點位置偏移
        return;
    }

    addComputingEffect(node) {
        // 已禁用：避免創建額外元素導致節點位置偏移
        return;
    }

    addComputedEffect(node) {
        // 已禁用：避免創建額外元素導致節點位置偏移
        return;
    }

    markReused(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.element.classList.add('reused');
            // 顯示重用提示
            this.showReuseMessage(node);
        }
    }

    showReuseMessage(node) {
        const message = document.createElement('div');
        message.textContent = '已計算過!';
        message.style.position = 'absolute';
        
        // 根據節點類型調整位置
        if (this.type === 'dp') {
            // DP 節點使用原本的偏移位置
            message.style.left = `${node.x + 70}px`;
            message.style.top = `${node.y + 20}px`;
        } else {
            // 遞迴節點使用中心位置
            message.style.left = `${node.x + node.size + 10}px`;
            message.style.top = `${node.y}px`;
        }
        
        message.style.background = '#9c27b0';
        message.style.color = 'white';
        message.style.padding = '4px 8px';
        message.style.borderRadius = '4px';
        message.style.fontSize = '12px';
        message.style.fontWeight = 'bold';
        message.style.zIndex = '20';
        message.style.opacity = '0';
        message.style.transform = 'translateY(-10px)';
        message.style.transition = 'all 0.3s ease';
        
        this.container.appendChild(message);
        
        // 動畫顯示
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        }, 100);
        
        // 3秒後移除
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 2000);
    }

    activateEdge(parentId, childId) {
        const edge = this.edges.find(e => e.parentId === parentId && e.childId === childId);
        if (edge) {
            edge.element.classList.add('active');
        }
    }

    completeEdge(parentId, childId) {
        const edge = this.edges.find(e => e.parentId === parentId && e.childId === childId);
        if (edge) {
            edge.element.classList.remove('active');
            edge.element.classList.add('completed');
        }
    }

    getComputeCount() {
        return this.computeCount;
    }

    resetCount() {
        this.computeCount = 0;
    }
}