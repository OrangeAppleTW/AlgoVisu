// 矩陣視覺化工具 - 黑白簡約風格
let matrices = [];
let maxMatrices = 4;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const matrixInput = document.getElementById('matrix-input');
    const visualizeBtn = document.getElementById('visualize-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exampleBtn = document.getElementById('example-btn');
    const statusMessage = document.getElementById('status-message');
    const displayArea = document.getElementById('matrix-display-area');

    // 綁定事件監聽器
    visualizeBtn.addEventListener('click', visualizeMatrices);
    clearBtn.addEventListener('click', clearAll);
    exampleBtn.addEventListener('click', loadExample);

    // 輸入框變化時隱藏狀態訊息
    matrixInput.addEventListener('input', function() {
        hideStatusMessage();
    });

    // 初始化狀態
    hideStatusMessage();
});

// 視覺化矩陣
function visualizeMatrices() {
    const input = document.getElementById('matrix-input').value.trim();
    
    if (!input) {
        showStatusMessage('請輸入矩陣數據', 'error');
        return;
    }

    try {
        // 解析輸入的矩陣
        matrices = parseMatrixInput(input);
        
        if (matrices.length === 0) {
            showStatusMessage('未找到有效的矩陣數據', 'error');
            return;
        }

        if (matrices.length > maxMatrices) {
            showStatusMessage(`最多只能顯示 ${maxMatrices} 個矩陣，已顯示前 ${maxMatrices} 個`, 'warning');
            matrices = matrices.slice(0, maxMatrices);
        }

        // 渲染矩陣
        renderMatrices();
        showStatusMessage(`成功載入 ${matrices.length} 個矩陣`, 'success');

    } catch (error) {
        showStatusMessage(`解析錯誤：${error.message}`, 'error');
        console.error('Matrix parsing error:', error);
    }
}

// 解析矩陣輸入
function parseMatrixInput(input) {
    const lines = input.split('\n');
    const parsedMatrices = [];
    let currentMatrix = [];
    let expectedCols = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 空行表示矩陣結束
        if (line === '') {
            if (currentMatrix.length > 0) {
                parsedMatrices.push([...currentMatrix]);
                currentMatrix = [];
                expectedCols = null;
            }
            continue;
        }

        // 解析當前行的數字
        const elements = line.split(/\s+/).filter(el => el !== '');
        
        if (elements.length === 0) continue;

        // 驗證數字格式
        const row = [];
        for (const element of elements) {
            const num = parseFloat(element);
            if (isNaN(num)) {
                throw new Error(`無效的數字格式："${element}"`);
            }
            row.push(num);
        }

        // 檢查列數一致性
        if (expectedCols === null) {
            expectedCols = row.length;
        } else if (row.length !== expectedCols) {
            throw new Error(`矩陣第 ${currentMatrix.length + 1} 行有 ${row.length} 個元素，但第 1 行有 ${expectedCols} 個元素`);
        }

        currentMatrix.push(row);
    }

    // 添加最後一個矩陣（如果有的話）
    if (currentMatrix.length > 0) {
        parsedMatrices.push(currentMatrix);
    }

    return parsedMatrices;
}

// 渲染矩陣
function renderMatrices() {
    const displayArea = document.getElementById('matrix-display-area');
    displayArea.innerHTML = '';

    matrices.forEach((matrix, index) => {
        const container = createMatrixContainer(matrix, index);
        displayArea.appendChild(container);
    });
}

