// ----- 動態規劃解決硬幣找零問題 - 簡化版視覺化工具 -----

// 在完成DP算法後調用視覺化函數
function initVisualization() {
    // 檢查是否已完成DP
    if (!dpTable || dpTable.length === 0) return;
    
    // 創建核心視覺化：表格變化 
    createDpTableStages();
}

// 創建動態規劃表格階段視覺化
function createDpTableStages() {
    const container = document.getElementById('dp-stages-container');
    if (!container || !window.dpTableSnapshots || window.dpTableSnapshots.length === 0) return;
    
    container.innerHTML = '';
    
    // 添加說明文本
    const description = document.createElement('div');
    description.className = 'core-description';
    description.style.margin = '20px 0';
    description.style.padding = '15px';
    description.style.backgroundColor = '#f8f9fa';
    description.style.borderRadius = '5px';
    description.style.border = '1px solid #dee2e6';
    description.innerHTML = `
        <h4 class="text-center">動態規劃解決硬幣找零問題</h4>
        <p><strong>問題</strong>：湊出 ${dpAmount} 元，使用最少的硬幣數量</p>
        <p><strong>可用硬幣</strong>：${dpCoins.map(c => c.label).join(', ')}</p>
        <p><strong>基礎條件</strong>：dp[0] = 0（湊出0元需要0個硬幣）</p>
        <p><strong>狀態轉移方程</strong>：dp[i] = min(dp[i], dp[i-coin] + 1)</p>
    `;
    container.appendChild(description);
    
    // 創建硬幣按鈕區域
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container text-center mb-4';
    buttonContainer.innerHTML = `
        <h5>點擊按鈕查看加入每個硬幣後的表格變化</h5>
        <div id="coin-buttons" class="btn-group mt-2"></div>
    `;
    container.appendChild(buttonContainer);
    
    // 創建表格顯示區域
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container mt-4';
    tableContainer.innerHTML = `
        <div id="table-stage-info" class="alert alert-info mb-3"></div>
        <div id="table-display" class="table-responsive"></div>
    `;
    container.appendChild(tableContainer);
    
    // 創建步驟解說區域
    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'steps-container mt-4';
    stepsContainer.innerHTML = `
        <h5 class="mb-3">演算法步驟解說</h5>
        <div id="steps-explanation" class="p-3 border rounded bg-light"></div>
    `;
    container.appendChild(stepsContainer);
    
    // 初始化硬幣按鈕
    initCoinButtons();
    
    // 預設顯示初始狀態
    showTableStage(0);
}

// 初始化硬幣按鈕
function initCoinButtons() {
    const buttonContainer = document.getElementById('coin-buttons');
    const snapshots = window.dpTableSnapshots;
    
    if (!buttonContainer || !snapshots) return;
    
    buttonContainer.innerHTML = '';
    
    // 添加初始狀態按鈕
    const initialButton = document.createElement('button');
    initialButton.className = 'btn btn-primary';
    initialButton.textContent = '初始狀態';
    initialButton.dataset.stage = '0';
    buttonContainer.appendChild(initialButton);
    
    // 添加每個硬幣的按鈕
    for (let i = 1; i < snapshots.length; i++) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary';
        button.textContent = `加入${snapshots[i].coin.label}`;
        button.dataset.stage = i.toString();
        buttonContainer.appendChild(button);
    }
    
    // 添加按鈕事件
    buttonContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // 更新按鈕狀態
            buttonContainer.querySelectorAll('button').forEach(btn => {
                btn.className = 'btn btn-outline-primary';
            });
            e.target.className = 'btn btn-primary';
            
            // 顯示對應階段
            const stage = parseInt(e.target.dataset.stage);
            showTableStage(stage);
        }
    });
}

// 顯示特定階段的表格
function showTableStage(stage) {
    const snapshots = window.dpTableSnapshots;
    const tableInfo = document.getElementById('table-stage-info');
    const tableDisplay = document.getElementById('table-display');
    const stepsExplanation = document.getElementById('steps-explanation');
    
    if (!snapshots || !tableInfo || !tableDisplay || !stepsExplanation) return;
    
    const snapshot = snapshots[stage];
    
    // 更新階段信息
    if (stage === 0) {
        tableInfo.innerHTML = `
            <h5>初始狀態</h5>
            <p>開始時，表格中只有 dp[0] = 0，表示湊出0元需要0個硬幣。其他金額都設為∞，表示暫時無法湊出。</p>
        `;
    } else {
        const coin = snapshot.coin;
        tableInfo.innerHTML = `
            <h5>加入硬幣${coin.label} (面額=${coin.value})</h5>
            <p>考慮使用面額為 ${coin.value} 的硬幣後，表格的變化。綠色標記表示找到了更好的解。</p>
        `;
    }
    
    // 創建並顯示當前階段表格
    createStageTable(tableDisplay, stage);
    
    // 更新步驟解說
    updateStepsExplanation(stepsExplanation, stage);
}

