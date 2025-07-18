// 背包問題的資料定義和正確答案

// 物品資料 (新的物品數據)
const ITEMS = [
    { id: 1, name: '書本1', weight: 3, value: 6, color: '#4CAF50' },
    { id: 2, name: '書本2', weight: 1, value: 10, color: '#2196F3' },
    { id: 3, name: '書本3', weight: 3, value: 5, color: '#FF9800' },
    { id: 4, name: '書本4', weight: 2, value: 7, color: '#9C27B0' }
];

// 背包容量
const KNAPSACK_CAPACITY = 6;

// 預先計算的正確 DP 表格
// dp[i][w] = 考慮前 i 個物品，背包容量為 w 時的最大價值
const CORRECT_DP = [
    // w=0, w=1, w=2, w=3, w=4, w=5, w=6
    [0, 0, 0, 0, 0, 0, 0], // i=0 (不考慮任何物品)
    [0, 0, 0, 6, 6, 6, 6], // i=1 (考慮書本1: weight=3, value=6)
    [0, 10, 10, 10, 16, 16, 16], // i=2 (考慮書本1,2: weight=1, value=10)
    [0, 10, 10, 10, 16, 16, 16], // i=3 (考慮書本1,2,3: weight=3, value=5)
    [0, 10, 10, 17, 17, 17, 23]  // i=4 (考慮書本1,2,3,4: weight=2, value=7)
];

// 每一步的遊戲步驟順序 (按行填入)
const GAME_STEPS = [];

// 生成遊戲步驟順序
function generateGameSteps() {
    for (let i = 1; i <= ITEMS.length; i++) {
        for (let w = 1; w <= KNAPSACK_CAPACITY; w++) {
            GAME_STEPS.push({ row: i, col: w });
        }
    }
}

// 初始化遊戲步驟
generateGameSteps();

// 獲取當前步驟的提示訊息
function getHintMessage(step) {
    const { row, col } = GAME_STEPS[step];
    const item = ITEMS[row - 1];
    const weight = col;
    
    if (weight < item.weight) {
        return `容量 ${weight} 無法放入重量為 ${item.weight} 的${item.name}，所以答案是 dp[${row-1}][${weight}] = ${CORRECT_DP[row-1][weight]}`;
    } else {
        const notTake = CORRECT_DP[row-1][weight];
        const take = CORRECT_DP[row-1][weight - item.weight] + item.value;
        const result = Math.max(notTake, take);
        
        return `比較不拿${item.name}(${notTake}) vs 拿${item.name}(${take}) = max(${notTake}, ${take}) = ${result}。請選擇能達到價值 ${result} 的物品組合。`;
    }
}

// 獲取錯誤提示訊息
function getErrorMessage(step, userAnswer) {
    const { row, col } = GAME_STEPS[step];
    const correctAnswer = CORRECT_DP[row][col];
    const item = ITEMS[row - 1];
    
    return {
        message: `答案應該是 ${correctAnswer}，你填入的是 ${userAnswer}`,
        hint: getHintMessage(step)
    };
}

// 檢查答案是否正確
function checkAnswer(step, userAnswer) {
    const { row, col } = GAME_STEPS[step];
    return parseInt(userAnswer) === CORRECT_DP[row][col];
}

// 獲取最佳解的選擇物品
function getOptimalItems() {
    const selectedItems = [];
    let i = ITEMS.length;
    let w = KNAPSACK_CAPACITY;
    
    while (i > 0 && w > 0) {
        // 如果當前值不等於上一行同重量的值，說明選擇了當前物品
        if (CORRECT_DP[i][w] !== CORRECT_DP[i-1][w]) {
            selectedItems.push(ITEMS[i-1]);
            w -= ITEMS[i-1].weight;
        }
        i--;
    }
    
    return selectedItems.reverse();
}

// 獲取當前狀態的背包內容（根據已填入的DP值推斷）
function getCurrentKnapsackState(currentStep) {
    if (currentStep < 0) return { items: [], totalWeight: 0, totalValue: 0 };
    
    // 簡化版本：根據當前步驟顯示理論上的最佳選擇
    const { row } = GAME_STEPS[Math.min(currentStep, GAME_STEPS.length - 1)];
    const selectedItems = [];
    
    // 基於當前考慮的物品數量，計算最佳選擇
    let remainingWeight = KNAPSACK_CAPACITY;
    
    for (let i = 0; i < row && i < ITEMS.length; i++) {
        const item = ITEMS[i];
        if (remainingWeight >= item.weight) {
            // 簡單貪心選擇（實際應該用DP結果，但這裡簡化處理）
            if (item.value / item.weight >= 1) { // 價值密度閾值
                selectedItems.push(item);
                remainingWeight -= item.weight;
            }
        }
    }
    
    const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);
    
    return { items: selectedItems, totalWeight, totalValue };
}

// 根據DP表格回溯獲取特定狀態的最佳物品組合
function getOptimalItemsForState(itemCount, capacity) {
    if (itemCount === 0 || capacity === 0) {
        return [];
    }
    
    const selectedItems = [];
    let i = itemCount;
    let w = capacity;
    
    while (i > 0 && w > 0) {
        // 如果當前值不等於上一行同重量的值，說明選擇了當前物品
        if (CORRECT_DP[i][w] !== CORRECT_DP[i-1][w]) {
            selectedItems.push(ITEMS[i-1]);
            w -= ITEMS[i-1].weight;
        }
        i--;
    }
    
    return selectedItems.reverse();
}

// 獲取當前步驟應該預設的物品選擇（基於上一行的最佳解）
function getPresetItemsForStep(step) {
    const { row, col } = GAME_STEPS[step];
    
    // 如果是第一行，沒有預設
    if (row === 1) {
        return [];
    }
    
    // 獲取上一行同容量的最佳解
    const prevRowValue = CORRECT_DP[row - 1][col];
    if (prevRowValue === 0) {
        return [];
    }
    
    // 回溯獲取上一行的最佳物品組合
    return getOptimalItemsForState(row - 1, col);
}

// 導出所有需要的資料和函數
window.KnapsackData = {
    ITEMS,
    KNAPSACK_CAPACITY,
    CORRECT_DP,
    GAME_STEPS,
    getHintMessage,
    getErrorMessage,
    checkAnswer,
    getOptimalItems,
    getCurrentKnapsackState,
    getOptimalItemsForState,
    getPresetItemsForStep
};