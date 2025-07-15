/**
 * SVG 渲染器類別
 * 負責繪製圖形到 SVG 元素
 */
class SVGRenderer {
    constructor(svgId, graph) {
        this.svg = document.getElementById(svgId);
        this.graph = graph;
        this.setupSVG();
    }

    /**
     * 設置 SVG 元素
     */
    setupSVG() {
        if (!this.svg) return;
        
        // 清空 SVG 內容
        this.svg.innerHTML = '';
        
        // 設置 SVG 屬性
        this.svg.setAttribute('viewBox', '0 0 360 280');
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    /**
     * 渲染圖形
     */
    render() {
        if (!this.svg) return;

        this.svg.innerHTML = '';

        // 先繪製邊線
        this.renderEdges();
        
        // 再繪製節點
        this.renderNodes();
    }

    /**
     * 繪製邊線
     */
    renderEdges() {
        const edges = this.graph.getEdges();
        const nodes = this.graph.getNodes();
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        edges.forEach(edge => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            
            if (fromNode && toNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromNode.x);
                line.setAttribute('y1', fromNode.y);
                line.setAttribute('x2', toNode.x);
                line.setAttribute('y2', toNode.y);
                line.setAttribute('class', 'graph-edge');
                
                if (edge.active) {
                    line.classList.add('active');
                } else if (edge.traversed) {
                    line.classList.add('traversed');
                }
                
                this.svg.appendChild(line);
            }
        });
    }

    /**
     * 繪製節點
     */
    renderNodes() {
        const nodes = this.graph.getNodes();

        nodes.forEach(node => {
            // 創建節點群組
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'graph-node');

            // 創建圓形
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '20');
            circle.setAttribute('class', 'node-circle');

            // 根據節點狀態設置樣式
            if (node.current) {
                circle.classList.add('current');
            } else if (node.visited) {
                circle.classList.add('visited');
            } else if (node.inQueue) {
                circle.classList.add('in-queue');
            } else if (node.inStack) {
                circle.classList.add('in-stack');
            }

            // 創建文字 - 只有當 labelVisible 為 true 或是起始節點時才顯示
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('class', 'node-text');
            
            // 檢查是否應該顯示標籤
            if (node.isStartNode || node.labelVisible) {
                text.textContent = node.label;
            } else {
                text.textContent = ''; // 不顯示標籤
            }

            // 設置文字狀態樣式
            if (node.current) {
                text.classList.add('current');
            } else if (node.visited) {
                text.classList.add('visited');
            } else if (node.inQueue) {
                text.classList.add('in-queue');
            } else if (node.inStack) {
                text.classList.add('in-stack');
            }

            group.appendChild(circle);
            group.appendChild(text);
            this.svg.appendChild(group);
        });
    }
}

/**
 * Queue 渲染器類別
 * 負責顯示 BFS 的佇列狀態和當前取出節點
 */
class QueueRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.itemsContainer = this.container?.querySelector('.queue-items');
        this.currentNodeElement = document.getElementById('bfs-current-node');
    }

    /**
     * 更新佇列顯示
     */
    updateQueue(queue, currentNode = null) {
        if (!this.itemsContainer) return;

        this.itemsContainer.innerHTML = '';

        queue.forEach((item, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.textContent = item;
            
            // 標記隊首元素
            if (index === 0) {
                queueItem.classList.add('front');
            }
            
            this.itemsContainer.appendChild(queueItem);
        });

        // 如果佇列為空，顯示提示
        if (queue.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = '佇列為空';
            emptyMsg.style.color = '#999';
            emptyMsg.style.fontStyle = 'italic';
            this.itemsContainer.appendChild(emptyMsg);
        }
        
        // 更新當前取出節點
        this.updateCurrentNode(currentNode);
    }
    
    /**
     * 更新當前取出節點顯示
     */
    updateCurrentNode(nodeId) {
        if (this.currentNodeElement) {
            this.currentNodeElement.textContent = nodeId || '無';
        }
    }

    /**
     * 清空佇列顯示
     */
    clear() {
        this.updateQueue([]);
        this.updateCurrentNode(null);
    }
}

/**
 * Stack 渲染器類別
 * 負責顯示 DFS 的堆疊狀態和當前取出節點
 */
class StackRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.itemsContainer = this.container?.querySelector('.stack-items');
        this.currentNodeElement = document.getElementById('dfs-current-node');
    }

    /**
     * 更新堆疊顯示
     */
    updateStack(stack, currentNode = null) {
        if (!this.itemsContainer) return;

        this.itemsContainer.innerHTML = '';

        stack.forEach((item, index) => {
            const stackItem = document.createElement('div');
            stackItem.className = 'stack-item';
            stackItem.textContent = item;
            
            // 標記棧頂元素
            if (index === stack.length - 1) {
                stackItem.classList.add('top');
            }
            
            this.itemsContainer.appendChild(stackItem);
        });

        // 如果堆疊為空，顯示提示
        if (stack.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = '堆疊為空';
            emptyMsg.style.color = '#999';
            emptyMsg.style.fontStyle = 'italic';
            this.itemsContainer.appendChild(emptyMsg);
        }
        
        // 更新當前取出節點
        this.updateCurrentNode(currentNode);
    }
    
    /**
     * 更新當前取出節點顯示
     */
    updateCurrentNode(nodeId) {
        if (this.currentNodeElement) {
            this.currentNodeElement.textContent = nodeId || '無';
        }
    }

    /**
     * 清空堆疊顯示
     */
    clear() {
        this.updateStack([]);
        this.updateCurrentNode(null);
    }
}