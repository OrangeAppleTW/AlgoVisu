// 共通的輔助函數
function getRandomArray(length = 15, min = 5, max = 100) {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

function disableButtons(prefix, disabled, exceptReset = false) {
    document.getElementById(`${prefix}-generate`).disabled = disabled;
    document.getElementById(`${prefix}-start`).disabled = disabled;
    if (document.getElementById(`${prefix}-pause`)) {
        document.getElementById(`${prefix}-pause`).disabled = !disabled;
    }
    if (!exceptReset) {
        document.getElementById(`${prefix}-reset`).disabled = disabled;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ----- 氣泡排序 (Bubble Sort) -----
let bubbleArray = [];
let bubbleSortRunning = false;
let bubbleSortPaused = false;
let bubbleSortAnimationId = null;

function initBubbleSort() {
    const container = document.getElementById('bubble-array');
    const generateBtn = document.getElementById('bubble-generate');
    const startBtn = document.getElementById('bubble-start');
    const pauseBtn = document.getElementById('bubble-pause');
    const resetBtn = document.getElementById('bubble-reset');
    const speedSlider = document.getElementById('bubble-speed');
    const statusText = document.getElementById('bubble-status');
    
    generateBtn.addEventListener('click', generateBubbleArray);
    startBtn.addEventListener('click', startBubbleSort);
    pauseBtn.addEventListener('click', pauseBubbleSort);
    resetBtn.addEventListener('click', resetBubbleSort);
    
    function generateBubbleArray() {
        resetBubbleSort();
        bubbleArray = getRandomArray();
        renderBubbleArray();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        statusText.textContent = '數組已生成，點擊「開始排序」按鈕開始';
    }
    
    function renderBubbleArray(comparing = [], swapping = [], sorted = []) {
        container.innerHTML = '';
        
        const maxValue = Math.max(...bubbleArray);
        
        bubbleArray.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // 設置高度和顯示值
            const height = (value / maxValue) * 200;
            bar.style.height = `${height}px`;
            bar.textContent = value;
            
            // 設置顏色
            if (swapping.includes(index)) {
                bar.classList.add('swapping');
            } else if (comparing.includes(index)) {
                bar.classList.add('comparing');
            } else if (sorted.includes(index)) {
                bar.classList.add('sorted');
            }
            
            container.appendChild(bar);
        });
    }
    
    async function bubbleSortAlgorithm() {
        const n = bubbleArray.length;
        const speed = 101 - speedSlider.value;
        let sorted = [];
        
        for (let i = 0; i < n; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                if (bubbleSortPaused) {
                    // 暫停時不覆蓋狀態文字，直接返回
                    return;
                }
                
                // 顯示正在比較的元素
                statusText.textContent = `比較元素 ${bubbleArray[j]} 和 ${bubbleArray[j + 1]}`;
                renderBubbleArray([j, j + 1], [], sorted);
                await sleep(speed * 10);
                
                if (bubbleArray[j] > bubbleArray[j + 1]) {
                    // 交換元素
                    statusText.textContent = `交換元素 ${bubbleArray[j]} 和 ${bubbleArray[j + 1]}`;
                    renderBubbleArray([], [j, j + 1], sorted);
                    await sleep(speed * 10);
                    
                    [bubbleArray[j], bubbleArray[j + 1]] = [bubbleArray[j + 1], bubbleArray[j]];
                    swapped = true;
                    
                    // 顯示交換後的數組
                    renderBubbleArray([], [], sorted);
                    await sleep(speed * 5);
                }
            }
            
            // 最後一個元素已排序
            sorted.push(n - i - 1);
            renderBubbleArray([], [], sorted);
            
            if (!swapped) {
                break;
            }
        }
        
        // 所有元素已排序
        sorted = Array.from({ length: n }, (_, i) => i);
        renderBubbleArray([], [], sorted);
        statusText.textContent = '排序完成！';
        bubbleSortRunning = false;
        disableButtons('bubble', false);
    }
    
    function startBubbleSort() {
        if (!bubbleSortRunning) {
            bubbleSortRunning = true;
            bubbleSortPaused = false;
            disableButtons('bubble', true);
            bubbleSortAlgorithm();
        } else if (bubbleSortPaused) {
            bubbleSortPaused = false;
            disableButtons('bubble', true);
            bubbleSortAlgorithm();
        }
    }
    
    function pauseBubbleSort() {
        bubbleSortPaused = true;
        // 不覆蓋原狀態文字，只在文字後面添加暫停提示
        statusText.textContent = statusText.textContent + ' (已暫停)';
        disableButtons('bubble', false);
    }
    
    function resetBubbleSort() {
        if (bubbleSortRunning) {
            bubbleSortPaused = true;
            bubbleSortRunning = false;
        }
        bubbleArray = [];
        container.innerHTML = '';
        disableButtons('bubble', false, true);
        document.getElementById('bubble-start').disabled = true;
        document.getElementById('bubble-reset').disabled = true;
        statusText.textContent = '請點擊「生成數組」按鈕開始';
    }
}

