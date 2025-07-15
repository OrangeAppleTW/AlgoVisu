/**
 * 二元樹專用 SVG 渲染器
 * 根據節點位置使用不同顏色渲染
 */
class TreeSVGRenderer {
    constructor(svgId, tree) {
        this.svg = document.getElementById(svgId);
        this.tree = tree;
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
        this.svg.setAttribute('viewBox', '0 0 360 260');
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    }

    /**
     * 渲染樹形圖
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
        const edges = this.tree.getEdges();
        const nodes = this.tree.getNodes();
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
                line.setAttribute('class', 'tree-edge');
                line.setAttribute('stroke', '#666');
                line.setAttribute('stroke-width', '2');
                
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
     * 獲取節點顏色（使用 BFS 相同的配色方案）
     */
    getNodeColor(node) {
        // 預設節點顏色 - 使用 BFS 風格
        return { fill: '#f0f0f0', stroke: '#333' };
    }

    /**
     * 獲取節點狀態顏色（與 BFS 一致）
     */
    getNodeStateColor(node) {
        if (node.current) {
            return { fill: '#333', stroke: '#000' }; // 當前節點 - 深色
        } else if (node.visited) {
            return { fill: '#666', stroke: '#333' }; // 已訪問 - 灰色
        } else if (node.inStack) {
            return { fill: '#999', stroke: '#333' }; // 在堆疊中 - 中灰色
        }
        return null; // 使用預設顏色
    }

    /**
     * 繪製節點
     */
    renderNodes() {
        const nodes = this.tree.getNodes();

        nodes.forEach(node => {
            // 創建節點群組
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'tree-node');

            // 創建圓形
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '22');
            
            // 獲取顏色
            const stateColor = this.getNodeStateColor(node);
            const defaultColor = this.getNodeColor(node);
            const color = stateColor || defaultColor;
            
            circle.setAttribute('fill', color.fill);
            circle.setAttribute('stroke', color.stroke);
            circle.setAttribute('stroke-width', '2');
            
            // 創建文字
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('font-family', 'Arial, sans-serif');
            text.setAttribute('font-size', '16');
            text.setAttribute('font-weight', 'bold');
            
            // 設置文字顏色
            if (node.current || node.visited) {
                text.setAttribute('fill', 'white');
            } else {
                text.setAttribute('fill', 'white');
            }
            
            text.textContent = node.label;

            group.appendChild(circle);
            group.appendChild(text);
            this.svg.appendChild(group);
        });
    }
}