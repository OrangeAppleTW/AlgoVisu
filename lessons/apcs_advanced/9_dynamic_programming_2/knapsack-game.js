// 背包問題遊戲邏輯 - 新版本（決策模式）

class KnapsackGame {
    constructor() {
        this.currentStep = -1; // -1 表示遊戲尚未開始
        this.isGameActive = false;
        this.totalSteps = KnapsackData.GAME_STEPS.length;
        this.selectedItems = new Set(); // 當前選中的物品ID
        this.currentDecision = null; // 'take', 'not-take', null
        
        this.init();
    }
    
    init() {
        this.createDPTable();
        this.createItemsList();
        this.bindEvents();
        this.updateUI();
        this.initializeDecisionArea();
    }
    
    // 初始化決策區域
    initializeDecisionArea() {
        document.getElementById('decision-area').style.display = 'none';
        document.getElementById('capacity-info').style.display = 'none';
    }
    
    // 創建 DP 表格
    createDPTable() {
        const table = document.getElementById('dp-table');
        table.innerHTML = '';
        
        // 創建表格頭部
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>物品/容量</th>';
        for (let w = 0; w <= KnapsackData.KNAPSACK_CAPACITY; w++) {
            headerRow.innerHTML += `<th>${w}</th>`;
        }
        table.appendChild(headerRow);
        
        // 創建表格內容
        for (let i = 0; i <= KnapsackData.ITEMS.length; i++) {
            const row = document.createElement('tr');
            
            // 行標籤
            if (i === 0) {
                row.innerHTML = '<td class="row-header">∅</td>';
            } else {
                const item = KnapsackData.ITEMS[i - 1];
                row.innerHTML = `<td class="row-header">${item.name}<br><small>w:${item.weight} v:${item.value}</small></td>`;
            }
            
            // 數據單元格
            for (let w = 0; w <= KnapsackData.KNAPSACK_CAPACITY; w++) {
                const cell = document.createElement('td');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', w);
                
                if (w === 0 || i === 0) {
                    // 初始值都是 0
                    cell.textContent = '0';
                    cell.classList.add('locked');
                } else {
                    // 可編輯的單元格（但不是輸入框）
                    cell.textContent = '';
                    cell.classList.add('editable');
                }
                
                row.appendChild(cell);
            }
            
            table.appendChild(row);
        }
    }
    
