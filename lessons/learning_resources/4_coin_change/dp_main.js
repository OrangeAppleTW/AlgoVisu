// ----- 動態規劃解決硬幣找零問題 - 主文件 -----
let dpCoins = [];
let dpAmount = 0;
let dpRunning = false;
let dpPaused = false;
let dpAnimationSteps = [];
let currentDpStep = 0;
let dpTable = []; // 動態規劃表格
let coinChoice = []; // 記錄每個金額選擇的硬幣
let currentCoinUsage = []; // 記錄每個金額使用的各種硬幣數量

// 洗牌算法 (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initDynamicProgrammingCoins() {
    const container = document.getElementById('dp-container');
    const tableContainer = document.getElementById('dp-table-container');
    const startBtn = document.getElementById('dp-start');
    const pauseBtn = document.getElementById('dp-pause');
    const resetBtn = document.getElementById('dp-reset');
    const speedSlider = document.getElementById('dp-speed');
    const structureView = document.getElementById('dp-structure');
    const statusText = document.getElementById('dp-status');
    
    // 設置畫布尺寸
    const width = container.clientWidth;
    const height = 300;
    
    // 添加事件監聽器
    startBtn.addEventListener('click', startDpAlgorithm);
    pauseBtn.addEventListener('click', pauseDpAlgorithm);
    resetBtn.addEventListener('click', resetDpAlgorithm);
    
    // 頁面加載時自動生成預設的問題數據
    generatePredefinedProblem();
    
    // 新增函數：使用預定義的問題數據
    function generatePredefinedProblem() {
        resetDpAlgorithm();
        
        // 預定義的目標金額和硬幣面額
        dpAmount = 50;
        const coinValues = [1, 4, 25, 17, 9];
        
        // 創建硬幣對象
        dpCoins = [];
        
        // 為每種面額創建硬幣對象，並指定不同的顏色
        const colors = ['#A67D3D', '#B87333', '#CD7F32', '#C0C0C0', '#FFD700'];
        
        // 不需要按面額排序，展示DP演算法對硬幣處理順序的不敏感性
        // 為了展示效果，我們甚至可以隨機打亂硬幣順序
        shuffleArray(coinValues);
        
        coinValues.forEach((value, index) => {
            dpCoins.push({
                id: index + 1,
                value: value,
                color: colors[index],
                label: '$' + value
            });
        });
        
        renderProblem();
        renderInitialTable(); // 顯示初始表格
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        statusText.textContent = '請點擊「開始求解」按鈕開始';
        structureView.textContent = `目標：湊出 ${dpAmount} 元\n\n可用硬幣：\n`;
        
        // 顯示硬幣數據
        dpCoins.forEach(coin => {
            structureView.textContent += `${coin.label}：面額 = ${coin.value}\n`;
        });
        
        // 添加說明，強調不需要事先排序
        structureView.textContent += `\n注意：硬幣面額並未事先排序。動態規劃算法無需依賴特定的硬幣處理順序，仍能找到最優解。`;
    }

    function generateProblem() {
        resetDpAlgorithm();
        
        // 生成隨機錢額，範圍在 80-110 之間
        dpAmount = Math.floor(Math.random() * 31) + 80;
        
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
        
        // 不需要對硬幣面額進行排序，隨機順序展示DP的特性
        shuffleArray(coinValues);
        
        // 創建硬幣對象
        dpCoins = [];
        
        // 為每種面額創建硬幣對象，並指定不同的顏色
        const colors = ['#A67D3D', '#B87333', '#CD7F32', '#C0C0C0', '#FFD700'];  // 從小到大面額對應的顏色
        
        coinValues.forEach((value, index) => {
            dpCoins.push({
                id: index + 1,
                value: value,
                color: colors[index],
                label: '$' + value
            });
        });
        
        renderProblem();
        renderInitialTable(); // 顯示初始表格
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        statusText.textContent = '硬幣問題已生成，點擊「開始求解」按鈕開始';
        structureView.textContent = `目標：湊出 ${dpAmount} 元\n\n可用硬幣：\n`;
        
        // 顯示硬幣數據
        dpCoins.forEach(coin => {
            structureView.textContent += `${coin.label}：面額 = ${coin.value}\n`;
        });
        
        // 添加說明，強調不需要事先排序
        structureView.textContent += `\n注意：硬幣面額並未事先排序。動態規劃算法無需依賴特定的硬幣處理順序，仍能找到最優解。`;
    }
    
    function continueDpAnimation() {
        disableButtons('dp', true);
        playDpAnimation();
    }
    
    function pauseDpAlgorithm() {
        dpPaused = true;
        disableButtons('dp', false);
    }
    
    function resetDpAlgorithm() {
        if (dpRunning) {
            dpPaused = true;
            dpRunning = false;
        }
        
        currentDpStep = 0;
        dpAnimationSteps = [];
        dpTable = [];
        coinChoice = [];
        currentCoinUsage = [];
        
        // 重置硬幣使用情況
        dpCoins.forEach(coin => {
            coin.count = 0;
        });
        
        if (dpCoins.length > 0) {
            renderProblem();
            updateCurrentAmount(0);
        }
        
        tableContainer.innerHTML = '';
        structureView.textContent = '';
        statusText.textContent = '請點擊「開始求解」按鈕開始';
        
        disableButtons('dp', false, true);
        document.getElementById('dp-start').disabled = false;
        document.getElementById('dp-reset').disabled = true;
    }
}

// 頁面加載時初始化動態規劃找零算法
document.addEventListener('DOMContentLoaded', () => {
    initDynamicProgrammingCoins();
});
