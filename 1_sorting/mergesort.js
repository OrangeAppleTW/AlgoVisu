// 預模擬合併排序過程，產生完整的分割和合併步驟記錄
function simulateEntireMergeSort(array) {
    // 記錄所有分割和合併的步驟，分割全部放前面，合併放後面
    const splitSteps = [];
    const mergeSteps = [];
    
    // 結束條件：數組只有一個元素
    if (array.length <= 1) {
        return [{type: 'split', array, left: array, right: [], level: 0}];
    }
    
    // 模擬不實際改變原數組的合併排序
    function mergeSortSimulation(arr, level = 0) {
        // 基本情況：數組已經不能再分割
        if (arr.length <= 1) return arr;
        
        // 分割數組
        const mid = Math.floor(arr.length / 2);
        const leftArray = arr.slice(0, mid);
        const rightArray = arr.slice(mid);
        
        // 記錄分割步驟
        splitSteps.push({
            type: 'split',
            array: [...arr],
            left: [...leftArray],
            right: [...rightArray],
            level: level
        });
        
        // 遞歸分割
        const leftSorted = mergeSortSimulation(leftArray, level + 1);
        const rightSorted = mergeSortSimulation(rightArray, level + 1);
        
        // 合併左右子數組
        const result = merge(leftSorted, rightSorted);
        
        // 記錄合併步驟
        mergeSteps.push({
            type: 'merge',
            left: [...leftSorted],
            right: [...rightSorted],
            result: [...result],
            level: level
        });
        
        return result;
    }
    
    // 合併兩個已排序的數組
    function merge(left, right) {
        const result = [];
        let leftIndex = 0, rightIndex = 0;
        
        // 比較並合併
        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] <= right[rightIndex]) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }
        
        // 加入剩餘元素
        return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
    }
    
    // 執行模擬
    mergeSortSimulation([...array]);
    
    // 組合所有步驟，分割全部放前面，合併放後面
    // 這樣可以更直觀地表示分割和合併的過程
    return [...splitSteps, ...mergeSteps];
}// 重新設計的合併排序可視化，移除暫停功能，添加完整的分割和合併記錄
function initMergeSortNew() {
    // 確認所有DOM元素存在
    const container = document.getElementById('merge-array');
    const structureView = document.getElementById('merge-structure');
    const generateBtn = document.getElementById('merge-generate');
    const startBtn = document.getElementById('merge-start');
    const resetBtn = document.getElementById('merge-reset');
    const speedSlider = document.getElementById('merge-speed');
    const statusText = document.getElementById('merge-status');
    
    // 檢查元素是否存在
    if (!container || !structureView || !generateBtn || !startBtn || !resetBtn || !speedSlider || !statusText) {
        setTimeout(initMergeSortNew, 500);
        return;
    }
    
    // 記錄合併排序的過程
    let mergeHistorySteps = [];
    
    generateBtn.addEventListener('click', generateMergeArray);
    startBtn.addEventListener('click', startMergeSort);
    resetBtn.addEventListener('click', resetMergeSort);
    
    function generateMergeArray() {
        resetMergeSort();
        mergeArray = getRandomArray();
        mergeArrayAux = [...mergeArray];
        renderMergeArray();
        
        // 安全地設置按鈕狀態
        if (startBtn) startBtn.disabled = false;
        if (resetBtn) resetBtn.disabled = false;
        
        if (statusText) statusText.textContent = '數組已生成，點擊「開始排序」按鈕開始';
        
        // 預先模擬合併排序過程，但不顯示結果
        mergeHistorySteps = simulateEntireMergeSort([...mergeArray]);
        
        // 初始化結構視圖，只顯示原始數組
        if (structureView) structureView.innerHTML = `<div class="initial-array">原始數組: [${mergeArray.join(', ')}]</div>`;
    }
    
    function renderMergeArray(highlights = [], merging = [], sorted = []) {
        if (!container) return; // 如果容器不存在，則跳過渲染
        
        container.innerHTML = '';
        
        if (!mergeArray || mergeArray.length === 0) return; // 數組為空則跳過
        
        const maxValue = Math.max(...mergeArray);
        
        mergeArray.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            
            // 設置高度和顯示值
            const height = (value / maxValue) * 200;
            bar.style.height = `${height}px`;
            bar.textContent = value;
            
            // 設置顏色
            if (merging.includes(index)) {
                bar.classList.add('swapping');
            } else if (highlights.includes(index)) {
                bar.classList.add('comparing');
            } else if (sorted.includes(index)) {
                bar.classList.add('sorted');
            }
            
            container.appendChild(bar);
        });
    }
    
    function updateStructureView() {
        // 安全檢查
        if (!structureView) return;
        
        // 清空當前結構視圖
        structureView.innerHTML = '';
        
        // 將分割和合併完全分開顯示
        createSplitMergeView();
        
        // 創建分割和合併兩部分展示
        function createSplitMergeView() {
            // 添加原始數組
            const initialArrayDiv = document.createElement('div');
            initialArrayDiv.className = 'initial-array';
            initialArrayDiv.textContent = `原始數組: [${mergeArray.join(', ')}]`;
            structureView.appendChild(initialArrayDiv);
            
            // 將步驟分為分割和合併兩部分
            const splitSteps = mergeHistorySteps.filter(step => step.type === 'split');
            const mergeSteps = mergeHistorySteps.filter(step => step.type === 'merge');
            
            // 分割部分
            if (splitSteps.length > 0) {
                const splitSection = document.createElement('div');
                splitSection.className = 'section-container';
                
                // 添加分割部分標題
                const splitTitle = document.createElement('div');
                splitTitle.className = 'section-title';
                splitTitle.textContent = '分割階段 (Divide)';
                splitSection.appendChild(splitTitle);
                
                // 按照層級分組顯示分割步驟
                const splitLevels = {};
                splitSteps.forEach(step => {
                    const level = step.level || 0;
                    if (!splitLevels[level]) splitLevels[level] = [];
                    splitLevels[level].push(step);
                });
                
                // 將分割步驟按照層級左右排列
                Object.keys(splitLevels).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
                    const levelContainer = document.createElement('div');
                    levelContainer.className = 'level-container';
                    levelContainer.setAttribute('data-level', level);
                    
                    // 為這個層級添加標識
                    const levelLabel = document.createElement('div');
                    levelLabel.className = 'level-label';
                    levelLabel.textContent = `層級 ${level}`;
                    levelContainer.appendChild(levelLabel);
                    
                    // 創建分割步驟容器
                    const stepsContainer = document.createElement('div');
                    stepsContainer.className = 'steps-container';
                    
                    // 添加這個層級的所有分割步驟
                    splitLevels[level].forEach(step => {
                        const stepElement = document.createElement('div');
                        stepElement.className = 'split-step';
                        
                        stepElement.innerHTML = `
                            <div class="array-item">[${step.array.join(', ')}]</div>
                            <div class="split-result">
                                <div class="array-item">[${step.left.join(', ')}]</div>
                                <div class="array-item">[${step.right.join(', ')}]</div>
                            </div>
                        `;
                        
                        stepsContainer.appendChild(stepElement);
                    });
                    
                    levelContainer.appendChild(stepsContainer);
                    splitSection.appendChild(levelContainer);
                });
                
                structureView.appendChild(splitSection);
            }
            
            // 合併部分
            if (mergeSteps.length > 0) {
                const mergeSection = document.createElement('div');
                mergeSection.className = 'section-container';
                
                // 添加合併部分標題
                const mergeTitle = document.createElement('div');
                mergeTitle.className = 'section-title';
                mergeTitle.textContent = '合併階段 (Conquer)';
                mergeSection.appendChild(mergeTitle);
                
                // 按照層級分組顯示合併步驟，從高層到低層
                const mergeLevels = {};
                mergeSteps.forEach(step => {
                    const level = step.level || 0;
                    if (!mergeLevels[level]) mergeLevels[level] = [];
                    mergeLevels[level].push(step);
                });
                
                // 將合併步驟按照層級從高到低排列，和分割相反
                const levelOrder = Object.keys(mergeLevels).sort((a, b) => parseInt(b) - parseInt(a));
                
                levelOrder.forEach(level => {
                    const levelContainer = document.createElement('div');
                    levelContainer.className = 'level-container';
                    levelContainer.setAttribute('data-level', level);
                    
                    // 為這個層級添加標識
                    const levelLabel = document.createElement('div');
                    levelLabel.className = 'level-label';
                    levelLabel.textContent = `層級 ${level}`;
                    levelContainer.appendChild(levelLabel);
                    
                    // 創建合併步驟容器
                    const stepsContainer = document.createElement('div');
                    stepsContainer.className = 'steps-container';
                    
                    // 添加這個層級的所有合併步驟
                    mergeLevels[level].forEach(step => {
                        const stepElement = document.createElement('div');
                        stepElement.className = 'merge-step';
                        
                        stepElement.innerHTML = `
                            <div class="merge-input">
                                <div class="array-item">[${step.left.join(', ')}]</div>
                                <div class="array-item">[${step.right.join(', ')}]</div>
                            </div>
                            <div class="merge-output">
                                <div class="array-item result">[${step.result.join(', ')}]</div>
                            </div>
                        `;
                        
                        stepsContainer.appendChild(stepElement);
                    });
                    
                    levelContainer.appendChild(stepsContainer);
                    mergeSection.appendChild(levelContainer);
                });
                
                structureView.appendChild(mergeSection);
            }
        }
    }
    
    async function mergeSortAlgorithm() {
        const speed = speedSlider ? 101 - speedSlider.value : 50; // 替代方案使用默認值
        const n = mergeArray.length;
        
        // 清空歷史記錄
        mergeHistorySteps = [];
        
        // 顯示分治過程
        await splitAndMerge(0, n - 1);
        
        // 排序完成
        if (statusText) statusText.textContent = `合併排序完成！最終數組: [${mergeArray.join(', ')}]`;
        renderMergeArray([], [], Array.from({ length: n }, (_, i) => i));
        mergeSortRunning = false;
        
        // 安全地啟用按鈕
        if (generateBtn) generateBtn.disabled = false;
        if (startBtn) startBtn.disabled = true;
        if (resetBtn) resetBtn.disabled = false;
        
        // 分割並合併子數組
        async function splitAndMerge(left, right) {
            if (left >= right) return [mergeArray[left]];
            
            const mid = Math.floor((left + right) / 2);
            
            // 可視化分割過程
            const currentArray = mergeArray.slice(left, right + 1);
            const leftPart = mergeArray.slice(left, mid + 1);
            const rightPart = mergeArray.slice(mid + 1, right + 1);
            
            // 添加分割步驟到歷史記錄
            mergeHistorySteps.push({
                type: 'split',
                array: currentArray,
                left: leftPart,
                right: rightPart
            });
            
            // 更新結構視圖
            updateStructureView();
            
            statusText.textContent = statusText ? `分割區間 [${left}...${right}] 為 [${left}...${mid}] 和 [${mid+1}...${right}]` : '';
            
            const highlightRange = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            renderMergeArray(highlightRange);
            
            await sleep(speed * 10);
            
            // 遞迴分割左右兩部分
            const leftSorted = await splitAndMerge(left, mid);
            const rightSorted = await splitAndMerge(mid + 1, right);
            
            // 合併兩個已排序的子數組
            const merged = await merge(left, mid, right, leftSorted, rightSorted);
            
            return merged;
        }
        
        // 合併兩個已排序的子數組
        async function merge(left, mid, right, leftSorted, rightSorted) {
            const leftPart = mergeArray.slice(left, mid + 1);
            const rightPart = mergeArray.slice(mid + 1, right + 1);
            
            if (statusText) statusText.textContent = `合併區間 [${left}...${mid}] 和 [${mid+1}...${right}]`;
            
            const mergingIndices = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            renderMergeArray([], mergingIndices);
            
            await sleep(speed * 10);
            
            // 使用輔助數組進行合併
            const aux = Array(right - left + 1);
            let i = 0, j = 0, k = 0;
            
            // 合併兩個子數組
            while (i < leftPart.length && j < rightPart.length) {
                if (leftPart[i] <= rightPart[j]) {
                    aux[k++] = leftPart[i++];
                } else {
                    aux[k++] = rightPart[j++];
                }
            }
            
            // 複製剩餘元素
            while (i < leftPart.length) {
                aux[k++] = leftPart[i++];
            }
            
            while (j < rightPart.length) {
                aux[k++] = rightPart[j++];
            }
            
            // 將結果複製回原數組
            for (let i = 0; i < aux.length; i++) {
                mergeArray[left + i] = aux[i];
            }
            
            // 添加合併步驟到歷史記錄
            mergeHistorySteps.push({
                type: 'merge',
                left: leftPart,
                right: rightPart,
                result: aux
            });
            
            // 更新結構視圖
            updateStructureView();
            
            // 可視化合併後的數組
            const sortedIndices = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            renderMergeArray([], [], sortedIndices);
            
            await sleep(speed * 10);
            
            return aux;
        }
    }
    
    function startMergeSort() {
        if (!mergeSortRunning) {
            mergeSortRunning = true;
            
            // 安全地禁用按鈕
            if (generateBtn) generateBtn.disabled = true;
            if (startBtn) startBtn.disabled = true;
            if (resetBtn) resetBtn.disabled = false;
            
            // 先預模擬合併排序過程，然後使用實際排序與顯示同步
            mergeHistorySteps = simulateEntireMergeSort([...mergeArray]);
            updateStructureView();
            
            // 實際執行排序
            executeSort();
        }
    }
    
    // 實際排序過程
    async function executeSort() {
        const n = mergeArray.length;
        const speed = speedSlider ? 101 - speedSlider.value : 50;
        
        // 創建輔助數組
        const aux = Array(n);
        
        // 開始排序
        await mergeSort(0, n - 1);
        
        // 排序完成
        if (statusText) statusText.textContent = `合併排序完成！最終數組: [${mergeArray.join(', ')}]`;
        renderMergeArray([], [], Array.from({ length: n }, (_, i) => i));
        
        // 安全地啟用按鈕
        if (generateBtn) generateBtn.disabled = false;
        if (startBtn) startBtn.disabled = true;
        if (resetBtn) resetBtn.disabled = false;
        
        mergeSortRunning = false;
        
        // 自上而下的合併排序
        async function mergeSort(low, high) {
            if (low >= high) return;
            
            const mid = Math.floor((low + high) / 2);
            
            // 顯示當前正在分割的部分
            const indices = Array.from({ length: high - low + 1 }, (_, i) => low + i);
            renderMergeArray(indices);
            if (statusText) statusText.textContent = `分割: [${low}...${high}]`;
            await sleep(speed * 5);
            
            // 遍歷左子數組
            await mergeSort(low, mid);
            
            // 遍歷右子數組
            await mergeSort(mid + 1, high);
            
            // 合併子數組
            await merge(low, mid, high);
        }
        
        // 合併兩個子數組
        async function merge(low, mid, high) {
            // 先複製到輔助數組
            for (let i = low; i <= high; i++) {
                aux[i] = mergeArray[i];
            }
            
            // 顯示合併過程
            const indices = Array.from({ length: high - low + 1 }, (_, i) => low + i);
            renderMergeArray([], indices);
            if (statusText) statusText.textContent = `合併: [${low}...${mid}] 和 [${mid+1}...${high}]`;
            await sleep(speed * 5);
            
            // 合併過程
            let i = low; // 左子數組索引
            let j = mid + 1; // 右子數組索引
            
            for (let k = low; k <= high; k++) {
                if (i > mid) {
                    // 左子數組用完
                    mergeArray[k] = aux[j++];
                } else if (j > high) {
                    // 右子數組用完
                    mergeArray[k] = aux[i++];
                } else if (aux[i] <= aux[j]) {
                    // 左子數組元素較小
                    mergeArray[k] = aux[i++];
                } else {
                    // 右子數組元素較小
                    mergeArray[k] = aux[j++];
                }
            }
            
            // 顯示合併後的數組
            renderMergeArray([], [], indices);
            await sleep(speed * 5);
        }
    }
    
    function resetMergeSort() {
        mergeSortRunning = false;
        mergeArray = [];
        mergeArrayAux = [];
        mergeHistorySteps = [];
        
        container.innerHTML = '';
        structureView.innerHTML = '';
        
        // 使用安全的方式設置按鈕狀態
        if (generateBtn) generateBtn.disabled = false;
        if (startBtn) startBtn.disabled = true;
        if (resetBtn) resetBtn.disabled = true;
        
        if (statusText) statusText.textContent = '請點擊「生成數組」按鈕開始';
    }
}

