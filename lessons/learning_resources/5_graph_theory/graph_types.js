// ----- 圖的類型和表示 -----
let graphNodes = [];
let graphEdges = [];
let graphType = 'undirected';
let graphRepresentation = 'adjacency-matrix';

function initGraphTypes() {
    const container = document.getElementById('graph-type-container');
    const generateBtn = document.getElementById('graph-type-generate');
    const typeSelect = document.getElementById('graph-type-select');
    const representationSelect = document.getElementById('graph-type-representation');
    const sizeSelect = document.getElementById('graph-type-size');
    const structureView = document.getElementById('graph-type-structure');
    const statusText = document.getElementById('graph-type-status');
    
    // 初始化事件監聽器
    generateBtn.addEventListener('click', generateGraph);
    typeSelect.addEventListener('change', updateGraphType);
    representationSelect.addEventListener('change', updateGraphRepresentation);
    
    // 圖的初始設置
    const width = container.clientWidth;
    const height = 400;
    let simulation = null;
    
    function updateGraphType() {
        graphType = typeSelect.value;
        if (graphNodes.length > 0) {
            updateStructureView();
            renderGraph();
        }
    }
    
    function updateGraphRepresentation() {
        graphRepresentation = representationSelect.value;
        if (graphNodes.length > 0) {
            updateStructureView();
        }
    }
    
    function generateGraph() {
        // 獲取圖的類型和大小
        graphType = typeSelect.value;
        const nodeCount = parseInt(sizeSelect.value);
        graphRepresentation = representationSelect.value;
        
        // 生成節點
        graphNodes = Array(nodeCount).fill().map((_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // A, B, C, ...
        }));
        
        // 生成邊
        graphEdges = [];
        
        // 設置連接概率
        const edgeProbability = 0.3;
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() < edgeProbability) {
                    // 根據圖的類型創建邊
                    if (graphType === 'undirected' || graphType === 'weighted-undirected') {
                        // 無向圖或無向加權圖
                        const weight = graphType.includes('weighted') ? Math.floor(Math.random() * 9) + 1 : 1;
                        graphEdges.push({
                            source: i,
                            target: j,
                            weight: weight
                        });
                    } else if (graphType === 'directed' || graphType === 'weighted-directed') {
                        // 有向圖或有向加權圖
                        const weight = graphType.includes('weighted') ? Math.floor(Math.random() * 9) + 1 : 1;
                        graphEdges.push({
                            source: i,
                            target: j,
                            weight: weight,
                            directed: true
                        });
                        
                        // 隨機決定是否也添加反向邊
                        if (Math.random() < 0.3) {
                            const reverseWeight = graphType.includes('weighted') ? Math.floor(Math.random() * 9) + 1 : 1;
                            graphEdges.push({
                                source: j,
                                target: i,
                                weight: reverseWeight,
                                directed: true
                            });
                        }
                    }
                }
            }
        }
        
        // 如果節點數較多，確保每個節點至少有一個連接
        if (nodeCount > 5) {
            for (let i = 0; i < nodeCount; i++) {
                const hasEdge = graphEdges.some(e => e.source === i || e.target === i);
                if (!hasEdge) {
                    // 添加一個隨機連接
                    let target;
                    do {
                        target = Math.floor(Math.random() * nodeCount);
                    } while (target === i);
                    
                    const weight = graphType.includes('weighted') ? Math.floor(Math.random() * 9) + 1 : 1;
                    
                    if (graphType === 'undirected' || graphType === 'weighted-undirected') {
                        graphEdges.push({
                            source: i,
                            target: target,
                            weight: weight
                        });
                    } else {
                        graphEdges.push({
                            source: i,
                            target: target,
                            weight: weight,
                            directed: true
                        });
                    }
                }
            }
        }
        
        // 創建鄰接矩陣和鄰接列表
        updateStructureView();
        
        // 繪製圖
        renderGraph();
        
        statusText.textContent = `已生成${getGraphTypeName()}，使用${getRepresentationName()}表示`;
    }
    
    function updateStructureView() {
        // 根據當前的表示方法更新結構視圖
        if (graphRepresentation === 'adjacency-matrix') {
            displayAdjacencyMatrix();
        } else {
            displayAdjacencyList();
        }
    }
    
    function displayAdjacencyMatrix() {
        // 創建鄰接矩陣
        const n = graphNodes.length;
        const matrix = Array(n).fill().map(() => Array(n).fill(0));
        
        for (const edge of graphEdges) {
            const { source, target, weight } = edge;
                        
            if (graphType.includes('weighted')) {
                matrix[source][target] = weight;
                if (graphType === 'weighted-undirected') {
                    matrix[target][source] = weight;
                }
            } else {
                matrix[source][target] = 1;
                if (graphType === 'undirected') {
                    matrix[target][source] = 1;
                }
            }
        }
        
        // 顯示鄰接矩陣
        let matrixText = `${getGraphTypeName()}的鄰接矩陣表示：\n\n`;
        
        // 添加列標籤
        matrixText += '    ';
        for (let i = 0; i < n; i++) {
            matrixText += ` ${graphNodes[i].label} `;
        }
        matrixText += '\n';
        
        // 添加矩陣內容
        for (let i = 0; i < n; i++) {
            matrixText += ` ${graphNodes[i].label} `;
            for (let j = 0; j < n; j++) {
                matrixText += ` ${matrix[i][j]} `;
            }
            matrixText += '\n';
        }
        
        structureView.textContent = matrixText;
    }
    
    function displayAdjacencyList() {
        // 創建鄰接列表
        const n = graphNodes.length;
        const adjList = Array(n).fill().map(() => []);
        
        for (const edge of graphEdges) {
            const { source, target, weight } = edge;
            
            if (graphType.includes('weighted')) {
                adjList[source].push({ node: target, weight: weight });
                if (graphType === 'weighted-undirected') {
                    adjList[target].push({ node: source, weight: weight });
                }
            } else {
                adjList[source].push({ node: target });
                if (graphType === 'undirected') {
                    adjList[target].push({ node: source });
                }
            }
        }
        
        // 顯示鄰接列表
        let listText = `${getGraphTypeName()}的鄰接列表表示：\n\n`;
        
        for (let i = 0; i < n; i++) {
            listText += `${graphNodes[i].label} -> `;
            
            if (adjList[i].length === 0) {
                listText += '空';
            } else {
                const neighbors = adjList[i].map(neighbor => {
                    const neighborNode = graphNodes[neighbor.node].label;
                    return graphType.includes('weighted') ? 
                        `${neighborNode}(權重:${neighbor.weight})` : neighborNode;
                });
                
                listText += neighbors.join(', ');
            }
            
            listText += '\n';
        }
        
        structureView.textContent = listText;
    }
    
    function renderGraph() {
        // 清空容器
        container.innerHTML = '';
        
        // 創建SVG
        const svg = d3.select('#graph-type-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 添加箭頭標記（用於有向圖）
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20) // 調整箭頭位置，切間的接觸到節點
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');
        
        // 準備節點和連接的D3格式
        const links = graphEdges.map(edge => ({
            source: edge.source,
            target: edge.target,
            weight: edge.weight,
            directed: edge.directed
        }));
        
        const nodes = graphNodes.map(node => ({
            id: node.id,
            label: node.label
        }));
        
        // 創建力模擬
        const linkDistance = graphNodes.length > 8 ? 150 : 100; // 根據節點數量設置連接距離
        
        simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
            .force('charge', d3.forceManyBody().strength(-400)) // 增強排斗力
            .force('center', d3.forceCenter(width / 2, height / 2))
            // 新增力以確保節點不會超出邊界
            .force('x', d3.forceX(width / 2).strength(0.07))
            .force('y', d3.forceY(height / 2).strength(0.07))
            .force('collision', d3.forceCollide().radius(20));
        
        // 創建連接  const link = svg.append(h).data(link).selectALL.enter().append(line)
    
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', 2)
            .attr('stroke', '#999')
            .attr('marker-end', d => graphType.includes('directed') && d.directed ? 'url(#arrowhead)' : '');
        
        // 創建節點
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', '#3498db');
        
        // 添加節點標籤
        const labels = svg.append('g')
            .selectAll('text')
            .data(nodes)
            .enter().append('text')
            .attr('class', 'node-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .text(d => d.label);
        
        // 如果是加權圖，添加權重標籤
        if (graphType.includes('weighted')) {
            const weightLabels = svg.append('g')
                .selectAll('text')
                .data(links)
                .enter().append('text')
                .attr('class', 'weight-label')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', '#e74c3c')
                .attr('font-weight', 'bold')
                .text(d => d.weight);
                
            // 更新權重標籤位置
            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                
                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                
                labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
                
                weightLabels
                    .attr('x', d => (d.source.x + d.target.x) / 2)
                    .attr('y', d => (d.source.y + d.target.y) / 2);
            });
        } else {
            // 更新位置並確保不超出邊界
            simulation.on('tick', () => {
            // 將節點限制在視圖區域內
            nodes.forEach(d => {
            d.x = Math.max(15, Math.min(width - 15, d.x));
            d.y = Math.max(15, Math.min(height - 15, d.y));
            });
            
            link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                    .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            
            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
        }
        
        // 添加拖拽行為
        node.call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
            
        // 添加縮放功能
        // 首先創建一個包含所有元素的群組
        const svgGroup = svg.append('g').attr('class', 'zoom-group');
        
        // 將之前創建的元素移動到這個群組中
        svg.selectAll('g').each(function() {
            if (!d3.select(this).classed('zoom-group')) {
                const g = d3.select(this);
                svgGroup.node().appendChild(g.node());
            }
        });
        
        // 應用縮放和平移於整個群組
        svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 2]) // 限制縮放範圍
            .on('zoom', (event) => {
                svgGroup.attr('transform', event.transform);
            }));
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
    
    function getGraphTypeName() {
        switch(graphType) {
            case 'undirected':
                return '無向圖';
            case 'directed':
                return '有向圖';
            case 'weighted-undirected':
                return '無向加權圖';
            case 'weighted-directed':
                return '有向加權圖';
            default:
                return '未知圖類型';
        }
    }
    
    function getRepresentationName() {
        switch(graphRepresentation) {
            case 'adjacency-matrix':
                return '鄰接矩陣';
            case 'adjacency-list':
                return '鄰接列表';
            default:
                return '未知表示方法';
        }
    }
    
    // 初始生成圖
    generateGraph();
}

// 加載時初始化圖的類型與標籤切換功能
document.addEventListener('DOMContentLoaded', () => {
    initGraphTypes();
    
    // 添加標籤切換功能
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // 更新標籤狀態
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新內容區域
            tabContents.forEach(content => {
                if (content.id === target) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // 如果正在切換到路徑與環路標籤，確保初始化
            if (target === 'path-cycle') {
                if (window.initPathCycle && typeof window.initPathCycle === 'function') {
                    window.initPathCycle();
                }
            }
            // 如果正在切換到連通與樹標籤，確保初始化
            else if (target === 'connected-tree') {
                if (window.initConnectedTree && typeof window.initConnectedTree === 'function') {
                    window.initConnectedTree();
                }
            }
        });
    });
});