// ----- 插入排序 (Insertion Sort) -----
let insertionArray = [];
let insertionSortRunning = false;
let insertionSortPaused = false;

function initInsertionSort() {
    const container = document.getElementById('insertion-array');
    const generateBtn = document.getElementById('insertion-generate');
    const startBtn = document.getElementById('insertion-start');
    const pauseBtn = document.getElementById('insertion-pause');
    const resetBtn = document.getElementById('insertion-reset');
    const speedSlider = document.getElementById('insertion-speed');
    const statusText = document.getElementById('insertion-status');
    
    generateBtn.addEventListener('click', generateInsertionArray);
    startBtn.addEventListener('click', startInsertionSort);
    pauseBtn.addEventListener('click', pauseInsertionSort);
    resetBtn.addEventListener('click', resetInsertionSort);
    
    function generateInsertionArray() {
        resetInsertionSort();
        insertionArray = getRandomArray();
        renderInsertionArray();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        statusText.textContent = '數組已生成，點擊「開始排序」按鈕開始';
    }
    
    function renderInsertionArray(current = -1, moving = -1, sorted = []) {
        container.innerHTML = '';
        
        const maxValue = Math.max(...insertionArray);
        
        insertionArray.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // 設置高度和顯示值
            const height = (value / maxValue) * 200;
            bar.style.height = `${height}px`;
            bar.textContent = value;
            
            // 設置顏色
            if (index === current) {
                bar.classList.add('comparing');
            } else if (index === moving) {
                bar.classList.add('swapping');
            } else if (sorted.includes(index)) {
                bar.classList.add('sorted');
            }
            
            container.appendChild(bar);
        });
    }
    
    async function insertionSortAlgorithm() {
        const n = insertionArray.length;
        const speed = 101 - speedSlider.value;
        let sorted = [0]; // 第一個元素默認已排序
        
        for (let i = 1; i < n; i++) {
            if (insertionSortPaused) {
                // 暫停時不覆蓋狀態文字，直接返回
                return;
            }
            
            let key = insertionArray[i];
            let j = i - 1;
            
            // 顯示當前要插入的元素
            statusText.textContent = `選取元素 ${key} 進行插入`;
            renderInsertionArray(i, -1, sorted);
            await sleep(speed * 10);
            
            while (j >= 0 && insertionArray[j] > key) {
                if (insertionSortPaused) {
                    // 暫停時不覆蓋狀態文字，直接返回
                    return;
                }
                
                // 顯示比較過程
                statusText.textContent = `比較 ${insertionArray[j]} > ${key}，向右移動元素`;
                renderInsertionArray(i, j, sorted);
                await sleep(speed * 10);
                
                // 向右移動元素
                insertionArray[j + 1] = insertionArray[j];
                renderInsertionArray(i, j + 1, sorted);
                await sleep(speed * 5);
                
                j--;
            }
            
            // 插入key到正確位置
            insertionArray[j + 1] = key;
            statusText.textContent = `將 ${key} 插入到位置 ${j + 1}`;
            
            // 更新已排序的元素
            sorted.push(i);
            renderInsertionArray(-1, -1, sorted);
            await sleep(speed * 10);
        }
        
        // 排序完成
        statusText.textContent = '排序完成！';
        renderInsertionArray(-1, -1, Array.from({ length: n }, (_, i) => i));
        insertionSortRunning = false;
        disableButtons('insertion', false);
    }
    
    function startInsertionSort() {
        if (!insertionSortRunning) {
            insertionSortRunning = true;
            insertionSortPaused = false;
            disableButtons('insertion', true);
            insertionSortAlgorithm();
        } else if (insertionSortPaused) {
            insertionSortPaused = false;
            disableButtons('insertion', true);
            insertionSortAlgorithm();
        }
    }
    
    function pauseInsertionSort() {
        insertionSortPaused = true;
        // 不覆蓋原狀態文字，只在文字後面添加暫停提示
        statusText.textContent = statusText.textContent + ' (已暫停)';
        disableButtons('insertion', false);
    }
    
    function resetInsertionSort() {
        if (insertionSortRunning) {
            insertionSortPaused = true;
            insertionSortRunning = false;
        }
        insertionArray = [];
        container.innerHTML = '';
        disableButtons('insertion', false, true);
        document.getElementById('insertion-start').disabled = true;
        document.getElementById('insertion-reset').disabled = true;
        statusText.textContent = '請點擊「生成數組」按鈕開始';
    }
}

