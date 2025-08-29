// Bellman-Ford Algorithm Renderer
class BellmanFordRenderer {
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
        
        this.data.edges.forEach((edge, index) => {
            const edgeElement = this.createEdge(edge, index);
            this.edgeGroup.appendChild(edgeElement);
        });
    }

    createEdge(edge, index) {
        const fromNode = this.data.getNodeById(edge.from);
        const toNode = this.data.getNodeById(edge.to);
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'edge');
        g.setAttribute('data-edge', `${edge.from}-${edge.to}`);
        g.setAttribute('data-edge-index', index);

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

        // 創建箭頭（因為Bellman-Ford處理有向圖）
        // 特殊處理 S→F 邊，使用曲線避免與 D、E 重疊
        if (edge.from === 'S' && edge.to === 'F') {
            this.createArrow(g, startX, startY, endX, endY);
        } else {
            this.createArrow(g, startX, startY, endX, endY);
        }

        // 創建背景矩形讓文字更清楚
        let midX, midY;
        
        if (edge.from === 'S' && edge.to === 'F') {
            // 為 S→F 曲線調整標籤位置
            midX = (startX + endX) / 2;
            midY = (startY + endY) / 2 - 6; ; // 在曲線上位置標籤
        } else {
            midX = (startX + endX) / 2;
            midY = (startY + endY) / 2 - 6; // 向上調整6像素
        }
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', midX - 15);
        rect.setAttribute('y', midY - 8);
        rect.setAttribute('width', 30);
        rect.setAttribute('height', 20);
        rect.setAttribute('fill', edge.weight < 0 ? '#f0ababff' : 'white');
        rect.setAttribute('stroke', '#7f8c8d');
        rect.setAttribute('stroke-width', edge.weight < 0 ? 2 : 1);
        rect.setAttribute('rx', 4);

        // 創建權重標籤
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 2);
        text.textContent = edge.weight;
        text.setAttribute('fill', edge.weight < 0 ? '#e74c3c' : '#2c3e50');
        text.setAttribute('font-weight', edge.weight < 0 ? 'bold' : 'normal');

        g.appendChild(rect);
        g.appendChild(text);

        return g;
    }

    createArrow(group, x1, y1, x2, y2) {
        // 創建線段
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        
        // 計算箭頭
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        
        const arrowLength = 10;
        const arrowWidth = 6;
        
        const arrowX1 = x2 - unitX * arrowLength - unitY * arrowWidth;
        const arrowY1 = y2 - unitY * arrowLength + unitX * arrowWidth;
        const arrowX2 = x2 - unitX * arrowLength + unitY * arrowWidth;
        const arrowY2 = y2 - unitY * arrowLength - unitX * arrowWidth;
        
        // 創建箭頭路徑
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', `M ${x2} ${y2} L ${arrowX1} ${arrowY1} L ${arrowX2} ${arrowY2} Z`);
        arrowPath.setAttribute('fill', '#7f8c8d');
        
        group.appendChild(line);
        group.appendChild(arrowPath);
    }
    
    createCurvedArrow(group, x1, y1, x2, y2) {
        // 為 S→F 創建彧曲的路徑，從下方繞過 D、E
        const midX = (x1 + x2) / 2;
        const controlY = y1 + 60; // 向下彎曲 60 像素
        
        // 創建曲線路徑
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${x1} ${y1} Q ${midX} ${controlY} ${x2} ${y2}`;
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#7f8c8d');
        path.setAttribute('stroke-width', '2');
        
        // 計算箭頭（在曲線終點）
        // 先計算曲線在終點的切線方向
        const t = 0.95; // 接近終點的參數
        const qx = (1-t)*(1-t)*x1 + 2*(1-t)*t*midX + t*t*x2;
        const qy = (1-t)*(1-t)*y1 + 2*(1-t)*t*controlY + t*t*y2;
        
        const dx = x2 - qx;
        const dy = y2 - qy;
        const length = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / length;
        const unitY = dy / length;
        
        const arrowLength = 10;
        const arrowWidth = 6;
        
        const arrowX1 = x2 - unitX * arrowLength - unitY * arrowWidth;
        const arrowY1 = y2 - unitY * arrowLength + unitX * arrowWidth;
        const arrowX2 = x2 - unitX * arrowLength + unitY * arrowWidth;
        const arrowY2 = y2 - unitY * arrowLength - unitX * arrowWidth;
        
        // 創建箭頭
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', `M ${x2} ${y2} L ${arrowX1} ${arrowY1} L ${arrowX2} ${arrowY2} Z`);
        arrowPath.setAttribute('fill', '#7f8c8d');
        
        group.appendChild(path);
        group.appendChild(arrowPath);
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
            nodeElement.classList.remove('start', 'relaxing', 'updated', 'negative-cycle', 'default');

            // 根據狀態添加適當的類別
            if (node.id === this.data.startNode) {
                nodeElement.classList.add('start');
            } else if (this.data.hasNegativeCycle && this.data.isNodeUpdated(node.id)) {
                nodeElement.classList.add('negative-cycle');
            } else if (this.data.isNodeUpdated(node.id)) {
                nodeElement.classList.add('updated');
            } else if (this.data.relaxingEdge && 
                      (this.data.relaxingEdge.from === node.id || this.data.relaxingEdge.to === node.id)) {
                nodeElement.classList.add('relaxing');
            } else {
                nodeElement.classList.add('default');
            }
        });
    }

    updateEdges() {
        // 重置所有邊的狀態
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('relaxing', 'updated', 'negative-cycle');
        });

        // 如果有正在鬆弛的邊，高亮顯示
        if (this.data.relaxingEdge) {
            const edgeKey = `${this.data.relaxingEdge.from}-${this.data.relaxingEdge.to}`;
            const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey}"]`);
            if (edgeElement) {
                if (this.data.hasNegativeCycle) {
                    edgeElement.classList.add('negative-cycle');
                } else {
                    edgeElement.classList.add('relaxing');
                }
            }
        }
    }

    updateDistanceLabels() {
        this.data.nodes.forEach(node => {
            const distanceLabel = this.svg.querySelector(`[data-node-id="${node.id}"] .distance-label`);
            if (distanceLabel) {
                distanceLabel.textContent = this.data.formatDistance(this.data.distances[node.id]);
                
                // 如果是負數，變成紅色
                const distance = this.data.distances[node.id];
                if (distance < 0) {
                    distanceLabel.setAttribute('fill', '#e74c3c');
                } else {
                    distanceLabel.setAttribute('fill', '#2c3e50');
                }
            }
        });
    }

    highlightRelaxingEdge(edge) {
        this.clearHighlights();
        
        if (edge) {
            const edgeKey = `${edge.from}-${edge.to}`;
            const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey}"]`);
            if (edgeElement) {
                edgeElement.classList.add('relaxing');
            }
        }
    }

    highlightRelaxingEdge(edge) {
        this.clearHighlights();
        
        if (edge) {
            const edgeKey = `${edge.from}-${edge.to}`;
            const edgeElement = this.svg.querySelector(`[data-edge="${edgeKey}"]`);
            if (edgeElement) {
                edgeElement.classList.add('relaxing');
            }
        }
    }

    clearHighlights() {
        const allEdges = this.svg.querySelectorAll('.edge');
        allEdges.forEach(edge => {
            edge.classList.remove('relaxing', 'updated', 'negative-cycle');
        });
    }

    animateNodeUpdate(nodeId) {
        const nodeElement = this.svg.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) {
            // 簡單的顏色變化動畫，不調整大小
            nodeElement.style.filter = 'brightness(1.2)';
            setTimeout(() => {
                nodeElement.style.filter = 'brightness(1)';
            }, 300);
        }
    }

    getNodePosition(nodeId) {
        const node = this.data.getNodeById(nodeId);
        return node ? { x: node.x, y: node.y } : null;
    }
}