    // 創建物品列表
    createItemsList() {
        const container = document.getElementById('items-container');
        container.innerHTML = '';
        
        KnapsackData.ITEMS.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.setAttribute('data-item-id', item.id);
            
            itemCard.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-stats">
                        <span class="item-weight">重量: ${item.weight}kg</span> | 
                        <span class="item-value">價值: $${item.value}</span>
                    </div>
                </div>
            `;
            
            // 添加點擊事件
            itemCard.addEventListener('click', () => {
                this.toggleItemSelection(item.id);
            });
            
            container.appendChild(itemCard);
        });
    }
    
    // 綁定事件
    bindEvents() {
        // 開始遊戲按鈕
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // 重新開始按鈕
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        // 顯示提示按鈕
        document.getElementById('show-hint').addEventListener('click', () => {
            this.showHint();
        });
        
        // 自動解答按鈕
        document.getElementById('auto-solve').addEventListener('click', () => {
            this.autoSolve();
        });
        
        // 提交選擇按鈕
        document.getElementById('submit-selection').addEventListener('click', () => {
            this.submitSelection();
        });
        
        // 決策按鈕事件
        document.getElementById('decision-not-take').addEventListener('click', () => {
            this.makeDecision('not-take');
        });
        
        document.getElementById('decision-take').addEventListener('click', () => {
            this.makeDecision('take');
        });
        
        // 模態框關閉事件
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal('success-modal');
            this.resetGame();
        });
        
        document.getElementById('close-error-modal').addEventListener('click', () => {
            this.closeModal('error-modal');
        });
    }
    
    // 做出決策（是否要拿當前物品）
    makeDecision(decision) {
        if (!this.isGameActive || this.currentStep < 0) return;
        
        this.currentDecision = decision;
        
        // 更新決策按鈕狀態
        document.querySelectorAll('.decision-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById(`decision-${decision}`).classList.add('selected');
        
        // 根據決策預設物品組合
        this.applyDecisionPreset();
        
        // 顯示容量資訊
        this.updateCapacityInfo();
        
        // 更新說明文字
        this.updateDecisionExplanation();
    }
    
    // 根據決策預設物品組合
    applyDecisionPreset() {
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const currentItem = KnapsackData.ITEMS[stepData.row - 1];
        
        // 清空當前選擇
        this.selectedItems.clear();
        
        if (this.currentDecision === 'not-take') {
            // 不拿：預設上一列的最佳解
            const presetItems = KnapsackData.getPresetItemsForStep(this.currentStep);
            presetItems.forEach(item => {
                this.selectedItems.add(item.id);
            });
        } else if (this.currentDecision === 'take') {
            // 要拿：先放入當前物品
            this.selectedItems.add(currentItem.id);
        }
        
        // 更新顯示
        this.updateItemsDisplay();
        this.updateSelectionSummary();
    }
    
    // 更新容量資訊
    updateCapacityInfo() {
        const capacityInfoElement = document.getElementById('capacity-info');
        
        if (this.currentDecision === 'take') {
            const stepData = KnapsackData.GAME_STEPS[this.currentStep];
            const currentItem = KnapsackData.ITEMS[stepData.row - 1];
            const remainingCapacity = stepData.col - currentItem.weight;
            
            document.getElementById('remaining-capacity').textContent = remainingCapacity;
            capacityInfoElement.style.display = 'block';
            
            // 更新提示文字，引導學生查表
            const hintElement = capacityInfoElement.querySelector('.capacity-hint');
            hintElement.textContent = `(請查表格 dp[${stepData.row - 1}][${remainingCapacity}] 的最佳解)`;
            
            // 高亮對應的表格位置
            this.highlightTableCell(stepData.row - 1, remainingCapacity);
        } else {
            capacityInfoElement.style.display = 'none';
            this.clearTableHighlight();
        }
    }
    
    // 高亮表格位置
    highlightTableCell(row, col) {
        this.clearTableHighlight();
        const cell = document.querySelector(`td[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.style.background = '#4caf50';
            cell.style.color = 'white';
            cell.style.fontWeight = 'bold';
            cell.classList.add('lookup-highlight');
        }
    }
    
    // 清除表格高亮
    clearTableHighlight() {
        document.querySelectorAll('.lookup-highlight').forEach(cell => {
            cell.style.background = '';
            cell.style.color = '';
            cell.style.fontWeight = '';
            cell.classList.remove('lookup-highlight');
        });
    }
    
    // 更新決策說明
    updateDecisionExplanation() {
        const explanationElement = document.getElementById('decision-explanation');
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const currentItem = KnapsackData.ITEMS[stepData.row - 1];
        
        if (this.currentDecision === 'not-take') {
            explanationElement.textContent = `選擇不拿 ${currentItem.name}，使用上一列的最佳解。`;
        } else if (this.currentDecision === 'take') {
            const remainingCapacity = stepData.col - currentItem.weight;
            explanationElement.textContent = `選擇拿 ${currentItem.name}，需要留出 ${currentItem.weight}kg 空間，剩餘 ${remainingCapacity}kg 可以放其他物品。`;
        } else {
            explanationElement.textContent = '請先選擇是否要拿當前物品。';
        }
    }
    
    // 切換物品選擇狀態
    toggleItemSelection(itemId) {
        if (!this.isGameActive || this.currentDecision === null) return;
        
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const currentCapacity = stepData.col;
        const currentRow = stepData.row;
        
        // 檢查是否為當前可選擇的物品（只能選擇前 currentRow 個物品）
        if (itemId > currentRow) {
            this.showError(
                '無法選擇該物品！', 
                `當前步驟只考慮前 ${currentRow} 個物品，無法選擇 ${KnapsackData.ITEMS.find(item => item.id === itemId).name}。`
            );
            return;
        }
        
        if (this.selectedItems.has(itemId)) {
            // 取消選擇
            this.selectedItems.delete(itemId);
        } else {
            // 選擇物品 - 檢查是否會超過當前容量
            const selectedWeight = this.calculateSelectedWeight();
            const item = KnapsackData.ITEMS.find(item => item.id === itemId);
            
            if (selectedWeight + item.weight <= currentCapacity) {
                this.selectedItems.add(itemId);
            } else {
                // 顯示警告
                this.showError(
                    '容量不足！', 
                    `當前容量限制為 ${currentCapacity}kg，選擇此物品會超過限制。`
                );
                return;
            }
        }
        
        this.updateItemsDisplay();
        this.updateSelectionSummary();
    }
    
