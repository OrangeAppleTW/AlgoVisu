// ----- 搜尋操作 -----
let searchMatrix = [];
let searchNodes = [];
let searchRunning = false;
let searchPaused = false;

function initSearch() {
    const container = document.getElementById('grid-search');
    const generateBtn = document.getElementById('search-generate');
    const sizeSelect = document.getElementById('search-size');
    const methodSelect = document.getElementById('search-method');
    const startBtn = document.getElementById('search-start');
    const pauseBtn = document.getElementById('search-pause');
    const resetBtn = document.getElementById('search-reset');
    const speedSlider = document.getElementById('search-speed');
    const structureView = document.getElementById('search-structure');
    const statusText = document.getElementById('search-status');
    
    let targetValue = -1;
    let startNode = null;
    let endNode = null;
    
    generateBtn.addEventListener('click', generateGrid);
    startBtn.addEventListener('click', startSearch);
    pauseBtn.addEventListener('click', pauseSearch);
    resetBtn.addEventListener('click', resetSearch);
    methodSelect.addEventListener('change', updateMethodUI);
    
    function generateGrid() {
        resetSearch();
        const size = parseInt(sizeSelect.value);
        searchMatrix = getRandomMatrix(size);
        searchNodes = create2DLinkedList(searchMatrix);
        renderGrid();
        
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        updateMethodUI();
    }
    
    function updateMethodUI() {
        const method = methodSelect.value;
        
        if (method === 'value') {
            statusText.textContent = '網格已生成，請選擇要搜尋的值，然後點擊「開始搜尋」';
            // 隨機選擇目標值
            const randomRow = Math.floor(Math.random() * searchMatrix.length);
            const randomCol = Math.floor(Math.random() * searchMatrix[0].length);
            targetValue = searchMatrix[randomRow][randomCol];
            
            structureView.textContent = `將搜尋值: ${targetValue}`;
            startNode = null;
            endNode = null;
        } else if (method === 'path') {
            statusText.textContent = '網格已生成，請選擇起點和終點，然後點擊「開始搜尋」';
            startNode = null;
            endNode = null;
            structureView.textContent = '請先點擊一個節點作為起點，再點擊另一個節點作為終點';
        }
    }
    
    function renderGrid() {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${searchMatrix.length}, 40px)`;
        
        for (let i = 0; i < searchMatrix.length; i++) {
            for (let j = 0; j < searchMatrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = searchMatrix[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => {
                    if (methodSelect.value === 'path') {
                        if (!startNode) {
                            startNode = searchNodes[i][j];
                            cell.classList.add('highlight');
                            structureView.textContent = `起點: (${i}, ${j})，值=${searchMatrix[i][j]}\n請選擇終點`;
                        } else if (!endNode) {
                            endNode = searchNodes[i][j];
                            cell.classList.add('path');
                            structureView.textContent = `起點: (${startNode.row}, ${startNode.col})，值=${startNode.value}\n終點: (${i}, ${j})，值=${searchMatrix[i][j]}\n點擊「開始搜尋」找出路徑`;
                        }
                    } else if (methodSelect.value === 'value') {
                        targetValue = searchMatrix[i][j];
                        structureView.textContent = `將搜尋值: ${targetValue}`;
                        
                        // 清除之前的高亮
                        const cells = container.querySelectorAll('.matrix-cell');
                        cells.forEach(cell => cell.classList.remove('highlight', 'path'));
                        
                        // 高亮所選的值
                        cell.classList.add('highlight');
                    }
                });
                
                container.appendChild(cell);
            }
        }
    }
    
    async function startSearch() {
        if (searchRunning && searchPaused) {
            searchPaused = false;
            disableButtons('search', true);
            return;
        }
        
        if (searchRunning) return;
        
        searchRunning = true;
        searchPaused = false;
        disableButtons('search', true);
        
        // 清除之前的高亮
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            if (!startNode || (parseInt(cell.dataset.row) !== startNode.row || parseInt(cell.dataset.col) !== startNode.col)) {
                cell.classList.remove('highlight', 'path', 'visited');
            }
        });
        
        const method = methodSelect.value;
        const speed = 101 - speedSlider.value;
        
        if (method === 'value') {
            await searchByValue(targetValue, speed);
        } else if (method === 'path') {
            if (!startNode || !endNode) {
                statusText.textContent = '請先選擇起點和終點';
                searchRunning = false;
                disableButtons('search', false);
                return;
            }
            
            await findPath(startNode, endNode, speed);
        }
        
        searchRunning = false;
        disableButtons('search', false);
    }
    
    async function searchByValue(value, speed) {
        statusText.textContent = `搜尋值: ${value}`;
        structureView.textContent = `搜尋值: ${value}\n\n搜尋過程:`;
        
        // 從左上角節點開始搜尋
        const startNode = searchNodes[0][0];
        let currentNode = startNode;
        let visited = new Set([`${startNode.row},${startNode.col}`]);
        
        // 使用隊列進行廣度優先搜尋
        const queue = [currentNode];
        
        while (queue.length > 0 && !searchPaused) {
            const node = queue.shift();
            
            // 更新當前節點的顯示
            const currentCell = container.querySelector(`.matrix-cell[data-row="${node.row}"][data-col="${node.col}"]`);
            currentCell.classList.add('highlight');
            
            // 更新狀態和結構視圖
            statusText.textContent = `檢查節點 (${node.row}, ${node.col})，值: ${node.value}`;
            structureView.textContent += `\n檢查節點 (${node.row}, ${node.col})，值: ${node.value}`;
            
            await sleep(speed * 10);
            
            // 找到目標節點
            if (node.value === value) {
                statusText.textContent = `在位置 (${node.row}, ${node.col}) 找到值 ${value}！`;
                structureView.textContent += `\n在位置 (${node.row}, ${node.col}) 找到值 ${value}！`;
                currentCell.classList.remove('highlight');
                currentCell.classList.add('path');
                return;
            }
            
            // 將當前節點標記為已訪問
            currentCell.classList.remove('highlight');
            currentCell.classList.add('visited');
            
            // 檢查四個方向
            const directions = [
                { dir: 'up', nextNode: node.up },
                { dir: 'right', nextNode: node.right },
                { dir: 'down', nextNode: node.down },
                { dir: 'left', nextNode: node.left }
            ];
            
            for (const { dir, nextNode } of directions) {
                if (nextNode && !visited.has(`${nextNode.row},${nextNode.col}`)) {
                    queue.push(nextNode);
                    visited.add(`${nextNode.row},${nextNode.col}`);
                    
                    structureView.textContent += `\n添加節點 (${nextNode.row}, ${nextNode.col}) 到搜尋隊列`;
                }
            }
        }
        
        if (searchPaused) {
            statusText.textContent = '搜尋已暫停';
        } else {
            statusText.textContent = `未找到值 ${value}`;
            structureView.textContent += `\n搜尋結束，未找到值 ${value}`;
        }
    }
    
    async function findPath(start, end, speed) {
        statusText.textContent = `尋找從 (${start.row}, ${start.col}) 到 (${end.row}, ${end.col}) 的路徑`;
        structureView.textContent = `起點: (${start.row}, ${start.col}), 值=${start.value}\n終點: (${end.row}, ${end.col}), 值=${end.value}\n\n搜尋過程:`;
        
        // 清除之前的標記，但保留起點和終點
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if ((row !== start.row || col !== start.col) && (row !== end.row || col !== end.col)) {
                cell.classList.remove('highlight', 'path', 'visited');
            }
        });
        
        // 顯示起點和終點
        const startCell = container.querySelector(`.matrix-cell[data-row="${start.row}"][data-col="${start.col}"]`);
        const endCell = container.querySelector(`.matrix-cell[data-row="${end.row}"][data-col="${end.col}"]`);
        startCell.classList.add('highlight');
        endCell.classList.add('path');
        
        // 使用BFS尋找路徑
        const queue = [{ node: start, path: [] }];
        const visited = new Set([`${start.row},${start.col}`]);
        
        while (queue.length > 0 && !searchPaused) {
            const { node, path } = queue.shift();
            
            // 更新顯示
            const currentCell = container.querySelector(`.matrix-cell[data-row="${node.row}"][data-col="${node.col}"]`);
            
            if (node !== start) {
                currentCell.classList.add('highlight');
            }
            
            // 更新狀態
            statusText.textContent = `訪問節點 (${node.row}, ${node.col})`;
            structureView.textContent += `\n訪問節點 (${node.row}, ${node.col})`;
            
            await sleep(speed * 10);
            
            // 找到終點
            if (node === end) {
                statusText.textContent = `找到從 (${start.row}, ${start.col}) 到 (${end.row}, ${end.col}) 的路徑！`;
                structureView.textContent += `\n找到路徑！路徑長度：${path.length + 1}`;
                
                // 顯示路徑
                for (const pathNode of path) {
                    if (pathNode !== start) {
                        const pathCell = container.querySelector(`.matrix-cell[data-row="${pathNode.row}"][data-col="${pathNode.col}"]`);
                        pathCell.classList.remove('highlight', 'visited');
                        pathCell.classList.add('path');
                    }
                }
                
                return;
            }
            
            // 將當前節點標記為已訪問
            if (node !== start && node !== end) {
                currentCell.classList.remove('highlight');
                currentCell.classList.add('visited');
            }
            
            // 檢查四個方向
            const directions = [
                { dir: 'up', nextNode: node.up },
                { dir: 'right', nextNode: node.right },
                { dir: 'down', nextNode: node.down },
                { dir: 'left', nextNode: node.left }
            ];
            
            for (const { dir, nextNode } of directions) {
                if (nextNode && !visited.has(`${nextNode.row},${nextNode.col}`)) {
                    queue.push({ node: nextNode, path: [...path, node] });
                    visited.add(`${nextNode.row},${nextNode.col}`);
                    
                    structureView.textContent += `\n添加節點 (${nextNode.row}, ${nextNode.col}) 到搜尋隊列`;
                }
            }
        }
        
        if (searchPaused) {
            statusText.textContent = '搜尋已暫停';
        } else {
            statusText.textContent = `無法找到從 (${start.row}, ${start.col}) 到 (${end.row}, ${end.col}) 的路徑`;
            structureView.textContent += `\n搜尋結束，未找到路徑`;
        }
    }
    
    function pauseSearch() {
        searchPaused = true;
        disableButtons('search', false);
    }
    
    function resetSearch() {
        if (searchRunning) {
            searchPaused = true;
            searchRunning = false;
        }
        
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => cell.classList.remove('highlight', 'path', 'visited'));
        
        startNode = null;
        endNode = null;
        targetValue = -1;
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成網格」按鈕開始';
        
        disableButtons('search', false, true);
        document.getElementById('search-start').disabled = true;
        document.getElementById('search-reset').disabled = true;
    }
}