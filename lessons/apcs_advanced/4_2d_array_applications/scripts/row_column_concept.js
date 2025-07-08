// Row & Column 概念演示的 JavaScript

console.log('JavaScript 檔案已載入');

// 全域變數
let currentRows = 5;
let currentCols = 5;
let gridData = [];

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 載入完成，開始初始化');
    generateInitialMatrix();
    initializeCoordinateGrid();
});

// 生成初始矩陣數據
function generateInitialMatrix() {
    console.log('生成初始矩陣數據');
    gridData = [];
    for (let i = 0; i < currentRows; i++) {
        gridData[i] = [];
        for (let j = 0; j < currentCols; j++) {
            // 生成更豐富的數值：包含負數、小數、大數等
            const valueTypes = [
                Math.floor(Math.random() * 100),           // 0-99的整數
                Math.floor(Math.random() * 20) - 10,       // -10到9的整數
                (Math.random() * 10).toFixed(1),           // 0.0-10.0的小數
                Math.floor(Math.random() * 1000),          // 0-999的大數
                String.fromCharCode(65 + Math.floor(Math.random() * 26)) // A-Z字母
            ];
            gridData[i][j] = valueTypes[Math.floor(Math.random() * valueTypes.length)];
        }
    }
    console.log('矩陣數據生成完成:', gridData);
}

// 初始化座標理解網格
function initializeCoordinateGrid() {
    console.log('初始化座標理解網格');
    const grid = document.getElementById('coordinateGrid');
    const rowLabels = document.getElementById('rowLabels');
    const colLabels = document.getElementById('colLabels');
    
    if (!grid || !rowLabels || !colLabels) {
        console.error('找不到必要的DOM元素');
        return;
    }
    
    // 設定網格佈局
    grid.style.gridTemplateColumns = `repeat(${currentCols}, 1fr)`;
    
    // 建立行標籤 (j = 0, 1, 2, ...)
    colLabels.innerHTML = '';
    for (let j = 0; j < currentCols; j++) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = `j=${j}`;
        colLabels.appendChild(label);
    }
    
    // 建立列標籤 (i = 0, 1, 2, ...)
    rowLabels.innerHTML = '';
    for (let i = 0; i < currentRows; i++) {
        const label = document.createElement('div');
        label.className = 'label row-label';
        label.textContent = `i=${i}`;
        rowLabels.appendChild(label);
    }
    
    // 建立網格格子
    grid.innerHTML = '';
    for (let i = 0; i < currentRows; i++) {
        for (let j = 0; j < currentCols; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = gridData[i][j];  // 顯示實際數值
            cell.onclick = () => showCoordinate(i, j, gridData[i][j]);
            cell.onmouseenter = () => highlightRowColumn(i, j, true);
            cell.onmouseleave = () => highlightRowColumn(i, j, false);
            
            // 根據值的類型設定顏色
            setCellColor(cell, gridData[i][j]);
            
            grid.appendChild(cell);
        }
    }
    
    // 更新輸入框的最大值
    updateInputLimits();
    console.log('網格初始化完成');
}

// 設定格子顏色（統一風格）
function setCellColor(cell, value) {
    // 所有格子都使用統一的白色背景
    cell.style.backgroundColor = '#ffffff';
    cell.style.color = '#2c3e50';
    cell.style.border = '2px solid #bdc3c7';
}

// 顯示座標資訊
function showCoordinate(i, j, value) {
    console.log(`顯示座標 (${i}, ${j}), 值: ${value}`);
    
    // 重置所有格子
    document.querySelectorAll('#coordinateGrid .grid-cell').forEach(cell => {
        cell.classList.remove('highlighted');
    });
    
    // 高亮當前格子
    const cells = document.querySelectorAll('#coordinateGrid .grid-cell');
    const index = i * currentCols + j;
    if (cells[index]) {
        cells[index].classList.add('highlighted');
    }
    
    // 分析數值類型
    let valueType = '字母';
    let valueDescription = '字符串類型';
    
    if (!isNaN(value)) {
        const numValue = parseFloat(value);
        if (Number.isInteger(numValue)) {
            valueType = '整數';
            if (numValue < 0) {
                valueDescription = '負整數';
            } else if (numValue === 0) {
                valueDescription = '零';
            } else {
                valueDescription = '正整數';
            }
        } else {
            valueType = '小數';
            valueDescription = '浮點數';
        }
    }
    
    // 更新右側資訊面板
    const infoPanel = document.getElementById('coordinateInfo');
    if (infoPanel) {
        infoPanel.innerHTML = `
            <div class="coordinate-info-item">
                <div class="info-label">座標表示法</div>
                <div class="info-value">arr[${i}][${j}]</div>
                <div class="info-description">二維陣列的元素存取方式</div>
            </div>
            
            <div class="coordinate-info-item">
                <div class="info-label">Row (列)</div>
                <div class="info-value">i = ${i}</div>
                <div class="info-description">水平方向，第 ${i+1} 列</div>
            </div>
            
            <div class="coordinate-info-item">
                <div class="info-label">Column (行)</div>
                <div class="info-value">j = ${j}</div>
                <div class="info-description">垂直方向，第 ${j+1} 行</div>
            </div>
            
            <div class="coordinate-info-item">
                <div class="info-label">元素數值</div>
                <div class="info-value">${value}</div>
                <div class="info-description">${valueType} - ${valueDescription}</div>
            </div>
            
            <div class="coordinate-info-item">
                <div class="info-label">矩陣維度</div>
                <div class="info-value">${currentRows} × ${currentCols}</div>
                <div class="info-description">目前矩陣大小</div>
            </div>
        `;
    }
}

