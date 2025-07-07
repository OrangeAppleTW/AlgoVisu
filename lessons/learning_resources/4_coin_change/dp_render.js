// ----- 動態規劃解決硬幣找零問題 - 渲染函數 -----

// 新增函數：顯示初始的表格結構
function renderInitialTable() {
    // 初始化表格
    dpTable = Array(dpAmount + 1).fill(Infinity);
    dpTable[0] = 0;  // 湊出0元需要0個硬幣
    coinChoice = Array(dpAmount + 1).fill(-1);
    currentCoinUsage = Array(dpAmount + 1).fill().map(() => ({}));
    
    // 顯示初始表格結構
    renderDpTable();
}

function renderProblem() {
    const container = document.getElementById('dp-container');
    const tableContainer = document.getElementById('dp-table-container');
    const width = container.clientWidth;
    const height = 300;
    
    // 清空容器
    container.innerHTML = '';
    tableContainer.innerHTML = '';
    
    // 創建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    container.appendChild(svg);
    
    // 項目標題 - 顯示目標金額和可用硬幣
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', width / 2);
    titleText.setAttribute('y', 30);
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('fill', '#2c3e50');
    titleText.setAttribute('font-weight', 'bold');
    titleText.setAttribute('font-size', '16px');
    
    const coinsInfo = dpCoins.map(coin => coin.label).join(', ');
    titleText.textContent = `目標金額: ${dpAmount} 元 | 可用硬幣: ${coinsInfo}`;
    svg.appendChild(titleText);
    
    // 繪製目標金額區域
    const targetBoxWidth = Math.min(width / 3, 200);
    const targetBoxHeight = height * 0.6;
    const targetBoxX = width - targetBoxWidth - 30;
    const targetBoxY = (height - targetBoxHeight) / 2 + 20; // 增加一點距離，為上方標題留出空間
    
    const targetBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    targetBox.setAttribute('x', targetBoxX);
    targetBox.setAttribute('y', targetBoxY);
    targetBox.setAttribute('width', targetBoxWidth);
    targetBox.setAttribute('height', targetBoxHeight);
    targetBox.setAttribute('stroke', '#3498db');
    targetBox.setAttribute('stroke-width', '2');
    targetBox.setAttribute('fill', '#f1f1f1');
    targetBox.setAttribute('id', 'dp-target-box');
    svg.appendChild(targetBox);
    
    // 繪製目標金額標籤
    const targetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    targetLabel.setAttribute('x', targetBoxX + targetBoxWidth / 2);
    targetLabel.setAttribute('y', targetBoxY - 10);
    targetLabel.setAttribute('text-anchor', 'middle');
    targetLabel.setAttribute('fill', '#3498db');
    targetLabel.setAttribute('font-weight', 'bold');
    targetLabel.textContent = `目標金額: ${dpAmount}`;
    svg.appendChild(targetLabel);
    
    // 在目標金額框中央顯示當前金額
    const currentAmount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    currentAmount.setAttribute('x', targetBoxX + targetBoxWidth / 2);
    currentAmount.setAttribute('y', targetBoxY + targetBoxHeight / 2);
    currentAmount.setAttribute('text-anchor', 'middle');
    currentAmount.setAttribute('fill', '#2c3e50');
    currentAmount.setAttribute('font-size', '24px');
    currentAmount.setAttribute('font-weight', 'bold');
    currentAmount.setAttribute('id', 'dp-current-amount');
    currentAmount.textContent = '0';
    svg.appendChild(currentAmount);
    
    // 繪製硬幣
    const coinSize = Math.min(width / (dpCoins.length * 2), 60);
    const coinSpacing = Math.min((width / 2 - 30) / dpCoins.length, 100);
    
    dpCoins.forEach((coin, index) => {
        const coinX = 40 + index * coinSpacing;
        const coinY = height / 2 + 20; // 增加一點距離，為上方標題留出空間
        
        // 計算硬幣使用次數（初始為0）
        const usageCount = coin.count || 0;
        
        // 繪製硬幣
        const coinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        coinCircle.setAttribute('cx', coinX + coinSize / 2);
        coinCircle.setAttribute('cy', coinY);
        coinCircle.setAttribute('r', coinSize / 2);
        coinCircle.setAttribute('fill', coin.color);
        coinCircle.setAttribute('stroke', '#2c3e50');
        coinCircle.setAttribute('stroke-width', '1');
        coinCircle.setAttribute('id', `dp-coin-${coin.id}`);
        svg.appendChild(coinCircle);
        
        // 硬幣面額標籤
        const coinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        coinLabel.setAttribute('x', coinX + coinSize / 2);
        coinLabel.setAttribute('y', coinY + 5);
        coinLabel.setAttribute('text-anchor', 'middle');
        coinLabel.setAttribute('fill', '#2c3e50');
        coinLabel.setAttribute('font-weight', 'bold');
        coinLabel.setAttribute('font-size', '14px');
        coinLabel.textContent = coin.label;
        svg.appendChild(coinLabel);
        
        // 顯示硬幣使用次數
        const usageLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        usageLabel.setAttribute('x', coinX + coinSize / 2);
        usageLabel.setAttribute('y', coinY + coinSize / 2 + 20);
        usageLabel.setAttribute('text-anchor', 'middle');
        usageLabel.setAttribute('fill', '#2c3e50');
        usageLabel.setAttribute('font-size', '14px');
        usageLabel.setAttribute('id', `dp-usage-${coin.id}`);
        usageLabel.textContent = `× ${usageCount}`;
        svg.appendChild(usageLabel);
    });
    
    // 繪製DP進度指示器
    renderDpProgressIndicator(svg, targetBoxX, targetBoxY - 40, targetBoxWidth);
}

