// ----- 深度優先搜索 (DFS) -----
let dfsNodes = [];
let dfsEdges = [];
let dfsRunning = false;
let dfsPaused = false;
let dfsAnimationSteps = [];
let currentDfsStep = 0;
let dfsStartNode = null;
let dfsEndNode = null;

function initDFS() {
    const container = document.getElementById('dfs-container');
    const generateBtn = document.getElementById('dfs-generate');
    const sizeSelect = document.getElementById('dfs-size');
    const startBtn = document.getElementById('dfs-start');
    const pauseBtn = document.getElementById('dfs-pause');
    const resetBtn = document.getElementById('dfs-reset');
    const speedSlider = document.getElementById('dfs-speed');
    const structureView = document.getElementById('dfs-structure');
    const statusText = document.getElementById('dfs-status');
    
    // 初始化事件監聽器
    generateBtn.addEventListener('click', generateGraph);
    startBtn.addEventListener('click', startDFS);
    pauseBtn.addEventListener('click', pauseDFS);
    resetBtn.addEventListener('click', resetDFS);
    
    // 圖的設置
    const width = container.clientWidth;
    const height = 400;
    let svg = null;
    let simulation = null;
    
    function generateGraph() {
        resetDFS();
        
        // 獲取節點數量
        const nodeCount = parseInt(sizeSelect.value);
        
        // 生成節點
        dfsNodes = Array(nodeCount).fill().map((_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // A, B, C, ...
        }));
        
        // 生成邊（無向圖）
        dfsEdges = [];
        
        // 設置連接概率
        const edgeProbability = 0.3;
        
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                if (Math.random() < edgeProbability) {
                    dfsEdges.push({
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
        structureView.textContent = '深度優先搜索(DFS)用於查找路徑或探索圖的結構\n\n點擊「開始搜索」按鈕，然後選擇起點和終點';
        
        // 啟用開始按鈕
        startBtn.disabled = false;
        resetBtn.disabled = false;
    }
    
    function ensureConnected() {
        // 使用DFS檢查圖的連通性
        const visited = new Set();
        
        function dfs(node) {
            visited.add(node);
            
            for (const edge of dfsEdges) {
                let neighbor = null;
                if (edge.source === node) {
                    neighbor = edge.target;
                } else if (edge.target === node) {
                    neighbor = edge.source;
                }
                
                if (neighbor !== null && !visited.has(neighbor)) {
                    dfs(neighbor);
                }
            }
        }
        
        dfs(0);
        
        // 如果有節點未訪問，添加邊連接它們
        if (visited.size < dfsNodes.length) {
            for (let i = 0; i < dfsNodes.length; i++) {
                if (!visited.has(i)) {
                    // 連接到已訪問的節點
                    const connectedNode = Array.from(visited)[0];
                    dfsEdges.push({
                        source: connectedNode,
                        target: i
                    });
                    
                    // 更新訪問集合
                    dfs(i);
                }
            }
        }
    }
    
    function renderGraph() {
        // 清空容器
        container.innerHTML = '';
        
        // 創建SVG
        svg = d3.select('#dfs-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 準備節點和連接的D3格式
        const links = dfsEdges.map(edge => ({
            source: edge.source,
            target: edge.target
        }));
        
        const nodes = dfsNodes.map(node => ({
            id: node.id,
            label: node.label
        }));
        
        // 創建力模擬
        const linkDistance = dfsNodes.length > 8 ? 150 : 100; // 根據節點數量設置連接距離
        
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
            .attr('id', d => `dfs-link-${d.source.id}-${d.target.id}`);
        
        // 創建節點
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', '#3498db')
            .attr('id', d => `dfs-node-${d.id}`)
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
        if (!dfsRunning) return;
        
        if (!dfsStartNode) {
            dfsStartNode = d.id;
            d3.select(`#dfs-node-${d.id}`).attr('fill', '#e74c3c');
            statusText.textContent = `已選擇起點 ${dfsNodes[d.id].label}，請選擇終點`;
        } else if (!dfsEndNode) {
            dfsEndNode = d.id;
            d3.select(`#dfs-node-${d.id}`).attr('fill', '#2ecc71');
            statusText.textContent = `將使用DFS查找從 ${dfsNodes[dfsStartNode].label} 到 ${dfsNodes[dfsEndNode].label} 的路徑`;
            
            // 開始DFS
            setTimeout(() => runDFS(dfsStartNode, dfsEndNode), 500);
        }
    }
    
    async function startDFS() {
        if (dfsRunning && dfsPaused) {
            dfsPaused = false;
            continueDfsAnimation();
            return;
        }
        
        if (dfsRunning) return;
        
        dfsRunning = true;
        dfsPaused = false;
        disableButtons('dfs', true);
        
        // 重置節點和邊的顏色
        resetGraphColors();
        
        // 重置起點和終點
        dfsStartNode = null;
        dfsEndNode = null;
        
        // 準備動畫步驟
        dfsAnimationSteps = [];
        currentDfsStep = 0;
        
        // 提示用戶選擇節點
        statusText.textContent = '請點擊一個節點作為起點';
    }
    
    async function runDFS(start, end) {
        structureView.textContent = `使用深度優先搜索(DFS)查找從 ${dfsNodes[start].label} 到 ${dfsNodes[end].label} 的路徑\n\n`;
        
        // 創建鄰接列表
        const adjList = Array(dfsNodes.length).fill().map(() => []);
        
        for (const edge of dfsEdges) {
            adjList[edge.source].push(edge.target);
            adjList[edge.target].push(edge.source); // 無向圖
        }
        
        // DFS實現（迭代版）
        const stack = [{ node: start, path: [start] }];
        const visited = new Set([start]);
        let foundPath = null;
        
        dfsAnimationSteps.push({
            type: 'start-dfs',
            node: start,
            message: `開始DFS，從起點 ${dfsNodes[start].label} 出發`
        });
        
        dfsAnimationSteps.push({
            type: 'stack-update',
            stack: [{ node: start, path: [start].map(n => dfsNodes[n].label) }],
            message: `堆疊: [${dfsNodes[start].label}]`
        });
        
        while (stack.length > 0 && !foundPath) {
            const { node, path } = stack.pop();
            
            dfsAnimationSteps.push({
                type: 'pop',
                node: node,
                message: `從堆疊中彈出節點 ${dfsNodes[node].label}`
            });
            
            dfsAnimationSteps.push({
                type: 'visit-node',
                node: node,
                message: `訪問節點 ${dfsNodes[node].label}`
            });
            
            if (node === end) {
                foundPath = path;
                dfsAnimationSteps.push({
                    type: 'found-target',
                    node: node,
                    message: `找到終點 ${dfsNodes[node].label}！`
                });
                break;
            }
            
            dfsAnimationSteps.push({
                type: 'check-neighbors',
                node: node,
                neighbors: adjList[node],
                message: `檢查節點 ${dfsNodes[node].label} 的相鄰節點`
            });
            
            // 將相鄰節點逆序添加到堆疊中（以便按照正序遍歷）
            const neighbors = [...adjList[node]].reverse();
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    
                    const newPath = [...path, neighbor];
                    stack.push({
                        node: neighbor,
                        path: newPath
                    });
                    
                    dfsAnimationSteps.push({
                        type: 'push',
                        node: neighbor,
                        parent: node,
                        message: `將節點 ${dfsNodes[neighbor].label} 壓入堆疊，其父節點為 ${dfsNodes[node].label}`
                    });
                    
                    dfsAnimationSteps.push({
                        type: 'stack-update',
                        stack: stack.map(item => ({ 
                            node: item.node, 
                            path: item.path.map(n => dfsNodes[n].label) 
                        })),
                        message: `堆疊: [${stack.map(item => dfsNodes[item.node].label).join(', ')}]`
                    });
                } else {
                    dfsAnimationSteps.push({
                        type: 'already-visited',
                        node: neighbor,
                        parent: node,
                        message: `節點 ${dfsNodes[neighbor].label} 已訪問過，跳過`
                    });
                }
            }
        }
        
        if (foundPath) {
            dfsAnimationSteps.push({
                type: 'show-path',
                path: foundPath,
                message: `找到路徑: ${foundPath.map(n => dfsNodes[n].label).join(' -> ')}，長度: ${foundPath.length - 1}`
            });
        } else {
            dfsAnimationSteps.push({
                type: 'no-path',
                message: `未找到從 ${dfsNodes[start].label} 到 ${dfsNodes[end].label} 的路徑`
            });
        }
        
        // 開始播放動畫
        await playDfsAnimation();
    }
    
    async function playDfsAnimation() {
        if (currentDfsStep >= dfsAnimationSteps.length) {
            dfsRunning = false;
            disableButtons('dfs', false);
            return;
        }
        
        if (dfsPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = dfsAnimationSteps[currentDfsStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message;
            structureView.textContent += `${step.message}\n`;
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'start-dfs':
                // 起點已經在選擇時高亮
                break;
                
            case 'stack-update':
                // 僅更新文本
                break;
                
            case 'pop':
                d3.select(`#dfs-node-${step.node}`).attr('fill', '#f39c12');
                break;
                
            case 'visit-node':
                d3.select(`#dfs-node-${step.node}`).attr('fill', '#9b59b6');
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
                
            case 'push':
                d3.select(`#dfs-node-${step.node}`).attr('fill', '#3498db');
                highlightEdge(step.parent, step.node, '#3498db');
                break;
                
            case 'already-visited':
                // 暫時高亮已訪問的相鄰節點
                highlightEdge(step.parent, step.node, '#e74c3c');
                setTimeout(() => {
                    d3.select(`#dfs-link-${step.parent}-${step.node}`).attr('stroke', '#999').attr('stroke-width', 2);
                    d3.select(`#dfs-link-${step.node}-${step.parent}`).attr('stroke', '#999').attr('stroke-width', 2);
                }, 500);
                break;
                
            case 'show-path':
                // 高亮路徑
                resetGraphColors();
                for (let i = 0; i < step.path.length - 1; i++) {
                    highlightEdge(step.path[i], step.path[i + 1], '#2ecc71');
                    d3.select(`#dfs-node-${step.path[i]}`).attr('fill', '#2ecc71');
                }
                d3.select(`#dfs-node-${step.path[step.path.length - 1]}`).attr('fill', '#2ecc71');
                break;
                
            case 'no-path':
                // 重置圖的顏色
                resetGraphColors();
                d3.select(`#dfs-node-${dfsStartNode}`).attr('fill', '#e74c3c');
                d3.select(`#dfs-node-${dfsEndNode}`).attr('fill', '#e74c3c');
                break;
        }
        
        // 滾動到視圖底部
        structureView.scrollTop = structureView.scrollHeight;
        
        // 移動到下一步
        currentDfsStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 繼續動畫
        await playDfsAnimation();
    }
    
    function highlightEdge(source, target, color = '#f39c12') {
        // 檢查兩個方向的邊
        d3.select(`#dfs-link-${source}-${target}`).attr('stroke', color).attr('stroke-width', 3);
        d3.select(`#dfs-link-${target}-${source}`).attr('stroke', color).attr('stroke-width', 3);
    }
    
    function resetGraphColors() {
        // 重置節點顏色
        d3.selectAll('[id^="dfs-node-"]').attr('fill', '#3498db');
        
        // 重置邊顏色
        d3.selectAll('[id^="dfs-link-"]').attr('stroke', '#999').attr('stroke-width', 2);
    }
    
    function continueDfsAnimation() {
        disableButtons('dfs', true);
        playDfsAnimation();
    }
    
    function pauseDFS() {
        dfsPaused = true;
        disableButtons('dfs', false);
    }
    
    function resetDFS() {
        if (dfsRunning) {
            dfsPaused = true;
            dfsRunning = false;
        }
        
        currentDfsStep = 0;
        dfsAnimationSteps = [];
        
        dfsStartNode = null;
        dfsEndNode = null;
        
        resetGraphColors();
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成圖」按鈕開始';
        
        disableButtons('dfs', false, true);
        document.getElementById('dfs-start').disabled = true;
        document.getElementById('dfs-reset').disabled = true;
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
    // BFS 和 DFS 都會被初始化
    initDFS();
    
    // 添加標籤切換邏輯
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
        });
    });
});