// ----- 快速排序 (Quick Sort) -----
let quickArray = [];
let quickSortRunning = false;
let quickSortPaused = false;

function initQuickSort() {
    const container = document.getElementById('quick-array');
    const generateBtn = document.getElementById('quick-generate');
    const startBtn = document.getElementById('quick-start');
    const pauseBtn = document.getElementById('quick-pause');
    const resetBtn = document.getElementById('quick-reset');
    const speedSlider = document.getElementById('quick-speed');
    const statusText = document.getElementById('quick-status');
    
    generateBtn.addEventListener('click', generateQuickArray);
    startBtn.addEventListener('click', startQuickSort);
    pauseBtn.addEventListener('click', pauseQuickSort);
    resetBtn.addEventListener('click', resetQuickSort);
    
    function generateQuickArray() {
        resetQuickSort();
        quickArray = getRandomArray();
        renderQuickArray();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        statusText.textContent = '數組已生成，點擊「開始排序」按鈕開始';
    }
    
    function renderQuickArray(pivot = -1, comparing = -1, swapping = -1, sorted = []) {
        container.innerHTML = '';
        
        const maxValue = Math.max(...quickArray);
        
        quickArray.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // 設置高度和顯示值
            const height = (value / maxValue) * 200;
            bar.style.height = `${height}px`;
            bar.textContent = value;
            
            // 設置顏色
            if (index === pivot) {
                bar.classList.add('pivot');
            } else if (index === comparing) {
                bar.classList.add('comparing');
            } else if (index === swapping) {
                bar.classList.add('swapping');
            } else if (sorted.includes(index)) {
                bar.classList.add('sorted');
            }
            
            container.appendChild(bar);
        });
    }
    
    async function quickSortAlgorithm(low = 0, high = quickArray.length - 1, sorted = []) {
        if (low >= high) {
            if (low >= 0 && low < quickArray.length && !sorted.includes(low)) {
                sorted.push(low);
                renderQuickArray(-1, -1, -1, sorted);
            }
            return;
        }
        
        if (quickSortPaused) {
            // 暫停時不覆蓋狀態文字，直接返回
            return;
        }
        
        const speed = 101 - speedSlider.value;
        
        // 選擇基準元素
        const pivotIndex = high;
        const pivot = quickArray[pivotIndex];
        
        statusText.textContent = `選擇基準元素: ${pivot}`;
        renderQuickArray(pivotIndex, -1, -1, sorted);
        await sleep(speed * 15);
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (quickSortPaused) {
                // 暫停時不覆蓋狀態文字，直接返回
                return;
            }
            
            // 顯示正在比較的元素
            statusText.textContent = `比較元素 ${quickArray[j]} 和基準 ${pivot}`;
            renderQuickArray(pivotIndex, j, -1, sorted);
            await sleep(speed * 10);
            
            if (quickArray[j] <= pivot) {
                i++;
                
                // 顯示交換過程
                statusText.textContent = `交換元素 ${quickArray[i]} 和 ${quickArray[j]}`;
                renderQuickArray(pivotIndex, -1, j, sorted);
                await sleep(speed * 10);
                
                [quickArray[i], quickArray[j]] = [quickArray[j], quickArray[i]];
                renderQuickArray(pivotIndex, -1, -1, sorted);
                await sleep(speed * 5);
            }
        }
        
        // 將基準元素放到正確位置
        statusText.textContent = `將基準元素 ${pivot} 放到最終位置`;
        renderQuickArray(pivotIndex, -1, i + 1, sorted);
        await sleep(speed * 10);
        
        [quickArray[i + 1], quickArray[high]] = [quickArray[high], quickArray[i + 1]];
        
        const newPivotIndex = i + 1;
        sorted.push(newPivotIndex);
        renderQuickArray(-1, -1, -1, sorted);
        await sleep(speed * 10);
        
        // 遞迴排序基準元素的左右兩部分
        await quickSortAlgorithm(low, newPivotIndex - 1, sorted);
        await quickSortAlgorithm(newPivotIndex + 1, high, sorted);
        
        return;
    }
    
    async function startQuickSort() {
        if (!quickSortRunning) {
            quickSortRunning = true;
            quickSortPaused = false;
            disableButtons('quick', true);
            
            const sorted = [];
            await quickSortAlgorithm(0, quickArray.length - 1, sorted);
            
            if (!quickSortPaused) {
                statusText.textContent = '排序完成！';
                renderQuickArray(-1, -1, -1, Array.from({ length: quickArray.length }, (_, i) => i));
                quickSortRunning = false;
                disableButtons('quick', false);
            }
        } else if (quickSortPaused) {
            quickSortPaused = false;
            disableButtons('quick', true);
            await quickSortAlgorithm(0, quickArray.length - 1, []);
            
            if (!quickSortPaused) {
                statusText.textContent = '排序完成！';
                renderQuickArray(-1, -1, -1, Array.from({ length: quickArray.length }, (_, i) => i));
                quickSortRunning = false;
                disableButtons('quick', false);
            }
        }
    }
    
    function pauseQuickSort() {
        quickSortPaused = true;
        // 不覆蓋原狀態文字，只在文字後面添加暫停提示
        statusText.textContent = statusText.textContent + ' (已暫停)';
        disableButtons('quick', false);
    }
    
    function resetQuickSort() {
        if (quickSortRunning) {
            quickSortPaused = true;
            quickSortRunning = false;
        }
        quickArray = [];
        container.innerHTML = '';
        disableButtons('quick', false, true);
        document.getElementById('quick-start').disabled = true;
        document.getElementById('quick-reset').disabled = true;
        statusText.textContent = '請點擊「生成數組」按鈕開始';
    }
}

// ----- 合併排序 (Merge Sort) -----
// 宣告全局變數給 mergesort-new.js 使用
let mergeArray = [];
let mergeArrayAux = [];
let mergeSortRunning = false;
// 初始化合併排序的空函數，後由 mergesort-new.js 替換
function initMergeSort() {
    // 空函數，將由 mergesort-new.js 中的新實現替換
}

// 頁簽切換功能
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // 移除所有活動狀態
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 設置活動狀態
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 程式碼選項卡切換功能
function initCodeTabs() {
    const codeTabs = document.querySelectorAll('.code-tab');
    
    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const codeId = tab.getAttribute('data-code');
            const parentContainer = tab.closest('.code-container');
            
            // 移除該容器內所有活動狀態
            parentContainer.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
            parentContainer.querySelectorAll('.code-view').forEach(view => view.classList.remove('active'));
            
            // 設置活動狀態
            tab.classList.add('active');
            document.getElementById(codeId).classList.add('active');
        });
    });
}

// 頁面加載時初始化所有排序算法
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initBubbleSort();
    initInsertionSort();
    initQuickSort();
    initMergeSort(); // 初始化合併排序，會由 mergesort-new.js 提供的新實現替換
    initCodeTabs(); // 初始化程式碼選項卡功能
});
