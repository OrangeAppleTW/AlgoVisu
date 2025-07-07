// ----- 動態規劃解決硬幣找零問題 - 簡化版 -----

// 全局變數
const coins = [4, 1, 25, 17, 9]; // 硬幣面額
const targetAmount = 50; // 目標金額
const coinColors = ['#A67D3D', '#B87333', '#CD7F32', '#C0C0C0', '#FFD700']; // 硬幣顏色

// 主要函數: 初始化並計算動態規劃表格
function initDynamicProgramming() {
    // 生成表格序列
    const tables = generateDPTables();
    
    // 設置按鈕和顯示區域
    setupUI(tables);
}

// 調整表格大小以適應螢幕
function getOptimalColumnWidth() {
    // 根據目標金額決定列寬
    if (targetAmount <= 20) return '40px';
    if (targetAmount <= 30) return '35px';
    if (targetAmount <= 40) return '30px';
    return '25px'; // 超過 40 則使用最小寬度
}

// 生成不同階段的DP表格
function generateDPTables() {
    const tables = [];
    
    // 遍歷每種可能的硬幣組合（逐步加入硬幣）
    for (let coinCount = 0; coinCount < coins.length; coinCount++) {
        // 獲取當前可用的硬幣子集
        const availableCoins = coins.slice(0, coinCount + 1);
        
        // 使用當前硬幣子集計算DP表格
        const stageResult = calculateDP(availableCoins);
        
        // 保存這個階段的結果
        tables.push({
            coin: coins[coinCount],  // 新加入的硬幣
            coinIndex: coinCount,
            availableCoins: availableCoins,
            table: stageResult.dp,
            coinUsage: stageResult.coinUsage,
            prevTable: coinCount > 0 ? tables[coinCount - 1].table : null
        });
    }
    
    return tables;
}

// 使用特定硬幣子集計算動態規劃表格
function calculateDP(availableCoins) {
    // 初始化表格：全部設為無限大，除了dp[0]=0
    const dp = Array(targetAmount + 1).fill(Infinity);
    dp[0] = 0;
    
    // 初始化硬幣使用情況矩陣
    const coinUsage = Array(targetAmount + 1).fill().map(() => 
        Array(coins.length).fill(0)
    );
    
    // 對於當前可用的每種硬幣
    for (let amount = 1; amount <= targetAmount; amount++) {
        for (let j = 0; j < availableCoins.length; j++) {
            const coin = availableCoins[j];
            const coinIndex = coins.indexOf(coin); // 全局索引
            
            if (coin <= amount) {
                const subproblem = amount - coin;
                
                // 如果子問題有解，並且使用當前硬幣可以獲得更少的硬幣數
                if (dp[subproblem] !== Infinity && dp[subproblem] + 1 < dp[amount]) {
                    dp[amount] = dp[subproblem] + 1;
                    
                    // 更新硬幣使用情況
                    // 複製子問題的硬幣使用情況
                    for (let k = 0; k < coins.length; k++) {
                        coinUsage[amount][k] = coinUsage[subproblem][k];
                    }
                    // 加上當前使用的硬幣
                    coinUsage[amount][coinIndex]++;
                }
            }
        }
    }
    
    return { dp, coinUsage };
}