// 新增：DP進度指示器
function renderDpProgressIndicator(svg, x, y, width) {
    const progressBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    progressBar.setAttribute('x', x);
    progressBar.setAttribute('y', y);
    progressBar.setAttribute('width', 0); // 初始寬度0
    progressBar.setAttribute('height', 5);
    progressBar.setAttribute('fill', '#3498db');
    progressBar.setAttribute('id', 'dp-progress-bar');
    svg.appendChild(progressBar);
    
    const progressText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    progressText.setAttribute('x', x + width / 2);
    progressText.setAttribute('y', y - 5);
    progressText.setAttribute('text-anchor', 'middle');
    progressText.setAttribute('fill', '#2c3e50');
    progressText.setAttribute('font-size', '12px');
    progressText.setAttribute('id', 'dp-progress-text');
    progressText.textContent = `DP 進度: 0%`;
    svg.appendChild(progressText);
}

// 更新DP進度
function updateDpProgress(percent) {
    const progressBar = document.getElementById('dp-progress-bar');
    const progressText = document.getElementById('dp-progress-text');
    if (progressBar && progressText) {
        const width = progressBar.parentElement.viewBox.baseVal.width / 3;
        progressBar.setAttribute('width', (width * percent / 100).toFixed(2));
        progressText.textContent = `DP 進度: ${Math.round(percent)}%`;
    }
}

