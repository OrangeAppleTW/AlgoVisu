// Bellman-Ford Algorithm Graph Data
class BellmanFordData {
    constructor() {
        // 完美的多輪教學案例：展示負權重如何創造驚人的路徑改善
        // 節點排列優化：讓 S→F 邊從 D、E 下方繞過，避免視覺重疊
        this.nodes = [
            { id: 'S', x: 100, y: 200, label: 'S' },
            { id: 'A', x: 220, y: 120, label: 'A' },
            { id: 'B', x: 350, y: 120, label: 'B' },
            { id: 'C', x: 480, y: 120, label: 'C' },
            { id: 'D', x: 220, y: 250, label: 'D' },    // D 稍微下移
            { id: 'E', x: 350, y: 250, label: 'E' },    // E 稍微下移
            { id: 'F', x: 550, y: 200, label: 'F' }     // F 保持在中間高度
        ];

        this.edges = [
            { from: 'S', to: 'A', weight: 3 },
            { from: 'S', to: 'D', weight: 2 },
            { from: 'S', to: 'F', weight: 15 },
            { from: 'A', to: 'B', weight: 4 },
            { from: 'D', to: 'B', weight: 4 },
            { from: 'D', to: 'E', weight: 3 },
            { from: 'B', to: 'C', weight: 2 },
            { from: 'E', to: 'F', weight: 2 },
            { from: 'C', to: 'F', weight: -10 }  // 關鍵負權重邊！驚人的改善
        ];

        this.startNode = 'S';
        this.distances = {};
        this.predecessors = {};
        this.currentRound = 0;
        this.maxRounds = this.nodes.length - 1; // V-1 輪
        this.currentEdgeIndex = -1;
        this.hasNegativeCycle = false;
        this.relaxingEdge = null;
        this.updatedNodes = new Set();
        
        this.initializeAlgorithm();
    }

    initializeAlgorithm() {
        // 初始化距離和前驅節點
        this.nodes.forEach(node => {
            this.distances[node.id] = node.id === this.startNode ? 0 : Infinity;
            this.predecessors[node.id] = null;
        });
        
        this.currentRound = 0;
        this.currentEdgeIndex = -1;
        this.hasNegativeCycle = false;
        this.relaxingEdge = null;
        this.updatedNodes.clear();
    }

    reset() {
        this.initializeAlgorithm();
    }

    getNodeById(id) {
        return this.nodes.find(node => node.id === id);
    }

    getEdgeByIndex(index) {
        return index >= 0 && index < this.edges.length ? this.edges[index] : null;
    }

    // 鬆弛操作：檢查是否能通過邊(u,v)改善到v的距離
    canRelax(edge) {
        const uDistance = this.distances[edge.from];
        const vDistance = this.distances[edge.to];
        
        if (uDistance === Infinity) {
            return false;
        }
        
        const newDistance = uDistance + edge.weight;
        return newDistance < vDistance;
    }

    // 執行鬆弛操作
    relax(edge) {
        if (this.canRelax(edge)) {
            const oldDistance = this.distances[edge.to];
            const newDistance = this.distances[edge.from] + edge.weight;
            
            this.distances[edge.to] = newDistance;
            this.predecessors[edge.to] = edge.from;
            this.updatedNodes.add(edge.to);
            
            return {
                updated: true,
                from: edge.from,
                to: edge.to,
                oldDistance: oldDistance,
                newDistance: newDistance,
                calculation: `${this.distances[edge.from]} + (${edge.weight}) = ${newDistance}`
            };
        }
        
        return {
            updated: false,
            from: edge.from,
            to: edge.to,
            calculation: `${this.distances[edge.from]} + (${edge.weight}) = ${this.distances[edge.from] + edge.weight} ≥ ${this.distances[edge.to]}`
        };
    }

    getShortestPath(target) {
        const path = [];
        let current = target;
        
        while (current !== null) {
            path.unshift(current);
            current = this.predecessors[current];
            
            // 防止無限迴圈
            if (path.length > this.nodes.length) {
                return []; // 可能有負環
            }
        }
        
        return this.distances[target] === Infinity ? [] : path;
    }

    formatDistance(distance) {
        return distance === Infinity ? '∞' : distance.toString();
    }

    formatPath(nodeId) {
        if (this.distances[nodeId] === Infinity) {
            return '-';
        }
        const path = this.getShortestPath(nodeId);
        return path.length > 0 ? path.join(' → ') : '-';
    }

    // 檢查是否存在負權重環
    checkForNegativeCycle() {
        for (const edge of this.edges) {
            if (this.canRelax(edge)) {
                return true;
            }
        }
        return false;
    }

    // 獲取當前正在處理的邊
    getCurrentEdge() {
        return this.relaxingEdge;
    }

    // 檢查節點是否最近被更新
    isNodeUpdated(nodeId) {
        return this.updatedNodes.has(nodeId);
    }

    // 清除更新標記
    clearUpdateMarks() {
        this.updatedNodes.clear();
    }
}