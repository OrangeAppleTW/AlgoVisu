// ----- 動態規劃解決硬幣找零問題 - 算法邏輯 -----

// 計算特定金額的最優硬幣組合
function calculateCoinCombination(amount) {
    if (amount === 0) return {};
    
    // 如果這個金額已經有記錄，直接返回
    if (currentCoinUsage[amount]) return currentCoinUsage[amount];
    
    const usedCoins = {};
    let remainingAmount = amount;
    
    // 回溯找出使用的硬幣
    while (remainingAmount > 0) {
        const coinId = coinChoice[remainingAmount];
        if (coinId === -1 || coinId === undefined) break; // 無解
        
        const coin = dpCoins.find(c => c.id === coinId);
        if (!coin) break; // 安全檢查
        
        usedCoins[coinId] = (usedCoins[coinId] || 0) + 1;
        remainingAmount -= coin.value;
    }
    
    return usedCoins;
}

async function startDpAlgorithm() {
    if (dpRunning && dpPaused) {
        dpPaused = false;
        continueDpAnimation();
        return;
    }
    
    if (dpRunning) return;
    
    dpRunning = true;
    dpPaused = false;
    disableButtons('dp', true);
    
    // 重置硬幣使用情況
    dpCoins.forEach(coin => {
        coin.count = 0;
    });
    renderProblem();
    
    // 初始化硬幣使用情況記錄
    currentCoinUsage = Array(dpAmount + 1).fill().map(() => ({}));
    
    // 準備動畫步驟
    dpAnimationSteps = [];
    currentDpStep = 0;
    
    const statusText = document.getElementById('dp-status');
    const structureView = document.getElementById('dp-structure');
    
    statusText.textContent = '正在執行動態規劃算法...';
    structureView.textContent = `開始使用動態規劃算法解決硬幣找零問題\n目標金額: ${dpAmount}\n`;
    
    // Step 1: 初始化動態規劃表格
    dpAnimationSteps.push({
        type: 'message',
        message: '步驟1: 初始化動態規劃表格',
        progress: 5
    });
    
    // 創建動態規劃表格和選擇記錄
    dpTable = Array(dpAmount + 1).fill(Infinity);
    coinChoice = Array(dpAmount + 1).fill(-1);
    
    // 湊出0元需要0個硬幣
    dpTable[0] = 0;
    
    dpAnimationSteps.push({
        type: 'initTable',
        message: '創建大小為(amount+1)的表格，初始值為無窮大，表示無法湊出\ndp[0] = 0 表示湊出0元需要0個硬幣',
        table: [...dpTable],
        choice: [...coinChoice],
        progress: 10
    });
    
    // Step 2: 填充表格
    dpAnimationSteps.push({
        type: 'message',
        message: '步驟2: 填充動態規劃表格 - 注意我們不需要事先將硬幣排序',
        progress: 15
    });
    
    // 計算總步驟數用於進度計算
    const totalSteps = dpCoins.reduce((sum, coin) => sum + Math.max(0, dpAmount - coin.value + 1), 0);
    let currentStep = 0;
    let progressBase = 15; // 初始進度15%
    
    // 不對硬幣進行排序，用來展示DP不需要排序也能得到正確答案
    const dpTableSnapshots = []; // 存儲每次處理完一種硬幣後的表格快照
    dpTableSnapshots.push({
        table: [...dpTable],
        choice: [...coinChoice],
        message: "初始狀態: 只有dp[0] = 0，其他都是無窮大(∞)"
    });
    
    // 對每種面額的硬幣
    for (const coin of dpCoins) {
        dpAnimationSteps.push({
            type: 'considerCoin',
            coin: coin,
            message: `考慮硬幣 ${coin.label}（面額=${coin.value}）`,
            progress: progressBase + Math.floor((currentStep / totalSteps) * 65) // 填表佔65%的進度(15%-80%)
        });
        
        // 創建當前硬幣處理前的表格狀態快照
        const beforeTable = [...dpTable];
        
        // 對每個金額進行計算
        for (let amount = coin.value; amount <= dpAmount; amount++) {
            currentStep++;
            
            // 使用當前硬幣的方案：當前金額減去硬幣面額後的最優解 + 1
            const usingCoin = dpTable[amount - coin.value] + 1;
            
            // 當前值保存下來用於比較
            const currentValue = dpTable[amount];
            
            dpAnimationSteps.push({
                type: 'compareOptions',
                amount: amount,
                currentValue: currentValue,
                usingCoin: usingCoin,
                coin: coin,
                message: `對於金額 ${amount}，比較：\n不使用${coin.label}：${currentValue === Infinity ? '無法湊出' : currentValue + '個硬幣'}\n使用${coin.label}：${dpTable[amount - coin.value] === Infinity ? '無法湊出' : dpTable[amount - coin.value] + ' + 1 = ' + usingCoin + '個硬幣'}`,
                progress: progressBase + Math.floor((currentStep / totalSteps) * 65)
            });
            
            // 如果使用當前硬幣可以得到更好的解
            if (usingCoin < currentValue) {
                dpTable[amount] = usingCoin;
                coinChoice[amount] = coin.id;
                
                // 計算並更新這個金額的硬幣組合
                const prevCombination = calculateCoinCombination(amount - coin.value);
                currentCoinUsage[amount] = {...prevCombination};
                currentCoinUsage[amount][coin.id] = (currentCoinUsage[amount][coin.id] || 0) + 1;
                
                dpAnimationSteps.push({
                    type: 'updateCell',
                    amount: amount,
                    prevValue: currentValue,
                    newValue: usingCoin,
                    coin: coin,
                    coinUsage: {...currentCoinUsage[amount]},
                    message: `更新 dp[${amount}] = ${usingCoin}，選擇硬幣 ${coin.label}`,
                    progress: progressBase + Math.floor((currentStep / totalSteps) * 65)
                });
            }
        }
        
        // 添加處理完這種硬幣後的表格快照
        dpTableSnapshots.push({
            table: [...dpTable],
            choice: [...coinChoice],
            coin: coin,
            message: `加入硬幣 ${coin.label} (面額=${coin.value}) 後的表格狀態`
        });
        
        // 顯示這個硬幣處理後的表格變化
        dpAnimationSteps.push({
            type: 'showTableSnapshot',
            coin: coin,
            beforeTable: beforeTable,
            afterTable: [...dpTable],
            message: `完成硬幣 ${coin.label} (面額=${coin.value}) 的處理`,
            progress: progressBase + Math.floor((currentStep / totalSteps) * 65)
        });
    }
    
    // 保存所有表格快照供後續視覺化使用
    window.dpTableSnapshots = dpTableSnapshots;
    
    // 顯示最終結果
    dpAnimationSteps.push({
        type: 'tableFilled',
        message: `填充完畢，dp[${dpAmount}] = ${dpTable[dpAmount]}，表示湊出 ${dpAmount} 元最少需要 ${dpTable[dpAmount]} 個硬幣`,
        table: [...dpTable],
        choice: [...coinChoice],
        coinUsage: currentCoinUsage,
        progress: 80
    });
    
    // Step 3: 回溯找出使用的硬幣
    dpAnimationSteps.push({
        type: 'message',
        message: '步驟3: 回溯找出選擇的硬幣',
        progress: 85
    });
    
    // 檢查是否有解
    if (dpTable[dpAmount] === Infinity) {
        dpAnimationSteps.push({
            type: 'complete',
            message: `無法湊出目標金額 ${dpAmount}`,
            success: false,
            progress: 100
        });
    } else {
        let remainingAmount = dpAmount;
        const usedCoins = {};
        const totalSteps = dpTable[dpAmount]; // 總硬幣數作為步驟數
        let trackStep = 0;
        
        while (remainingAmount > 0) {
            trackStep++;
            const coinId = coinChoice[remainingAmount];
            const coin = dpCoins.find(c => c.id === coinId);
            
            if (!coin) break; // 安全檢查
            
            usedCoins[coinId] = (usedCoins[coinId] || 0) + 1;
            
            const trackProgress = 85 + Math.floor((trackStep / totalSteps) * 15); // 回溯佔15%進度(85%-100%)
            
            dpAnimationSteps.push({
                type: 'selectCoin',
                coin: coin,
                amount: remainingAmount,
                newAmount: remainingAmount - coin.value,
                count: usedCoins[coinId],
                message: `選擇硬幣 ${coin.label} 用於湊出金額 ${remainingAmount}，還剩 ${remainingAmount - coin.value} 元`,
                progress: trackProgress
            });
            
            remainingAmount -= coin.value;
        }
        
        // 設置硬幣使用次數
        dpCoins.forEach(coin => {
            coin.count = usedCoins[coin.id] || 0;
        });
        
        const totalCoins = Object.values(usedCoins).reduce((sum, count) => sum + count, 0);
        
        dpAnimationSteps.push({
            type: 'complete',
            message: `動態規劃算法完成！湊出 ${dpAmount} 元最少需要 ${totalCoins} 個硬幣`,
            success: true,
            usedCoins: Object.entries(usedCoins).map(([id, count]) => {
                const coin = dpCoins.find(c => c.id === parseInt(id));
                return { ...coin, count };
            }),
            progress: 100
        });
    }
    
    // 開始動畫
    await playDpAnimation();
}