function renderDpTable(highlightCell = null, prevValue = null, newValue = null) {
    const tableContainer = document.getElementById('dp-table-container');
    tableContainer.innerHTML = '';
    
    if (!dpTable || dpTable.length === 0) return;
    
    // 添加表格樣式
    const style = document.createElement('style');
    style.textContent = `
        .dp-table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        .dp-table th, .dp-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            transition: all 0.5s ease;
        }
        .dp-table th {
            background-color: #f2f2f2;
            color: #333;
        }
        .dp-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .highlight {
            background-color: #ffeb3b !important;
            font-weight: bold;
        }
        .updated {
            background-color: #a5d6a7 !important;
            font-weight: bold;
            animation: pulse 1s;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    tableContainer.appendChild(style);
    
    const table = document.createElement('table');
    table.className = 'dp-table';
    
    // 創建表頭（金額）
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 第一個單元格（空的）
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = '金額';
    headerRow.appendChild(emptyHeader);
    
    // 顯示每個金額
    for (let amount = 0; amount <= dpAmount; amount++) {
        // 為了節省空間，只顯示部分金額
        if (dpAmount > 25 && amount > 0 && amount < dpAmount && amount % Math.ceil(dpAmount / 25) !== 0) {
        continue;
        }
        
        const th = document.createElement('th');
        th.textContent = amount;
        headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 創建表格主體
    const tbody = document.createElement('tbody');
    
    // 第一行，顯示最小硬幣數
    const row = document.createElement('tr');
    
    // 第一列是標題
    const rowHeader = document.createElement('th');
    rowHeader.textContent = '最少硬幣數';
    row.appendChild(rowHeader);
    
    // 填充動態規劃表格的值
    for (let amount = 0; amount <= dpAmount; amount++) {
        // 為了節省空間，只顯示部分金額
        if (dpAmount > 20 && amount > 0 && amount < dpAmount && amount % Math.ceil(dpAmount / 20) !== 0) {
            continue;
        }
        
        const cell = document.createElement('td');
        const value = dpTable[amount];
        cell.textContent = value === Infinity ? '∞' : value;
        cell.id = `dp-cell-${amount}`;
        
        // 高亮當前更新的單元格
        if (highlightCell && highlightCell.amount === amount && !highlightCell.row) {
            if (prevValue !== null && newValue !== null && prevValue > newValue) {
                cell.classList.add('updated'); // 使用特別的動畫效果
            } else {
                cell.classList.add('highlight');
            }
        }
        
        row.appendChild(cell);
    }
    
    tbody.appendChild(row);
    
    // 為每種硬幣創建一行，顯示在每個金額下使用的數量
    if (currentCoinUsage && currentCoinUsage.length > 0) {
        dpCoins.forEach((coin, coinIndex) => {
            const coinRow = document.createElement('tr');
            
            // 第一列是硬幣面額
            const coinHeader = document.createElement('th');
            coinHeader.textContent = `${coin.label} 數量`;
            coinRow.appendChild(coinHeader);
            
            // 填充每個金額使用該硬幣的數量
            for (let amount = 0; amount <= dpAmount; amount++) {
                // 為了節省空間，只顯示部分金額
                if (dpAmount > 20 && amount > 0 && amount < dpAmount && amount % Math.ceil(dpAmount / 20) !== 0) {
                    continue;
                }
                
                const cell = document.createElement('td');
                if (amount === 0) {
                    cell.textContent = '0';
                } else if (currentCoinUsage[amount] && currentCoinUsage[amount][coin.id]) {
                    cell.textContent = currentCoinUsage[amount][coin.id];
                    
                    // 高亮當前硬幣的使用數量
                    if (highlightCell && highlightCell.amount === amount && 
                        highlightCell.row === 'coin' && highlightCell.coinId === coin.id) {
                        cell.classList.add('updated');
                    }
                } else {
                    cell.textContent = '0';
                }
                
                coinRow.appendChild(cell);
            }
            
            tbody.appendChild(coinRow);
        });
    }
    
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    
    // 添加表格說明
    const caption = document.createElement('div');
    caption.style.marginTop = '10px';
    caption.style.textAlign = 'center';
    caption.innerHTML = '<span style="background-color: #ffeb3b; padding: 2px 5px;">黃色</span> = 當前正在分析的金額 | ' +
                        '<span style="background-color: #a5d6a7; padding: 2px 5px;">綠色</span> = 找到更好的解';
    tableContainer.appendChild(caption);
}

function updateCurrentAmount(amount) {
    const currentAmountElement = document.getElementById('dp-current-amount');
    if (currentAmountElement) {
        currentAmountElement.textContent = amount;
    }
}

function updateCoinUsage(coinId, count) {
    const usageLabel = document.getElementById(`dp-usage-${coinId}`);
    if (usageLabel) {
        usageLabel.textContent = `× ${count}`;
    }
}

function highlightCoin(coinId, type) {
    const coin = document.getElementById(`dp-coin-${coinId}`);
    if (!coin) return;
    
    // 保存原始顏色
    const originalColor = dpCoins.find(c => c.id === coinId).color;
    
    if (type === 'considering') {
        coin.setAttribute('stroke', '#f39c12');
        coin.setAttribute('stroke-width', '3');
        // 新增脈動效果
        coin.setAttribute('filter', 'url(#pulse)');
        ensurePulseFilter();
    } else if (type === 'selected') {
        // 嘗試增加亮度或飽和度
        coin.setAttribute('stroke', '#2ecc71');
        coin.setAttribute('stroke-width', '3');
        // 移除脈動效果
        coin.removeAttribute('filter');
    } else if (type === 'normal') {
        coin.setAttribute('stroke', '#2c3e50');
        coin.setAttribute('stroke-width', '1');
        // 移除脈動效果
        coin.removeAttribute('filter');
    }
}

// 確保脈動效果濾鏡已添加
function ensurePulseFilter() {
    // 檢查是否已經存在
    if (document.getElementById('pulse-filter')) return;
    
    const svg = document.querySelector('#dp-container svg');
    if (!svg) return;
    
    // 創建濾鏡定義
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'pulse');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'r');
    animate.setAttribute('values', '0;1;0');
    animate.setAttribute('dur', '1.5s');
    animate.setAttribute('repeatCount', 'indefinite');
    
    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '1');
    blur.appendChild(animate);
    
    filter.appendChild(blur);
    defs.appendChild(filter);
}

// 禁用/啟用按鈕
function disableButtons(prefix, disabled, exceptGenerate = false) {
    document.getElementById(`${prefix}-start`).disabled = disabled;
    document.getElementById(`${prefix}-pause`).disabled = !disabled;
    document.getElementById(`${prefix}-reset`).disabled = false;
    if (!exceptGenerate) {
        document.getElementById(`${prefix}-generate`).disabled = disabled;
    }
}

// 等待函數
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
