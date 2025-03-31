// ----- 路徑與環路 -----
let pcNodes = [];
let pcEdges = [];
let pcRunning = false;
let pcPaused = false;
let pcAnimationSteps = [];
let currentPcStep = 0;
let startNode = null;
let endNode = null;

function initPathCycle() {
    const container = document.getElementById('path-cycle-container');
    const generateBtn = document.getElementById('path-cycle-generate');
    const operationSelect = document.getElementById('path-cycle-operation');
    const startBtn = document.getElementById('path-cycle-start');
    const pauseBtn = document.getElementById('path-cycle-pause');
    const resetBtn = document.getElementById('path-cycle-reset');
    const speedSlider = document.getElementById('path-cycle-speed');
    const structureView = document.getElementById('path-cycle-structure');
    const statusText = document.getElementById('path-cycle-status');
    
    // 初始化事件監聽器
    generateBtn.addEventListener('click', generateGraph);
    operationSelect.addEventListener('change', updateOperation);
    startBtn.addEventListener('click', startOperation);
    pauseBtn.addEventListener('click', pauseOperation);
    resetBtn.addEventListener('click', resetOperation);
    
    // 圖的設置
    const width = container.clientWidth;
    const height = 400;
    let svg = null;
    let simulation = null;
    
    // 設置節點數量和邊的生成概率
    const nodeCount = 8;
    const edgeProbability = 0.3;
    
    function generateGraph() {
        resetOperation();
        
        // 生成節點
        pcNodes = Array(nodeCount).fill().map((_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // A, B, C, ...
        }));
        
        // 生成邊
        pcEdges = [];
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = 0; j < nodeCount; j++) {
                if (i !== j && Math.random() < edgeProbability) {
                    // 添加有向邊
                    pcEdges.push({
                        source: i,
                        target: j,
                        value: 1
                    });
                }
            }
        }
        
        // 確保每個節點至少有一條出邊和一條入邊
        for (let i = 0; i < nodeCount; i++) {
            const hasOutEdge = pcEdges.some(e => e.source === i);
            const hasInEdge = pcEdges.some(e => e.target === i);
            
            if (!hasOutEdge) {
                let target;
                do {
                    target = Math.floor(Math.random() * nodeCount);
                } while (target === i);
                
                pcEdges.push({
                    source: i,
                    target: target,
                    value: 1
                });
            }
            
            if (!hasInEdge) {
                let source;
                do {
                    source = Math.floor(Math.random() * nodeCount);
                } while (source === i);
                
                pcEdges.push({
                    source: source,
                    target: i,
                    value: 1
                });
            }
        }
        
        // 繪製圖
        renderGraph();
        
        // 更新狀態和結構視圖
        statusText.textContent = '已生成圖，請選擇操作並點擊「開始查找」按鈕';
        updateOperation();
        
        // 啟用開始按鈕
        startBtn.disabled = false;
        resetBtn.disabled = false;
    }
    
    function updateOperation() {
        const operation = operationSelect.value;
        
        if (operation === 'find-path') {
            structureView.textContent = '將使用BFS查找兩個節點之間的最短路徑\n\n請點擊「開始查找」按鈕選擇起點和終點';
        } else if (operation === 'find-cycle') {
            structureView.textContent = '將使用DFS查找圖中的環路\n\n請點擊「開始查找」按鈕開始搜索';
        }
    }
    
    // 在渲染圖之前確保容器存在且可見
    function renderGraph() {
        // 清空容器
        container.innerHTML = '';
        
        // 如果容器不可見，不需要繼續渲染
        if (container.offsetParent === null) {
            console.log('Path-Cycle tab is not visible, skipping render');
            return;
        }
        
        // 創建SVG
        svg = d3.select('#path-cycle-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 添加箭頭標記
        svg.append('defs').append('marker')
            .attr('id', 'pc-arrowhead')
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
        const links = pcEdges.map(edge => ({
            source: edge.source,
            target: edge.target,
            value: edge.value
        }));
        
        const nodes = pcNodes.map(node => ({
            id: node.id,
            label: node.label
        }));
        
        // 創建力模擬
        const linkDistance = 180; // 增加為固定較大的長度，確保線更長
        
        simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
            .force('charge', d3.forceManyBody().strength(-500)) // 進一步增強排斗力
            .force('center', d3.forceCenter(width / 2, height / 2))
            // 新增力以確保節點不會超出邊界
            .force('x', d3.forceX(width / 2).strength(0.05))
            .force('y', d3.forceY(height / 2).strength(0.05))
            .force('collision', d3.forceCollide().radius(25)); // 增加碰撞半徑
        
        // 創建連接
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', 2)
            .attr('stroke', '#999')
            .attr('marker-end', 'url(#pc-arrowhead)')
            .attr('id', d => `link-${d.source.id}-${d.target.id}`);
        
        // 創建節點
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', '#3498db')
            .attr('id', d => `node-${d.id}`)
            .on('click', handleNodeClick);
        
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
    
    function handleNodeClick(event, d) {
        if (!pcRunning) return;
        
        const operation = operationSelect.value;
        
        if (operation === 'find-path') {
            if (!startNode) {
                startNode = d.id;
                d3.select(`#node-${d.id}`).attr('fill', '#e74c3c');
                statusText.textContent = `已選擇起點 ${pcNodes[d.id].label}，請選擇終點`;
            } else if (!endNode) {
                endNode = d.id;
                d3.select(`#node-${d.id}`).attr('fill', '#2ecc71');
                statusText.textContent = `將查找從 ${pcNodes[startNode].label} 到 ${pcNodes[endNode].label} 的最短路徑`;
                
                // 開始BFS查找路徑
                setTimeout(() => findShortestPath(startNode, endNode), 500);
            }
        }
    }
    
    async function startOperation() {
        if (pcRunning && pcPaused) {
            pcPaused = false;
            continuePcAnimation();
            return;
        }
        
        if (pcRunning) return;
        
        pcRunning = true;
        pcPaused = false;
        disableButtons('path-cycle', true);
        
        // 重置節點和邊的顏色
        resetGraphColors();
        
        // 準備動畫步驟
        pcAnimationSteps = [];
        currentPcStep = 0;
        
        // 重置起點和終點
        startNode = null;
        endNode = null;
        
        const operation = operationSelect.value;
        
        if (operation === 'find-path') {
            // 開始選擇節點
            statusText.textContent = '請點擊一個節點作為起點';
        } else if (operation === 'find-cycle') {
            // 開始查找環路
            await findCycle();
        }
    }
    
    async function findShortestPath(source, target) {
        statusText.textContent = `正在使用BFS查找從 ${pcNodes[source].label} 到 ${pcNodes[target].label} 的最短路徑`;
        structureView.textContent = `使用廣度優先搜索(BFS)查找從 ${pcNodes[source].label} 到 ${pcNodes[target].label} 的最短路徑\n\n`;
        
        // 創建鄰接列表
        const adjList = Array(pcNodes.length).fill().map(() => []);
        
        for (const edge of pcEdges) {
            adjList[edge.source].push(edge.target);
        }
        
        // BFS查找最短路徑
        const queue = [source];
        const visited = new Set([source]);
        const parent = {};
        
        pcAnimationSteps.push({
            type: 'highlight-node',
            node: source,
            color: '#e74c3c',
            message: `開始BFS，從節點 ${pcNodes[source].label} 出發`
        });
        
        let found = false;
        
        while (queue.length > 0 && !found) {
            const node = queue.shift();
            
            pcAnimationSteps.push({
                type: 'check-node',
                node: node,
                color: '#f39c12',
                message: `檢查節點 ${pcNodes[node].label} 的相鄰節點`
            });
            
            for (const neighbor of adjList[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent[neighbor] = node;
                    queue.push(neighbor);
                    
                    pcAnimationSteps.push({
                        type: 'visit-neighbor',
                        node: neighbor,
                        parent: node,
                        color: '#3498db',
                        message: `訪問鄰居節點 ${pcNodes[neighbor].label}，設置其父節點為 ${pcNodes[node].label}`
                    });
                    
                    if (neighbor === target) {
                        found = true;
                        break;
                    }
                }
            }
        }
        
        if (found) {
            // 構建最短路徑
            const path = [];
            let current = target;
            
            while (current !== source) {
                path.unshift(current);
                current = parent[current];
            }
            
            path.unshift(source);
            
            pcAnimationSteps.push({
                type: 'highlight-path',
                path: path,
                message: `找到最短路徑: ${path.map(n => pcNodes[n].label).join(' -> ')}`
            });
        } else {
            pcAnimationSteps.push({
                type: 'message',
                message: `未找到從 ${pcNodes[source].label} 到 ${pcNodes[target].label} 的路徑`
            });
        }
        
        // 開始播放動畫
        await playPcAnimation();
    }
    
    async function findCycle() {
        statusText.textContent = '正在使用DFS查找環路';
        structureView.textContent = '使用深度優先搜索(DFS)查找圖中的環路\n\n';
        
        // 創建鄰接列表
        const adjList = Array(pcNodes.length).fill().map(() => []);
        
        for (const edge of pcEdges) {
            adjList[edge.source].push(edge.target);
        }
        
        // 用於DFS的訪問標記
        const visited = new Set();
        const inStack = new Set();
        let cycleFound = false;
        const cycleNodes = [];
        
        // 對每個未訪問的節點進行DFS
        for (let i = 0; i < pcNodes.length && !cycleFound; i++) {
            if (!visited.has(i)) {
                pcAnimationSteps.push({
                    type: 'start-dfs',
                    node: i,
                    message: `從節點 ${pcNodes[i].label} 開始DFS`
                });
                
                await dfs(i);
            }
        }
        
        async function dfs(node) {
            visited.add(node);
            inStack.add(node);
            
            pcAnimationSteps.push({
                type: 'visit-node',
                node: node,
                color: '#f39c12',
                message: `訪問節點 ${pcNodes[node].label}，添加到DFS堆棧`
            });
            
            for (const neighbor of adjList[node]) {
                if (cycleFound) return;
                
                if (!visited.has(neighbor)) {
                    pcAnimationSteps.push({
                        type: 'check-neighbor',
                        from: node,
                        to: neighbor,
                        message: `檢查鄰居節點 ${pcNodes[neighbor].label}`
                    });
                    
                    await dfs(neighbor);
                } else if (inStack.has(neighbor)) {
                    // 找到環路
                    cycleFound = true;
                    
                    // 構建環路
                    let current = node;
                    cycleNodes.push(neighbor);
                    
                    while (current !== neighbor) {
                        cycleNodes.push(current);
                        
                        // 找到current的父節點（這裡簡化處理，實際應記錄父節點）
                        for (let i = 0; i < pcNodes.length; i++) {
                            if (inStack.has(i) && adjList[i].includes(current)) {
                                current = i;
                                break;
                            }
                        }
                    }
                    
                    cycleNodes.reverse();
                    
                    pcAnimationSteps.push({
                        type: 'found-cycle',
                        cycle: cycleNodes,
                        message: `找到環路: ${cycleNodes.map(n => pcNodes[n].label).join(' -> ')} -> ${pcNodes[neighbor].label}`
                    });
                    
                    return;
                }
            }
            
            inStack.delete(node);
            
            pcAnimationSteps.push({
                type: 'backtrack',
                node: node,
                color: '#3498db',
                message: `回溯，將節點 ${pcNodes[node].label} 從DFS堆棧中移除`
            });
        }
        
        if (!cycleFound) {
            pcAnimationSteps.push({
                type: 'message',
                message: '圖中不存在環路'
            });
        }
        
        // 開始播放動畫
        await playPcAnimation();
    }
    
    async function playPcAnimation() {
        if (currentPcStep >= pcAnimationSteps.length) {
            pcRunning = false;
            disableButtons('path-cycle', false);
            return;
        }
        
        if (pcPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = pcAnimationSteps[currentPcStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message;
            structureView.textContent += `${step.message}\n`;
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'highlight-node':
                d3.select(`#node-${step.node}`).attr('fill', step.color);
                break;
                
            case 'check-node':
                d3.select(`#node-${step.node}`).attr('fill', step.color);
                break;
                
            case 'visit-neighbor':
                d3.select(`#node-${step.node}`).attr('fill', step.color);
                highlightEdge(step.parent, step.node);
                break;
                
            case 'highlight-path':
                // 高亮路徑上的所有節點和邊
                for (let i = 0; i < step.path.length - 1; i++) {
                    d3.select(`#node-${step.path[i]}`).attr('fill', '#2ecc71');
                    highlightEdge(step.path[i], step.path[i + 1], '#2ecc71');
                }
                d3.select(`#node-${step.path[step.path.length - 1]}`).attr('fill', '#2ecc71');
                break;
                
            case 'start-dfs':
                resetGraphColors();
                break;
                
            case 'visit-node':
                d3.select(`#node-${step.node}`).attr('fill', step.color);
                break;
                
            case 'check-neighbor':
                highlightEdge(step.from, step.to, '#f39c12');
                break;
                
            case 'backtrack':
                d3.select(`#node-${step.node}`).attr('fill', step.color);
                break;
                
            case 'found-cycle':
                // 高亮環路上的所有節點和邊
                for (let i = 0; i < step.cycle.length - 1; i++) {
                    d3.select(`#node-${step.cycle[i]}`).attr('fill', '#e74c3c');
                    highlightEdge(step.cycle[i], step.cycle[i + 1], '#e74c3c');
                }
                // 連接最後一個節點和第一個節點，形成環路
                highlightEdge(step.cycle[step.cycle.length - 1], step.cycle[0], '#e74c3c');
                d3.select(`#node-${step.cycle[0]}`).attr('fill', '#e74c3c');
                break;
        }
        
        // 移動到下一步
        currentPcStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 繼續動畫
        await playPcAnimation();
    }
    
    function highlightEdge(source, target, color = '#f39c12') {
        d3.select(`#link-${source}-${target}`).attr('stroke', color).attr('stroke-width', 3);
    }
    
    function resetGraphColors() {
        // 重置節點顏色
        d3.selectAll('[id^="node-"]').attr('fill', '#3498db');
        
        // 重置邊顏色
        d3.selectAll('[id^="link-"]').attr('stroke', '#999').attr('stroke-width', 2);
    }
    
    function continuePcAnimation() {
        disableButtons('path-cycle', true);
        playPcAnimation();
    }
    
    function pauseOperation() {
        pcPaused = true;
        disableButtons('path-cycle', false);
    }
    
    function resetOperation() {
        if (pcRunning) {
            pcPaused = true;
            pcRunning = false;
        }
        
        currentPcStep = 0;
        pcAnimationSteps = [];
        
        startNode = null;
        endNode = null;
        
        resetGraphColors();
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成圖」按鈕開始';
        
        disableButtons('path-cycle', false, true);
        document.getElementById('path-cycle-start').disabled = true;
        document.getElementById('path-cycle-reset').disabled = true;
    }
    
    // 初始生成圖
    generateGraph();
}

// 幫助函數：在按鈕的啟用/禁用狀態之間切換
function disableButtons(prefix, disableStart, resetAll = false) {
    if (resetAll) {
        document.getElementById(`${prefix}-start`).disabled = false;
        document.getElementById(`${prefix}-pause`).disabled = true;
        document.getElementById(`${prefix}-reset`).disabled = false;
        return;
    }
    
    document.getElementById(`${prefix}-start`).disabled = disableStart;
    document.getElementById(`${prefix}-pause`).disabled = !disableStart;
    document.getElementById(`${prefix}-reset`).disabled = false;
}

// 幫助函數：等待指定的毫秒數
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', () => {
    initPathCycle();
});

// 將初始化函數暴露為全局函數以供切換時調用
window.initPathCycle = initPathCycle;