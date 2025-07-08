// 網格搜尋演算法的 JavaScript

// 全域變數
let currentCenter = null;
let isEditMode = false;
let gridData = [];
let isAnimating = false;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    initializeSearchGrid();
});

// 初始化搜尋網格
function initializeSearchGrid() {
    const grid = document.getElementById('searchGrid');
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    
    // 初始化網格資料（對應範例程式碼）
    gridData = [
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 1, 0],
        [1, 0, 0, 0, 0]
    ];
    
    renderSearchGrid();
}

// 渲染搜尋網格
function renderSearchGrid() {
    const grid = document.getElementById('searchGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = gridData[i][j];
            cell.onclick = () => handleCellClick(i, j);
            
            // 根據值設定初始外觀
            if (gridData[i][j] === 0) {
                cell.classList.add('blocked');
            }
            
            grid.appendChild(cell);
        }
    }
}

// 處理格子點擊
function handleCellClick(i, j) {
    if (isAnimating) return;
    
    if (isEditMode) {
        // 編輯模式：切換格子值
        gridData[i][j] = gridData[i][j] === 1 ? 0 : 1;
        renderSearchGrid();
    } else {
        // 選擇模式：設定中心點
        setCenter(i, j);
    }
}

// 設定中心點
function setCenter(i, j) {
    currentCenter = {i, j};
    resetGridHighlights();
    
    const cells = document.querySelectorAll('#searchGrid .grid-cell');
    const index = i * 5 + j;
    cells[index].classList.add('current');
    
    updateAlgorithmExplanation('center', i, j);
}

// 顯示相鄰格子
function showNeighbors(type) {
    if (!currentCenter) {
        alert('請先點擊格子選擇中心點！');
        return;
    }
    
    resetGridHighlights();
    const {i, j} = currentCenter;
    
    // 重新標記中心點
    const cells = document.querySelectorAll('#searchGrid .grid-cell');
    cells[i * 5 + j].classList.add('current');
    
    if (type === 4) {
        show4Neighbors(i, j);
        updateAlgorithmExplanation('4neighbors', i, j);
    } else if (type === 8) {
        show8Neighbors(i, j);
        updateAlgorithmExplanation('8neighbors', i, j);
    }
}

// 顯示 4-neighbors
function show4Neighbors(centerI, centerJ) {
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]  // 上、下、左、右
    ];
    
    const cells = document.querySelectorAll('#searchGrid .grid-cell');
    
    directions.forEach(([di, dj]) => {
        const ni = centerI + di;
        const nj = centerJ + dj;
        
        if (ni >= 0 && ni < 5 && nj >= 0 && nj < 5) {
            const index = ni * 5 + nj;
            cells[index].classList.add('neighbor-4');
        }
    });
}

// 顯示 8-neighbors
function show8Neighbors(centerI, centerJ) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],  // 上排
        [0, -1],           [0, 1],   // 中排（左、右）
        [1, -1],  [1, 0],  [1, 1]    // 下排
    ];
    
    const cells = document.querySelectorAll('#searchGrid .grid-cell');
    
    directions.forEach(([di, dj]) => {
        const ni = centerI + di;
        const nj = centerJ + dj;
        
        if (ni >= 0 && ni < 5 && nj >= 0 && nj < 5) {
            const index = ni * 5 + nj;
            cells[index].classList.add('neighbor-8');
        }
    });
}

// 重置網格高亮
function resetGridHighlights() {
    document.querySelectorAll('#searchGrid .grid-cell').forEach(cell => {
        cell.classList.remove('current', 'neighbor-4', 'neighbor-8', 'visited');
    });
}

// 重置整個網格
function resetGrid() {
    // 重置為原始資料
    gridData = [
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 1, 0],
        [1, 0, 0, 0, 0]
    ];
    
    currentCenter = null;
    isAnimating = false;
    renderSearchGrid();
    updateAlgorithmExplanation('reset');
}

// 切換編輯模式
function toggleEditMode() {
    isEditMode = !isEditMode;
    const button = document.getElementById('editModeText');
    button.textContent = isEditMode ? '切換為選擇模式' : '切換為編輯模式';
    
    if (isEditMode) {
        updateAlgorithmExplanation('edit');
    } else {
        updateAlgorithmExplanation('select');
    }
}

