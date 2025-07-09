// Flood Fill 演算法動畫演示的 JavaScript

// 全域變數
let animationSpeed = 800; // 動畫速度（毫秒） - 放慢一點
let isAnimating = false;

// 測試網格數據 - 1代表可填充，0代表障礙物
const testGridData = [
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0]
];

// 起始點位置
const startPoint = { row: 2, col: 1 };

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    console.log('Flood Fill 演示頁面載入完成');
    initializeGrids();
});

// 初始化兩個網格
function initializeGrids() {
    initializeGrid('grid4', 4);
    initializeGrid('grid8', 8);
}

// 初始化單個網格
function initializeGrid(gridId, neighbors) {
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.error(`找不到網格元素: ${gridId}`);
        return;
    }
    
    // 設定網格佈局
    grid.style.gridTemplateColumns = `repeat(5, 1fr)`;
    grid.innerHTML = '';
    
    // 創建5x5網格
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // 顯示實際數值（0或1）
            cell.textContent = testGridData[i][j];
            
            // 如果是起始點，先標記為已填充的顏色
            if (i === startPoint.row && j === startPoint.col) {
                cell.classList.add('filled');
            }
            
            grid.appendChild(cell);
        }
    }
}

// 開始 Flood Fill 演示
async function startFloodFill(neighbors) {
    if (isAnimating) {
        alert('演示進行中，請稍候...');
        return;
    }
    
    console.log(`開始 ${neighbors}-Neighbors Flood Fill 演示`);
    isAnimating = true;
    
    const gridId = `grid${neighbors}`;
    const statusId = `status${neighbors}`;
    
    // 重置網格
    resetDemo(neighbors);
    
    // 更新狀態
    updateStatus(statusId, `開始 ${neighbors}-Neighbors Flood Fill 演算法...`);
    
    // 創建訪問紀錄
    const visited = Array(5).fill().map(() => Array(5).fill(false));
    
    // 執行 Flood Fill
    const filledCount = await floodFillRecursive(
        gridId, 
        testGridData, 
        visited, 
        startPoint.row, 
        startPoint.col, 
        neighbors
    );
    
    // 清理所有可能的動畫狀態
    cleanupAnimation(gridId);
    
    // 完成通知
    updateStatus(statusId, `演算法完成！共填充了 ${filledCount} 個格子`);
    
    isAnimating = false;
}

// 遞迴 Flood Fill 演算法（動畫版本）
async function floodFillRecursive(gridId, grid, visited, row, col, neighbors) {
    // **先進行邊界檢查，在任何視覺化或陣列存取之前**
    if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        await showBoundaryCheck(gridId, row, col, neighbors);
        return 0;
    }
    
    // 先顯示探訪動畫（讓所有格子都能看到橘色效果）
    await showVisiting(gridId, row, col, neighbors);
    
    // 檢查是否為可填充格子且未訪問
    if (grid[row][col] !== 1 || visited[row][col]) {
        await showInvalidCell(gridId, row, col, neighbors, visited[row][col]);
        return 0;
    }
    
    // 標記為已訪問
    visited[row][col] = true;
    
    // 顯示成功填充的動畫
    await showSuccessfulFill(gridId, row, col, neighbors);
    
    let totalFilled = 1; // 當前格子
    
    if (neighbors === 4) {
        // 4-neighbors: 上、下、左、右
        totalFilled += await floodFillRecursive(gridId, grid, visited, row - 1, col, neighbors);     // 上
        totalFilled += await floodFillRecursive(gridId, grid, visited, row + 1, col, neighbors);     // 下
        totalFilled += await floodFillRecursive(gridId, grid, visited, row, col - 1, neighbors);     // 左
        totalFilled += await floodFillRecursive(gridId, grid, visited, row, col + 1, neighbors);     // 右
    } else if (neighbors === 8) {
        // 8-neighbors: 從正上方開始順時針搜尋所有8個方向
        totalFilled += await floodFillRecursive(gridId, grid, visited, row - 1, col, neighbors);     // 上
        totalFilled += await floodFillRecursive(gridId, grid, visited, row - 1, col + 1, neighbors); // 右上
        totalFilled += await floodFillRecursive(gridId, grid, visited, row, col + 1, neighbors);     // 右
        totalFilled += await floodFillRecursive(gridId, grid, visited, row + 1, col + 1, neighbors); // 右下
        totalFilled += await floodFillRecursive(gridId, grid, visited, row + 1, col, neighbors);     // 下
        totalFilled += await floodFillRecursive(gridId, grid, visited, row + 1, col - 1, neighbors); // 左下
        totalFilled += await floodFillRecursive(gridId, grid, visited, row, col - 1, neighbors);     // 左
        totalFilled += await floodFillRecursive(gridId, grid, visited, row - 1, col - 1, neighbors); // 左上
    }
    
    return totalFilled;
}

// 顯示探訪動畫
async function showVisiting(gridId, row, col, neighbors) {
    // 雙重檢查邊界（防止負數索引問題）
    if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        console.warn(`showVisiting: 座標超出邊界 (${row}, ${col})`);
        return;
    }
    
    const cell = getCellElement(gridId, row, col);
    const statusId = `status${neighbors}`;
    
    if (cell) {
        // 添加探訪動畫
        cell.classList.add('visiting');
        updateStatus(statusId, `正在探訪位置 (${row}, ${col})...`);
        // 增加等待時間，讓動畫完整播放
        await sleep(animationSpeed);
        // 移除動畫類別，準備下個狀態
        cell.classList.remove('visiting');
    }
}

