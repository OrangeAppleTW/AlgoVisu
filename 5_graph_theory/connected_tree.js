// ----- 連通與樹 -----
let ctNodes = [];
let ctEdges = [];
let ctRunning = false;
let ctPaused = false;
let ctAnimationSteps = [];
let currentCtStep = 0;

function initConnectedTree() {
    const container = document.getElementById('connected-tree-container');
    const generateBtn = document.getElementById('connected-tree-generate');
    const operationSelect = document.getElementById('connected-tree-operation');
    const startBtn = document.getElementById('connected-tree-start');
    const pauseBtn = document.getElementById('connected-tree-pause');
    const resetBtn = document.getElementById('connected-tree-reset');
    const speedSlider = document.getElementById('connected-tree-speed');
    const structureView = document.getElementById('connected-tree-structure');
    const statusText = document.getElementById('connected-tree-status');
    
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
    const nodeCount = 10;
    let edgeProbability = 0.2; // 較低的概率，使圖不太可能完全連通
    
    function generateGraph() {
        resetOperation();
        
        // 生成節點
        ctNodes = Array(nodeCount).fill().map((_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // A, B, C, ...
        }));
        
        // 生成邊
        ctEdges = [];
        
        // 選擇操作類型
        const operation = operationSelect.value;
        
        if (operation === 'connected-components') {
            // 對於連通組件，生成多個獨立的子圖
            
            // 先將節點分成幾組
            const groupCount = Math.floor(Math.random() * 3) + 2; // 2-4 個組
            const groups = Array(groupCount).fill().map(() => []);
            
            // 隨機分配節點到各組
            const shuffledNodes = [...Array(nodeCount).keys()].sort(() => Math.random() - 0.5);
            for (let i = 0; i < nodeCount; i++) {
                const groupIndex = i % groupCount;
                groups[groupIndex].push(shuffledNodes[i]);
            }
            
            // 在每個組內生成邊，確保組內連通
            for (const group of groups) {
                if (group.length <= 1) continue;
                
                // 隨機生成組內邊，保證至少形成一棵樹
                for (let i = 1; i < group.length; i++) {
                    const target = group[i];
                    const source = group[Math.floor(Math.random() * i)]; // 從前i個節點中隨機選一個
                    
                    ctEdges.push({
                        source: source,
                        target: target,
                        weight: Math.floor(Math.random() * 9) + 1
                    });
                }
                
                // 額外添加一些隨機邊，增加連通性
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        if (Math.random() < 0.3) {
                            ctEdges.push({
                                source: group[i],
                                target: group[j],
                                weight: Math.floor(Math.random() * 9) + 1
                            });
                        }
                    }
                }
            }
        } else if (operation === 'spanning-tree') {
            // 對於最小生成樹，生成一個連通加權無向圖
            
            // 首先確保圖是連通的，至少形成一棵樹
            for (let i = 1; i < nodeCount; i++) {
                const source = Math.floor(Math.random() * i); // 從已有節點中隨機選一個
                
                ctEdges.push({
                    source: source,
                    target: i,
                    weight: Math.floor(Math.random() * 9) + 1
                });
            }
            
            // 再添加一些隨機邊，使圖更複雜
            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    // 檢查是否已存在這條邊
                    const edgeExists = ctEdges.some(e => 
                        (e.source === i && e.target === j) || 
                        (e.source === j && e.target === i)
                    );
                    
                    if (!edgeExists && Math.random() < 0.3) {
                        ctEdges.push({
                            source: i,
                            target: j,
                            weight: Math.floor(Math.random() * 9) + 1
                        });
                    }
                }
            }
        }
        
        // 繪製圖
        renderGraph();
        
        // 更新狀態和結構視圖
        statusText.textContent = '已生成圖，請點擊「開始操作」按鈕';
        updateOperation();
        
        // 啟用開始按鈕
        startBtn.disabled = false;
        resetBtn.disabled = false;
    }
    
    function updateOperation() {
        const operation = operationSelect.value;
        
        if (operation === 'connected-components') {
            structureView.textContent = '將使用深度優先搜索(DFS)查找圖中的連通組件\n\n請點擊「開始操作」按鈕開始查找';
        } else if (operation === 'spanning-tree') {
            structureView.textContent = '將使用Kruskal算法生成最小生成樹\n\n請點擊「開始操作」按鈕開始生成';
        }
    }
    
    // 在渲染圖之前確保容器存在且可見
    function renderGraph() {
        // 清空容器
        container.innerHTML = '';
        
        // 如果容器不可見，不需要繼續渲染
        if (container.offsetParent === null) {
            console.log('Connected-Tree tab is not visible, skipping render');
            return;
        }
        
        // 創建SVG
        svg = d3.select('#connected-tree-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // 準備節點和連接的D3格式
        const links = ctEdges.map(edge => ({
            source: edge.source,
            target: edge.target,
            weight: edge.weight
        }));
        
        const nodes = ctNodes.map(node => ({
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
            .attr('id', d => `ctlink-${d.source.id}-${d.target.id}`);
        
        // 創建節點
        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .attr('fill', '#3498db')
            .attr('id', d => `ctnode-${d.id}`);
        
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
        
        // 添加權重標籤（對於最小生成樹）
        const weightLabels = svg.append('g')
            .selectAll('text')
            .data(links)
            .enter().append('text')
            .attr('class', 'weight-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#e74c3c')
            .attr('font-weight', 'bold')
            .attr('font-size', '16px')  // 增加字體大小
            .attr('stroke', 'white')   // 添加白色描邂使數字更清晰
            .attr('stroke-width', '0.5px') // 描邂寬度
            .attr('paint-order', 'stroke')  // 先繪製描邂再繪製文字
            .text(d => d.weight);
        
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
            
            weightLabels
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
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
    
    async function startOperation() {
        if (ctRunning && ctPaused) {
            ctPaused = false;
            continueCtAnimation();
            return;
        }
        
        if (ctRunning) return;
        
        ctRunning = true;
        ctPaused = false;
        disableButtons('connected-tree', true);
        
        // 重置節點和邊的顏色
        resetGraphColors();
        
        // 準備動畫步驟
        ctAnimationSteps = [];
        currentCtStep = 0;
        
        const operation = operationSelect.value;
        
        if (operation === 'connected-components') {
            // 查找連通組件
            await findConnectedComponents();
        } else if (operation === 'spanning-tree') {
            // 生成最小生成樹
            await generateMinimumSpanningTree();
        }
    }
    
    async function findConnectedComponents() {
        statusText.textContent = '正在使用DFS查找連通組件';
        structureView.textContent = '使用深度優先搜索(DFS)查找圖中的連通組件\n\n';
        
        // 創建鄰接列表（無向圖）
        const adjList = Array(ctNodes.length).fill().map(() => []);
        
        for (const edge of ctEdges) {
            adjList[edge.source].push(edge.target);
            adjList[edge.target].push(edge.source); // 無向圖需要雙向添加
        }
        
        // 用於DFS的訪問標記
        const visited = new Set();
        const components = [];
        
        // 對每個未訪問的節點進行DFS
        for (let i = 0; i < ctNodes.length; i++) {
            if (!visited.has(i)) {
                const component = [];
                
                ctAnimationSteps.push({
                    type: 'start-component',
                    node: i,
                    message: `開始查找第 ${components.length + 1} 個連通組件，從節點 ${ctNodes[i].label} 開始DFS`
                });
                
                await dfs(i, component);
                components.push(component);
                
                ctAnimationSteps.push({
                    type: 'complete-component',
                    component: component,
                    message: `第 ${components.length} 個連通組件包含節點: ${component.map(n => ctNodes[n].label).join(', ')}`
                });
            }
        }
        
        async function dfs(node, component) {
            visited.add(node);
            component.push(node);
            
            ctAnimationSteps.push({
                type: 'visit-node',
                node: node,
                color: getComponentColor(components.length),
                message: `訪問節點 ${ctNodes[node].label}，添加到連通組件 ${components.length + 1}`
            });
            
            for (const neighbor of adjList[node]) {
                if (!visited.has(neighbor)) {
                    ctAnimationSteps.push({
                        type: 'check-neighbor',
                        from: node,
                        to: neighbor,
                        color: getComponentColor(components.length),
                        message: `檢查鄰居節點 ${ctNodes[neighbor].label}`
                    });
                    
                    await dfs(neighbor, component);
                }
            }
        }
        
        ctAnimationSteps.push({
            type: 'summary',
            message: `共找到 ${components.length} 個連通組件`,
            components: components
        });
        
        // 開始播放動畫
        await playCtAnimation();
    }
    
    async function generateMinimumSpanningTree() {
        statusText.textContent = '正在使用Kruskal算法生成最小生成樹';
        structureView.textContent = '使用Kruskal算法生成最小生成樹\n\n';
        
        // 準備邊的列表，並按權重排序
        const edges = ctEdges.map((edge, index) => ({
            source: edge.source,
            target: edge.target,
            weight: edge.weight,
            id: index
        })).sort((a, b) => a.weight - b.weight);
        
        ctAnimationSteps.push({
            type: 'message',
            message: '步驟1: 按權重對所有邊進行排序'
        });
        
        let edgeList = '';
        edges.forEach(edge => {
            edgeList += `${ctNodes[edge.source].label} -- ${edge.weight} --> ${ctNodes[edge.target].label}\n`;
        });
        
        ctAnimationSteps.push({
            type: 'message',
            message: `排序後的邊列表:\n${edgeList}`
        });
        
        // 初始化並查集
        const parent = Array(ctNodes.length).fill().map((_, i) => i);
        
        function find(x) {
            if (parent[x] !== x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        }
        
        function union(x, y) {
            parent[find(x)] = find(y);
        }
        
        ctAnimationSteps.push({
            type: 'message',
            message: '步驟2: 使用Kruskal算法選擇邊構建最小生成樹'
        });
        
        const mst = []; // 最小生成樹的邊
        
        for (const edge of edges) {
            const sourceRoot = find(edge.source);
            const targetRoot = find(edge.target);
            
            ctAnimationSteps.push({
                type: 'check-edge',
                edge: edge,
                message: `檢查邊 ${ctNodes[edge.source].label} -- ${edge.weight} --> ${ctNodes[edge.target].label}`
            });
            
            if (sourceRoot !== targetRoot) {
                // 添加到最小生成樹
                mst.push(edge);
                union(edge.source, edge.target);
                
                ctAnimationSteps.push({
                    type: 'add-edge',
                    edge: edge,
                    message: `將邊添加到最小生成樹（不會形成環）`
                });
                
                // 如果已經有n-1條邊，則MST已經完成
                if (mst.length === ctNodes.length - 1) {
                    break;
                }
            } else {
                ctAnimationSteps.push({
                    type: 'skip-edge',
                    edge: edge,
                    message: `跳過邊（會形成環）`
                });
            }
        }
        
        // 計算總權重
        const totalWeight = mst.reduce((sum, edge) => sum + edge.weight, 0);
        
        ctAnimationSteps.push({
            type: 'complete-mst',
            mst: mst,
            message: `最小生成樹完成，總權重: ${totalWeight}`
        });
        
        // 開始播放動畫
        await playCtAnimation();
    }
    
    async function playCtAnimation() {
        if (currentCtStep >= ctAnimationSteps.length) {
            ctRunning = false;
            disableButtons('connected-tree', false);
            return;
        }
        
        if (ctPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = ctAnimationSteps[currentCtStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message.split('\n')[0]; // 只顯示第一行
            structureView.textContent += `${step.message}\n\n`;
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'start-component':
                // 開始新的連通組件
                break;
                
            case 'visit-node':
                d3.select(`#ctnode-${step.node}`).attr('fill', step.color);
                break;
                
            case 'check-neighbor':
                highlightEdge(step.from, step.to, step.color);
                break;
                
            case 'complete-component':
                // 連通組件已完成
                for (const node of step.component) {
                    d3.select(`#ctnode-${node}`).attr('fill', getComponentColor(currentCtStep % 5));
                }
                break;
                
            case 'summary':
                // 顯示連通組件總數
                for (let i = 0; i < step.components.length; i++) {
                    const component = step.components[i];
                    const color = getComponentColor(i);
                    
                    for (const node of component) {
                        d3.select(`#ctnode-${node}`).attr('fill', color);
                    }
                    
                    // 高亮連通組件內的邊
                    for (let j = 0; j < component.length; j++) {
                        for (let k = j + 1; k < component.length; k++) {
                            highlightConnectedEdge(component[j], component[k], color);
                        }
                    }
                }
                break;
                
            case 'check-edge':
                resetEdgeColors();
                highlightEdge(step.edge.source, step.edge.target, '#f39c12');
                break;
                
            case 'add-edge':
                highlightEdge(step.edge.source, step.edge.target, '#2ecc71');
                break;
                
            case 'skip-edge':
                highlightEdge(step.edge.source, step.edge.target, '#e74c3c');
                // 短暫顯示後恢復
                setTimeout(() => {
                    d3.select(`#ctlink-${step.edge.source}-${step.edge.target}`).attr('stroke', '#999').attr('stroke-width', 2);
                    d3.select(`#ctlink-${step.edge.target}-${step.edge.source}`).attr('stroke', '#999').attr('stroke-width', 2);
                }, 500);
                break;
                
            case 'complete-mst':
                resetGraphColors();
                for (const edge of step.mst) {
                    highlightEdge(edge.source, edge.target, '#2ecc71');
                    d3.select(`#ctnode-${edge.source}`).attr('fill', '#2ecc71');
                    d3.select(`#ctnode-${edge.target}`).attr('fill', '#2ecc71');
                }
                break;
        }
        
        // 滾動到視圖底部
        structureView.scrollTop = structureView.scrollHeight;
        
        // 移動到下一步
        currentCtStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 繼續動畫
        await playCtAnimation();
    }
    
    function highlightEdge(source, target, color = '#f39c12') {
        // 檢查兩個方向的邊
        d3.select(`#ctlink-${source}-${target}`).attr('stroke', color).attr('stroke-width', 3);
        d3.select(`#ctlink-${target}-${source}`).attr('stroke', color).attr('stroke-width', 3);
    }
    
    function highlightConnectedEdge(node1, node2, color) {
        // 檢查這兩個節點之間是否有邊
        for (const edge of ctEdges) {
            if ((edge.source === node1 && edge.target === node2) || 
                (edge.source === node2 && edge.target === node1)) {
                highlightEdge(edge.source, edge.target, color);
                return;
            }
        }
    }
    
    function resetEdgeColors() {
        // 重置邊顏色
        d3.selectAll('[id^="ctlink-"]').attr('stroke', '#999').attr('stroke-width', 2);
    }
    
    function resetGraphColors() {
        // 重置節點顏色
        d3.selectAll('[id^="ctnode-"]').attr('fill', '#3498db');
        
        // 重置邊顏色
        resetEdgeColors();
    }
    
    function getComponentColor(index) {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
        return colors[index % colors.length];
    }
    
    function continueCtAnimation() {
        disableButtons('connected-tree', true);
        playCtAnimation();
    }
    
    function pauseOperation() {
        ctPaused = true;
        disableButtons('connected-tree', false);
    }
    
    function resetOperation() {
        if (ctRunning) {
            ctPaused = true;
            ctRunning = false;
        }
        
        currentCtStep = 0;
        ctAnimationSteps = [];
        
        resetGraphColors();
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成圖」按鈕開始';
        
        disableButtons('connected-tree', false, true);
        document.getElementById('connected-tree-start').disabled = true;
        document.getElementById('connected-tree-reset').disabled = true;
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
    initConnectedTree();
});

// 將初始化函數暴露為全局函數以供切換時調用
window.initConnectedTree = initConnectedTree;