    // 計算選中物品的總重量
    calculateSelectedWeight() {
        let totalWeight = 0;
        this.selectedItems.forEach(itemId => {
            const item = KnapsackData.ITEMS.find(item => item.id === itemId);
            totalWeight += item.weight;
        });
        return totalWeight;
    }
    
    // 計算選中物品的總價值
    calculateSelectedValue() {
        let totalValue = 0;
        this.selectedItems.forEach(itemId => {
            const item = KnapsackData.ITEMS.find(item => item.id === itemId);
            totalValue += item.value;
        });
        return totalValue;
    }
    
    // 更新物品選擇顯示
    updateItemsDisplay() {
        const container = document.getElementById('selected-items-display');
        
        if (this.selectedItems.size === 0) {
            container.innerHTML = '<p class="empty-selection">尚未選擇任何物品</p>';
        } else {
            container.innerHTML = '';
            this.selectedItems.forEach(itemId => {
                const item = KnapsackData.ITEMS.find(item => item.id === itemId);
                const selectedItemElement = document.createElement('div');
                selectedItemElement.className = 'selected-item';
                selectedItemElement.innerHTML = `
                    <span>${item.name} (${item.weight}kg, $${item.value})</span>
                    <button class="remove-btn" onclick="window.knapsackGame.toggleItemSelection(${itemId})">×</button>
                `;
                container.appendChild(selectedItemElement);
            });
        }
        
        // 更新物品卡片的選中狀態和可用性
        const stepData = this.isGameActive && this.currentStep >= 0 ? 
            KnapsackData.GAME_STEPS[this.currentStep] : null;
        const currentRow = stepData ? stepData.row : KnapsackData.ITEMS.length;
        
        KnapsackData.ITEMS.forEach(item => {
            const itemCard = document.querySelector(`[data-item-id="${item.id}"]`);
            
            // 更新選中狀態
            if (this.selectedItems.has(item.id)) {
                itemCard.classList.add('selected');
            } else {
                itemCard.classList.remove('selected');
            }
            
            // 更新可用性（只能選擇前 currentRow 個物品）
            if (this.isGameActive && item.id > currentRow) {
                itemCard.classList.add('disabled');
                itemCard.style.pointerEvents = 'none';
            } else {
                itemCard.classList.remove('disabled');
                itemCard.style.pointerEvents = 'auto';
            }
        });
    }
    
    // 更新選擇摘要
    updateSelectionSummary() {
        const totalWeight = this.calculateSelectedWeight();
        const totalValue = this.calculateSelectedValue();
        
        document.getElementById('selection-weight').textContent = totalWeight;
        document.getElementById('selection-value').textContent = totalValue;
        
        // 計算並顯示剩餘重量
        const currentCapacity = this.isGameActive && this.currentStep >= 0 ? 
            KnapsackData.GAME_STEPS[this.currentStep].col : KnapsackData.KNAPSACK_CAPACITY;
        const remainingWeight = currentCapacity - totalWeight;
        document.getElementById('remaining-weight').textContent = remainingWeight;
        
        // 更新提交按鈕狀態
        const submitBtn = document.getElementById('submit-selection');
        if (this.isGameActive && this.currentStep >= 0 && this.currentDecision !== null) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }
    
    // 提交選擇
    submitSelection() {
        if (!this.isGameActive || this.currentStep >= this.totalSteps || this.currentDecision === null) return;
        
        const totalValue = this.calculateSelectedValue();
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const correctAnswer = KnapsackData.CORRECT_DP[stepData.row][stepData.col];
        
        if (totalValue === correctAnswer) {
            // 答案正確
            this.handleCorrectAnswer(totalValue);
        } else {
            // 答案錯誤
            this.handleWrongAnswer(totalValue, correctAnswer);
        }
    }
    
