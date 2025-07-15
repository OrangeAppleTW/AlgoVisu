/**
 * BFS 專用圖形結構管理類別
 * 負責創建和管理BFS範例的圖形節點與邊線
 */
class BFSGraphStructure {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.adjacencyList = new Map();
        this.defaultGraph = this.createDefaultGraph();
        this.visitCounter = 0; // 追蹤訪問順序
    }

    /**
     * 創建BFS專用的圖形結構
     */
    createDefaultGraph() {
        return {
            nodes: [
                // BFS 範例圖形結構 - 按照正確的圖片位置重新對應
                
                // 上列節點
                { id: 'node_F', x: 80, y: 60, label: '', fixedLabel: 'F', labelVisible: false },      // 左上節點（F）
                { id: 'S', x: 180, y: 60, label: 'S', isStartNode: true, labelVisible: true },     // S節點（中上）
                { id: 'node_B', x: 280, y: 60, label: '', fixedLabel: 'B', labelVisible: false },     // 右上節點（B）
                
                // 下列節點
                { id: 'node_C', x: 80, y: 160, label: '', fixedLabel: 'C', labelVisible: false },     // 左下節點（C）
                { id: 'node_A', x: 180, y: 160, label: '', fixedLabel: 'A', labelVisible: false },   // 中下節點（A）
                { id: 'node_D', x: 240, y: 160, label: '', fixedLabel: 'D', labelVisible: false },   // 中下偏右節點（D）
                { id: 'node_E', x: 320, y: 160, label: '', fixedLabel: 'E', labelVisible: false }    // 右下節點（E）
            ],
            edges: [
                // BFS 圖形的連接關係（按照圖片正確的連接關係）
                
                // S 的連接（先A後B，因為A在左邊）
                { from: 'S', to: 'node_A' },      // S → A（垂直向下，左邊）
                { from: 'S', to: 'node_B' },      // S → B（水平向右）
                
                // A 的連接（C）
                { from: 'node_A', to: 'node_C' }, // A → C（水平向左）
                
                // C 的連接（F）
                { from: 'node_C', to: 'node_F' }, // C → F（垂直向上）
                
                // B 的連接（先D後E，按照從左到右）
                { from: 'node_B', to: 'node_D' }, // B → D（垂直向下）
                { from: 'node_B', to: 'node_E' }  // B → E（向下右）
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

            // 有向圖：只從起點指向終點
            this.adjacencyList.get(edge.from).push(edge.to);
            // 注意：這是有向圖，不添加反向連接
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
            
            // 重置標籤顯示狀態（除了起始節點S）
            if (!node.isStartNode) {
                node.labelVisible = false;
                node.label = '';
            }
        });

        this.edges.forEach(edge => {
            edge.active = false;
            edge.traversed = false;
        });
    }

    /**
     * 顯示節點標籤
     */
    showNodeLabel(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node && !node.isStartNode && node.fixedLabel) {
            node.labelVisible = true;
            node.label = node.fixedLabel;
            return node.fixedLabel;
        }
        return null;
    }

    /**
     * 隱藏節點標籤
     */
    hideNodeLabel(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node && !node.isStartNode) {
            node.labelVisible = false;
            node.label = '';
        }
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
