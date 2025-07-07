// 互動式迷宮教學工具邏輯
let interactiveMaze = [];
let playerPosition = { x: 1, y: 1 };
let goalPosition = { x: 6, y: 6 };
let visitedCells = [];
let moveCount = 0;
let backtrackMoves = 0;
let obstaclesPlaced = 0;
let isGameActive = false;
let mazeSize = 8; // 固定為8x8
let interactionMode = 'move'; // 'move' 或 'obstacle'
let hoverTimer = null;
let currentTooltipCell = null;
let cellStepStates = {}; // 記錄每個格子的步驟完成狀態

// 固定的8x8迷宮模板
const mazeTemplate = {
    size: 8,
    layout: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ]
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    bindInteractiveEvents();
    resetGameState();
    renderInteractiveMaze();
    updateGameDisplay();
    updateModeDisplay();
    setupTooltipEvents();
});

// 綁定事件監聽器
function bindInteractiveEvents() {
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('mode-switch').addEventListener('click', toggleInteractionMode);
    document.getElementById('solve-btn').addEventListener('click', autoSolve);
    document.getElementById('reset-position').addEventListener('click', resetPlayerPosition);
}

// 設置提示框事件
function setupTooltipEvents() {
    const tooltip = document.getElementById('direction-tooltip');
    
    // 為提示框中的每個方向項目添加點擊事件
    tooltip.querySelectorAll('.direction-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDirectionStep(item);
        });
    });
    
    // 點擊其他地方隱藏提示框
    document.addEventListener('click', function(e) {
        if (!tooltip.contains(e.target)) {
            hideTooltip();
        }
    });
}

// 切換方向步驟的完成狀態
function toggleDirectionStep(item) {
    if (!currentTooltipCell) return;
    
    const direction = item.dataset.direction;
    const cellKey = `${currentTooltipCell.x}-${currentTooltipCell.y}`;
    
    if (!cellStepStates[cellKey]) {
        cellStepStates[cellKey] = {};
    }
    
    // 切換完成狀態
    cellStepStates[cellKey][direction] = !cellStepStates[cellKey][direction];
    
    // 更新視覺狀態
    if (cellStepStates[cellKey][direction]) {
        item.classList.add('completed');
    } else {
        item.classList.remove('completed');
    }
}

// 切換互動模式
function toggleInteractionMode() {
    if (!isGameActive) return;
    
    interactionMode = interactionMode === 'move' ? 'obstacle' : 'move';
    updateModeDisplay();
}

// 更新模式顯示
function updateModeDisplay() {
    const modeButton = document.getElementById('mode-switch');
    if (interactionMode === 'move') {
        modeButton.textContent = '🔄 切換模式：移動老鼠';
        modeButton.style.backgroundColor = '#222';
    } else {
        modeButton.textContent = '🔄 切換模式：標記死路';
        modeButton.style.backgroundColor = '#d32f2f';
    }
}

// 開始新示範
function startNewGame() {
    resetGameState();
    generateInteractiveMaze();
    renderInteractiveMaze();
    isGameActive = true;
    updateGameDisplay();
    updateButtons();
    
    document.getElementById('game-status').textContent = '示範進行中 - 點擊操作老鼠或標記死路';
}

// 重置狀態
function resetGameState() {
    interactiveMaze = mazeTemplate.layout.map(row => [...row]);
    playerPosition = { x: 1, y: 1 };
    goalPosition = { x: 6, y: 6 };
    visitedCells = [];
    moveCount = 0;
    backtrackMoves = 0;
    obstaclesPlaced = 0;
    isGameActive = false;
    interactionMode = 'move';
    cellStepStates = {}; // 重置所有步驟狀態
    currentTooltipCell = null;
    hideTooltip();
    updateModeDisplay();
}

// 生成互動迷宮
function generateInteractiveMaze() {
    interactiveMaze = mazeTemplate.layout.map(row => [...row]);
    
    // 確保起點和終點是通路
    interactiveMaze[playerPosition.y][playerPosition.x] = 1;
    interactiveMaze[goalPosition.y][goalPosition.x] = 1;
}