async function playDpAnimation() {
    const speedSlider = document.getElementById('dp-speed');
    const statusText = document.getElementById('dp-status');
    const structureView = document.getElementById('dp-structure');
    
    if (currentDpStep >= dpAnimationSteps.length) {
        dpRunning = false;
        disableButtons('dp', false);
        statusText.textContent = '算法執行完成！';
        
        // 隱藏原始的畫面元素，只顯示視覺化區域
        document.getElementById('dp-container').style.display = 'none';
        document.getElementById('dp-table-container').style.display = 'none';
        document.getElementById('dp-structure').style.display = 'none';
        document.getElementById('dp-status').style.display = 'none';
        document.querySelectorAll('.form-group, .btn-group').forEach(el => {
            el.style.display = 'none';
        });
        
        // 為視覺化區域增加標題
        const visualTitle = document.createElement('h3');
        visualTitle.className = 'text-center my-4';
        visualTitle.textContent = '動態規劃解決硬幣找零問題';
        document.querySelector('.container').insertBefore(visualTitle, document.getElementById('dp-visualization-section'));
        
        document.getElementById('dp-visualization-section').style.marginTop = '30px';
        document.getElementById('dp-visualization-section').querySelector('.card-header').style.display = 'none';
        
        // 算法完成後調用視覺化函數
        setTimeout(() => {
            // 檢查是否存在視覺化容器
            const vizSection = document.getElementById('dp-visualization-section');
            if (!vizSection) {
                // 創建視覺化區域
                const mainContainer = document.querySelector('.container') || document.body;
                
                const section = document.createElement('div');
                section.id = 'dp-visualization-section';
                section.className = 'row mt-4';
                section.innerHTML = `
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0">動態規劃視覺化</h5>
                            </div>
                            <div class="card-body">
                                <ul class="nav nav-tabs" id="dp-viz-tabs" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active" id="stages-tab" data-toggle="tab" href="#dp-stages-container" role="tab">表格填充階段</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="state-tab" data-toggle="tab" href="#state-graph" role="tab">狀態轉移圖</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="table-tab" data-toggle="tab" href="#dp-animation-container" role="tab">填表動畫</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="tree-tab" data-toggle="tab" href="#dp-decision-tree" role="tab">決策樹</a>
                                    </li>
                                </ul>
                                <div class="tab-content mt-3">
                                    <div class="tab-pane fade show active" id="dp-stages-container" role="tabpanel">
                                        <div class="text-center mb-3">
                                            <h4>動態規劃表格填充階段</h4>
                                            <p>展示不同硬幣加入後，DP表格的變化</p>
                                            <div id="snapshot-controls" class="btn-group my-3">
                                                <!-- JavaScript 將在此處添加按鈕 -->
                                            </div>
                                            <div id="snapshot-display" class="mt-3">
                                                <!-- JavaScript 將在此處顯示表格快照 -->
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="state-graph" role="tabpanel"></div>
                                    <div class="tab-pane fade" id="dp-animation-container" role="tabpanel"></div>
                                    <div class="tab-pane fade" id="dp-decision-tree" role="tabpanel"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                mainContainer.appendChild(section);
                
                // 手動處理tab切換，因為可能沒有Bootstrap JS
                const tabs = section.querySelectorAll('.nav-link');
                const panes = section.querySelectorAll('.tab-pane');
                
                tabs.forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        e.preventDefault();
                        // 移除所有 active 類別
                        tabs.forEach(t => t.classList.remove('active'));
                        panes.forEach(p => {
                            p.classList.remove('show');
                            p.classList.remove('active');
                        });
                        
                        // 添加 active 到當前選擇的 tab
                        tab.classList.add('active');
                        
                        // 激活對應的內容區
                        const target = document.querySelector(tab.getAttribute('href'));
                        if (target) {
                            target.classList.add('show');
                            target.classList.add('active');
                        }
                    });
                });
            }
            
            // 初始化視覺化
            initVisualization();
            
            // 創建表格快照控制
            createTableSnapshotControls();
        }, 500);
        
        return;
    }
    
    if (dpPaused) {
        return;
    }
    
    const speed = 101 - speedSlider.value;
    const step = dpAnimationSteps[currentDpStep];
    
    // 更新進度條
    if (step.progress !== undefined) {
        updateDpProgress(step.progress);
    }
    
    // 更新狀態文本
    if (step.message) {
        statusText.textContent = step.message.split('\n')[0]; // 只顯示第一行
    }
    
    // 執行動畫步驟
    switch (step.type) {
        case 'message':
            structureView.textContent += `\n\n${step.message}`;
            break;
            
        case 'initTable':
            structureView.textContent += `\n${step.message}`;
            renderDpTable();
            break;
            
        case 'considerCoin':
            highlightCoin(step.coin.id, 'considering');
            structureView.textContent += `\n\n${step.message}`;
            break;
            
        case 'compareOptions':
            structureView.textContent += `\n${step.message}`;
            renderDpTable({ amount: step.amount });
            break;
            
        case 'updateCell':
            structureView.textContent += `\n${step.message}`;
            // 加入前值和新值用於動畫效果
            renderDpTable({ 
                amount: step.amount, 
                row: 'coin', 
                coinId: step.coin.id 
            }, step.prevValue, step.newValue);
            break;
            
        case 'showTableSnapshot':
            structureView.textContent += `\n\n${step.message}`;
            // 這裡只顯示訊息，實際的表格快照將在視覺化部分顯示
            break;
            
        case 'tableFilled':
            structureView.textContent += `\n\n${step.message}`;
            renderDpTable();
            break;
            
        case 'selectCoin':
            highlightCoin(step.coin.id, 'selected');
            structureView.textContent += `\n${step.message}`;
            updateCoinUsage(step.coin.id, step.count);
            updateCurrentAmount(dpAmount - step.newAmount);
            
            // 淡入淡出金額變化動畫
            animateAmountChange(dpAmount - step.amount, dpAmount - step.newAmount);
            
            // 短暫顯示後恢復正常狀態
            setTimeout(() => {
                highlightCoin(step.coin.id, 'normal');
            }, speed * 30);
            break;
            
        case 'complete':
            if (step.success) {
                structureView.textContent += `\n\n${step.message}`;
                structureView.textContent += `\n\n使用的硬幣：`;
                step.usedCoins.forEach(coin => {
                    if (coin.count > 0) {
                        structureView.textContent += `\n${coin.label}: ${coin.count} 個`;
                    }
                });
                
                // 成功完成的動畫
                const coinElements = document.querySelectorAll('[id^="dp-coin-"]');
                coinElements.forEach(coin => {
                    const coinId = parseInt(coin.id.replace('dp-coin-', ''));
                    const usedCoin = step.usedCoins.find(c => c.id === coinId);
                    if (usedCoin && usedCoin.count > 0) {
                        // 使用過的硬幣增加亮度
                        coin.setAttribute('filter', 'brightness(1.2)');
                    }
                });
            } else {
                structureView.textContent += `\n\n${step.message}`;
            }
            break;
    }
    
    // 滾動到視圖底部
    structureView.scrollTop = structureView.scrollHeight;
    
    // 移動到下一步
    currentDpStep++;
    
    // 暫停一段時間
    await sleep(speed * 50);
    
    // 繼續動畫
    await playDpAnimation();
}

// 金額變化動畫
function animateAmountChange(oldAmount, newAmount) {
    const amountElement = document.getElementById('dp-current-amount');
    if (!amountElement) return;
    
    // 使用CSS動畫
    amountElement.style.transition = 'all 0.5s ease';
    amountElement.style.transform = 'scale(1.2)';
    amountElement.style.color = '#27ae60';
    
    // 設置新值
    amountElement.textContent = newAmount;
    
    // 恢復樣式
    setTimeout(() => {
        amountElement.style.transform = 'scale(1)';
        amountElement.style.color = '#2c3e50';
    }, 500);
}

// 創建表格快照控制
function createTableSnapshotControls() {
    const snapshots = window.dpTableSnapshots;
    if (!snapshots || snapshots.length === 0) return;
    
    const controlsContainer = document.getElementById('snapshot-controls');
    const displayContainer = document.getElementById('snapshot-display');
    
    if (!controlsContainer || !displayContainer) return;
    
    // 清空容器
    controlsContainer.innerHTML = '';
    
    // 為每個快照添加按鈕
    snapshots.forEach((snapshot, index) => {
        const button = document.createElement('button');
        button.className = 'btn ' + (index === 0 ? 'btn-primary' : 'btn-outline-primary');
        button.textContent = index === 0 ? '初始狀態' : `步驟 ${index}: ${snapshot.coin?.label || ''}`;
        button.addEventListener('click', () => {
            // 更改按鈕樣式
            controlsContainer.querySelectorAll('.btn').forEach(btn => {
                btn.className = 'btn btn-outline-primary';
            });
            button.className = 'btn btn-primary';
            
            // 顯示對應的快照
            displaySnapshotTable(snapshot, index);
        });
        
        controlsContainer.appendChild(button);
    });
    
    // 預設顯示第一個快照
    displaySnapshotTable(snapshots[0], 0);
    
    function displaySnapshotTable(snapshot, index) {
        displayContainer.innerHTML = '';
        
        // 創建標題
        const title = document.createElement('h5');
        title.className = 'text-center mb-3';
        title.textContent = snapshot.message;
        displayContainer.appendChild(title);
        
        // 顯示表格
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.style.margin = '0 auto';
        table.style.maxWidth = '90%';
        table.style.textAlign = 'center';
        
        // 表頭
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // 添加金額列標題
        for (let i = 0; i <= dpAmount; i++) {
            if (dpAmount > 25 && i > 0 && i < dpAmount && i % Math.ceil(dpAmount / 25) !== 0) {
                continue;
            }
            
            const th = document.createElement('th');
            th.textContent = i;
            if (i === 0) {
                th.style.backgroundColor = '#e3f2fd';
            }
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 表格主體
        const tbody = document.createElement('tbody');
        
        // 添加最少硬幣數行
        const row = document.createElement('tr');
        
        // 填充每個金額的最少硬幣數
        for (let i = 0; i <= dpAmount; i++) {
            if (dpAmount > 25 && i > 0 && i < dpAmount && i % Math.ceil(dpAmount / 25) !== 0) {
                continue;
            }
            
            const cell = document.createElement('td');
            const value = snapshot.table[i];
            cell.textContent = value === Infinity ? '∞' : value;
            
            // 如果是非初始快照，高亮顯示與前一個快照相比有變化的單元格
            if (index > 0 && snapshots[index - 1].table[i] !== value) {
                cell.style.backgroundColor = '#a5d6a7';
                cell.style.fontWeight = 'bold';
            }
            
            // 特殊標記 dp[0] = 0
            if (i === 0) {
                cell.style.backgroundColor = '#e3f2fd';
                cell.style.fontWeight = 'bold';
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
        table.appendChild(tbody);
        
        // 添加說明
        if (index > 0) {
            const description = document.createElement('div');
            description.className = 'alert alert-info mt-3';
            description.innerHTML = `
                <p><strong>說明:</strong> 加入硬幣 ${snapshot.coin.label} (面額=${snapshot.coin.value}) 後，
                所有能夠被該硬幣優化的金額都被更新了。綠色背景的單元格表示有所變化。</p>
                <p>如果某個金額 i 已有一個最優解，且 i - ${snapshot.coin.value} 也有解，則可以考慮使用這枚硬幣來獲得更優的解。</p>
                <p>注意：硬幣並<strong>不需要</strong>按照面額排序。DP算法會找到最優解，無論硬幣以什麼順序處理。</p>
            `;
            displayContainer.appendChild(description);
        } else {
            const description = document.createElement('div');
            description.className = 'alert alert-info mt-3';
            description.innerHTML = `
                <p><strong>初始狀態:</strong> 表格中只有 dp[0] = 0 (表示湊出0元需要0個硬幣)，其餘都設為無窮大(∞)表示暫時無法湊出。</p>
                <p>點擊上方按鈕查看加入每種硬幣後，表格的變化情況。</p>
            `;
            displayContainer.appendChild(description);
        }
        
        displayContainer.appendChild(table);
    }
}

function continueDpAnimation() {
    disableButtons('dp', true);
    playDpAnimation();
}
