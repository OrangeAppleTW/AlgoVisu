// Dijkstra Algorithm Renderer
class DijkstraRenderer {
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

        // 創建距離標籤
        const distanceLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        distanceLabel.setAttribute('class', 'distance-label');
        distanceLabel.setAttribute('x', node.x);
        distanceLabel.setAttribute('y', node.y - this.nodeRadius - 10);
        distanceLabel.textContent = this.data.formatDistance(this.data.distances[node.id]);

        g.appendChild(circle);
        g.appendChild(text);
        g.appendChild(distanceLabel);

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
        const midY = (startY + endY) / 2;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', midX - 15);
        rect.setAttribute('y', midY - 12);
        rect.setAttribute('width', 30);
        rect.setAttribute('height', 20);
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke', '#7f8c8d');
        rect.setAttribute('stroke-width', 1);
        rect.setAttribute('rx', 4);

        // 創建權重標籤
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 2);
        text.textContent = edge.weight;

        g.appendChild(line);
        g.appendChild(rect);
        g.appendChild(text);

        return g;
    }

    updateVisualization() {
        this.updateNodes();
        this.updateEdges();
        this.updateDistanceLabels();
    }

    updateNodes() {
        this.data.nodes.forEach(node => {
            const nodeElement = this.svg.querySelector(`[data-node-id="${node.id}"]`);
            if (!nodeElement) return;

            // 移除所有狀態類別
            nodeElement.classList.remove('start', 'current', 'visited', 'unvisited');

            // 根據狀態添加適當的類別
            if (node.id === this.data.startNode) {
                nodeElement.classList.add('start');
            } else if (node.id === this.data.currentNode) {
                nodeElement.classList.add('current');
            } else if (this.data.visited.has(node.id)) {
                nodeElement.classList.add('visited');
            } else {
                nodeElement.classList.add('unvisited');
            }
        });
    }

    updateEdges() {
        // 重置所有邊的狀態
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('active', 'considering');
        });
    }

    updateDistanceLabels() {
        this.data.nodes.forEach(node => {
            const distanceLabel = this.svg.querySelector(`[data-node-id="${node.id}"] .distance-label`);
            if (distanceLabel) {
                distanceLabel.textContent = this.data.formatDistance(this.data.distances[node.id]);
            }
        });
    }

    highlightConsideringEdges(edges) {
        // 移除之前的考慮狀態
        const consideringEdges = this.svg.querySelectorAll('.edge.considering');
        consideringEdges.forEach(edge => edge.classList.remove('considering'));

        // 添加新的考慮狀態
        edges.forEach(edge => {
            const edgeKey1 = `${edge.from}-${edge.to}`;
            const edgeKey2 = `${edge.to}-${edge.from}`;
            const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey1}"]`) ||
                              this.svg.querySelector(`[data-edge="${edgeKey2}"]`);
            if (edgeElement) {
                edgeElement.classList.add('considering');
            }
        });
    }

    clearHighlights() {
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('considering');
        });
    }

    animateNodeUpdate(nodeId) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            nodeElement.style.transform = 'scale(1.2)';
            setTimeout(() => {
                nodeElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    getNodePosition(nodeId) {
        const node = this.data.getNodeById(nodeId);
        return node ? { x: node.x, y: node.y } : null;
    }
}