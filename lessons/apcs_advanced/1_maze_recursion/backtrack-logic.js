// 回溯機制演示邏輯
let backtrackMaze = [];
let backtrackMousePos = { x: 1, y: 1 };
let backtrackGoal = { x: 6, y: 6 };
let backtrackVisited = [];
let backtrackPath = [];
let decisionNodes = [];
let backtrackCount = 0;
let currentDepth = 0;
let isBacktrackRunning = false;
let isStepMode = false;
let backtrackTimer = null;

// 設計一個有多個死路的迷宮來展示回溯
const backtrackMazeLayout = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

const directions = [
    { x: 0, y: -1, name: '上' },
    { x: 1, y: 0, name: '右' },
    { x: 0, y: 1, name: '下' },
    { x: -1, y: 0, name: '左' }
];

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeBacktrackDemo();
    bindBacktrackEvents();
    renderBacktrackMaze();
    updateBacktrackDisplay();
});

// 綁定事件監聽器
function bindBacktrackEvents() {
    document.getElementById('start-demo').addEventListener('click', startBacktrackDemo);
    document.getElementById('step-demo').addEventListener('click', stepBacktrackDemo);
    document.getElementById('reset-demo').addEventListener('click', resetBacktrackDemo);
}

// 初始化回溯演示
function initializeBacktrackDemo() {
    backtrackMaze = backtrackMazeLayout.map(row => [...row]);
    backtrackVisited = Array(8).fill().map(() => Array(8).fill(false));
    backtrackMousePos = { x: 1, y: 1 };
    backtrackGoal = { x: 6, y: 6 };
    backtrackPath = [];
    decisionNodes = [];
    backtrackCount = 0;
    currentDepth = 0;
    isBacktrackRunning = false;
    isStepMode = false;
    
    if (backtrackTimer) {
        clearTimeout(backtrackTimer);
        backtrackTimer = null;
    }
}

// 開始回溯演示
function startBacktrackDemo() {
    resetBacktrackDemo();
    isBacktrackRunning = true;
    isStepMode = false;
    updateBacktrackButtons();
    
    // 開始遞迴搜尋
    solveWithBacktrack(backtrackMousePos.x, backtrackMousePos.y);
}

// 單步回溯演示
function stepBacktrackDemo() {
    if (!isBacktrackRunning) {
        resetBacktrackDemo();
        isBacktrackRunning = true;
        isStepMode = true;
        updateBacktrackButtons();
        solveWithBacktrack(backtrackMousePos.x, backtrackMousePos.y);
    }
}

// 重置回溯演示
function resetBacktrackDemo() {
    initializeBacktrackDemo();
    renderBacktrackMaze();
    updateBacktrackDisplay();
    updateDecisionTree();
    updateBacktrackButtons();
}

// 更新按鈕狀態
function updateBacktrackButtons() {
    const startBtn = document.getElementById('start-demo');
    const stepBtn = document.getElementById('step-demo');
    const resetBtn = document.getElementById('reset-demo');
    
    if (isBacktrackRunning) {
        startBtn.disabled = true;
        stepBtn.disabled = true;
        resetBtn.disabled = false;
        startBtn.textContent = '運行中...';
    } else {
        startBtn.disabled = false;
        stepBtn.disabled = false;
        resetBtn.disabled = false;
        startBtn.textContent = '開始演示';
    }
}

// 檢查位置是否有效
function isValidBacktrackPosition(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8 && 
           backtrackMaze[y][x] === 1 && !backtrackVisited[y][x];
}

// 更新顯示資訊
function updateBacktrackDisplay() {
    document.getElementById('current-position').textContent = 
        `(${backtrackMousePos.x}, ${backtrackMousePos.y})`;
    document.getElementById('current-depth').textContent = currentDepth;
    document.getElementById('backtrack-counter').textContent = backtrackCount;
}

// 添加決策節點
function addDecisionNode(x, y, action, type = 'current') {
    const nodeInfo = {
        position: `(${x}, ${y})`,
        action: action,
        depth: currentDepth,
        type: type,
        timestamp: Date.now()
    };
    
    decisionNodes.push(nodeInfo);
    updateDecisionTree();
}