// 創建階段表格
function createStageTable(container, stage) {
    const snapshots = window.dpTableSnapshots;
    if (!snapshots || !container) return;
    
    container.innerHTML = '';
    
    const snapshot = snapshots[stage];
    const prevSnapshot = stage > 0 ? snapshots[stage - 1] : null;
    
    // 創建表格
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    table.style.textAlign = 'center';
    
    // 表頭 - 金額
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 添加金額列
    headerRow.innerHTML = '<th style="background-color:#f8f9fa;">金額 i</th>';
    
    for (let i = 0; i <= dpAmount; i++) {
        // 只顯示部分金額以節省空間
        if (i > 0 && i < dpAmount && i % 5 !== 0 && i !== 1) continue;
        
        const th = document.createElement('th');
        th.textContent = i;
        headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 表格主體 - dp值
    const tbody = document.createElement('tbody');
    
    // dp[i] 行
    const dpRow = document.createElement('tr');
    dpRow.innerHTML = '<th style="background-color:#f8f9fa;">dp[i]</th>';
    
    for (let i = 0; i <= dpAmount; i++) {
        // 只顯示部分金額以節省空間
        if (i > 0 && i < dpAmount && i % 5 !== 0 && i !== 1) continue;
        
        const cell = document.createElement('td');
        const value = snapshot.table[i];
        
        cell.textContent = value === Infinity ? '∞' : value;
        
        // 基礎情況 dp[0] = 0
        if (i === 0) {
            cell.style.backgroundColor = '#bbdefb'; // 藍色
            cell.style.fontWeight = 'bold';
        } 
        // 高亮變化的單元格
        else if (prevSnapshot && prevSnapshot.table[i] !== value) {
            cell.style.backgroundColor = '#a5d6a7'; // 綠色
            cell.style.fontWeight = 'bold';
        }
        
        dpRow.appendChild(cell);
    }
    
    tbody.appendChild(dpRow);
    
    // 如果不是初始狀態，添加選擇的硬幣行
    if (stage > 0) {
        const coinRow = document.createElement('tr');
        coinRow.innerHTML = '<th style="background-color:#f8f9fa;">使用硬幣</th>';
        
        for (let i = 0; i <= dpAmount; i++) {
            // 只顯示部分金額以節省空間
            if (i > 0 && i < dpAmount && i % 5 !== 0 && i !== 1) continue;
            
            const cell = document.createElement('td');
            
            if (i === 0) {
                cell.textContent = '-';
            } else if (snapshot.table[i] !== Infinity) {
                // 獲取選擇的硬幣
                const coinId = coinChoice[i];
                const coin = dpCoins.find(c => c.id === coinId);
                
                if (coin) {
                    cell.innerHTML = `<span style="color:${coin.color}">■</span> ${coin.label}`;
                    
                    // 高亮變化的單元格
                    if (prevSnapshot && prevSnapshot.table[i] !== snapshot.table[i]) {
                        cell.style.backgroundColor = '#a5d6a7'; // 綠色
                    }
                } else {
                    cell.textContent = '-';
                }
            } else {
                cell.textContent = '-';
            }
            
            coinRow.appendChild(cell);
        }
        
        tbody.appendChild(coinRow);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// 更新步驟解說
function updateStepsExplanation(container, stage) {
    const snapshots = window.dpTableSnapshots;
    if (!snapshots || !container) return;
    
    container.innerHTML = '';
    
    if (stage === 0) {
        // 初始狀態解說
        container.innerHTML = `
            <h6>初始狀態</h6>
            <ol>
                <li>設置 dp[0] = 0，表示湊出0元需要0個硬幣。</li>
                <li>其他所有金額 dp[1...${dpAmount}] 初始化為∞，表示暫時無法湊出。</li>
                <li>接下來，我們將逐一考慮每種硬幣，更新表格。</li>
            </ol>
            <p>動態規劃的基礎條件已設置完成，請點擊「加入」按鈕查看加入每種硬幣後的變化。</p>
        `;
        return;
    }
    
    const snapshot = snapshots[stage];
    const prevSnapshot = snapshots[stage - 1];
    const coin = snapshot.coin;
    
    // 尋找變化的金額
    const changedAmounts = [];
    for (let i = 1; i <= dpAmount; i++) {
        if (prevSnapshot.table[i] !== snapshot.table[i]) {
            changedAmounts.push(i);
        }
    }
    
    // 創建解說
    let explanationHtml = `
        <h6>加入硬幣${coin.label} (面額=${coin.value})的處理過程</h6>
        <p>對於每個金額 i，我們考慮是否使用硬幣${coin.label}，計算 dp[i] = min(dp[i], dp[i-${coin.value}] + 1)</p>
    `;
    
    if (changedAmounts.length === 0) {
        explanationHtml += `
            <div class="alert alert-warning">
                <p>沒有任何金額的最優解發生變化。這意味著使用已有的硬幣組合已經是最優解，無需使用${coin.label}。</p>
            </div>
        `;
    } else {
        explanationHtml += `<p>有 <strong>${changedAmounts.length}</strong> 個金額的最優解發生了變化：</p><ul>`;
        
        // 只顯示前5個變化，避免過多
        const displayAmounts = changedAmounts.slice(0, 5);
        displayAmounts.forEach(amount => {
            const oldValue = prevSnapshot.table[amount];
            const newValue = snapshot.table[amount];
            const subproblemAmount = amount - coin.value;
            const subproblemValue = snapshot.table[subproblemAmount];
            
            explanationHtml += `
                <li>
                    <strong>金額 ${amount}</strong>：
                    <ul>
                        <li>原本需要 ${oldValue === Infinity ? '∞' : oldValue} 個硬幣</li>
                        <li>使用${coin.label}後：dp[${subproblemAmount}] + 1 = ${subproblemValue} + 1 = ${newValue}</li>
                        <li>選擇較小值，更新 dp[${amount}] = ${newValue}</li>
                    </ul>
                </li>
            `;
        });
        
        if (changedAmounts.length > 5) {
            explanationHtml += `<li>...以及其他 ${changedAmounts.length - 5} 個金額</li>`;
        }
        
        explanationHtml += `</ul>`;
    }
    
    // 添加總結
    explanationHtml += `
        <div class="mt-3 p-2 bg-light border rounded">
            <p><strong>小結</strong>：加入硬幣${coin.label}後，我們可以更好地湊出某些金額。動態規劃通過解決子問題並記錄結果，逐步構建最優解。</p>
        </div>
    `;
    
    container.innerHTML = explanationHtml;
}