// 渲染互動迷宮
function renderInteractiveMaze() {
    const mazeGrid = document.getElementById('interactive-maze');
    mazeGrid.innerHTML = '';
    
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.id = `interactive-cell-${x}-${y}`;
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            // 添加hover事件
            cell.addEventListener('mouseenter', () => handleCellHover(x, y, cell));
            cell.addEventListener('mouseleave', () => handleCellLeave());
            
            // 設定單元格樣式
            if (interactiveMaze[y][x] === 0) {
                cell.classList.add('cell-wall');
            } else if (interactiveMaze[y][x] === 2) {
                cell.classList.add('cell-obstacle');
            } else {
                cell.classList.add('cell-path');
                
                if (x === playerPosition.x && y === playerPosition.y) {
                    cell.classList.add('cell-mouse');
                } else if (x === goalPosition.x && y === goalPosition.y) {
                    cell.classList.add('cell-goal');
                } else if (visitedCells.some(pos => pos.x === x && pos.y === y)) {
                    cell.classList.add('cell-visited');
                }
            }
            
            mazeGrid.appendChild(cell);
        }
        mazeGrid.appendChild(document.createElement('br'));
    }
}

// 處理格子hover
function handleCellHover(x, y, cellElement) {
    if (!isGameActive || interactiveMaze[y][x] !== 1) return;
    
    // 清除之前的timer
    if (hoverTimer) {
        clearTimeout(hoverTimer);
    }
    
    // 設置新的timer，1秒後顯示提示框
    hoverTimer = setTimeout(() => {
        showTooltip(x, y, cellElement);
    }, 1000);
}

// 處理格子離開
function handleCellLeave() {
    if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
    }
}

// 顯示提示框
function showTooltip(x, y, cellElement) {
    const tooltip = document.getElementById('direction-tooltip');
    const rect = cellElement.getBoundingClientRect();
    const mazeRect = document.getElementById('interactive-maze').getBoundingClientRect();
    
    currentTooltipCell = { x, y };
    
    // 更新提示框中步驟的完成狀態
    updateTooltipSteps(x, y);
    
    // 計算提示框位置
    let left = rect.right + 10;
    let top = rect.top;
    
    // 如果右邊空間不夠，顯示在左邊
    if (left + 200 > window.innerWidth) {
        left = rect.left - 210;
    }
    
    // 如果下邊空間不夠，向上調整
    if (top + tooltip.offsetHeight > window.innerHeight) {
        top = window.innerHeight - tooltip.offsetHeight - 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.display = 'block';
}

// 更新提示框中的步驟狀態
function updateTooltipSteps(x, y) {
    const cellKey = `${x}-${y}`;
    const tooltip = document.getElementById('direction-tooltip');
    
    tooltip.querySelectorAll('.direction-item').forEach(item => {
        const direction = item.dataset.direction;
        const isCompleted = cellStepStates[cellKey] && cellStepStates[cellKey][direction];
        
        if (isCompleted) {
            item.classList.add('completed');
        } else {
            item.classList.remove('completed');
        }
    });
}

// 隱藏提示框
function hideTooltip() {
    const tooltip = document.getElementById('direction-tooltip');
    tooltip.style.display = 'none';
    currentTooltipCell = null;
}

// 處理格子點擊
function handleCellClick(x, y) {
    if (!isGameActive) return;
    
    if (interactionMode === 'move') {
        handleMoveClick(x, y);
    } else {
        handleObstacleClick(x, y);
    }
}

// 處理移動點擊
function handleMoveClick(x, y) {
    if (!isValidMove(x, y)) {
        showInvalidMoveMessage(x, y);
        return;
    }
    
    movePlayer(x, y);
    
    if (x === goalPosition.x && y === goalPosition.y) {
        handleGameWin();
    }
}

// 處理障礙點擊
function handleObstacleClick(x, y) {
    if ((x === 1 && y === 1) || 
        (x === goalPosition.x && y === goalPosition.y) || 
        (x === playerPosition.x && y === playerPosition.y) || 
        interactiveMaze[y][x] === 0) {
        showInvalidMoveMessage(x, y);
        return;
    }
    
    if (interactiveMaze[y][x] === 1) {
        interactiveMaze[y][x] = 2;
        obstaclesPlaced++;
    } else if (interactiveMaze[y][x] === 2) {
        interactiveMaze[y][x] = 1;
        obstaclesPlaced = Math.max(0, obstaclesPlaced - 1);
    }
    
    renderInteractiveMaze();
    updateGameDisplay();
}

// 檢查是否為有效移動
function isValidMove(x, y) {
    const dx = Math.abs(x - playerPosition.x);
    const dy = Math.abs(y - playerPosition.y);
    
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        return x >= 0 && x < mazeSize && y >= 0 && y < mazeSize && 
               interactiveMaze[y][x] === 1;
    }
    
    return false;
}