// 添加 CSS 樣式來優化結構視圖
function addMergeSortStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .merge-sort-tree {
            display: flex;
            flex-direction: column;
            gap: 30px;
            padding: 20px 10px;
            font-family: monospace;
            background-color: #FFF8DC; /* 添加跟圖片相似的背景色 */
        }
        
        .section-container {
            margin: 20px 0;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #ccc;
            padding-bottom: 8px;
        }
        
        .level-container {
            margin: 15px 0;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 5px;
        }
        
        .level-label {
            font-weight: bold;
            margin-bottom: 10px;
            color: #555;
            text-align: center;
        }
        
        .steps-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
        }
        
        .split-step, .merge-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            border-radius: 5px;
            background-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin: 5px;
        }
        
        .array-item {
            background-color: #FFE1E1; /* 粉紅色築塊 */
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 5px 10px;
            margin: 5px;
            font-size: 14px;
            font-family: monospace;
            min-width: 50px;
            text-align: center;
        }
        
        .array-item.result {
            background-color: #E1FFE1; /* 結果築塊為綠色 */
            font-weight: bold;
        }
        
        .split-result, .merge-input, .merge-output {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .initial-array {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 20px;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        /* 每個層級的數組項目都有不同的背景色 */
        .level-container[data-level="0"] .array-item {
            background-color: #FFE1E1;
        }
        
        .level-container[data-level="1"] .array-item {
            background-color: #E1FFFF;
        }
        
        .level-container[data-level="2"] .array-item {
            background-color: #E1E1FF;
        }
        
        .level-container[data-level="3"] .array-item {
            background-color: #FFE1FF;
        }
        
        /* 結構視圖的整體背景 */
        #merge-structure {
            background-color: #FFF8DC;
            border-radius: 8px;
            padding: 15px;
        }
    `;
    document.head.appendChild(style);
}

// 導出新的初始化函數
function applyNewMergeSort() {
    try {
        // 添加自定義樣式
        addMergeSortStyles();
        
        // 安全地設置初始化函數
        window.initMergeSort = initMergeSortNew;
        
        // 確保全局變數存在
        if (typeof mergeArray === 'undefined') mergeArray = [];
        if (typeof mergeArrayAux === 'undefined') mergeArrayAux = [];
        if (typeof mergeSortRunning === 'undefined') mergeSortRunning = false;
        
        // 等待短時間後才初始化，確保 DOM 元素可用
        setTimeout(() => {
            // 重新初始化合併排序的元素
            try {
                initMergeSortNew();
            } catch (e) {
                // 錯誤處理
            }
        }, 500); // 增加延遲確保 DOM 元素完全加載
    } catch (e) {
        // 錯誤處理
    }
}

// 綁定 DOMContentLoaded 事件，確保頁面完全加載後才執行
document.addEventListener('DOMContentLoaded', function() {
    // 在頁面加載後等待繼續執行，確保 sorting.js 中的函數先執行
    setTimeout(applyNewMergeSort, 100);
});