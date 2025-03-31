// ----- 貪婪算法解決硬幣找零問題 -----
let greedyCoins = [];
let greedyAmount = 0;
let greedyRunning = false;
let greedyPaused = false;
let greedyAnimationSteps = [];
let currentGreedyStep = 0;

function initGreedyCoins() {
    const container = document.getElementById('greedy-container');
    const generateBtn = document.getElementById('greedy-generate');
    const startBtn = document.getElementById('greedy-start');
    const pauseBtn = document.getElementById('greedy-pause');
    const resetBtn = document.getElementById('greedy-reset');
    const speedSlider = document.getElementById('greedy-speed');
    const structureView = document.getElementById('greedy-structure');
    const statusText = document.getElementById('greedy-status');
    
    generateBtn.addEventListener('click', generateProblem);
    startBtn.addEventListener('click', startGreedyAlgorithm);
    pauseBtn.addEventListener('click', pauseGreedyAlgorithm);
    resetBtn.addEventListener('click', resetGreedyAlgorithm);
    
    // 設置畫布尺寸
    const width = container.clientWidth;
    const height = 300;
    
    function generateProblem() {
        resetGreedyAlgorithm();
        
        // 生成隨機錢額，範圍在 80-110 之間
        greedyAmount = Math.floor(Math.random() * 31) + 80;
        
        // 生成 5 種不同面額的硬幣，範圍在 1-50 之間
        // 確保至少有一種面額為 1，以便可以湊出任意金額
        const usedValues = new Set([1]);  // 確保有面額 1
        const coinValues = [1];  // 先加入面額 1
        
        // 生成其他 4 種不重複的面額
        while(coinValues.length < 5) {
            const value = Math.floor(Math.random() * 50) + 1;
            if (!usedValues.has(value)) {
                usedValues.add(value);
                coinValues.push(value);
            }
        }
        
        // 按面額升序排序
        coinValues.sort((a, b) => a - b);
        
        // 創建硬幣對象
        greedyCoins = [];
        
        // 為每種面額創建硬幣對象，並指定不同的顏色
        const colors = ['#A67D3D', '#B87333', '#CD7F32', '#C0C0C0', '#FFD700'];  // 從小到大面額對應的顏色
        
        coinValues.forEach((value, index) => {
            greedyCoins.push({
                id: index + 1,
                value: value,
                color: colors[index],
                label: '$' + value
            });
        });
        
        renderProblem();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        statusText.textContent = '硬幣問題已生成，點擊「開始求解」按鈕開始';
        structureView.textContent = `目標：湊出 ${greedyAmount} 元\n\n可用硬幣：\n`;
        
        // 顯示硬幣數據
        greedyCoins.forEach(coin => {
            structureView.textContent += `${coin.label}：面額 = ${coin.value}\n`;
        });
    }
    
    function renderProblem(itemsToRender = greedyCoins) {
        // 清空容器
        container.innerHTML = '';
        
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
        
        const coinsInfo = itemsToRender.map(coin => coin.label).join(', ');
        titleText.textContent = `目標金額: ${greedyAmount} 元 | 可用硬幣: ${coinsInfo}`;
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
        targetBox.setAttribute('id', 'target-box');
        svg.appendChild(targetBox);
        
        // 繪製目標金額標籤
        const targetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        targetLabel.setAttribute('x', targetBoxX + targetBoxWidth / 2);
        targetLabel.setAttribute('y', targetBoxY - 10);
        targetLabel.setAttribute('text-anchor', 'middle');
        targetLabel.setAttribute('fill', '#3498db');
        targetLabel.setAttribute('font-weight', 'bold');
        targetLabel.textContent = `目標金額: ${greedyAmount}`;
        svg.appendChild(targetLabel);
        
        // 在目標金額框中央顯示當前金額
        const currentAmount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        currentAmount.setAttribute('x', targetBoxX + targetBoxWidth / 2);
        currentAmount.setAttribute('y', targetBoxY + targetBoxHeight / 2);
        currentAmount.setAttribute('text-anchor', 'middle');
        currentAmount.setAttribute('fill', '#2c3e50');
        currentAmount.setAttribute('font-size', '24px');
        currentAmount.setAttribute('font-weight', 'bold');
        currentAmount.setAttribute('id', 'current-amount');
        currentAmount.textContent = '0';
        svg.appendChild(currentAmount);
        
        // 繪製硬幣
        const coinSize = Math.min(width / (itemsToRender.length * 2), 60);
        const coinSpacing = Math.min((width / 2 - 30) / itemsToRender.length, 100);
        
        itemsToRender.forEach((coin, index) => {
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
            coinCircle.setAttribute('id', `coin-${coin.id}`);
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
            usageLabel.setAttribute('id', `usage-${coin.id}`);
            usageLabel.textContent = `× ${usageCount}`;
            svg.appendChild(usageLabel);
        });
        
        // 繪製目標金額內容填充
        updateKnapsackFill(0);
    }
    
    function updateKnapsackFill(usedCapacity) {
        const knapsack = document.getElementById('target-box');
        if (!knapsack) return;
        
        const knapsackX = parseFloat(knapsack.getAttribute('x'));
        const knapsackY = parseFloat(knapsack.getAttribute('y'));
        const knapsackWidth = parseFloat(knapsack.getAttribute('width'));
        const knapsackHeight = parseFloat(knapsack.getAttribute('height'));
        
        // 移除舊的填充
        const oldFill = document.getElementById('knapsack-fill');
        if (oldFill) oldFill.remove();
        
        // 創建新的填充
        const fillHeight = Math.min((usedCapacity / greedyAmount) * knapsackHeight, knapsackHeight);
        const fillY = knapsackY + knapsackHeight - fillHeight;
        
        if (fillHeight > 0) {
            const knapsackFill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            knapsackFill.setAttribute('x', knapsackX);
            knapsackFill.setAttribute('y', fillY);
            knapsackFill.setAttribute('width', knapsackWidth);
            knapsackFill.setAttribute('height', fillHeight);
            knapsackFill.setAttribute('fill', '#3498db');
            knapsackFill.setAttribute('fill-opacity', '0.3');
            knapsackFill.setAttribute('id', 'knapsack-fill');
            
            // 確保填充在背包下方
            const svg = document.querySelector('#greedy-container svg');
            const knapsackElement = document.getElementById('target-box');
            svg.insertBefore(knapsackFill, knapsackElement);
        }
        
        // 更新背包容量標籤
        const usedCapacityLabel = document.getElementById('used-capacity');
        if (usedCapacityLabel) {
            usedCapacityLabel.textContent = `已湊出: ${usedCapacity}/${greedyAmount}`;
        } else {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', knapsackX + knapsackWidth / 2);
            label.setAttribute('y', knapsackY + knapsackHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#3498db');
            label.setAttribute('id', 'used-capacity');
            label.textContent = `已湊出: ${usedCapacity}/${greedyAmount}`;
            
            const svg = document.querySelector('#greedy-container svg');
            svg.appendChild(label);
        }
    }
    
    async function startGreedyAlgorithm() {
        if (greedyRunning && greedyPaused) {
            greedyPaused = false;
            continueGreedyAnimation();
            return;
        }
        
        if (greedyRunning) return;
        
        greedyRunning = true;
        greedyPaused = false;
        disableButtons('greedy', true);
        
        // 重置硬幣使用情況
        greedyCoins.forEach(coin => {
            coin.count = 0;
        });
        renderProblem();
        
        // 準備動畫步驟
        greedyAnimationSteps = [];
        currentGreedyStep = 0;
        
        statusText.textContent = '正在執行貪婪算法...';
        structureView.textContent = `開始使用貪婪算法解決硬幣找零問題\n目標金額: ${greedyAmount}\n`;
        
        // 第一步：對硬幣按面額排序（從大到小）
        greedyAnimationSteps.push({
            type: 'message',
            message: `步驟1: 將硬幣按面額從大到小排序`
        });
        
        // 複製並排序硬幣
        const sortedCoins = [...greedyCoins].sort((a, b) => b.value - a.value);
        
        greedyAnimationSteps.push({
            type: 'sort',
            sortedCoins: [...sortedCoins],
            message: `排序後的硬幣：\n${sortedCoins.map(coin => `${coin.label}（面額=${coin.value}）`).join('\n')}`
        });
        
        // 第二步：貪婪選擇硬幣
        greedyAnimationSteps.push({
            type: 'message',
            message: `步驟2: 從最大面額的硬幣開始，盡可能多地使用每種硬幣`
        });
        
        let remainingAmount = greedyAmount;
        let currentAmount = 0;
        const usedCoins = [];
        
        for (const coin of sortedCoins) {
            // 考慮該硬幣
            greedyAnimationSteps.push({
                type: 'considerCoin',
                coin: coin,
                message: `考慮硬幣 ${coin.label}（面額=${coin.value}）`,
                remainingAmount,
                currentAmount
            });
            
            if (coin.value <= remainingAmount) {
                // 計算可以使用多少個該面額的硬幣
                const count = Math.floor(remainingAmount / coin.value);
                const valueAdded = count * coin.value;
                
                coin.count = count;
                currentAmount += valueAdded;
                remainingAmount -= valueAdded;
                
                usedCoins.push({ ...coin });
                
                greedyAnimationSteps.push({
                    type: 'selectCoin',
                    coin: coin,
                    count: count,
                    message: `選擇 ${count} 個 ${coin.label} 硬幣，共 ${valueAdded} 元`,
                    remainingAmount,
                    currentAmount
                });
            } else {
                // 硬幣面額太大，無法使用
                greedyAnimationSteps.push({
                    type: 'skipCoin',
                    coin: coin,
                    message: `跳過硬幣 ${coin.label} - 面額太大（${coin.value} > ${remainingAmount}）`,
                    remainingAmount,
                    currentAmount
                });
            }
            
            // 如果已經湊齊，就結束循環
            if (remainingAmount === 0) {
                break;
            }
        }
        
        // 檢查是否成功湊齊金額
        const success = remainingAmount === 0;
        
        // 完成
        greedyAnimationSteps.push({
            type: 'complete',
            message: success
                ? `貪婪算法完成！成功湊出 ${greedyAmount} 元，使用了 ${usedCoins.reduce((sum, coin) => sum + coin.count, 0)} 個硬幣`
                : `貪婪算法無法湊出確切的金額，還差 ${remainingAmount} 元`,
            success,
            remainingAmount,
            currentAmount,
            usedCoins
        });
        
        // 開始動畫
        await playGreedyAnimation();
    }
    
    async function playGreedyAnimation() {
        if (currentGreedyStep >= greedyAnimationSteps.length) {
            greedyRunning = false;
            disableButtons('greedy', false);
            statusText.textContent = '算法執行完成！';
            return;
        }
        
        if (greedyPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = greedyAnimationSteps[currentGreedyStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message.split('\n')[0]; // 只顯示第一行
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'message':
                structureView.textContent += `\n\n${step.message}`;
                break;
                
            case 'sort':
                // 根據排序後的硬幣重新渲染
                renderProblem(step.sortedCoins);
                structureView.textContent += `\n\n${step.message}`;
                break;
                
            case 'considerCoin':
                highlightCoin(step.coin.id, 'considering');
                structureView.textContent += `\n\n${step.message}`;
                structureView.textContent += `\n目前已湊出: ${step.currentAmount}，還需湊出: ${step.remainingAmount}`;
                break;
                
            case 'selectCoin':
                highlightCoin(step.coin.id, 'selected');
                updateCoinUsage(step.coin.id, step.count);
                updateCurrentAmount(step.currentAmount);
                structureView.textContent += `\n${step.message}`;
                structureView.textContent += `\n目前已湊出: ${step.currentAmount}，還需湊出: ${step.remainingAmount}`;
                updateKnapsackFill(step.currentAmount);
                
                // 短暫顯示後恢復正常狀態
                setTimeout(() => {
                    highlightCoin(step.coin.id, 'normal');
                }, speed * 30);
                break;
                
            case 'skipCoin':
                structureView.textContent += `\n${step.message}`;
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
                } else {
                    structureView.textContent += `\n\n${step.message}`;
                }
                updateCurrentAmount(step.currentAmount);
                updateKnapsackFill(step.currentAmount);
                break;
        }
        
        // 滾動到視圖底部
        structureView.scrollTop = structureView.scrollHeight;
        
        // 移動到下一步
        currentGreedyStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 繼續動畫
        await playGreedyAnimation();
    }
    
    function updateCurrentAmount(amount) {
        const currentAmountElement = document.getElementById('current-amount');
        if (currentAmountElement) {
            currentAmountElement.textContent = amount;
        }
    }
    
    function updateCoinUsage(coinId, count) {
        const usageLabel = document.getElementById(`usage-${coinId}`);
        if (usageLabel) {
            usageLabel.textContent = `× ${count}`;
        }
    }
    
    function highlightCoin(coinId, type) {
        const coin = document.getElementById(`coin-${coinId}`);
        if (!coin) return;
        
        // 保存原始顏色
        const originalColor = greedyCoins.find(c => c.id === coinId).color;
        
        if (type === 'considering') {
            coin.setAttribute('stroke', '#f39c12');
            coin.setAttribute('stroke-width', '3');
        } else if (type === 'selected') {
            // 嘗試增加亮度或飽和度
            coin.setAttribute('stroke', '#2ecc71');
            coin.setAttribute('stroke-width', '3');
        } else if (type === 'normal') {
            coin.setAttribute('stroke', '#2c3e50');
            coin.setAttribute('stroke-width', '1');
        }
    }
    
    function continueGreedyAnimation() {
        disableButtons('greedy', true);
        playGreedyAnimation();
    }
    
    function pauseGreedyAlgorithm() {
        greedyPaused = true;
        disableButtons('greedy', false);
    }
    
    function resetGreedyAlgorithm() {
        if (greedyRunning) {
            greedyPaused = true;
            greedyRunning = false;
        }
        
        currentGreedyStep = 0;
        greedyAnimationSteps = [];
        
        // 重置硬幣使用情況
        greedyCoins.forEach(coin => {
            coin.count = 0;
        });
        
        if (greedyCoins.length > 0) {
            renderProblem();
            updateCurrentAmount(0);
        }
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成問題」按鈕開始';
        
        disableButtons('greedy', false, true);
        document.getElementById('greedy-start').disabled = true;
        document.getElementById('greedy-reset').disabled = true;
    }
}

// 頁面加載時初始化貪婪找零算法
document.addEventListener('DOMContentLoaded', () => {
    initGreedyCoins();
});