    // 處理正確答案
    handleCorrectAnswer(value) {
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const cell = document.querySelector(`td[data-row="${stepData.row}"][data-col="${stepData.col}"]`);
        
        // 填入正確值並標記為完成
        cell.textContent = value;
        cell.classList.remove('current');
        cell.classList.add('completed');
        
        // 清除表格高亮
        this.clearTableHighlight();
        
        // 重置決策狀態
        this.currentDecision = null;
        this.selectedItems.clear();
        this.updateItemsDisplay();
        this.updateSelectionSummary();
        
        this.currentStep++;
        
        if (this.currentStep >= this.totalSteps) {
            // 遊戲完成
            this.completeGame();
        } else {
            // 繼續下一步
            this.updateUI();
            this.highlightCurrentCell();
            this.updateKnapsackVisualization();
        }
    }
    
    // 處理錯誤答案
    handleWrongAnswer(userValue, correctValue) {
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const item = KnapsackData.ITEMS[stepData.row - 1];
        
        const errorMessage = `答案錯誤！你選擇的物品總價值為 ${userValue}，但正確答案是 ${correctValue}`;
        const hint = KnapsackData.getHintMessage(this.currentStep);
        
        this.showError(errorMessage, hint);
    }
    
    // 開始遊戲
    startGame() {
        this.isGameActive = true;
        this.currentStep = 0;
        this.currentDecision = null;
        this.selectedItems.clear();
        this.updateUI();
        this.highlightCurrentCell();
        this.updateItemsDisplay();
        this.updateSelectionSummary();
        
        // 禁用開始按鈕
        document.getElementById('start-game').disabled = true;
    }
    
