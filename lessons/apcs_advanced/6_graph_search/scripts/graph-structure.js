/**
 * 圖形結構管理類別
 * 負責創建和管理圖形的節點與邊線
 */
class GraphStructure {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.adjacencyList = new Map();
        this.defaultGraph = this.createDefaultGraph();
        this.visitCounter = 0; // 追蹤訪問順序
    }

    /**
     * 創建預設的圖形結構（樹狀結構）
     */
    createDefaultGraph() {
        return {
            nodes: [
                // 樹狀結構佈局 - 固定標籤（DFS頁面一開始就顯示所有標籤）
                // 根節點 S
                { id: 'S', x: 180, y: 60, label: 'S', isStartNode: true, labelVisible: true },
                
                // 第二層：S的直接子節點
                { id: 'node_A', x: 120, y: 140, label: 'A', visitOrder: 1, labelVisible: true }, // 左子節點
                { id: 'node_B', x: 240, y: 140, label: 'B', visitOrder: 2, labelVisible: true }, // 右子節點
                
                // 第三層：A的子節點
                { id: 'node_C', x: 80, y: 220, label: 'C', visitOrder: 3, labelVisible: true },  // A的左子節點
                { id: 'node_D', x: 160, y: 220, label: 'D', visitOrder: 4, labelVisible: true }, // A的右子節點
                
                // 第三層：B的子節點（只有右子節點）
                { id: 'node_E', x: 240, y: 220, label: 'E', visitOrder: 5, labelVisible: true }  // B的右子節點（沒有左子節點）
            ],
            edges: [
                // 樹狀連接關係
                { from: 'S', to: 'node_A' },      // S → A
                { from: 'S', to: 'node_B' },      // S → B
                { from: 'node_A', to: 'node_C' }, // A → C
                { from: 'node_A', to: 'node_D' }, // A → D
                { from: 'node_B', to: 'node_E' }  // B → E（B只有一個子節點）
            ]
        };
    }

    /**
     * 初始化圖形結構
     */
    initializeGraph(graphData = this.defaultGraph) {
        this.nodes.clear();
        this.edges.clear();
        this.adjacencyList.clear();
        this.visitCounter = 0;

        // 添加節點
        graphData.nodes.forEach(node => {
            this.nodes.set(node.id, {
                ...node,
                visited: false,
                inQueue: false,
                inStack: false,
                current: false
            });
            this.adjacencyList.set(node.id, []);
        });

        // 添加邊線並建立鄰接列表
        graphData.edges.forEach(edge => {
            const edgeId = `${edge.from}-${edge.to}`;
            this.edges.set(edgeId, {
                ...edge,
                active: false,
                traversed: false
            });

            // 有向樹：只從父節點指向子節點
            this.adjacencyList.get(edge.from).push(edge.to);
            // 注意：不添加反向連接，因為這是有向樹
        });
    }

    /**
     * 重置所有節點和邊線的狀態（保持固定標籤）
     */
    resetGraph() {
        this.visitCounter = 0;
        
        this.nodes.forEach(node => {
            node.visited = false;
            node.inQueue = false;
            node.inStack = false;
            node.current = false;
            
            // 不清空標籤，因為現在使用固定標籤
        });

        this.edges.forEach(edge => {
            edge.active = false;
            edge.traversed = false;
        });
    }

    /**
     * 根據訪問順序為節點添加標籤
     */
    addNodeLabel(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node && !node.isStartNode && node.label === '') {
            // 按照英文字母順序分配標籤：A, B, C, D, E, F...
            const label = String.fromCharCode(65 + this.visitCounter); // A=65, B=66...
            node.label = label;
            this.visitCounter++;
            return label;
        }
        return null;
    }

    /**
     * 直接為節點設置標籤（不增加訪問計數器）
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
            node.inQueue = false;
            node.inStack = false;
            node.current = false;

            // 設置新狀態
            if (state === 'visited') node.visited = true;
            else if (state === 'inQueue') node.inQueue = true;
            else if (state === 'inStack') node.inStack = true;
            else if (state === 'current') node.current = true;
        }
    }

    /**
     * 設置邊線狀態
     */
    setEdgeState(fromId, toId, state) {
        const edgeId1 = `${fromId}-${toId}`;
        const edgeId2 = `${toId}-${fromId}`;
        
        let edge = this.edges.get(edgeId1) || this.edges.get(edgeId2);
        if (edge) {
            edge.active = (state === 'active');
            edge.traversed = (state === 'traversed');
        }
    }

    /**
     * 獲取節點的鄰接節點
     */
    getNeighbors(nodeId) {
        return this.adjacencyList.get(nodeId) || [];
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
     * 獲取圖形的鄰接列表（用於算法）
     */
    getAdjacencyList() {
        const result = {};
        this.adjacencyList.forEach((neighbors, nodeId) => {
            result[nodeId] = [...neighbors];
        });
        return result;
    }

    /**
     * 獲取訪問計數器
     */
    getVisitCounter() {
        return this.visitCounter;
    }

    /**
     * 重置訪問計數器
     */
    resetVisitCounter() {
        this.visitCounter = 0;
    }
}