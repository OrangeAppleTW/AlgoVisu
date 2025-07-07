// 回溯演示渲染功能

// 渲染回溯迷宮
function renderBacktrackMaze() {
    const mazeGrid = document.getElementById('backtrack-maze');
    mazeGrid.innerHTML = '';
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.id = `backtrack-cell-${x}-${y}`;
            
            // 設定單元格樣式
            if (backtrackMaze[y][x] === 0) {
                cell.classList.add('cell-wall');
            } else {
                cell.classList.add('cell-path');
                
                if (x === backtrackMousePos.x && y === backtrackMousePos.y) {
                    cell.classList.add('cell-mouse');
                } else if (x === backtrackGoal.x && y === backtrackGoal.y) {
                    cell.classList.add('cell-goal');
                } else if (backtrackVisited[y][x]) {
                    cell.classList.add('cell-visited');
                }
            }
            
            mazeGrid.appendChild(cell);
        }
        mazeGrid.appendChild(document.createElement('br'));
    }
}

// 更新決策樹顯示
function updateDecisionTree() {
    const container = document.getElementById('decision-nodes');
    container.innerHTML = '';
    
    if (decisionNodes.length === 0) {
        container.innerHTML = '<div style="color: #999; font-style: italic;">尚未開始決策</div>';
        return;
    }
    
    // 只顯示最近的10個決策節點，避免過度擁擠
    const recentNodes = decisionNodes.slice(-10);
    
    recentNodes.forEach((node, index) => {
        const nodeElement = document.createElement('div');
        nodeElement.className = `tree-node ${node.type}`;
        
        // 根據深度添加縮進
        const indent = '  '.repeat(Math.max(0, node.depth - 1));
        nodeElement.textContent = `${indent}[深度${node.depth}] ${node.position} - ${node.action}`;
        
        // 如果是最新的節點，加上特殊標記
        if (index === recentNodes.length - 1) {
            nodeElement.classList.add('current');
        }
        
        container.appendChild(nodeElement);
    });
    
    // 自動滾動到最新的節點
    container.scrollTop = container.scrollHeight;
}

// 創建路徑動畫效果
function animatePathDiscovery(path) {
    path.forEach((position, index) => {
        setTimeout(() => {
            const cell = document.getElementById(`backtrack-cell-${position.x}-${position.y}`);
            if (cell) {
                cell.style.animation = 'path-pulse 0.5s ease-in-out';
                setTimeout(() => {
                    cell.style.animation = '';
                }, 500);
            }
        }, index * 200);
    });
}

// 創建回溯動畫效果
function animateBacktrack(fromX, fromY, toX, toY) {
    const fromCell = document.getElementById(`backtrack-cell-${fromX}-${fromY}`);
    const toCell = document.getElementById(`backtrack-cell-${toX}-${toY}`);
    
    if (fromCell && toCell) {
        // 創建一個臨時的動畫元素
        const animationElement = document.createElement('div');
        animationElement.style.position = 'absolute';
        animationElement.style.width = '50px';
        animationElement.style.height = '50px';
        animationElement.style.backgroundColor = '#ff9800';
        animationElement.style.borderRadius = '50%';
        animationElement.style.opacity = '0.7';
        animationElement.style.pointerEvents = 'none';
        animationElement.style.zIndex = '1000';
        
        // 設置起始位置
        const fromRect = fromCell.getBoundingClientRect();
        animationElement.style.left = fromRect.left + 'px';
        animationElement.style.top = fromRect.top + 'px';
        
        document.body.appendChild(animationElement);
        
        // 計算目標位置
        const toRect = toCell.getBoundingClientRect();
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;
        
        // 執行動畫
        animationElement.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.7 },
            { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.5)`, opacity: 0.3 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => {
            document.body.removeChild(animationElement);
        };
    }
}

// 高亮死路
function highlightDeadEnd(x, y) {
    const cell = document.getElementById(`backtrack-cell-${x}-${y}`);
    if (cell) {
        cell.style.animation = 'deadend-flash 1s ease-in-out';
        setTimeout(() => {
            cell.style.animation = '';
        }, 1000);
    }
}

// 顯示當前探索方向
function showExplorationDirection(fromX, fromY, toX, toY, direction) {
    // 創建方向指示箭頭
    const arrow = document.createElement('div');
    arrow.style.position = 'absolute';
    arrow.style.fontSize = '20px';
    arrow.style.pointerEvents = 'none';
    arrow.style.zIndex = '999';
    arrow.style.color = '#2196f3';
    arrow.style.fontWeight = 'bold';
    
    // 根據方向設置箭頭符號
    const arrowSymbols = {
        '上': '↑',
        '下': '↓',
        '左': '←',
        '右': '→'
    };
    arrow.textContent = arrowSymbols[direction] || '?';
    
    // 設置位置
    const fromCell = document.getElementById(`backtrack-cell-${fromX}-${fromY}`);
    if (fromCell) {
        const rect = fromCell.getBoundingClientRect();
        arrow.style.left = rect.left + rect.width / 2 - 10 + 'px';
        arrow.style.top = rect.top + rect.height / 2 - 10 + 'px';
        
        document.body.appendChild(arrow);
        
        // 動畫效果
        arrow.animate([
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(1.2)', opacity: 1 },
            { transform: 'scale(1)', opacity: 0.8 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => {
            setTimeout(() => {
                if (document.body.contains(arrow)) {
                    document.body.removeChild(arrow);
                }
            }, 500);
        };
    }
}

// 創建成功找到路徑的慶祝效果
function createSuccessAnimation() {
    const goalCell = document.getElementById(`backtrack-cell-${backtrackGoal.x}-${backtrackGoal.y}`);
    if (!goalCell) return;
    
    // 創建光環效果
    for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '6px';
        sparkle.style.height = '6px';
        sparkle.style.backgroundColor = '#ffd700';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1001';
        
        const rect = goalCell.getBoundingClientRect();
        sparkle.style.left = rect.left + rect.width / 2 + 'px';
        sparkle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(sparkle);
        
        // 計算隨機方向
        const angle = (Math.PI * 2 * i) / 8;
        const distance = 30 + Math.random() * 40;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        sparkle.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1,
                backgroundColor: '#ffd700'
            },
            { 
                transform: `translate(${targetX}px, ${targetY}px) scale(1.5)`, 
                opacity: 0.5,
                backgroundColor: '#ff9800'
            },
            { 
                transform: `translate(${targetX * 1.5}px, ${targetY * 1.5}px) scale(0)`, 
                opacity: 0,
                backgroundColor: '#f44336'
            }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (document.body.contains(sparkle)) {
                document.body.removeChild(sparkle);
            }
        };
    }
}

// 添加CSS動畫樣式
function addBacktrackAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes path-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
            50% { transform: scale(1.1); box-shadow: 0 0 0 5px rgba(33, 150, 243, 0.3); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
        }
        
        @keyframes deadend-flash {
            0%, 100% { background-color: #ffebee; }
            25% { background-color: #ffcdd2; transform: scale(1.05); }
            50% { background-color: #ef5350; transform: scale(1.1); }
            75% { background-color: #ffcdd2; transform: scale(1.05); }
        }
        
        @keyframes success-glow {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
    `;
    document.head.appendChild(style);
}

// 頁面載入時添加動畫樣式
document.addEventListener('DOMContentLoaded', function() {
    addBacktrackAnimationStyles();
});