// 設置UI：按鈕和表格顯示
function setupUI(tables) {
    const container = document.getElementById('dp-visualization-section') || document.body;
    container.innerHTML = '';
    
    // 添加標題
    const title = document.createElement('h3');
    title.className = 'text-center my-4';
    title.textContent = '動態規劃解決硬幣找零問題';
    container.appendChild(title);
    
    // 添加說明
    const description = document.createElement('div');
    description.className = 'alert alert-info';
    description.innerHTML = `
        <p><strong>問題</strong>：湊出 ${targetAmount} 元，使用最少的硬幣數量</p>
        <p><strong>可用硬幣</strong>：${coins.map(c => '$' + c).join(', ')}</p>
        <p><strong>演算法</strong>：動態規劃 dp[i] = min(dp[i], dp[i-coin] + 1)</p>
        <p><strong>說明</strong>：點擊不同按鈕可查看逐步加入更多硬幣面額時的最優解。</p>
    `;
    container.appendChild(description);
    
    // 創建按鈕容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'center';
    buttonContainer.style.marginBottom = '20px';
    buttonContainer.innerHTML = `<h4>點擊按鈕查看不同硬幣組合的影響</h4>`;
    container.appendChild(buttonContainer);
    
    // 創建硬幣按鈕列
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.flexWrap = 'wrap';
    buttonGroup.style.justifyContent = 'center';
    buttonGroup.style.gap = '5px';
    buttonGroup.style.margin = '10px 0';
    buttonContainer.appendChild(buttonGroup);
    
    for (let i = 0; i < tables.length; i++) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = `加入$${tables[i].coin}`;
        button.dataset.index = i;
        button.style.margin = '2px';
        
        // 第一個按鈕預設選中
        if (i === 0) {
            button.className = 'btn btn-primary';
        }
        
        buttonGroup.appendChild(button);
    }
    
    // 創建表格顯示區域
    const tableInfo = document.createElement('div');
    tableInfo.className = 'alert alert-secondary mb-4';
    tableInfo.id = 'table-info';
    container.appendChild(tableInfo);
    
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive';
    tableContainer.id = 'table-container';
    tableContainer.style.maxWidth = '100%';
    tableContainer.style.overflowX = 'auto';
    container.appendChild(tableContainer);
    
    // 創建解釋區域
    const explanationContainer = document.createElement('div');
    explanationContainer.className = 'card mt-4';
    explanationContainer.innerHTML = `
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0">階段分析</h5>
        </div>
        <div class="card-body" id="explanation-container"></div>
    `;
    container.appendChild(explanationContainer);
    
    // 設置按鈕點擊事件
    buttonGroup.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // 更新按鈕狀態
            buttonGroup.querySelectorAll('button').forEach(btn => {
                btn.className = 'btn btn-outline-primary';
            });
            e.target.className = 'btn btn-primary';
            
            // 顯示對應表格
            const index = parseInt(e.target.dataset.index);
            showTable(tables[index], index);
        }
    });
    
    // 預設顯示第一個表格
    showTable(tables[0], 0);
}

// 顯示特定階段的表格
function showTable(tableData, stageIndex) {
    const { coin, availableCoins, table, prevTable, coinUsage } = tableData;
    
    // 更新表格資訊
    updateTableInfo(availableCoins, stageIndex);
    
    // 繪製表格
    renderTable(table, prevTable, coinUsage);
    
    // 更新解釋
    updateExplanation(tableData, stageIndex);
}

// 更新表格資訊
function updateTableInfo(availableCoins, stageIndex) {
    const tableInfo = document.getElementById('table-info');
    if (!tableInfo) return;
    
    const coinNames = availableCoins.map(c => '$' + c).join(', ');
    const newCoin = '$' + availableCoins[availableCoins.length - 1];
    
    tableInfo.innerHTML = `
        <h5>階段 ${stageIndex + 1}: 加入硬幣 ${newCoin}</h5>
        <p>可用硬幣: ${coinNames}</p>
        <p>此表格顯示使用以上面額的硬幣，湊出每個金額所需的最少硬幣數量。</p>
        <p>綠色單元格表示透過使用 ${newCoin} 找到了更好的解。</p>
    `;
}