// 顯示邊界檢查結果
async function showBoundaryCheck(gridId, row, col, neighbors) {
    const statusId = `status${neighbors}`;
    updateStatus(statusId, `位置 (${row}, ${col}) 超出邊界，返回`);
    await sleep(animationSpeed / 3);
}

// 顯示無效格子
async function showInvalidCell(gridId, row, col, neighbors, isAlreadyVisited = false) {
    // 確保座標在有效範圍內（避免負數索引問題）
    if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        console.warn(`showInvalidCell: 座標超出邊界 (${row}, ${col})`);
        return;
    }
    
    const cell = getCellElement(gridId, row, col);
    const statusId = `status${neighbors}`;
    
    if (cell) {
        cell.classList.remove('visiting');
        
        if (isAlreadyVisited) {
            // 已探訪過的格子 - 簡單顯示，不要動畫
            cell.classList.add('already-visited');
            updateStatus(statusId, `位置 (${row}, ${col}) 已探訪過，跳過`);
            await sleep(animationSpeed / 2);
            cell.classList.remove('already-visited');
        } else if (testGridData[row] && testGridData[row][col] === 0) {
            // 障礙物格子 - 只顯示狀態訊息，不改變颜色
            updateStatus(statusId, `位置 (${row}, ${col}) 的值為 0（障礙物），跳過`);
            await sleep(animationSpeed / 2);
        }
        
        cell.textContent = testGridData[row][col];
    }
}

// 顯示成功填充
async function showSuccessfulFill(gridId, row, col, neighbors) {
    // 確保座標在有效範圍內（避免負數索引問題）
    if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        console.warn(`showSuccessfulFill: 座標超出邊界 (${row}, ${col})`);
        return;
    }
    
    const cell = getCellElement(gridId, row, col);
    const statusId = `status${neighbors}`;
    
    console.log(`成功填充位置: (${row}, ${col}), 值: ${testGridData[row][col]}`);
    
    if (cell) {
        // 移除所有可能的動畫狀態
        cell.classList.remove('visiting');
        
        // 如果是起始點，更新狀態訊息
        if (row === startPoint.row && col === startPoint.col) {
            updateStatus(statusId, `起始點 (${row}, ${col})，值為 ${testGridData[row][col]}，開始填充`);
            await sleep(animationSpeed);
        } else {
            // 非起始點的處理
            updateStatus(statusId, `成功填充位置 (${row}, ${col})`);
            await sleep(animationSpeed);
        }
        
        // 確保添加已填充狀態並保持數值
        cell.classList.add('filled');
        cell.textContent = testGridData[row][col];
        
        await sleep(animationSpeed / 2);
    }
}

// 獲取方向向量
function getDirections(neighbors) {
    if (neighbors === 4) {
        // 4-Neighbors: 上、下、左、右
        return [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
    } else {
        // 8-Neighbors: 包含對角線
        return [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
    }
}

// 清理動畫狀態
function cleanupAnimation(gridId) {
    const grid = document.getElementById(gridId);
    if (grid) {
        const cells = grid.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            // 移除所有動畫狀態，但保持filled狀態
            cell.classList.remove(
                'visiting', 
                'already-visited'
            );
        });
    }
}

// 獲取指定位置的格子元素
function getCellElement(gridId, row, col) {
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.warn(`getCellElement: 找不到網格 ${gridId}`);
        return null;
    }
    
    // **重要：先檢查邊界，避免負數索引被JavaScript誤解為從陣列末尾計算**
    if (row < 0 || row >= 5 || col < 0 || col >= 5) {
        console.warn(`getCellElement: 座標超出邊界 (${row}, ${col})`);
        return null;
    }
    
    const cells = grid.querySelectorAll('.grid-cell');
    const index = row * 5 + col;
    
    // 額外檢查計算出的索引是否在有效範圍內
    if (index < 0 || index >= cells.length) {
        console.warn(`getCellElement: 計算出的索引 ${index} 超出範圍`);
        return null;
    }
    
    return cells[index] || null;
}

// 重置演示
function resetDemo(neighbors) {
    const gridId = `grid${neighbors}`;
    const statusId = `status${neighbors}`;
    
    console.log(`重置 ${neighbors}-Neighbors 演示`);
    
    // 清理動畫狀態
    cleanupAnimation(gridId);
    
    // 重新初始化網格
    initializeGrid(gridId, neighbors);
    
    // 重置狀態
    updateStatus(statusId, `點擊「開始 ${neighbors}-Neighbors 演示」來看演算法過程`);
}

// 更新狀態訊息
function updateStatus(statusId, message) {
    const statusElement = document.getElementById(statusId);
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// 睡眠函數
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 錯誤處理
window.addEventListener('error', function(e) {
    console.error('發生錯誤:', e.error);
    isAnimating = false;
});

console.log('Grid Traversal JavaScript 載入完成');