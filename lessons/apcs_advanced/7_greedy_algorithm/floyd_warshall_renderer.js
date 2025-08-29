// Floyd-Warshall Algorithm Renderer
class FloydWarshallRenderer {
    constructor(svgElement, data) {
        this.svg = svgElement;
        this.data = data;
        this.nodeRadius = 25;
        this.init();
    }

    init() {
        // 清空 SVG
        this.svg.innerHTML = '';
        
        // 創建群組
        this.edgeGroup = this.createGroup('edges');
        this.nodeGroup = this.createGroup('nodes');
        this.labelGroup = this.createGroup('labels');
        
        this.renderEdges();
        this.renderNodes();
    }

    createGroup(className) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', className);
        this.svg.appendChild(group);
        return group;
    }

    renderNodes() {
        this.nodeGroup.innerHTML = '';
        
        this.data.nodes.forEach(node => {
            const nodeElement = this.createNode(node);
            this.nodeGroup.appendChild(nodeElement);
        });
    }

    createNode(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node');
        g.setAttribute('data-node-id', node.id);
        g.setAttribute('data-node-index', node.index);

        // 創建圓圈
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', this.nodeRadius);

        // 創建標籤
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.textContent = node.label;

        g.appendChild(circle);
        g.appendChild(text);

        return g;
    }

    renderEdges() {
        this.edgeGroup.innerHTML = '';
        
        this.data.edges.forEach(edge => {
            const edgeElement = this.createEdge(edge);
            this.edgeGroup.appendChild(edgeElement);
        });
    }

    createEdge(edge) {
        const fromNode = this.data.getNodeById(edge.from);
        const toNode = this.data.getNodeById(edge.to);
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'edge');
        g.setAttribute('data-edge', `${edge.from}-${edge.to}`);

        // 計算邊的起點和終點（避開節點圓圈）
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;

        const startX = fromNode.x + unitX * this.nodeRadius;
        const startY = fromNode.y + unitY * this.nodeRadius;
        const endX = toNode.x - unitX * this.nodeRadius;
        const endY = toNode.y - unitY * this.nodeRadius;

        // 創建線段
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);

        // 創建背景矩形讓文字更清楚
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 6; // 向上調整6像素
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', midX - 15);
        rect.setAttribute('y', midY - 8);
        rect.setAttribute('width', 30);
        rect.setAttribute('height', 20);
        rect.setAttribute('fill', edge.weight < 0 ? '#f0ababff' : 'white');
        rect.setAttribute('stroke', '#7f8c8d');
        rect.setAttribute('stroke-width', 1);
        rect.setAttribute('rx', 4);

        // 創建權重標籤
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 2); // 對應調整文字位置
        text.textContent = edge.weight;

        g.appendChild(line);
        g.appendChild(rect);
        g.appendChild(text);

        return g;
    }

    updateVisualization() {
        this.updateNodes();
        this.updateEdges();
    }

    updateNodes() {
        this.data.nodes.forEach(node => {
            const nodeElement = this.svg.querySelector(`[data-node-id="${node.id}"]`);
            if (!nodeElement) return;

            // 移除所有狀態類別
            nodeElement.classList.remove('intermediate', 'source', 'destination', 'considering', 'default');

            // 根據當前狀態添加適當的類別
            if (node.index === this.data.currentK) {
                nodeElement.classList.add('intermediate');
            } else if (node.index === this.data.currentI) {
                nodeElement.classList.add('source');
            } else if (node.index === this.data.currentJ) {
                nodeElement.classList.add('destination');
            } else {
                nodeElement.classList.add('default');
            }
        });
    }

    updateEdges() {
        // 重置所有邊的狀態
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('direct', 'via-intermediate', 'considering');
        });

        // 如果有當前步驟，高亮相關的邊
        if (this.data.currentK >= 0 && this.data.currentI >= 0 && this.data.currentJ >= 0) {
            const consideringEdges = this.data.getConsideringEdges(
                this.data.currentK, 
                this.data.currentI, 
                this.data.currentJ
            );
            
            consideringEdges.forEach(edge => {
                const edgeKey1 = `${edge.from}-${edge.to}`;
                const edgeKey2 = `${edge.to}-${edge.from}`;
                const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey1}"]`) ||
                                  this.svg.querySelector(`[data-edge="${edgeKey2}"]`);
                
                if (edgeElement) {
                    if (edge.type === 'direct') {
                        edgeElement.classList.add('direct');
                    } else if (edge.type === 'to-intermediate' || edge.type === 'from-intermediate') {
                        edgeElement.classList.add('via-intermediate');
                    }
                }
            });
        }
    }

    highlightConsideringPath(k, i, j) {
        this.clearHighlights();
        
        if (k >= 0 && i >= 0 && j >= 0) {
            const consideringEdges = this.data.getConsideringEdges(k, i, j);
            
            consideringEdges.forEach(edge => {
                const edgeKey1 = `${edge.from}-${edge.to}`;
                const edgeKey2 = `${edge.to}-${edge.from}`;
                const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey1}"]`) ||
                                  this.svg.querySelector(`[data-edge="${edgeKey2}"]`);
                
                if (edgeElement) {
                    edgeElement.classList.add('considering');
                }
            });
        }
    }

    clearHighlights() {
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('direct', 'via-intermediate', 'considering');
        });
    }

    animateMatrixUpdate(i, j) {
        // 可以添加矩陣更新的動畫效果
        console.log(`Matrix updated at [${i}][${j}]`);
    }

    getNodePosition(nodeId) {
        const node = this.data.getNodeById(nodeId);
        return node ? { x: node.x, y: node.y } : null;
    }
}