// 移動老鼠並更新視覺效果
function moveBacktrackMouse(newX, newY) {
    // 移除舊位置的老鼠
    const oldCell = document.getElementById(`backtrack-cell-${backtrackMousePos.x}-${backtrackMousePos.y}`);
    if (oldCell) {
        oldCell.classList.remove('cell-mouse');
        oldCell.classList.add('cell-visited');
    }
    
    // 標記位置為已訪問
    backtrackVisited[backtrackMousePos.y][backtrackMousePos.x] = true;
    
    // 更新老鼠位置
    backtrackMousePos.x = newX;
    backtrackMousePos.y = newY;
    
    // 在新位置顯示老鼠
    const newCell = document.getElementById(`backtrack-cell-${newX}-${newY}`);
    if (newCell) {
        newCell.classList.remove('cell-path');
        newCell.classList.add('cell-mouse');
    }
    
    // 添加到路徑
    backtrackPath.push({ x: newX, y: newY });
    
    updateBacktrackDisplay();
}

// 標記死路
function markDeadEnd(x, y) {
    const cell = document.getElementById(`backtrack-cell-${x}-${y}`);
    if (cell) {
        cell.classList.add('cell-deadend');
    }
}

// 標記回溯路徑
function markBacktrackPath(x, y) {
    const cell = document.getElementById(`backtrack-cell-${x}-${y}`);
    if (cell) {
        cell.classList.add('cell-backtrack');
        
        // 移除回溯標記（模擬老鼠離開）
        setTimeout(() => {
            if (cell) {
                cell.classList.remove('cell-backtrack');
            }
        }, 1000);
    }
}

// 主要的回溯算法
async function solveWithBacktrack(x, y) {
    if (!isBacktrackRunning) return false;
    
    currentDepth++;
    
    // 添加決策節點
    addDecisionNode(x, y, `進入位置 (${x}, ${y})`, 'current');
    
    // 等待動畫或用戶操作
    if (!isStepMode) {
        await new Promise(resolve => {
            backtrackTimer = setTimeout(resolve, 800);
        });
    } else {
        await new Promise(resolve => {
            const stepBtn = document.getElementById('step-demo');
            stepBtn.disabled = false;
            stepBtn.textContent = '下一步';
            stepBtn.onclick = () => {
                stepBtn.disabled = true;
                stepBtn.textContent = '單步回溯';
                resolve();
            };
        });
    }
    
    // 基礎情況1：找到目標
    if (x === backtrackGoal.x && y === backtrackGoal.y) {
        moveBacktrackMouse(x, y);
        addDecisionNode(x, y, '🎉 找到目標！', 'success');
        
        document.getElementById('current-action').textContent = '成功找到奶酪！';
        isBacktrackRunning = false;
        updateBacktrackButtons();
        return true;
    }
    
    // 基礎情況2：位置無效
    if (!isValidBacktrackPosition(x, y)) {
        addDecisionNode(x, y, '❌ 無效位置', 'deadend');
        currentDepth--;
        return false;
    }
    
    // 移動到當前位置
    moveBacktrackMouse(x, y);
    document.getElementById('current-action').textContent = `探索位置 (${x}, ${y})`;
    
    // 嘗試所有方向
    for (let i = 0; i < directions.length; i++) {
        if (!isBacktrackRunning) break;
        
        const dir = directions[i];
        const newX = x + dir.x;
        const newY = y + dir.y;
        
        addDecisionNode(x, y, `嘗試向${dir.name}移動`, 'current');
        document.getElementById('current-action').textContent = `嘗試向${dir.name}移動到 (${newX}, ${newY})`;
        
        // 遞迴探索
        const found = await solveWithBacktrack(newX, newY);
        
        if (found) {
            // 找到路徑，返回成功
            currentDepth--;
            return true;
        }
        
        // 這個方向失敗，記錄回溯
        if (isBacktrackRunning) {
            backtrackCount++;
            addDecisionNode(x, y, `❌ ${dir.name}方向失敗，回溯`, 'deadend');
            document.getElementById('current-action').textContent = `${dir.name}方向失敗，回溯中...`;
            updateBacktrackDisplay();
            
            // 等待回溯動畫
            await new Promise(resolve => {
                backtrackTimer = setTimeout(resolve, 600);
            });
        }
    }
    
    // 所有方向都嘗試過了，標記為死路並回溯
    if (isBacktrackRunning) {
        markDeadEnd(x, y);
        markBacktrackPath(x, y);
        addDecisionNode(x, y, '🔄 所有方向都失敗，回溯到上一層', 'deadend');
        document.getElementById('current-action').textContent = '所有方向都失敗，回溯中...';
        
        // 從路徑中移除當前位置
        if (backtrackPath.length > 0) {
            backtrackPath.pop();
        }
        
        // 等待回溯動畫
        await new Promise(resolve => {
            backtrackTimer = setTimeout(resolve, 800);
        });
    }
    
    currentDepth--;
    return false;
}