// 高亮行和列（簡化版）
function highlightRowColumn(targetI, targetJ, highlight) {
    const cells = document.querySelectorAll('#coordinateGrid .grid-cell');
    const rowLabels = document.querySelectorAll('#rowLabels .label');
    const colLabels = document.querySelectorAll('#colLabels .label');
    
    if (highlight) {
        // 簡單高亮標籤
        if (targetI < rowLabels.length && targetJ < colLabels.length) {
            if (rowLabels[targetI]) {
                rowLabels[targetI].style.backgroundColor = '#f8f9fa';
                rowLabels[targetI].style.fontWeight = 'bold';
            }
            if (colLabels[targetJ]) {
                colLabels[targetJ].style.backgroundColor = '#f8f9fa';
                colLabels[targetJ].style.fontWeight = 'bold';
            }
        }
    } else {
        // 移除高亮
        rowLabels.forEach(label => {
            label.style.backgroundColor = '';
            label.style.fontWeight = '';
        });
        colLabels.forEach(label => {
            label.style.backgroundColor = '';
            label.style.fontWeight = '';
        });
    }
}

// 更新矩陣大小
function updateMatrixSize() {
    console.log('更新矩陣大小');
    const newRows = parseInt(document.getElementById('matrixRows').value);
    const newCols = parseInt(document.getElementById('matrixCols').value);
    
    currentRows = newRows;
    currentCols = newCols;
    
    generateInitialMatrix();
    initializeCoordinateGrid();
    
    // 清除座標資訊面板
    const infoPanel = document.getElementById('coordinateInfo');
    if (infoPanel) {
        infoPanel.innerHTML = `
            <div class="placeholder">
                點擊任意格子查看詳細資訊
            </div>
        `;
    }
}

// 載入自定義矩陣
function loadCustomMatrix() {
    console.log('載入自定義矩陣');
    const input = document.getElementById('matrixInput').value.trim();
    
    if (!input) {
        alert('請輸入矩陣數值！');
        return;
    }
    
    try {
        // 解析輸入的矩陣
        const lines = input.split('\n').filter(line => line.trim() !== '');
        const newRows = lines.length;
        
        if (newRows === 0) {
            alert('請輸入有效的矩陣數值！');
            return;
        }
        
        // 解析第一行來確定列數
        const firstRowValues = lines[0].trim().split(/\s+/);
        const newCols = firstRowValues.length;
        
        if (newCols === 0) {
            alert('請輸入有效的矩陣數值！');
            return;
        }
        
        // 檢查所有行的列數是否一致
        for (let i = 0; i < lines.length; i++) {
            const rowValues = lines[i].trim().split(/\s+/);
            if (rowValues.length !== newCols) {
                alert(`第 ${i+1} 行的列數不一致！期望 ${newCols} 個值，但找到 ${rowValues.length} 個。`);
                return;
            }
        }
        
        // 檢查矩陣大小是否在允許範圍內
        if (newRows < 3 || newRows > 8 || newCols < 3 || newCols > 8) {
            alert('矩陣大小必須在 3×3 到 8×8 之間！');
            return;
        }
        
        // 更新矩陣大小選擇器
        document.getElementById('matrixRows').value = newRows;
        document.getElementById('matrixCols').value = newCols;
        
        // 更新全域變數
        currentRows = newRows;
        currentCols = newCols;
        
        // 解析並設定矩陣數據
        gridData = [];
        for (let i = 0; i < newRows; i++) {
            gridData[i] = [];
            const rowValues = lines[i].trim().split(/\s+/);
            for (let j = 0; j < newCols; j++) {
                gridData[i][j] = rowValues[j];
            }
        }
        
        // 重新初始化網格
        initializeCoordinateGrid();
        
        // 清除座標資訊面板
        const infoPanel = document.getElementById('coordinateInfo');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <div class="placeholder">
                    點擊任意格子查看詳細資訊
                </div>
            `;
        }
        
        console.log('自定義矩陣載入成功:', gridData);
        
    } catch (error) {
        console.error('解析矩陣時發生錯誤:', error);
        alert('解析矩陣時發生錯誤，請檢查輸入格式！');
    }
}

// 更新輸入框限制（留作兼容）
function updateInputLimits() {
    // 不再需要，但保留以免錯誤
}

// 鍵盤導航支援
document.addEventListener('keydown', function(event) {
    const currentHighlighted = document.querySelector('#coordinateGrid .grid-cell.highlighted');
    if (!currentHighlighted) return;
    
    const cells = Array.from(document.querySelectorAll('#coordinateGrid .grid-cell'));
    const currentIndex = cells.indexOf(currentHighlighted);
    const currentI = Math.floor(currentIndex / currentCols);
    const currentJ = currentIndex % currentCols;
    
    let newI = currentI;
    let newJ = currentJ;
    
    switch(event.key) {
        case 'ArrowUp':
            newI = Math.max(0, currentI - 1);
            break;
        case 'ArrowDown':
            newI = Math.min(currentRows - 1, currentI + 1);
            break;
        case 'ArrowLeft':
            newJ = Math.max(0, currentJ - 1);
            break;
        case 'ArrowRight':
            newJ = Math.min(currentCols - 1, currentJ + 1);
            break;
        default:
            return;
    }
    
    event.preventDefault();
    showCoordinate(newI, newJ, gridData[newI][newJ]);
});

// 添加 CSS 動畫（簡約版）
const style = document.createElement('style');
style.textContent = `
    .grid-cell.highlighted {
        border: 2px solid #2c3e50 !important;  /* 保持相同寬度避免移動 */
        background-color: #f8f9fa !important;
        color: #2c3e50 !important;
        font-weight: bold;
    }
    
    .grid-cell:hover {
        background-color: #f8f9fa !important;
        border-color: #7f8c8d !important;
        cursor: pointer;
    }
`;
document.head.appendChild(style);