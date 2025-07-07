// 老鼠走迷宮 - 基礎遞迴視覺化
let maze = [];
let mousePosition = { x: 1, y: 1 };
let goalPosition = { x: 6, y: 6 };
let visited = [];
let isRunning = false;
let isPaused = false;
let animationSpeed = 500;
let stepCount = 0;
let recursionDepth = 0;
let backtrackCount = 0;
let callStack = [];
let animationTimer = null;
let isStepMode = false;

// 簡單的8x8迷宮 (0=牆壁, 1=通道)
const simpleMaze = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

// 四個移動方向：上、右、下、左
const directions = [
    { x: 0, y: -1, name: '上' },
    { x: 1, y: 0, name: '右' },
    { x: 0, y: 1, name: '下' },
    { x: -1, y: 0, name: '左' }
];

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeMaze();
    bindEvents();
    renderMaze();
    updateStats();
});

// 綁定事件監聽器
function bindEvents() {
    document.getElementById('start-btn').addEventListener('click', startExploration);
    document.getElementById('step-btn').addEventListener('click', stepExploration);
    document.getElementById('pause-btn').addEventListener('click', pauseExploration);
    document.getElementById('reset-btn').addEventListener('click', resetMaze);
    document.getElementById('speed-slider').addEventListener('input', updateSpeed);
}

// 初始化迷宮
function initializeMaze() {
    maze = simpleMaze.map(row => [...row]);
    visited = Array(8).fill().map(() => Array(8).fill(false));
    mousePosition = { x: 1, y: 1 };
    goalPosition = { x: 6, y: 6 };
    callStack = [];
    stepCount = 0;
    recursionDepth = 0;
    backtrackCount = 0;
    isRunning = false;
    isPaused = false;
    isStepMode = false;
    
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
}

// 更新統計資訊
function updateStats() {
    document.getElementById('step-count').textContent = stepCount;
    document.getElementById('recursion-depth').textContent = recursionDepth;
    document.getElementById('backtrack-count').textContent = backtrackCount;
    
    let status = '準備開始';
    if (isRunning && !isPaused) {
        status = '正在探索...';
    } else if (isPaused) {
        status = '已暫停';
    } else if (mousePosition.x === goalPosition.x && mousePosition.y === goalPosition.y) {
        status = '🎉 找到奶酪！';
    } else if (!isRunning && stepCount > 0) {
        status = '探索完成';
    }
    
    document.getElementById('current-status').textContent = status;
}

// 開始探索
function startExploration() {
    if (isPaused) {
        isPaused = false;
        updateButtons();
        continueExploration();
    } else {
        resetMaze();
        isRunning = true;
        isStepMode = false;
        updateButtons();
        findPath(mousePosition.x, mousePosition.y);
    }
}

// 單步執行
function stepExploration() {
    if (!isRunning) {
        resetMaze();
        isRunning = true;
        isStepMode = true;
        updateButtons();
        findPath(mousePosition.x, mousePosition.y);
    }
}

// 暫停探索
function pauseExploration() {
    isPaused = true;
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = null;
    }
    updateButtons();
    updateStats();
}

// 重置迷宮
function resetMaze() {
    // 清除所有特殊樣式
    document.querySelectorAll('.maze-cell').forEach(cell => {
        cell.classList.remove('cell-visited', 'cell-backtrack', 'cell-current', 'cell-mouse');
    });
    
    initializeMaze();
    renderMaze();
    updateStats();
    updateCallStack();
    updateButtons();
}

// 更新速度
function updateSpeed() {
    const slider = document.getElementById('speed-slider');
    animationSpeed = 1100 - (slider.value * 100);
}

// 更新按鈕狀態
function updateButtons() {
    const startBtn = document.getElementById('start-btn');
    const stepBtn = document.getElementById('step-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (isRunning && !isPaused) {
        startBtn.disabled = true;
        stepBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
        startBtn.textContent = '運行中...';
    } else if (isPaused) {
        startBtn.disabled = false;
        stepBtn.disabled = true;
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = '繼續探索';
    } else {
        startBtn.disabled = false;
        stepBtn.disabled = false;
        pauseBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = '開始探索';
    }
}

// 檢查位置是否有效
function isValidPosition(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8 && maze[y][x] === 1 && !visited[y][x];
}

// 移動老鼠到新位置
function moveMouse(newX, newY) {
    // 只有在實際位置改變時才執行移動
    if (mousePosition.x !== newX || mousePosition.y !== newY) {
        const oldCell = document.getElementById(`cell-${mousePosition.x}-${mousePosition.y}`);
        if (oldCell && !oldCell.classList.contains('cell-goal')) {
            oldCell.classList.remove('cell-mouse');
            if (!oldCell.classList.contains('cell-backtrack')) {
                oldCell.classList.add('cell-visited');
            }
        }
        
        mousePosition.x = newX;
        mousePosition.y = newY;
        
        stepCount++;
        updateStats();
    }
    
    // 更新新位置的顯示
    const newCell = document.getElementById(`cell-${newX}-${newY}`);
    if (newCell) {
        newCell.classList.remove('cell-path', 'cell-current', 'cell-visited', 'cell-backtrack');
        newCell.classList.add('cell-mouse');
    }
}

