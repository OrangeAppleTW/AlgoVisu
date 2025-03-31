// ----- 遞迴搜尋 -----
let recursiveMatrix = [];
let recursiveNodes = [];
let recursiveRunning = false;
let recursivePaused = false;

function initRecursive() {
    const container = document.getElementById('grid-recursive');
    const generateBtn = document.getElementById('recursive-generate');
    const sizeSelect = document.getElementById('recursive-size');
    const startBtn = document.getElementById('recursive-start');
    const pauseBtn = document.getElementById('recursive-pause');
    const resetBtn = document.getElementById('recursive-reset');
    const speedSlider = document.getElementById('recursive-speed');
    const structureView = document.getElementById('recursive-structure');
    const statusText = document.getElementById('recursive-status');
    
    let targetValue = -1;
    let startNode = null;
    
    generateBtn.addEventListener('click', generateGrid);
    startBtn.addEventListener('click', startRecursiveSearch);
    pauseBtn.addEventListener('click', pauseRecursiveSearch);
    resetBtn.addEventListener('click', resetRecursiveSearch);
    
    function generateGrid() {
        resetRecursiveSearch();
        const size = parseInt(sizeSelect.value);
        recursiveMatrix = getRandomMatrix(size);
        recursiveNodes = create2DLinkedList(recursiveMatrix);
        renderGrid();
        
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        // 隨機選擇目標值
        const randomRow = Math.floor(Math.random() * recursiveMatrix.length);
        const randomCol = Math.floor(Math.random() * recursiveMatrix[0].length);
        targetValue = recursiveMatrix[randomRow][randomCol];
        
        statusText.textContent = '網格已生成，點擊「開始搜尋」按鈕以開始遞迴搜尋';
        structureView.textContent = `將使用遞迴深度優先搜尋值：${targetValue}`;
    }
    
    function renderGrid() {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${recursiveMatrix.length}, 40px)`;
        
        for (let i = 0; i < recursiveMatrix.length; i++) {
            for (let j = 0; j < recursiveMatrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = recursiveMatrix[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => {
                    targetValue = recursiveMatrix[i][j];
                    statusText.textContent = `將使用遞迴深度優先搜尋值：${targetValue}`;
                    structureView.textContent = `將使用遞迴深度優先搜尋值：${targetValue}`;
                    
                    // 清除之前的高亮
                    const cells = container.querySelectorAll('.matrix-cell');
                    cells.forEach(cell => cell.classList.remove('highlight', 'path'));
                    
                    // 高亮所選的值
                    cell.classList.add('highlight');
                });
                
                container.appendChild(cell);
            }
        }
    }
    
    async function startRecursiveSearch() {
        if (recursiveRunning && recursivePaused) {
            recursivePaused = false;
            disableButtons('recursive', true);
            return;
        }
        
        if (recursiveRunning) return;
        
        recursiveRunning = true;
        recursivePaused = false;
        disableButtons('recursive', true);
        
        // 清除之前的高亮
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => cell.classList.remove('highlight', 'path', 'visited'));
        
        const speed = 101 - speedSlider.value;
        
        // 從左上角開始搜尋
        startNode = recursiveNodes[0][0];
        const visited = new Set();
        
        statusText.textContent = `使用遞迴深度優先搜尋值：${targetValue}`;
        structureView.textContent = `搜尋值：${targetValue}\n\n遞迴搜尋過程：`;
        
        const result = await recursiveDFS(startNode, targetValue, visited, speed, 0);
        
        if (!recursivePaused) {
            if (result) {
                statusText.textContent = `找到值 ${targetValue}！`;
                structureView.textContent += `\n\n遞迴搜尋成功找到值 ${targetValue}！`;
            } else {
                statusText.textContent = `未找到值 ${targetValue}`;
                structureView.textContent += `\n\n遞迴搜尋結束，未找到值 ${targetValue}`;
            }
            
            recursiveRunning = false;
            disableButtons('recursive', false);
        }
    }
    
    async function recursiveDFS(node, targetValue, visited, speed, depth) {
        if (!node || visited.has(`${node.row},${node.col}`) || recursivePaused) {
            return false;
        }
        
        // 更新遞迴深度和路徑
        const indent = '  '.repeat(depth);
        structureView.textContent += `\n${indent}訪問節點 (${node.row}, ${node.col})，值：${node.value}`;
        
        // 更新當前節點的顯示
        const currentCell = container.querySelector(`.matrix-cell[data-row="${node.row}"][data-col="${node.col}"]`);
        currentCell.classList.add('highlight');
        statusText.textContent = `檢查節點 (${node.row}, ${node.col})，值：${node.value}，遞迴深度：${depth}`;
        
        await sleep(speed * 10);
        
        // 標記為已訪問
        visited.add(`${node.row},${node.col}`);
        
        // 找到目標值
        if (node.value === targetValue) {
            structureView.textContent += `\n${indent}找到目標值！`;
            currentCell.classList.remove('highlight');
            currentCell.classList.add('path');
            return true;
        }
        
        // 將當前節點標記為已訪問
        currentCell.classList.remove('highlight');
        currentCell.classList.add('visited');
        
        // 遞迴訪問四個方向
        structureView.textContent += `\n${indent}嘗試向上遞迴`;
        if (await recursiveDFS(node.up, targetValue, visited, speed, depth + 1)) {
            return true;
        }
        
        structureView.textContent += `\n${indent}嘗試向右遞迴`;
        if (await recursiveDFS(node.right, targetValue, visited, speed, depth + 1)) {
            return true;
        }
        
        structureView.textContent += `\n${indent}嘗試向下遞迴`;
        if (await recursiveDFS(node.down, targetValue, visited, speed, depth + 1)) {
            return true;
        }
        
        structureView.textContent += `\n${indent}嘗試向左遞迴`;
        if (await recursiveDFS(node.left, targetValue, visited, speed, depth + 1)) {
            return true;
        }
        
        // 從此節點回溯
        structureView.textContent += `\n${indent}從節點 (${node.row}, ${node.col}) 回溯`;
        currentCell.classList.remove('visited');
        currentCell.classList.add('highlight');
        await sleep(speed * 5);
        currentCell.classList.remove('highlight');
        currentCell.classList.add('visited');
        
        return false;
    }
    
    function pauseRecursiveSearch() {
        recursivePaused = true;
        disableButtons('recursive', false);
    }
    
    function resetRecursiveSearch() {
        if (recursiveRunning) {
            recursivePaused = true;
            recursiveRunning = false;
        }
        
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => cell.classList.remove('highlight', 'path', 'visited'));
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成網格」按鈕開始';
        
        disableButtons('recursive', false, true);
        document.getElementById('recursive-start').disabled = true;
        document.getElementById('recursive-reset').disabled = true;
    }
}