    // 重置遊戲
    resetGame() {
        this.isGameActive = false;
        this.currentStep = -1;
        this.currentDecision = null;
        this.selectedItems.clear();
        
        // 清空表格
        const cells = document.querySelectorAll('.dp-table td.editable');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('current', 'completed');
        });
        
        // 隱藏決策區域
        document.getElementById('decision-area').style.display = 'none';
        document.getElementById('capacity-info').style.display = 'none';
        
        // 清除表格高亮
        this.clearTableHighlight();
        
        // 重置決策按鈕
        document.querySelectorAll('.decision-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // 重置UI
        this.updateUI();
        this.updateItemsDisplay();
        this.updateSelectionSummary();
        
        // 啟用開始按鈕
        document.getElementById('start-game').disabled = false;
    }
    
    // 高亮當前單元格並初始化決策流程
    highlightCurrentCell() {
        if (this.currentStep >= this.totalSteps) return;
        
        // 清除之前的高亮
        document.querySelectorAll('.dp-table td.current').forEach(cell => {
            cell.classList.remove('current');
        });
        
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const cell = document.querySelector(`td[data-row="${stepData.row}"][data-col="${stepData.col}"]`);
        if (cell) {
            cell.classList.add('current');
        }
        
        // 顯示決策區域並更新當前物品名稱
        const currentItem = KnapsackData.ITEMS[stepData.row - 1];
        document.getElementById('current-item-name').textContent = currentItem.name;
        document.getElementById('decision-area').style.display = 'block';
        
        // 重置決策狀態
        this.currentDecision = null;
        document.querySelectorAll('.decision-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('decision-explanation').textContent = '請先選擇是否要拿當前物品。';
        document.getElementById('capacity-info').style.display = 'none';
        
        // 清空選擇
        this.selectedItems.clear();
        this.updateItemsDisplay();
        this.updateSelectionSummary();
    }
    
    // 顯示提示
    showHint() {
        if (!this.isGameActive || this.currentStep >= this.totalSteps) return;
        
        const hint = KnapsackData.getHintMessage(this.currentStep);
        this.updateHint(hint);
        
        // 暫時高亮相關單元格
        this.highlightRelevantCells();
    }
    
    // 高亮相關單元格
    highlightRelevantCells() {
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const item = KnapsackData.ITEMS[stepData.row - 1];
        
        // 高亮上一行同列的單元格（不拿當前物品的情況）
        const prevRowCell = document.querySelector(`td[data-row="${stepData.row - 1}"][data-col="${stepData.col}"]`);
        if (prevRowCell) {
            prevRowCell.style.background = '#ffeb3b';
            setTimeout(() => {
                prevRowCell.style.background = '';
            }, 2000);
        }
        
        // 如果容量足夠，高亮 dp[i-1][w-weight] 的單元格
        if (stepData.col >= item.weight) {
            const takeCell = document.querySelector(`td[data-row="${stepData.row - 1}"][data-col="${stepData.col - item.weight}"]`);
            if (takeCell) {
                takeCell.style.background = '#4caf50';
                setTimeout(() => {
                    takeCell.style.background = '';
                }, 2000);
            }
        }
    }
    
    // 自動解答
    autoSolve() {
        if (!this.isGameActive) return;
        
        const stepData = KnapsackData.GAME_STEPS[this.currentStep];
        const correctAnswer = KnapsackData.CORRECT_DP[stepData.row][stepData.col];
        const prevValue = KnapsackData.CORRECT_DP[stepData.row - 1][stepData.col];
        
        // 自動做決策
        if (correctAnswer > prevValue) {
            this.makeDecision('take');
        } else {
            this.makeDecision('not-take');
        }
        
        // 自動提交
        setTimeout(() => {
            this.submitSelection();
        }, 1000);
    }
    
    // 完成遊戲
    completeGame() {
        this.isGameActive = false;
        const optimalItems = KnapsackData.getOptimalItems();
        
        // 隱藏決策區域
        document.getElementById('decision-area').style.display = 'none';
        document.getElementById('capacity-info').style.display = 'none';
        
        // 計算最終結果
        const finalValue = optimalItems.reduce((sum, item) => sum + item.value, 0);
        const finalWeight = optimalItems.reduce((sum, item) => sum + item.weight, 0);
        
        // 顯示成功模態框
        document.getElementById('final-value').textContent = finalValue;
        document.getElementById('final-weight').textContent = finalWeight + 'kg';
        
        const selectedItemsElement = document.getElementById('selected-items');
        selectedItemsElement.innerHTML = '<strong>選擇的物品：</strong>' + 
            optimalItems.map(item => `${item.name}(${item.weight}kg, $${item.value})`).join(', ');
        
        this.showModal('success-modal');
    }
    
    // 更新UI
    updateUI() {
        // 更新步驟信息
        if (this.currentStep >= 0) {
            document.getElementById('current-step').textContent = `步驟 ${this.currentStep + 1}`;
        } else {
            document.getElementById('current-step').textContent = '步驟 0';
        }
        
        document.getElementById('total-steps').textContent = `總共 ${this.totalSteps} 步`;
        
        // 更新進度條
        const progress = this.currentStep >= 0 ? ((this.currentStep + 1) / this.totalSteps) * 100 : 0;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // 更新提示信息
        if (this.currentStep >= 0 && this.currentStep < this.totalSteps) {
            const stepData = KnapsackData.GAME_STEPS[this.currentStep];
            const item = KnapsackData.ITEMS[stepData.row - 1];
            this.updateHint(`正在考慮 ${item.name}，背包容量為 ${stepData.col} 時的最大價值。請先決策是否要拿這個物品。`);
        } else if (!this.isGameActive) {
            this.updateHint('點擊開始遊戲來開始填入表格！');
        }
        
        // 更新背包視覺化
        this.updateKnapsackVisualization();
    }
    
    // 更新提示信息
    updateHint(message) {
        document.getElementById('current-hint').textContent = message;
    }
    
    // 更新背包視覺化
    updateKnapsackVisualization() {
        const knapsackState = KnapsackData.getCurrentKnapsackState(this.currentStep);
        
        // 更新背包信息
        document.getElementById('current-weight').textContent = knapsackState.totalWeight;
        document.getElementById('current-value').textContent = knapsackState.totalValue;
        
        // 更新背包內物品
        const knapsackItemsContainer = document.getElementById('knapsack-items');
        knapsackItemsContainer.innerHTML = '';
        
        knapsackState.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item in-knapsack';
            itemElement.style.backgroundColor = item.color;
            itemElement.textContent = item.name;
            knapsackItemsContainer.appendChild(itemElement);
        });
    }
    
    // 顯示錯誤模態框
    showError(message, hint) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-hint').textContent = hint;
        this.showModal('error-modal');
    }
    
    // 顯示模態框
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    // 關閉模態框
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    window.knapsackGame = new KnapsackGame();
});