// 樹狀結構探索 JavaScript - 節點類型修正版

class TreeNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.x = x;
        this.y = y;
        this.depth = 0;
        this.height = 0;
    }
}

class BinaryTreeVisualizer {
    constructor() {
        this.svg = document.getElementById('treeSvg');
        this.nodesGroup = document.getElementById('treeNodes');
        this.linksGroup = document.getElementById('treeLinks');
        this.depthLabelsGroup = document.getElementById('depthLabels');
        this.infoPanel = document.getElementById('nodeInfoPanel');
        
        this.selectedNode = null;
        this.tree = this.createSampleTree();
        this.calculatePositions();
        this.calculateHeights();
        this.setupSVG();
        this.render();
        this.renderDepthLabels();
    }

    createSampleTree() {
        // 建立範例樹: A(B(D,E), C(F,G))
        const root = new TreeNode('A');
        
        root.left = new TreeNode('B');
        root.right = new TreeNode('C');
        
        root.left.parent = root;
        root.right.parent = root;
        
        root.left.left = new TreeNode('D');
        root.left.right = new TreeNode('E');
        root.right.left = new TreeNode('F');
        root.right.right = new TreeNode('G');
        
        root.left.left.parent = root.left;
        root.left.right.parent = root.left;
        root.right.left.parent = root.right;
        root.right.right.parent = root.right;
        
        return root;
    }

    calculatePositions() {
        // 調整為更緊湊的佈局，適合320px高度的容器
        const levels = [
            [{node: this.tree, x: 300}],
            [{node: this.tree.left, x: 200}, {node: this.tree.right, x: 400}],
            [
                {node: this.tree.left.left, x: 140},
                {node: this.tree.left.right, x: 260},
                {node: this.tree.right.left, x: 340},
                {node: this.tree.right.right, x: 460}
            ]
        ];

        levels.forEach((level, depth) => {
            level.forEach(({node, x}) => {
                if (node) {
                    node.x = x;
                    node.y = 60 + depth * 80; // 減少垂直間距
                    node.depth = depth;
                }
            });
        });
    }

    setupSVG() {
        // 設置SVG的viewBox以適合更小的容器
        const padding = 30;
        const minX = 100 - padding;
        const minY = 30 - padding;
        const maxX = 500 + padding;
        const maxY = 220 + padding;
        
        const width = maxX - minX;
        const height = maxY - minY;
        
        this.svg.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // 移除固定寬高，讓CSS控制
        this.svg.removeAttribute('width');
        this.svg.removeAttribute('height');
    }

    calculateHeights() {
        const calculateHeight = (node) => {
            if (!node) return -1;
            
            const leftHeight = calculateHeight(node.left);
            const rightHeight = calculateHeight(node.right);
            
            node.height = Math.max(leftHeight, rightHeight) + 1;
            return node.height;
        };
        
        calculateHeight(this.tree);
    }

    render() {
        this.renderLinks();
        this.renderNodes();
    }

    renderLinks() {
        this.linksGroup.innerHTML = '';
        
        const renderNodeLinks = (node) => {
            if (!node) return;
            
            if (node.left) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'tree-link');
                line.setAttribute('x1', node.x);
                line.setAttribute('y1', node.y);
                line.setAttribute('x2', node.left.x);
                line.setAttribute('y2', node.left.y);
                line.setAttribute('data-from', node.value);
                line.setAttribute('data-to', node.left.value);
                this.linksGroup.appendChild(line);
            }
            
            if (node.right) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'tree-link');
                line.setAttribute('x1', node.x);
                line.setAttribute('y1', node.y);
                line.setAttribute('x2', node.right.x);
                line.setAttribute('y2', node.right.y);
                line.setAttribute('data-from', node.value);
                line.setAttribute('data-to', node.right.value);
                this.linksGroup.appendChild(line);
            }
            
            renderNodeLinks(node.left);
            renderNodeLinks(node.right);
        };
        
        renderNodeLinks(this.tree);
    }

    renderNodes() {
        this.nodesGroup.innerHTML = '';
        
        const renderNode = (node) => {
            if (!node) return;
            
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'tree-node');
            group.setAttribute('data-value', node.value);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', 20); // 略微縮小節點
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y);
            text.textContent = node.value;
            
            group.appendChild(circle);
            group.appendChild(text);
            
            group.addEventListener('click', () => this.selectNode(node));
            
            this.nodesGroup.appendChild(group);
            
            renderNode(node.left);
            renderNode(node.right);
        };
        
        renderNode(this.tree);
    }

    renderDepthLabels() {
        // 只顯示深度標籤文字，不顯示虛線
        const depths = [
            { depth: 0, y: 60, label: '深度 0' },
            { depth: 1, y: 140, label: '深度 1' },
            { depth: 2, y: 220, label: '深度 2' }
        ];
        
        depths.forEach(({ depth, y, label }) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'depth-label');
            text.setAttribute('x', 15);
            text.setAttribute('y', y);
            text.textContent = label;
            this.depthLabelsGroup.appendChild(text);
        });

        // 移除深度層級背景線的程式碼
    }

    selectNode(node) {
        // 清除之前的選擇
        const prevSelected = this.svg.querySelector('.tree-node.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }
        
        // 選擇新節點
        const nodeElement = this.svg.querySelector(`[data-value="${node.value}"]`);
        nodeElement.classList.add('selected');
        
        this.selectedNode = node;
        this.showNodeInfo(node);
    }

    showNodeInfo(node) {
        const info = this.getNodeInfo(node);
        
        this.infoPanel.innerHTML = `
            <div class="node-info">
                <h4>節點 ${node.value}</h4>
                <div class="info-item">
                    <span class="info-label">節點類型</span>
                    <span class="info-value">${info.nodeType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">深度</span>
                    <span class="info-value">${node.depth}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">高度</span>
                    <span class="info-value">${node.height}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">父節點</span>
                    <span class="info-value">${info.parent}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">左子節點</span>
                    <span class="info-value">${info.leftChild}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">右子節點</span>
                    <span class="info-value">${info.rightChild}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">從根路徑</span>
                    <span class="info-value">${info.pathFromRoot}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">子樹大小</span>
                    <span class="info-value">${info.subtreeSize}</span>
                </div>
            </div>
        `;
    }

    getNodeInfo(node) {
        const getNodeType = (node) => {
            if (!node.parent) return '根節點';
            if (!node.left && !node.right) return '葉節點';
            return '一般節點'; // 修改：將"內部節點"改為"一般節點"
        };

        const getPathFromRoot = (node) => {
            const path = [];
            let current = node;
            while (current) {
                path.unshift(current.value);
                current = current.parent;
            }
            return path.join(' → ');
        };

        const getSubtreeSize = (node) => {
            if (!node) return 0;
            return 1 + getSubtreeSize(node.left) + getSubtreeSize(node.right);
        };

        return {
            nodeType: getNodeType(node),
            parent: node.parent ? node.parent.value : '無',
            leftChild: node.left ? node.left.value : '無',
            rightChild: node.right ? node.right.value : '無',
            pathFromRoot: getPathFromRoot(node),
            subtreeSize: getSubtreeSize(node)
        };
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.treeVisualizer = new BinaryTreeVisualizer();
});