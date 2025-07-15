/**
 * 二元樹結構管理類別
 * 專門用於 DFS 樹遍歷視覺化
 */
class BinaryTreeStructure {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.adjacencyList = new Map();
        this.defaultTree = this.createDefaultTree();
        this.visitCounter = 0;
    }

    /**
     * 創建預設的二元樹結構
     */
    createDefaultTree() {
        return {
            nodes: [
                // 根節點
                { id: 'S', x: 180, y: 60, label: 'S', isStartNode: true, level: 0 },
                
                // 第二層 - 左右分布
                { id: 'node_A', x: 100, y: 130, label: '', level: 1, parent: 'S', position: 'left' },
                { id: 'node_B', x: 260, y: 130, label: '', level: 1, parent: 'S', position: 'right' },
                
                // 第三層 - A 的左子節點（只有一個）
                { id: 'node_C', x: 60, y: 200, label: '', level: 2, parent: 'node_A', position: 'left' },
                
                // 第三層 - B 的左右子節點
                { id: 'node_D', x: 220, y: 200, label: '', level: 2, parent: 'node_B', position: 'left' },
                { id: 'node_E', x: 300, y: 200, label: '', level: 2, parent: 'node_B', position: 'right' }
            ],
            edges: [
                // 根節點到第二層
                { from: 'S', to: 'node_A' },
                { from: 'S', to: 'node_B' },
                
                // A 只有左子節點
                { from: 'node_A', to: 'node_C' },
                
                // B 的子節點
                { from: 'node_B', to: 'node_D' },
                { from: 'node_B', to: 'node_E' }
            ]
        };
    }

    /**
     * 初始化樹結構
     */
    initializeTree(treeData = this.defaultTree) {
        this.nodes.clear();
        this.edges.clear();
        this.adjacencyList.clear();
        this.visitCounter = 0;

        // 添加節點
        treeData.nodes.forEach(node => {
            this.nodes.set(node.id, {
                ...node,
                visited: false,
                inStack: false,
                current: false
            });
            this.adjacencyList.set(node.id, []);
        });

        // 添加邊線並建立鄰接列表
        treeData.edges.forEach(edge => {
            const edgeId = `${edge.from}-${edge.to}`;
            this.edges.set(edgeId, {
                ...edge,
                active: false,
                traversed: false
            });

            // 樹結構：單向從父到子
            this.adjacencyList.get(edge.from).push(edge.to);
        });
    }

    /**
     * 重置所有節點和邊線的狀態
     */
    resetTree() {
        this.visitCounter = 0;
        
        this.nodes.forEach(node => {
            node.visited = false;
            node.inStack = false;
            node.current = false;
            
            // 清空非起始節點的標籤
            if (!node.isStartNode) {
                node.label = '';
            }
        });

        this.edges.forEach(edge => {
            edge.active = false;
            edge.traversed = false;
        });
    }

    /**
     * 直接為節點設置標籤
     */
    addNodeLabelDirectly(nodeId, label) {
        const node = this.nodes.get(nodeId);
        if (node && !node.isStartNode) {
            node.label = label;
            return label;
        }
        return null;
    }

    /**
     * 設置節點狀態
     */
    setNodeState(nodeId, state) {
        const node = this.nodes.get(nodeId);
        if (node) {
            // 重置所有狀態
            node.visited = false;
            node.inStack = false;
            node.current = false;

            // 設置新狀態
            if (state === 'visited') node.visited = true;
            else if (state === 'inStack') node.inStack = true;
            else if (state === 'current') node.current = true;
        }
    }

    /**
     * 設置邊線狀態
     */
    setEdgeState(fromId, toId, state) {
        const edgeId = `${fromId}-${toId}`;
        let edge = this.edges.get(edgeId);
        if (edge) {
            edge.active = (state === 'active');
            edge.traversed = (state === 'traversed');
        }
    }

    /**
     * 獲取節點的子節點（左右順序）
     */
    getChildren(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
    }

    /**
     * 獲取左子節點
     */
    getLeftChild(nodeId) {
        const children = this.getChildren(nodeId);
        return children.length > 0 ? children[0] : null;
    }

    /**
     * 獲取右子節點
     */
    getRightChild(nodeId) {
        const children = this.getChildren(nodeId);
        return children.length > 1 ? children[1] : null;
    }

    /**
     * 獲取所有節點
     */
    getNodes() {
        return Array.from(this.nodes.values());
    }

    /**
     * 獲取所有邊線
     */
    getEdges() {
        return Array.from(this.edges.values());
    }

    /**
     * 獲取特定節點
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    /**
     * 隨機重新分配節點標籤
     */
    generateRandomTree() {
        this.initializeTree(this.defaultTree);
        
        // 可以在這裡添加隨機化邏輯
        // 目前保持結構不變，只是重置狀態
    }

    /**
     * 獲取樹的鄰接列表（用於算法）
     */
    getAdjacencyList() {
        const result = {};
        this.adjacencyList.forEach((neighbors, nodeId) => {
            result[nodeId] = [...neighbors];
        });
        return result;
    }
}