// 遞迴尋找路徑的主要函數
async function findPath(x, y) {
    if (isPaused) return false;
    
    // 基礎情況1：找到目標
    if (x === goalPosition.x && y === goalPosition.y) {
        recursionDepth++;
        callStack.push({ x, y, direction: '🎉 找到目標！' });
        updateCallStack();
        updateStats();
        
        moveMouse(x, y);
        
        if (!isStepMode) {
            await new Promise(resolve => {
                animationTimer = setTimeout(resolve, animationSpeed);
            });
        }
        
        callStack.pop();
        recursionDepth--;
        isRunning = false;
        updateButtons();
        updateStats();
        document.getElementById('current-status').textContent = '🎉 成功找到奶酪！';
        return true;
    }
    
    // 基礎情況2：位置無效或已訪問
    if (!isValidPosition(x, y)) {
        return false;
    }
    
    recursionDepth++;
    callStack.push({ x, y, direction: callStack.length === 0 ? '開始探索' : '繼續探索' });
    updateCallStack();
    updateStats();
    
    highlightCurrentPosition(x, y);
    
    // 記錄當前位置為已訪問
    visited[y][x] = true;
    moveMouse(x, y);
    
    // 等待動畫或用戶操作
    if (!isStepMode) {
        await new Promise(resolve => {
            animationTimer = setTimeout(resolve, animationSpeed);
        });
    } else {
        await new Promise(resolve => {
            const stepBtn = document.getElementById('step-btn');
            stepBtn.disabled = false;
            stepBtn.textContent = '下一步';
            stepBtn.onclick = () => {
                stepBtn.disabled = true;
                stepBtn.textContent = '單步執行';
                resolve();
            };
        });
    }
    
    if (isPaused) {
        recursionDepth--;
        callStack.pop();
        return false;
    }
    
    // 嘗試四個方向
    for (let i = 0; i < directions.length; i++) {
        if (isPaused) break;
        
        const dir = directions[i];
        const newX = x + dir.x;
        const newY = y + dir.y;
        
        if (callStack.length > 0) {
            callStack[callStack.length - 1].direction = `嘗試向${dir.name}`;
            updateCallStack();
        }
        
        const found = await findPath(newX, newY);
        
        if (found) {
            callStack.pop();
            recursionDepth--;
            updateCallStack();
            updateStats();
            return true;
        }
        
        if (!isPaused) {
            backtrackCount++;
            updateStats();
        }
    }
    
    // 回溯：所有方向都失敗，需要返回
    if (!isPaused) {
        // 標記當前位置為回溯（死路）
        const currentCell = document.getElementById(`cell-${x}-${y}`);
        if (currentCell) {
            currentCell.classList.remove('cell-mouse');
            currentCell.classList.add('cell-backtrack');
        }
        
        if (callStack.length > 0) {
            callStack[callStack.length - 1].direction = '🔙 回溯中...';
            updateCallStack();
        }
        
        // 等待回溯動畫
        if (!isStepMode) {
            await new Promise(resolve => {
                animationTimer = setTimeout(resolve, animationSpeed / 2);
            });
        } else {
            await new Promise(resolve => {
                const stepBtn = document.getElementById('step-btn');
                stepBtn.disabled = false;
                stepBtn.textContent = '下一步 (回溯)';
                stepBtn.onclick = () => {
                    stepBtn.disabled = true;
                    stepBtn.textContent = '單步執行';
                    resolve();
                };
            });
        }
        
        // 找到上一個調用的位置並真正移動老鼠回去
        if (callStack.length >= 2) {
            const previousCall = callStack[callStack.length - 2];
            
            // 實際更新老鼠位置
            mousePosition.x = previousCall.x;
            mousePosition.y = previousCall.y;
            
            // 在上一個位置重新顯示老鼠
            const prevCell = document.getElementById(`cell-${previousCall.x}-${previousCall.y}`);
            if (prevCell) {
                prevCell.classList.remove('cell-visited', 'cell-backtrack', 'cell-current');
                prevCell.classList.add('cell-mouse');
            }
            
            // 注意：不要將回溯的位置重新標記為visited，因為我們可能需要再次探索
            
            stepCount++;
            updateStats();
            
            // 等待移動動畫
            if (!isStepMode) {
                await new Promise(resolve => {
                    animationTimer = setTimeout(resolve, animationSpeed / 2);
                });
            }
        }
    }
    
    callStack.pop();
    recursionDepth--;
    updateCallStack();
    updateStats();
    
    return false;
}

// 繼續執行
function continueExploration() {
    updateStats();
}
