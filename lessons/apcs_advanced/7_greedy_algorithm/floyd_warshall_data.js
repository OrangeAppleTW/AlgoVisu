// Floyd-Warshall Algorithm Graph Data
class FloydWarshallData {
    constructor() {
        // 使用與Dijkstra相同的節點和邊
        this.nodes = [
            { id: 'A', x: 100, y: 200, label: 'A', index: 0 },
            { id: 'B', x: 500, y: 250, label: 'B', index: 1 },
            { id: 'C', x: 200, y: 120, label: 'C', index: 2 },
            { id: 'D', x: 380, y: 80, label: 'D', index: 3 },
            { id: 'E', x: 320, y: 180, label: 'E', index: 4 },
            { id: 'F', x: 180, y: 280, label: 'F', index: 5 },
            { id: 'G', x: 380, y: 320, label: 'G', index: 6 }
        ];

        this.edges = [
            { from: 'A', to: 'C', weight: 3 },
            { from: 'A', to: 'F', weight: 2 },
            { from: 'C', to: 'D', weight: 4 },
            { from: 'C', to: 'E', weight: -1 },
            { from: 'C', to: 'F', weight: -2 },
            { from: 'D', to: 'B', weight: 1 },
            { from: 'E', to: 'B', weight: 2 },
            { from: 'E', to: 'F', weight: 3 },
            { from: 'F', to: 'G', weight: -2 },
            { from: 'G', to: 'B', weight: 2 },
            { from: 'F', to: 'B', weight: 6 }
        ];

        this.nodeCount = this.nodes.length;
        this.distanceMatrix = [];
        this.nextMatrix = [];
        this.currentK = -1;
        this.currentI = -1;
        this.currentJ = -1;
        this.hasNegativeCycle = false;
        this.negativeCycleNodes = [];
        
        this.initializeMatrices();
    }

    initializeMatrices() {
        // 初始化距離矩陣
        this.distanceMatrix = Array(this.nodeCount)
            .fill(null)
            .map(() => Array(this.nodeCount).fill(Infinity));
        
        // 初始化路徑矩陣
        this.nextMatrix = Array(this.nodeCount)
            .fill(null)
            .map(() => Array(this.nodeCount).fill(null));

        // 設定節點到自己的距離為0
        for (let i = 0; i < this.nodeCount; i++) {
            this.distanceMatrix[i][i] = 0;
        }

        // 設定直接連接的邊
        this.edges.forEach(edge => {
            const fromIndex = this.getNodeIndex(edge.from);
            const toIndex = this.getNodeIndex(edge.to);
            
            // 無向圖，兩個方向都要設定
            this.distanceMatrix[fromIndex][toIndex] = edge.weight;
            this.distanceMatrix[toIndex][fromIndex] = edge.weight;
            
            this.nextMatrix[fromIndex][toIndex] = toIndex;
            this.nextMatrix[toIndex][fromIndex] = fromIndex;
        });
    }

    reset() {
        this.initializeMatrices();
        this.currentK = -1;
        this.currentI = -1;
        this.currentJ = -1;
        this.hasNegativeCycle = false;
        this.negativeCycleNodes = [];
    }

    getNodeById(id) {
        return this.nodes.find(node => node.id === id);
    }

    getNodeIndex(id) {
        const node = this.nodes.find(node => node.id === id);
        return node ? node.index : -1;
    }

    getNodeByIndex(index) {
        return this.nodes.find(node => node.index === index);
    }

    formatDistance(distance) {
        return distance === Infinity ? '∞' : distance.toString();
    }

    getPath(fromIndex, toIndex) {
        if (this.distanceMatrix[fromIndex][toIndex] === Infinity) {
            return [];
        }
        
        const path = [fromIndex];
        let current = fromIndex;
        
        while (current !== toIndex) {
            current = this.nextMatrix[current][toIndex];
            if (current === null) break;
            path.push(current);
        }
        
        return path.map(index => this.getNodeByIndex(index).id);
    }

    formatPath(fromIndex, toIndex) {
        if (this.distanceMatrix[fromIndex][toIndex] === Infinity) {
            return '-';
        }
        return this.getPath(fromIndex, toIndex).join(' → ');
    }

    // 獲取當前步驟相關的邊
    getConsideringEdges(k, i, j) {
        const edges = [];
        
        if (k >= 0 && i >= 0 && j >= 0) {
            const kNode = this.getNodeByIndex(k).id;
            const iNode = this.getNodeByIndex(i).id;
            const jNode = this.getNodeByIndex(j).id;
            
            // i -> k 的邊
            if (this.hasDirectEdge(iNode, kNode)) {
                edges.push({ from: iNode, to: kNode, type: 'to-intermediate' });
            }
            
            // k -> j 的邊
            if (this.hasDirectEdge(kNode, jNode)) {
                edges.push({ from: kNode, to: jNode, type: 'from-intermediate' });
            }
            
            // 原本的 i -> j 邊（如果存在）
            if (this.hasDirectEdge(iNode, jNode)) {
                edges.push({ from: iNode, to: jNode, type: 'direct' });
            }
        }
        
        return edges;
    }

    hasDirectEdge(nodeA, nodeB) {
        return this.edges.some(edge => 
            (edge.from === nodeA && edge.to === nodeB) || 
            (edge.from === nodeB && edge.to === nodeA)
        );
    }

    getEdgeWeight(nodeA, nodeB) {
        const edge = this.edges.find(e => 
            (e.from === nodeA && e.to === nodeB) || 
            (e.from === nodeB && e.to === nodeA)
        );
        return edge ? edge.weight : Infinity;
    }
}