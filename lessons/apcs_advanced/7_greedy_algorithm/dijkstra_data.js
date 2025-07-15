// Dijkstra Algorithm Graph Data
class DijkstraData {
    constructor() {
        this.nodes = [
            { id: 'A', x: 100, y: 200, label: 'A' },
            { id: 'B', x: 500, y: 250, label: 'B' },
            { id: 'C', x: 200, y: 120, label: 'C' },
            { id: 'D', x: 380, y: 80, label: 'D' },
            { id: 'E', x: 320, y: 180, label: 'E' },
            { id: 'F', x: 180, y: 280, label: 'F' },
            { id: 'G', x: 380, y: 320, label: 'G' }
        ];

        this.edges = [
            { from: 'A', to: 'C', weight: 3 },
            { from: 'A', to: 'F', weight: 2 },
            { from: 'C', to: 'D', weight: 4 },
            { from: 'C', to: 'E', weight: 1 },
            { from: 'C', to: 'F', weight: 2 },
            { from: 'D', to: 'B', weight: 1 },
            { from: 'E', to: 'B', weight: 2 },
            { from: 'E', to: 'F', weight: 3 },
            { from: 'F', to: 'G', weight: 5 },
            { from: 'G', to: 'B', weight: 2 },
            { from: 'F', to: 'B', weight: 6 }
        ];

        this.startNode = 'A';
        this.distances = {};
        this.previous = {};
        this.visited = new Set();
        this.unvisited = new Set();
        this.currentNode = null;
        
        this.initializeAlgorithm();
    }

    initializeAlgorithm() {
        // 初始化距離和前一節點
        this.nodes.forEach(node => {
            this.distances[node.id] = node.id === this.startNode ? 0 : Infinity;
            this.previous[node.id] = null;
            this.unvisited.add(node.id);
        });
        
        this.visited.clear();
        this.currentNode = this.startNode;
    }

    reset() {
        this.initializeAlgorithm();
    }

    getNodeById(id) {
        return this.nodes.find(node => node.id === id);
    }

    getEdgesBetween(nodeA, nodeB) {
        return this.edges.filter(edge => 
            (edge.from === nodeA && edge.to === nodeB) || 
            (edge.from === nodeB && edge.to === nodeA)
        );
    }

    getNeighbors(nodeId) {
        const neighbors = [];
        this.edges.forEach(edge => {
            if (edge.from === nodeId && this.unvisited.has(edge.to)) {
                neighbors.push({ node: edge.to, weight: edge.weight });
            } else if (edge.to === nodeId && this.unvisited.has(edge.from)) {
                neighbors.push({ node: edge.from, weight: edge.weight });
            }
        });
        return neighbors;
    }

    getShortestPath(target) {
        const path = [];
        let current = target;
        
        while (current !== null) {
            path.unshift(current);
            current = this.previous[current];
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
        return this.getShortestPath(nodeId).join(' → ');
    }
}