// Flood Fill 演示
async function startFloodFillDemo() {
    if (!currentCenter) {
        alert('請先點擊格子選擇起始點！');
        return;
    }
    
    if (isAnimating) return;
    isAnimating = true;
    
    resetGridHighlights();
    
    const visited = Array(5).fill().map(() => Array(5).fill(false));
    const {i, j} = currentCenter;
    
    updateAlgorithmExplanation('floodfill');
    
    await floodFill(gridData, visited, i, j);
    
    // 計算連通區域大小
    const count = visited.reduce((sum, row) => sum + row.reduce((rowSum, cell) => rowSum + (cell ? 1 : 0), 0), 0);
    updateAlgorithmExplanation('floodfill_complete', count);
    
    isAnimating = false;
}

// 遞迴 Flood Fill 演算法（動畫版本）
async function floodFill(arr, visited, x, y) {
    // 邊界檢查
    if (x < 0 || x >= 5 || y < 0 || y >= 5) {
        return;
    }
    
    // 檢查是否為目標格子且未訪問過
    if (arr[x][y] === 1 && !visited[x][y]) {
        visited[x][y] = true;
        
        // 視覺化當前格子
        const cells = document.querySelectorAll('#searchGrid .grid-cell');
        const index = x * 5 + y;
        cells[index].classList.add('visited');
        
        // 等待動畫
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 遞迴搜尋 4-neighbors
        await floodFill(arr, visited, x-1, y);  // 上
        await floodFill(arr, visited, x+1, y);  // 下
        await floodFill(arr, visited, x, y-1);  // 左
        await floodFill(arr, visited, x, y+1);  // 右
    }
}

// 更新演算法說明
function updateAlgorithmExplanation(type, param1 = null, param2 = null) {
    const explanation = document.getElementById('algorithmExplanation');
    
    switch(type) {
        case 'center':
            explanation.innerHTML = `
                <h4>🎯 已選擇中心點</h4>
                <p>中心點座標：(${param1}, ${param2})</p>
                <p>現在可以點擊「4-Neighbors」或「8-Neighbors」按鈕來查看相鄰格子</p>
            `;
            break;
            
        case '4neighbors':
            explanation.innerHTML = `
                <h4>🔄 4-Neighbors 搜尋</h4>
                <p>從中心點 (${param1}, ${param2}) 搜尋上、下、左、右四個方向的相鄰格子</p>
                <p><strong>方向向量：</strong>(-1,0), (1,0), (0,-1), (0,1)</p>
                <p>這是最基本的網格搜尋方式，常用於迷宮尋路、連通性檢查等</p>
            `;
            break;
            
        case '8neighbors':
            explanation.innerHTML = `
                <h4>🔄 8-Neighbors 搜尋</h4>
                <p>從中心點 (${param1}, ${param2}) 搜尋周圍八個方向的相鄰格子</p>
                <p><strong>方向向量：</strong>(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)</p>
                <p>包含對角線方向，搜尋範圍更廣，常用於圖像處理、遊戲AI等</p>
            `;
            break;
            
        case 'floodfill':
            explanation.innerHTML = `
                <h4>🌊 Flood Fill 演算法演示</h4>
                <p>正在執行連通區域搜尋...</p>
                <p>演算法會遞迴地搜尋所有相連的值為1的格子</p>
                <p>綠色格子表示已經被搜尋到的區域</p>
            `;
            break;
            
        case 'floodfill_complete':
            explanation.innerHTML = `
                <h4>✅ Flood Fill 演算法完成</h4>
                <p>搜尋完成！找到 ${param1} 個連通的格子</p>
                <p>所有綠色格子組成一個連通區域</p>
                <p>這就是題目中 marker 陣列標記為 1 的所有位置</p>
            `;
            break;
            
        case 'edit':
            explanation.innerHTML = `
                <h4>✏️ 編輯模式</h4>
                <p>點擊格子可以切換其值（0 ↔ 1）</p>
                <p>0 = 障礙物（黑色），1 = 可通行（淺色）</p>
                <p>設計自己的地圖來測試演算法！</p>
            `;
            break;
            
        case 'select':
            explanation.innerHTML = `
                <h4>👆 選擇模式</h4>
                <p>點擊格子選擇中心點，然後使用上方按鈕開始演示</p>
            `;
            break;
            
        case 'reset':
            explanation.innerHTML = `
                <h4>🔄 網格已重置</h4>
                <p>恢復到原始狀態，點擊格子選擇新的中心點開始演示</p>
            `;
            break;
            
        default:
            explanation.innerHTML = `
                <h4>🤔 演算法說明</h4>
                <p>點擊上方按鈕開始演示不同的搜尋方式</p>
            `;
    }
}