// 創建矩陣容器
function createMatrixContainer(matrix, index) {
    const container = document.createElement('div');
    container.className = 'matrix-display-container';
    
    // 添加矩陣編號
    const counter = document.createElement('div');
    counter.className = 'matrix-counter';
    counter.textContent = `${index + 1}`;
    container.appendChild(counter);

    // 矩陣標題
    const title = document.createElement('div');
    title.className = 'matrix-title';
    title.textContent = `矩陣 ${index + 1}`;
    container.appendChild(title);

    // 創建矩陣表格
    const table = document.createElement('table');
    table.className = 'matrix-table';

    matrix.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(value => {
            const td = document.createElement('td');
            td.textContent = formatNumber(value);
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.appendChild(table);

    // 矩陣資訊
    const info = document.createElement('div');
    info.className = 'matrix-info';
    info.textContent = `維度：${matrix.length} × ${matrix[0].length}`;
    container.appendChild(info);

    return container;
}

// 格式化數字顯示
function formatNumber(num) {
    // 如果是整數，直接顯示
    if (Number.isInteger(num)) {
        return num.toString();
    }
    
    // 如果是小數，保留適當的小數位數
    if (Math.abs(num) < 0.001) {
        return num.toExponential(2);
    } else if (Math.abs(num) >= 1000000) {
        return num.toExponential(2);
    } else {
        return parseFloat(num.toFixed(3)).toString();
    }
}

// 顯示狀態訊息
function showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    
    // 設置不同類型的樣式
    statusElement.style.borderLeftColor = getStatusColor(type);
    statusElement.style.backgroundColor = getStatusBackground(type);
    
    // 3秒後自動隱藏（除了錯誤訊息）
    if (type !== 'error') {
        setTimeout(() => {
            hideStatusMessage();
        }, 3000);
    }
}

// 隱藏狀態訊息
function hideStatusMessage() {
    const statusElement = document.getElementById('status-message');
    statusElement.style.display = 'none';
}

// 獲取狀態顏色
function getStatusColor(type) {
    switch (type) {
        case 'success': return '#2ecc71';
        case 'warning': return '#f39c12';
        case 'error': return '#e74c3c';
        default: return '#333333';
    }
}

// 獲取狀態背景色
function getStatusBackground(type) {
    switch (type) {
        case 'success': return '#d5f4e6';
        case 'warning': return '#fef9e7';
        case 'error': return '#fadbd8';
        default: return '#f8f8f8';
    }
}

// 清除全部
function clearAll() {
    document.getElementById('matrix-input').value = '';
    matrices = [];
    const displayArea = document.getElementById('matrix-display-area');
    displayArea.innerHTML = `
        <div class="empty-state">
            <p>請在上方輸入矩陣數據，然後點擊「視覺化矩陣」按鈕開始</p>
        </div>
    `;
    hideStatusMessage();
}

// 載入範例
function loadExample() {
    const examples = [
        // 範例1：基本矩陣
        `1 2 3
4 5 6
7 8 9

10 11
12 13`,
        
        // 範例2：數學計算相關
        `1 0 0
0 1 0
0 0 1

2 3
1 4
5 6`,
        
        // 範例3：程式應用
        `1 2 3 4
5 6 7 8
9 10 11 12

0 1 0
1 0 1
0 1 0

-1 2.5
3.7 -4`,
        
        // 範例4：教學用途
        `1
2
3

5 10 15
20 25 30

1 2
3 4
5 6

100 200 300 400`
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('matrix-input').value = randomExample;
    hideStatusMessage();
    
    // 自動視覺化
    setTimeout(() => {
        visualizeMatrices();
    }, 100);
}

// 工具函數：驗證矩陣
function validateMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        return false;
    }
    
    const expectedLength = matrix[0].length;
    if (expectedLength === 0) return false;
    
    return matrix.every(row => 
        Array.isArray(row) && 
        row.length === expectedLength &&
        row.every(val => typeof val === 'number' && !isNaN(val))
    );
}

// 工具函數：獲取矩陣統計資訊
function getMatrixStats(matrix) {
    const allValues = matrix.flat();
    return {
        rows: matrix.length,
        cols: matrix[0].length,
        min: Math.min(...allValues),
        max: Math.max(...allValues),
        sum: allValues.reduce((a, b) => a + b, 0),
        avg: allValues.reduce((a, b) => a + b, 0) / allValues.length
    };
}

// 匯出功能（可供擴展使用）
function exportMatrices(format = 'json') {
    if (matrices.length === 0) {
        showStatusMessage('沒有矩陣可以匯出', 'warning');
        return;
    }

    let exportData;
    let filename;
    let mimeType;

    switch (format) {
        case 'json':
            exportData = JSON.stringify(matrices, null, 2);
            filename = 'matrices.json';
            mimeType = 'application/json';
            break;
        case 'csv':
            exportData = matrices.map((matrix, index) => {
                const header = `Matrix ${index + 1}\n`;
                const content = matrix.map(row => row.join(',')).join('\n');
                return header + content;
            }).join('\n\n');
            filename = 'matrices.csv';
            mimeType = 'text/csv';
            break;
        default:
            showStatusMessage('不支援的匯出格式', 'error');
            return;
    }

    // 創建下載連結
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatusMessage(`矩陣已匯出為 ${filename}`, 'success');
}