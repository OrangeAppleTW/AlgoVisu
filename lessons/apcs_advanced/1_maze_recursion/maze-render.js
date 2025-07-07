// 迷宮渲染和視覺化功能

// 渲染迷宮
function renderMaze() {
    const mazeGrid = document.getElementById('maze-grid');
    mazeGrid.innerHTML = '';
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.id = `cell-${x}-${y}`;
            
            // 設定單元格樣式
            if (maze[y][x] === 0) {
                cell.classList.add('cell-wall');
            } else {
                cell.classList.add('cell-path');
                
                if (x === mousePosition.x && y === mousePosition.y) {
                    cell.classList.add('cell-mouse');
                } else if (x === goalPosition.x && y === goalPosition.y) {
                    cell.classList.add('cell-goal');
                } else if (visited[y][x]) {
                    cell.classList.add('cell-visited');
                }
            }
            
            mazeGrid.appendChild(cell);
        }
        mazeGrid.appendChild(document.createElement('br'));
    }
}

// 高亮當前位置
function highlightCurrentPosition(x, y) {
    // 移除所有當前位置的高亮
    document.querySelectorAll('.cell-current').forEach(cell => {
        cell.classList.remove('cell-current');
    });
    
    // 添加新的高亮
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell && !cell.classList.contains('cell-mouse') && !cell.classList.contains('cell-goal')) {
        cell.classList.add('cell-current');
    }
}

// 更新呼叫堆疊顯示
function updateCallStack() {
    const stackContainer = document.getElementById('call-stack');
    stackContainer.innerHTML = '';
    
    if (callStack.length === 0) {
        stackContainer.innerHTML = '<div style="color: #999; font-style: italic;">堆疊為空</div>';
        return;
    }
    
    callStack.forEach((call, index) => {
        const stackItem = document.createElement('div');
        stackItem.className = 'stack-item';
        if (index === callStack.length - 1) {
            stackItem.classList.add('current');
        }
        stackItem.textContent = `findPath(${call.x}, ${call.y}) - ${call.direction || '開始'}`;
        stackContainer.appendChild(stackItem);
    });
}

// 添加視覺效果
function addVisualEffect(x, y, effectClass, duration = 1000) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
        cell.classList.add(effectClass);
        setTimeout(() => {
            cell.classList.remove(effectClass);
        }, duration);
    }
}

// 創建路徑軌跡效果
function createPathTrail(path) {
    path.forEach((position, index) => {
        setTimeout(() => {
            addVisualEffect(position.x, position.y, 'path-trail', 2000);
        }, index * 100);
    });
}

// 動畫移動老鼠
function animateMouseMovement(fromX, fromY, toX, toY, callback) {
    const fromCell = document.getElementById(`cell-${fromX}-${fromY}`);
    const toCell = document.getElementById(`cell-${toX}-${toY}`);
    
    if (fromCell && toCell) {
        // 創建移動動畫
        fromCell.style.transition = 'transform 0.3s ease';
        fromCell.style.transform = `translate(${(toX - fromX) * 60}px, ${(toY - fromY) * 60}px)`;
        
        setTimeout(() => {
            fromCell.style.transition = '';
            fromCell.style.transform = '';
            if (callback) callback();
        }, 300);
    } else if (callback) {
        callback();
    }
}

// 顯示遞迴深度變化
function visualizeRecursionDepth(depth) {
    const depthIndicator = document.getElementById('recursion-depth');
    if (depthIndicator) {
        depthIndicator.style.transform = 'scale(1.2)';
        depthIndicator.style.color = depth > 5 ? '#e74c3c' : '#222';
        
        setTimeout(() => {
            depthIndicator.style.transform = 'scale(1)';
        }, 200);
    }
}

// 創建粒子效果（當找到目標時）
function createSuccessParticles() {
    const goalCell = document.getElementById(`cell-${goalPosition.x}-${goalPosition.y}`);
    if (!goalCell) return;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#ffd700';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const rect = goalCell.getBoundingClientRect();
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        
        document.body.appendChild(particle);
        
        // 隨機移動方向
        const angle = (Math.PI * 2 * i) / 10;
        const distance = 50 + Math.random() * 50;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;
        
        particle.animate([
            { transform: 'translate(0, 0)', opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            document.body.removeChild(particle);
        };
    }
}

// 顯示回溯路徑
function showBacktrackPath(x, y) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
        cell.classList.add('cell-backtrack');
        
        // 添加回溯動畫
        cell.style.animation = 'backtrack-pulse 0.5s ease-in-out';
        setTimeout(() => {
            cell.style.animation = '';
        }, 500);
    }
}

// CSS動畫定義（動態添加到頁面）
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes backtrack-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(0.9); background-color: #ffcdd2; }
            100% { transform: scale(1); }
        }
        
        @keyframes path-trail {
            0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
            100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
        }
        
        .path-trail {
            animation: path-trail 1s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// 頁面載入時添加動畫樣式
document.addEventListener('DOMContentLoaded', function() {
    addAnimationStyles();
});