// 繪製表格
function renderTable(table, prevTable, coinUsage) {
    const tableContainer = document.getElementById('table-container');
    if (!tableContainer) return;
    
    tableContainer.innerHTML = '';
    tableContainer.style.overflowX = 'auto';  // 添加水平滾動
    tableContainer.style.maxWidth = '100%';
    tableContainer.style.display = 'block';
    
    // 創建表格並設置樣式
    const tableElement = document.createElement('table');
    tableElement.className = 'dp-table';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.width = '100%';
    
    // 創建表頭 - 金額
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 添加金額列標題
    const thHeader = document.createElement('th');
    thHeader.textContent = '金額';
    thHeader.className = 'bg-light';
    thHeader.style.position = 'sticky';
    thHeader.style.left = '0';
    thHeader.style.zIndex = '1';
    headerRow.appendChild(thHeader);
    
    // 添加所有金額列
    for (let i = 0; i <= targetAmount; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        th.style.width = getOptimalColumnWidth();
        headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
    tableElement.appendChild(thead);
    
    // 創建表格主體
    const tbody = document.createElement('tbody');
    
    // 最少硬幣數量行
    const dpRow = document.createElement('tr');
    
    // 添加行標題，固定在左側
    const thDp = document.createElement('th');
    thDp.textContent = '最少硬幣';
    thDp.className = 'bg-light';
    thDp.style.position = 'sticky';
    thDp.style.left = '0';
    thDp.style.zIndex = '1';
    dpRow.appendChild(thDp);
    
    for (let i = 0; i <= targetAmount; i++) {
        const cell = document.createElement('td');
        cell.textContent = table[i] === Infinity ? '∞' : table[i];
        
        // 高亮顯示基礎情況 dp[0] = 0
        if (i === 0) {
            cell.style.backgroundColor = '#e3f2fd'; // 藍色
            cell.style.fontWeight = 'bold';
        }
        // 高亮顯示有變化的單元格
        else if (prevTable && prevTable[i] !== table[i]) {
            cell.style.backgroundColor = '#a5d6a7'; // 綠色
            cell.style.fontWeight = 'bold';
        }
        
        dpRow.appendChild(cell);
    }
    
    tbody.appendChild(dpRow);
    
    // 為每種硬幣添加使用數量行
    for (let coinIdx = 0; coinIdx < coins.length; coinIdx++) {
        const coinValue = coins[coinIdx];
        const coinUsageRow = document.createElement('tr');
        
        // 添加行標題，固定在左側
        const thCoin = document.createElement('th');
        thCoin.innerHTML = `$${coinValue} 使用數`;
        thCoin.className = 'bg-light';
        thCoin.style.position = 'sticky';
        thCoin.style.left = '0';
        thCoin.style.zIndex = '1';
        coinUsageRow.appendChild(thCoin);
        
        for (let i = 0; i <= targetAmount; i++) {
            const cell = document.createElement('td');
            
            if (i === 0 || table[i] === Infinity) {
                cell.textContent = '-';
            } else {
                // 獲取該金額使用的這種硬幣數量
                const count = coinUsage[i][coinIdx];
                cell.textContent = count;
                
                // 高亮顯示使用了的硬幣
                if (count > 0) {
                    cell.style.color = coinColors[coinIdx];
                    cell.style.fontWeight = 'bold';
                }
                
                // 特別高亮最後加入的硬幣的變化
                if (prevTable && prevTable[i] !== table[i] && count > 0) {
                    cell.style.backgroundColor = '#a5d6a7';
                }
            }
            
            coinUsageRow.appendChild(cell);
        }
        
        tbody.appendChild(coinUsageRow);
    }
    
    tableElement.appendChild(tbody);
    tableContainer.appendChild(tableElement);
    
    // 添加固定第一列的CSS
    const style = document.createElement('style');
    style.textContent = `
        .dp-table th:first-child, .dp-table td:first-child {
            position: sticky;
            left: 0;
            z-index: 1;
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
}

// 更新解釋
function updateExplanation(tableData, stageIndex) {
    const explanationContainer = document.getElementById('explanation-container');
    if (!explanationContainer) return;
    
    const { coin, availableCoins, table, prevTable, coinUsage } = tableData;
    
    // 尋找有變化的金額
    const changedAmounts = [];
    for (let i = 0; i <= targetAmount; i++) {
        if (prevTable && prevTable[i] !== table[i]) {
            changedAmounts.push(i);
        }
    }
    
    let html = '';
    
    if (stageIndex === 0) {
        // 第一階段特殊處理
        const solvedAmounts = [];
        for (let i = 0; i <= targetAmount; i++) {
            if (table[i] !== Infinity) {
                solvedAmounts.push(i);
            }
        }
        
        html = `
            <div class="alert alert-info">
                <h6>初始階段: 只使用 $${coin} 硬幣</h6>
                <p>使用 $${coin} 硬幣，我們可以湊出以下金額: ${solvedAmounts.join(', ')}</p>
                <p>這些都是 $${coin} 的倍數，每個金額都能被 $${coin} 整除。</p>
            </div>
        `;
    } else if (changedAmounts.length === 0) {
        html = `
            <div class="alert alert-warning">
                <h6>沒有變化</h6>
                <p>加入硬幣 $${coin} 後，沒有任何金額的最優解發生變化。</p>
                <p>這表示使用已有的硬幣組合已經是最優解，無需使用 $${coin}。</p>
            </div>
        `;
    } else {
        html = `
            <h6>使用 $${coin} 改進的金額:</h6>
            <p>共有 ${changedAmounts.length} 個金額找到了更好的解。</p>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>金額</th>
                            <th>原本硬幣數</th>
                            <th>新的硬幣數</th>
                            <th>硬幣組合</th>
                            <th>說明</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // 只顯示前10個變化，避免過多
        const displayAmounts = changedAmounts.slice(0, 10);
        displayAmounts.forEach(amount => {
            const oldValue = prevTable[amount];
            const newValue = table[amount];
            
            // 計算硬幣組合字符串
            let coinComboStr = "";
            for (let i = 0; i < coins.length; i++) {
                const count = coinUsage[amount][i];
                if (count > 0) {
                    coinComboStr += `<span style="color:${coinColors[i]}">$${coins[i]}x${count}</span> `;
                }
            }
            
            // 找出最佳的子問題組合
            const bestSubproblem = amount - coin;
            html += `
                <tr>
                    <td>${amount}</td>
                    <td>${oldValue === Infinity ? '∞' : oldValue}</td>
                    <td>${newValue}</td>
                    <td>${coinComboStr}</td>
                    <td>使用1個$${coin} + 湊出${bestSubproblem}元</td>
                </tr>
            `;
        });
        
        if (changedAmounts.length > 10) {
            html += `
                <tr>
                    <td colspan="5">...以及其他 ${changedAmounts.length - 10} 個金額</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // 添加總結
    html += `
        <div class="alert alert-info mt-3">
            <h6>階段小結</h6>
            <p>當前可用硬幣: ${availableCoins.map(c => '$' + c).join(', ')}</p>
            <p>動態規劃的原理：對於每個金額 i，我們考慮所有可用硬幣，選擇使用哪一個能得到最少的硬幣數量。</p>
            <p>計算公式：dp[i] = min(dp[i], dp[i-coin] + 1) 表示用一個硬幣 coin 加上湊出 (i-coin) 元所需的最少硬幣數。</p>
        </div>
    `;
    
    // 如果是最後一個階段，添加最終解決方案
    if (stageIndex === coins.length - 1) {
        html += `
            <div class="alert alert-success mt-3">
                <h6>最終解決方案</h6>
        `;
        
        if (table[targetAmount] !== Infinity) {
            html += `<p>湊出 ${targetAmount} 元最少需要 ${table[targetAmount]} 個硬幣：</p><ul>`;
            
            for (let i = 0; i < coins.length; i++) {
                const count = coinUsage[targetAmount][i];
                if (count > 0) {
                    html += `<li><span style="color:${coinColors[i]}">$${coins[i]}</span>: ${count} 個</li>`;
                }
            }
            
            html += `</ul>`;
        } else {
            html += `<p>無法使用當前硬幣湊出 ${targetAmount} 元。</p>`;
        }
        
        html += `</div>`;
    }
    
    explanationContainer.innerHTML = html;
}

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', () => {
    initDynamicProgramming();
});