// 顯示無效移動訊息
function showInvalidMoveMessage(x, y) {
    const cell = document.getElementById(`interactive-cell-${x}-${y}`);
    if (cell) {
        const originalBg = cell.style.backgroundColor;
        cell.style.backgroundColor = '#ffcdd2';
        cell.style.transform = 'scale(0.95)';
        setTimeout(() => {
            cell.style.backgroundColor = originalBg;
            cell.style.transform = '';
        }, 300);
    }
}

// 移動玩家
function movePlayer(newX, newY) {
    const isBacktrack = visitedCells.some(pos => pos.x === newX && pos.y === newY);
    
    if (isBacktrack) {
        backtrackMoves++;
        const backtrackIndex = visitedCells.findIndex(pos => pos.x === newX && pos.y === newY);
        visitedCells = visitedCells.slice(0, backtrackIndex + 1);
    } else {
        visitedCells.push({ x: playerPosition.x, y: playerPosition.y });
    }
    
    playerPosition.x = newX;
    playerPosition.y = newY;
    moveCount++;
    
    renderInteractiveMaze();
    updateGameDisplay();
}

// 處理獲勝
function handleGameWin() {
    isGameActive = false;
    
    document.getElementById('game-status').textContent = '🎉 成功找到起司！示範完成';
    
    createVictoryAnimation();
    updateButtons();
}

// 自動求解
function autoSolve() {
    if (!isGameActive) return;
    
    const path = findShortestPath();
    if (path && path.length > 0) {
        animateAutoSolve(path);
    } else {
        alert('無法找到解決方案！請移除一些死路標記。');
    }
}

// 尋找最短路徑 (BFS)
function findShortestPath() {
    const queue = [{ x: playerPosition.x, y: playerPosition.y, path: [] }];
    const visited = new Set();
    const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        if (current.x === goalPosition.x && current.y === goalPosition.y) {
            return current.path;
        }
        
        for (const dir of directions) {
            const newX = current.x + dir.x;
            const newY = current.y + dir.y;
            const newKey = `${newX},${newY}`;
            
            if (newX >= 0 && newX < mazeSize && 
                newY >= 0 && newY < mazeSize && 
                interactiveMaze[newY][newX] === 1 && 
                !visited.has(newKey)) {
                
                queue.push({
                    x: newX,
                    y: newY,
                    path: [...current.path, { x: newX, y: newY }]
                });
            }
        }
    }
    
    return null;
}

// 動畫自動求解
function animateAutoSolve(path) {
    let step = 0;
    const interval = setInterval(() => {
        if (step >= path.length) {
            clearInterval(interval);
            handleGameWin();
            return;
        }
        
        const nextPos = path[step];
        movePlayer(nextPos.x, nextPos.y);
        step++;
    }, 500);
}

// 重置玩家位置
function resetPlayerPosition() {
    if (!isGameActive) return;
    
    playerPosition = { x: 1, y: 1 };
    visitedCells = [];
    moveCount = 0;
    backtrackMoves = 0;
    
    renderInteractiveMaze();
    updateGameDisplay();
}

// 更新顯示
function updateGameDisplay() {
    document.getElementById('move-count').textContent = moveCount;
    document.getElementById('backtrack-moves').textContent = backtrackMoves;
    document.getElementById('obstacles-placed').textContent = obstaclesPlaced;
    document.getElementById('recursion-depth').textContent = visitedCells.length;
}

// 更新按鈕狀態
function updateButtons() {
    const modeSwitchBtn = document.getElementById('mode-switch');
    const solveBtn = document.getElementById('solve-btn');
    const resetBtn = document.getElementById('reset-position');
    
    modeSwitchBtn.disabled = !isGameActive;
    solveBtn.disabled = !isGameActive;
    resetBtn.disabled = !isGameActive;
}

// 創建勝利動畫
function createVictoryAnimation() {
    const goalCell = document.getElementById(`interactive-cell-${goalPosition.x}-${goalPosition.y}`);
    if (!goalCell) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.backgroundColor = ['#ffd700', '#ff9800', '#4caf50', '#2196f3'][i % 4];
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const rect = goalCell.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 15;
        const distance = 50 + Math.random() * 100;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px) scale(1.5)`, opacity: 0.5 },
            { transform: `translate(${targetX * 1.2}px, ${targetY * 1.2}px) scale(0)`, opacity: 0 }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        };
    }
}
