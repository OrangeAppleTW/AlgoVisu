// ----- 廣度優先搜索 (BFS) -----
let bfsNodes = [];
let bfsEdges = [];
let bfsRunning = false;
let bfsPaused = false;
let bfsAnimationSteps = [];
let currentBfsStep = 0;
let bfsStartNode = null;
let bfsEndNode = null;

function initBFS() {
    const container = document.getElementById('bfs-container');
    const generateBtn = document.getElementById('bfs-generate');
    const sizeSelect = document.getElementById('bfs-size');
    const startBtn = document.getElementById('bfs-start');
    const pauseBtn = document.getElementById('bfs-pause');
    const resetBtn = document.getElementById('bfs-reset');
    const speedSlider = document.getElementById('bfs-speed');
    const structureView = document.getElementById('bfs-structure');
    const statusText = document.getElementById('bfs-status');
    
    // 初始化事件監聽器
    generateBtn.addEventListener('click', generateGraph);
    startBtn.addEventListener('click', startBFS);
    pauseBtn.addEventListener('click', pauseBFS);
    resetBtn.addEventListener('click', resetBFS);
    
    // 圖的設置
    const width = container.clientWidth;
    const height = 400;
    let svg = null;
    let simulation = null;
    
    function generateGraph() {
        resetBFS();
        
        // 獲取節點數量
        const nodeCount = parseInt(sizeSelect.value);
        
        // 生成節點
        bfsNodes = Array(nodeCount).fill().map((_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // A, B, C, ...
        }));
        
        // 生成邊（無向圖）
        bfsEdges = [];
        
        // 設置連接概率
        const edgeProbability = 0.3;
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() < edgeProbability) {
                    bfsEdges.push({
                        source: i,
                        target: j
                    });
                }
            }
        }
        
        // 確保圖是連通的
        ensureConnected();
        
        // 繪製圖
        renderGraph();
        
        // 更新狀態
        statusText.textContent = '圖已生成，點擊「開始搜索」按鈕選擇起點和終點';
        structureView.textContent = '廣度優先搜索(BFS)用於查找無權圖中的最短路徑\n\n點擊「開始搜索」按鈕，然後選擇起點和終點';
        
        // 啟用開始按鈕
        startBtn.disabled = false;
        resetBtn.disabled = false;
    }
    
    function ensureConnected() {
        // 使用BFS檢查圖的連通性
        const visited = new Set([0]);
        const queue = [0];
        
        while (queue.length > 0) {
            const node = queue.shift();
            
            for (const edge of bfsEdges) {
                let neighbor = null;
                if (edge.source === node) {
                    neighbor = edge.target;
                } else if (edge.target === node) {
                    neighbor = edge.source;
                }
                
                if (neighbor !== null && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        
        // 如果有節點未訪問，添加邊連接它們
        if (visited.size < bfsNodes.length) {
            for (let i = 0; i < bfsNodes.length; i++) {
                if (!visited.has(i)) {
                    // 連接到已訪問的節點
                    const connectedNode = Array.from(visited)[0];
                    bfsEdges.push({
                        source: connectedNode,
                        target: i
                    });
                    
                    // 更新訪問集合和隊列
                    visited.add(i);
                    queue.push(i);
                }
            }
        }
    }
    
    function renderGraph() {
        // 清空容器
        container.innerHTML = '';
        
        // 創建SVG
        svg = d3.select('#bfs-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 準備節點和連接的D3格式
        const links = bfsEdges.map(edge => ({
            source: edge.source,
            target: edge.target
        }));
        
        const nodes = bfsNodes.map(node => ({
            id: node.id,
            label: node.label
        }));
        
        // 創建力模擬
        const linkDistance = bfsNodes.length > 8 ? 150 : 100; // 根據節點數量設置連接距離
        
        simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
            .force('charge', d3.forceManyBody().strength(-400)) // 增強排斗力
            .force('center', d3.forceCenter(width / 2, height / 2))
            // 新增力以確保節點不會超出邊界
            .force('x', d3.forceX(width / 2).strength(0.07))
            .force('y', d3.forceY(height / 2).strength(0.07))
            .force('collision', d3.forceCollide().radius(20));
        
        // 創建連接
        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', 2)
            .attr('stroke', '#999')
            .attr('id', d => `bfs-link-${d.source.id}-${d.target.id}`);
        
        // 創建節點
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', '#3498db')
            .attr('id', d => `bfs-node-${d.id}`)
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
        if (!bfsRunning) return;
        
        if (!bfsStartNode) {
            bfsStartNode = d.id;
            d3.select(`#bfs-node-${d.id}`).attr('fill', '#e74c3c');
            statusText.textContent = `已選擇起點 ${bfsNodes[d.id].label}，請選擇終點`;
        } else if (!bfsEndNode) {
            bfsEndNode = d.id;
            d3.select(`#bfs-node-${d.id}`).attr('fill', '#2ecc71');
            statusText.textContent = `將使用BFS查找從 ${bfsNodes[bfsStartNode].label} 到 ${bfsNodes[bfsEndNode].label} 的最短路徑`;
            
            // 開始BFS
            setTimeout(() => runBFS(bfsStartNode, bfsEndNode), 500);
        }
    }
    
    async function startBFS() {
        if (bfsRunning && bfsPaused) {
            bfsPaused = false;
            continueBfsAnimation();
            return;
        }
        
        if (bfsRunning) return;
        
        bfsRunning = true;
        bfsPaused = false;
        disableButtons('bfs', true);
        
        // 重置節點和邊的顏色
        resetGraphColors();
        
        // 重置起點和終點
        bfsStartNode = null;
        bfsEndNode = null;
        
        // 準備動畫步驟
        bfsAnimationSteps = [];
        currentBfsStep = 0;
        
        // 提示用戶選擇節點
        statusText.textContent = '請點擊一個節點作為起點';
    }
    
    async function runBFS(start, end) {
        structureView.textContent = `使用廣度優先搜索(BFS)查找從 ${bfsNodes[start].label} 到 ${bfsNodes[end].label} 的最短路徑\n\n`;
        
        // 創建鄰接列表
        const adjList = Array(bfsNodes.length).fill().map(() => []);
        
        for (const edge of bfsEdges) {
            adjList[edge.source].push(edge.target);
            adjList[edge.target].push(edge.source); // 無向圖
        }
        
        // BFS實現
        const queue = [start];
        const visited = new Set([start]);
        const parent = {};
        
        bfsAnimationSteps.push({
            type: 'start-bfs',
            node: start,
            message: `開始BFS，從起點 ${bfsNodes[start].label} 出發`
        });
        
        bfsAnimationSteps.push({
            type: 'queue-update',
            queue: [...queue],
            message: `隊列: [${queue.map(n => bfsNodes[n].label).join(', ')}]`
        });
        
        let found = false;
        
        while (queue.length > 0 && !found) {
            const node = queue.shift();
            
            bfsAnimationSteps.push({
                type: 'dequeue',
                node: node,
                message: `從隊列中取出節點 ${bfsNodes[node].label}`
            });
            
            bfsAnimationSteps.push({
                type: 'visit-node',
                node: node,
                message: `訪問節點 ${bfsNodes[node].label}`
            });
            
            if (node === end) {
                found = true;
                bfsAnimationSteps.push({
                    type: 'found-target',
                    node: node,
                    message: `找到終點 ${bfsNodes[node].label}！`
                });
                break;
            }
            
            bfsAnimationSteps.push({
                type: 'check-neighbors',
                node: node,
                neighbors: adjList[node],
                message: `檢查節點 ${bfsNodes[node].label} 的相鄰節點`
            });
            
            for (const neighbor of adjList[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    parent[neighbor] = node;
                    
                    bfsAnimationSteps.push({
                        type: 'enqueue',
                        node: neighbor,
                        parent: node,
                        message: `將節點 ${bfsNodes[neighbor].label} 加入隊列，其父節點為 ${bfsNodes[node].label}`
                    });
                    
                    bfsAnimationSteps.push({
                        type: 'queue-update',
                        queue: [...queue],
                        message: `隊列: [${queue.map(n => bfsNodes[n].label).join(', ')}]`
                    });
                } else {
                    bfsAnimationSteps.push({
                        type: 'already-visited',
                        node: neighbor,
                        message: `節點 ${bfsNodes[neighbor].label} 已訪問過，跳過`
                    });
                }
            }
        }
        
        if (found) {
            // 構建路徑
            const path = [];
            let current = end;
            
            while (current !== start) {
                path.unshift(current);
                current = parent[current];
            }
            
            path.unshift(start);
            
            bfsAnimationSteps.push({
                type: 'show-path',
                path: path,
                message: `最短路徑: ${path.map(n => bfsNodes[n].label).join(' -> ')}，長度: ${path.length - 1}`
            });
        } else {
            bfsAnimationSteps.push({
                type: 'no-path',
                message: `未找到從 ${bfsNodes[start].label} 到 ${bfsNodes[end].label} 的路徑`
            });
        }
        
        // 開始播放動畫
        await playBfsAnimation();
    }
    
    async function playBfsAnimation() {
        if (currentBfsStep >= bfsAnimationSteps.length) {
            bfsRunning = false;
            disableButtons('bfs', false);
            return;
        }
        
        if (bfsPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = bfsAnimationSteps[currentBfsStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message;
            structureView.textContent += `${step.message}\n`;
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'start-bfs':
                // 起點已經在選擇時高亮
                break;
                
            case 'queue-update':
                // 僅更新文本
                break;
                
            case 'dequeue':
                d3.select(`#bfs-node-${step.node}`).attr('fill', '#f39c12');
                break;
                
            case 'visit-node':
                d3.select(`#bfs-node-${step.node}`).attr('fill', '#9b59b6');
                break;
                
            case 'found-target':
                // 終點已經在選擇時高亮
                break;
                
            case 'check-neighbors':
                // 暫時高亮所有相鄰節點
                for (const neighbor of step.neighbors) {
                    highlightEdge(step.node, neighbor, '#f39c12');
                }
                break;
                
            case 'enqueue':
                d3.select(`#bfs-node-${step.node}`).attr('fill', '#3498db');
                highlightEdge(step.parent, step.node, '#3498db');
                break;
                
            case 'already-visited':
                // 暫時高亮已訪問的相鄰節點
                highlightEdge(step.parent, step.node, '#e74c3c');
                setTimeout(() => {
                    d3.select(`#bfs-link-${step.parent}-${step.node}`).attr('stroke', '#999').attr('stroke-width', 2);
                    d3.select(`#bfs-link-${step.node}-${step.parent}`).attr('stroke', '#999').attr('stroke-width', 2);
                }, 500);
                break;
                
            case 'show-path':
                // 高亮路徑
                resetGraphColors();
                for (let i = 0; i < step.path.length - 1; i++) {
                    highlightEdge(step.path[i], step.path[i + 1], '#2ecc71');
                    d3.select(`#bfs-node-${step.path[i]}`).attr('fill', '#2ecc71');
                }
                d3.select(`#bfs-node-${step.path[step.path.length - 1]}`).attr('fill', '#2ecc71');
                break;
                
            case 'no-path':
                // 重置圖的顏色
                resetGraphColors();
                d3.select(`#bfs-node-${bfsStartNode}`).attr('fill', '#e74c3c');
                d3.select(`#bfs-node-${bfsEndNode}`).attr('fill', '#e74c3c');
                break;
        }
        
        // 滾動到視圖底部
        structureView.scrollTop = structureView.scrollHeight;
        
        // 移動到下一步
        currentBfsStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 繼續動畫
        await playBfsAnimation();
    }
    
    function highlightEdge(source, target, color = '#f39c12') {
        // 檢查兩個方向的邊
        d3.select(`#bfs-link-${source}-${target}`).attr('stroke', color).attr('stroke-width', 3);
        d3.select(`#bfs-link-${target}-${source}`).attr('stroke', color).attr('stroke-width', 3);
    }
    
    function resetGraphColors() {
        // 重置節點顏色
        d3.selectAll('[id^="bfs-node-"]').attr('fill', '#3498db');
        
        // 重置邊顏色
        d3.selectAll('[id^="bfs-link-"]').attr('stroke', '#999').attr('stroke-width', 2);
    }
    
    function continueBfsAnimation() {
        disableButtons('bfs', true);
        playBfsAnimation();
    }
    
    function pauseBFS() {
        bfsPaused = true;
        disableButtons('bfs', false);
    }
    
    function resetBFS() {
        if (bfsRunning) {
            bfsPaused = true;
            bfsRunning = false;
        }
        
        currentBfsStep = 0;
        bfsAnimationSteps = [];
        
        bfsStartNode = null;
        bfsEndNode = null;
        
        resetGraphColors();
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成圖」按鈕開始';
        
        disableButtons('bfs', false, true);
        document.getElementById('bfs-start').disabled = true;
        document.getElementById('bfs-reset').disabled = true;
    }
    
    // 初始生成圖
    generateGraph();
}

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', () => {
    initBFS();
});