// 快速排序的樹狀視覺化實現 - 使用 IIFE 避免變數衝突
(function() {
    // 所有變數都封裝在此函數範圍內，不會污染全局命名空間
    let qsSteps = []; // 記錄排序過程的每一步
    let qsDivideHistory = []; // 記錄分治過程的歷史
    let qsCurrentStep = 0; // 當前步驟索引
    let qsIsRunning = false; // 排序是否正在運行
    let qsIsPaused = false; // 排序是否暫停
    let qsMaxDepth = 0; // 遞迴的最大深度

    // 初始化快速排序視覺化
    function initQuickSort() {
        // 檢查元素是否存在
        const container = document.getElementById('quick-array');
        const structureView = document.getElementById('quick-structure');
        const statusText = document.getElementById('quick-status');
        const generateBtn = document.getElementById('quick-generate');
        const startBtn = document.getElementById('quick-start');
        const pauseBtn = document.getElementById('quick-pause');
        const resetBtn = document.getElementById('quick-reset');
        const speedSlider = document.getElementById('quick-speed');
        
        if (!container || !statusText || !generateBtn || !startBtn || !pauseBtn || !resetBtn || !speedSlider || !structureView) {
            console.error('無法找到快速排序所需的元素');
            return;
        }
        
        // 保存原始按鈕事件
        const originalGenerateClick = generateBtn.onclick;
        const originalStartClick = startBtn.onclick;
        const originalPauseClick = pauseBtn.onclick;
        const originalResetClick = resetBtn.onclick;
        
        // 更新事件監聽器
        generateBtn.onclick = function(e) {
            // 調用原始事件處理器
            if (originalGenerateClick) {
                originalGenerateClick.call(this, e);
            }
            
            // 等待一小段時間後執行我們的代碼
            setTimeout(() => {
                if (window.quickArray && window.quickArray.length > 0) {
                    simulateAndRenderInitial();
                }
            }, 100);
        };
        
        startBtn.onclick = function(e) {
            // 先調用原始事件處理器
            if (originalStartClick) {
                originalStartClick.call(this, e);
            }
            
            // 等待一小段時間後執行我們的代碼
            setTimeout(() => {
                if (qsIsPaused) {
                    qsIsPaused = false;
                    continueVisualization();
                } else if (!qsIsRunning) {
                    qsIsRunning = true;
                    startVisualization();
                }
            }, 100);
        };
        
        pauseBtn.onclick = function(e) {
            // 先調用原始事件處理器
            if (originalPauseClick) {
                originalPauseClick.call(this, e);
            }
            
            qsIsPaused = true;
        };
        
        resetBtn.onclick = function(e) {
            // 先調用原始事件處理器
            if (originalResetClick) {
                originalResetClick.call(this, e);
            }
            
            qsIsRunning = false;
            qsIsPaused = false;
            qsCurrentStep = 0;
            qsSteps = [];
            qsDivideHistory = [];
            qsMaxDepth = 0;
            
            // 清空結構視圖
            structureView.innerHTML = '';
        };
        
        // 添加自定義樣式
        addQuickSortStyles();
        
        // 模擬排序並渲染初始狀態
        function simulateAndRenderInitial() {
            try {
                console.log("初始化快速排序視覺化");
                
                // 清空舊數據
                qsSteps = [];
                qsDivideHistory = [];
                qsMaxDepth = 0;
                
                // 清空結構視圖
                const structureView = document.getElementById('quick-structure');
                if (structureView) {
                    structureView.innerHTML = '<div style="text-align: center; padding: 20px;">模擬中，請稍候...</div>';
                    // 確保它可見
                    structureView.style.display = 'block';
                    structureView.style.border = '2px solid #222';
                    structureView.style.backgroundColor = '#fff';
                    structureView.style.minHeight = '200px';
                    structureView.style.padding = '15px';
                    structureView.style.marginTop = '20px';
                }
                
                // 模擬排序過程
                const arrayCopy = [...window.quickArray];
                console.log('開始模擬快速排序:', arrayCopy);
                simulateQuickSort(arrayCopy, 0, arrayCopy.length - 1, 0);
                
                console.log("模擬完成，步驟數量:", qsSteps.length);
                console.log("分治層數:", qsMaxDepth);
                console.log("分治歷史:", qsDivideHistory);
                
                // 獲取結構視圖元素
                const quickStructure = document.getElementById('quick-structure');
                console.log('結構視圖元素:', quickStructure);
                
                // 更新狀態文字
                const statusText = document.getElementById('quick-status');
                if (statusText) {
                    statusText.textContent = '模擬完成，分治過程已視覺化，點擊「開始排序」以動畫方式觀看排序過程';
                }
                
                // 初始化樹狀結構視圖
                setTimeout(() => {
                    // 檢查分治歷史是否為空
                    if (qsDivideHistory.length === 0) {
                        console.error('分治歷史為空，無法渲染分區視覺化');
                        if (structureView) {
                            structureView.innerHTML = '<div style="color: red; padding: 20px;">錯誤: 未經準備分區歷史資料</div>';
                        }
                        return;
                    }
                    
                    renderDivideSteps();
                }, 100);
            } catch (e) {
                console.error('模擬排序過程時發生錯誤:', e);
                
                // 顯示錯誤信息
                const structureView = document.getElementById('quick-structure');
                if (structureView) {
                    structureView.innerHTML = `<div style="color: red; padding: 20px;">發生錯誤: ${e.message}</div>`;
                    structureView.style.display = 'block';
                }
            }
        }
        
        // 開始可視化排序過程
        function startVisualization() {
            qsCurrentStep = 0;
            visualizeQuickSort(0);
        }
        
        // 繼續可視化排序過程
        function continueVisualization() {
            visualizeQuickSort(qsCurrentStep);
        }
    }
    
    // 模擬快速排序過程，記錄每一步
    function simulateQuickSort(array, low, high, depth) {
        // 更新最大深度
        qsMaxDepth = Math.max(qsMaxDepth, depth);
        
        // 記錄當前分區
        const currentSubarray = array.slice(low, high + 1);
        qsDivideHistory.push({
            array: [...currentSubarray],
            low: low,
            high: high,
            depth: depth,
            completed: false
        });
        
        console.log(`模擬快速排序: low=${low}, high=${high}, depth=${depth}`);
        console.log('當前子數組:', currentSubarray);
        
        if (low < high) {
            // 選擇基準並進行分區
            const pivotIndex = partitionSimulation(array, low, high, depth);
            console.log(`分區完成: pivotIndex=${pivotIndex}, 值=${array[pivotIndex]}`);
            
            // 標記當前分區為已完成
            const currentIndex = qsDivideHistory.findIndex(d => 
                d.low === low && d.high === high && d.depth === depth && !d.completed);
            if (currentIndex !== -1) {
                qsDivideHistory[currentIndex].completed = true;
                qsDivideHistory[currentIndex].pivotIndex = pivotIndex;
                qsDivideHistory[currentIndex].pivotValue = array[pivotIndex];
            }
            
            // 過濴分治歷史，移除重複項
            qsDivideHistory = qsDivideHistory.filter((item, index, self) => 
                index === self.findIndex(t => (
                    t.low === item.low && 
                    t.high === item.high && 
                    t.depth === item.depth
                )));
            
            // 遞迴處理左右兩個部分
            simulateQuickSort(array, low, pivotIndex - 1, depth + 1);
            simulateQuickSort(array, pivotIndex + 1, high, depth + 1);
        } else if (low === high) {
            // 單個元素已經排序，標記為已完成
            const currentIndex = qsDivideHistory.findIndex(d => 
                d.low === low && d.high === high && d.depth === depth && !d.completed);
            if (currentIndex !== -1) {
                qsDivideHistory[currentIndex].completed = true;
                qsDivideHistory[currentIndex].isSingleElement = true;
            }
        }
    }
    
    // 模擬分區過程
    function partitionSimulation(array, low, high, depth) {
        // 選擇基準（最右邊的元素）
        const pivot = array[high];
        
        // 記錄選擇基準的步驟
        qsSteps.push({
            type: 'select-pivot',
            pivotIndex: high,
            pivotValue: pivot,
            array: [...array],
            low: low,
            high: high,
            depth: depth,
            message: `選擇基準元素: ${pivot} (位置: ${high})`
        });
        
        let i = low - 1;
        
        // 遍歷並比較元素
        for (let j = low; j < high; j++) {
            // 記錄比較步驟
            qsSteps.push({
                type: 'compare',
                pivotIndex: high,
                comparing: j,
                i: i,
                array: [...array],
                low: low,
                high: high,
                depth: depth,
                message: `比較元素 ${array[j]} 與基準 ${pivot}`
            });
            
            if (array[j] <= pivot) {
                i++;
                
                // 記錄交換步驟 (如果需要)
                if (i !== j) {
                    qsSteps.push({
                        type: 'swap',
                        pivotIndex: high,
                        swapping: [i, j],
                        array: [...array],
                        low: low,
                        high: high,
                        depth: depth,
                        message: `交換元素 ${array[i]} 和 ${array[j]}`
                    });
                }
                
                // 實際交換元素
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        
        // 最後一步：將基準元素放到正確位置
        const pivotFinalPos = i + 1;
        
        qsSteps.push({
            type: 'swap-pivot',
            pivotIndex: high,
            newPivotPos: pivotFinalPos,
            array: [...array],
            low: low,
            high: high,
            depth: depth,
            message: `將基準元素 ${pivot} 放到最終位置 ${pivotFinalPos}`
        });
        
        // 實際交換基準元素
        [array[pivotFinalPos], array[high]] = [array[high], array[pivotFinalPos]];
        
        // 記錄分區完成後的數組狀態
        qsSteps.push({
            type: 'partition-done',
            pivotIndex: pivotFinalPos,
            array: [...array],
            low: low,
            high: high,
            depth: depth,
            message: `分區完成: 基準 ${array[pivotFinalPos]} 的左側元素都小於等於它，右側元素都大於它`
        });
        
        return pivotFinalPos;
    }
    
    // 視覺化排序過程
    async function visualizeQuickSort(startStep) {
        const speedSlider = document.getElementById('quick-speed');
        const speed = speedSlider ? (101 - speedSlider.value) : 50;
        
        for (let i = startStep; i < qsSteps.length; i++) {
            if (qsIsPaused) {
                qsCurrentStep = i;
                return;
            }
            
            const step = qsSteps[i];
            const statusText = document.getElementById('quick-status');
            if (statusText) {
                statusText.textContent = step.message || '';
            }
            
            // 調用原始排序的渲染函數
            try {
                if (window.renderQuickArray) {
                    switch (step.type) {
                        case 'select-pivot':
                            window.renderQuickArray([], [], step.pivotIndex, []);
                            break;
                            
                        case 'compare':
                            window.renderQuickArray([step.comparing], [], step.pivotIndex, []);
                            break;
                            
                        case 'swap':
                            window.renderQuickArray([], step.swapping, step.pivotIndex, []);
                            break;
                            
                        case 'swap-pivot':
                            window.renderQuickArray([], [step.newPivotPos, step.pivotIndex], step.pivotIndex, []);
                            break;
                            
                        case 'partition-done':
                            const sortedIndices = getSortedIndices(i);
                            window.renderQuickArray([], [], step.pivotIndex, sortedIndices);
                            // 更新樹狀結構
                            highlightCurrentStep(step);
                            break;
                    }
                }
            } catch (e) {
                console.log('原始渲染函數調用失敗:', e);
            }
            
            // 延遲顯示
            await sleep(speed * 10);
        }
        
        // 排序完成
        if (!qsIsPaused) {
            const statusText = document.getElementById('quick-status');
            if (statusText) {
                statusText.textContent = '快速排序完成！';
            }
            
            try {
                if (window.renderQuickArray && window.quickArray) {
                    window.renderQuickArray([], [], -1, Array.from({ length: window.quickArray.length }, (_, i) => i));
                }
            } catch (e) {
                console.log('最終渲染調用失敗:', e);
            }
            
            qsIsRunning = false;
        }
    }
    
    // 獲取目前已排序的元素索引
    function getSortedIndices(currentStep) {
        const sortedSet = new Set();
        
        // 檢查所有已完成的分區步驟
        for (let i = 0; i <= currentStep; i++) {
            const step = qsSteps[i];
            if (step.type === 'partition-done') {
                sortedSet.add(step.pivotIndex);
            }
        }
        
        return Array.from(sortedSet);
    }
    
    // 高亮度當前步驟
    function highlightCurrentStep(step) {
        const structureView = document.getElementById('quick-structure');
        if (!structureView) return;
        
        // 移除所有高亮
        const allSubarrays = structureView.querySelectorAll('.subarray');
        allSubarrays.forEach(elem => {
            elem.classList.remove('current-step');
            elem.classList.remove('left-partition');
            elem.classList.remove('right-partition');
        });
        
        // 高亮當前分區
        const currentSubarray = structureView.querySelector(`.depth-${step.depth}[data-low="${step.low}"][data-high="${step.high}"]`);
        if (currentSubarray) {
            currentSubarray.classList.add('current-step');
            
            // 高亮左右分區
            const pivotIndex = step.pivotIndex;
            const leftPartition = structureView.querySelector(`.depth-${step.depth + 1}[data-low="${step.low}"][data-high="${pivotIndex - 1}"]`);
            const rightPartition = structureView.querySelector(`.depth-${step.depth + 1}[data-low="${pivotIndex + 1}"][data-high="${step.high}"]`);
            
            if (leftPartition) {
                leftPartition.classList.add('left-partition');
            }
            
            if (rightPartition) {
                rightPartition.classList.add('right-partition');
            }
        }
    }
    
    // 渲染分治步驟
    function renderDivideSteps() {
        const structureView = document.getElementById('quick-structure');
        if (!structureView) {
            console.error('找不到 quick-structure 元素');
            return;
        }
        
        // 清空容器
        structureView.innerHTML = '';
        
        // 强制顯示元素
        structureView.style.display = 'block';
        structureView.style.minHeight = '200px';
        structureView.style.border = '2px solid #222';
        structureView.style.backgroundColor = '#fff';
        structureView.style.margin = '20px 0';
        structureView.style.padding = '20px';
        structureView.style.overflow = 'auto';
        
        // 創建分治過程標題
        const divideTitle = document.createElement('h3');
        divideTitle.textContent = '分治過程 (Divide & Conquer)';
        divideTitle.className = 'divide-title';
        divideTitle.style.fontSize = '1.5em';
        divideTitle.style.marginBottom = '15px';
        divideTitle.style.textAlign = 'center';
        divideTitle.style.color = '#2c3e50';
        structureView.appendChild(divideTitle);
        
        // 創建水平分隔線
        const divider = document.createElement('hr');
        structureView.appendChild(divider);
        
        console.log("最大深度:", qsMaxDepth);
        console.log("分治歷史:", qsDivideHistory);
        
        // 為每個深度創建一個容器
        for (let depth = 0; depth <= qsMaxDepth; depth++) {
            const depthContainer = document.createElement('div');
            depthContainer.className = 'depth-container';
            depthContainer.style.margin = '40px 0';
            depthContainer.style.position = 'relative';
            depthContainer.style.border = '1px solid #e0e0e0';
            depthContainer.style.borderRadius = '8px';
            depthContainer.style.padding = '20px';
            depthContainer.style.backgroundColor = '#fafafa';
            
            // 添加深度標籤
            const depthLabel = document.createElement('div');
            depthLabel.className = 'depth-label';
            depthLabel.textContent = `層級 ${depth}`;
            depthLabel.style.textAlign = 'center';
            depthLabel.style.fontWeight = 'bold';
            depthLabel.style.margin = '0 0 15px 0';
            depthLabel.style.padding = '8px';
            depthLabel.style.backgroundColor = '#f5f5f5';
            depthLabel.style.color = '#333';
            depthLabel.style.borderRadius = '4px';
            depthLabel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            depthLabel.style.fontSize = '16px';
            depthContainer.appendChild(depthLabel);
            
            // 獲取此深度的所有子數組
            const subarraysAtDepth = qsDivideHistory.filter(d => d.depth === depth);
            
            console.log(`深度 ${depth} 的子數組:`, subarraysAtDepth);
            
            // 創建子數組的容器
            const subarraysContainer = document.createElement('div');
            subarraysContainer.className = 'subarrays-container';
            subarraysContainer.style.display = 'flex';
            subarraysContainer.style.flexWrap = 'wrap';
            subarraysContainer.style.justifyContent = 'center';
            subarraysContainer.style.gap = '15px';
            subarraysContainer.style.margin = '15px 0';
            
            // 按照 low 值排序子數組
            const sortedSubarrays = [...subarraysAtDepth].sort((a, b) => a.low - b.low);
            
            // 添加每個子數組
            sortedSubarrays.forEach(subarray => {
                const subarrayElem = document.createElement('div');
                subarrayElem.className = `subarray depth-${depth}`;
                subarrayElem.setAttribute('data-low', subarray.low);
                subarrayElem.setAttribute('data-high', subarray.high);
                subarrayElem.style.padding = '10px';
                subarrayElem.style.margin = '10px';
                subarrayElem.style.borderRadius = '5px';
                subarrayElem.style.position = 'relative';
                subarrayElem.style.minWidth = '100px';
                subarrayElem.style.transition = 'all 0.3s ease';
                
                // 設置顏色
                if (depth === 0) {
                    subarrayElem.classList.add('root-subarray');
                    subarrayElem.style.backgroundColor = '#f8f9fa';
                    subarrayElem.style.border = '2px solid #e9ecef';
                } else if (subarray.isSingleElement) {
                    subarrayElem.classList.add('single-element');
                    subarrayElem.style.backgroundColor = '#f1f3f5';
                    subarrayElem.style.border = '2px solid #dee2e6';
                } else if (subarray.completed) {
                    subarrayElem.classList.add('completed-subarray');
                    subarrayElem.style.backgroundColor = '#e9ecef';
                    subarrayElem.style.border = '2px solid #ced4da';
                } else {
                    subarrayElem.classList.add('pending-subarray');
                    subarrayElem.style.backgroundColor = '#f8f9fa';
                    subarrayElem.style.border = '2px solid #e9ecef';
                }
                
                // 創建數組內容
                const arrayContent = document.createElement('div');
                arrayContent.className = 'array-content';
                arrayContent.textContent = `[${subarray.array.join(', ')}]`;
                arrayContent.style.fontFamily = 'monospace';
                arrayContent.style.fontSize = '14px';
                arrayContent.style.whiteSpace = 'nowrap';
                arrayContent.style.overflowX = 'auto';
                arrayContent.style.padding = '8px';
                arrayContent.style.backgroundColor = 'rgba(255,255,255,0.7)';
                arrayContent.style.borderRadius = '4px';
                arrayContent.style.textAlign = 'center';
                arrayContent.style.marginTop = '5px';
                arrayContent.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                
                // 如果有基準元素，添加基準標記
                if (subarray.pivotValue !== undefined) {
                    const pivotMark = document.createElement('div');
                    pivotMark.className = 'pivot-mark';
                    pivotMark.innerHTML = `&uarr;<br>基準: ${subarray.pivotValue}`;
                    pivotMark.style.position = 'absolute';
                    pivotMark.style.bottom = '-28px';
                    pivotMark.style.transform = 'translateX(-50%)';
                    pivotMark.style.fontSize = '12px';
                    pivotMark.style.color = '#222';
                    pivotMark.style.fontWeight = 'bold';
                    pivotMark.style.textAlign = 'center';
                    pivotMark.style.lineHeight = '1.2';
                    pivotMark.style.backgroundColor = 'rgba(255,255,255,0.9)';
                    pivotMark.style.padding = '2px 5px';
                    pivotMark.style.borderRadius = '3px';
                    pivotMark.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                    
                    // 計算基準位置
                    const pivotRelativePosition = subarray.pivotIndex - subarray.low;
                    const elementWidth = 100 / subarray.array.length;
                    pivotMark.style.left = `${pivotRelativePosition * elementWidth + elementWidth / 2}%`;
                    
                    subarrayElem.appendChild(pivotMark);
                }
                
                subarrayElem.appendChild(arrayContent);
                subarraysContainer.appendChild(subarrayElem);
            });
            
            depthContainer.appendChild(subarraysContainer);
            structureView.appendChild(depthContainer);
        }
        
        // 顯示結構視圖
        structureView.style.display = 'block';
    }
    
    // 延遲函數 - 返回一個Promise，在指定毫秒後解析
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // 添加自定義樣式
    function addQuickSortStyles() {
        // 檢查樣式是否已經存在
        if (document.getElementById('quick-sort-tree-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'quick-sort-tree-styles';
        style.textContent = `
            .divide-title {
                text-align: center;
                margin: 15px 0 5px;
                color: #333;
            }
            
            .depth-container {
                margin: 30px 0;
                position: relative;
            }
            
            .depth-label {
                text-align: center;
                font-weight: bold;
                margin-bottom: 10px;
                color: #555;
            }
            
            .subarrays-container {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .subarray {
                padding: 10px;
                border-radius: 5px;
                position: relative;
                margin-top: 15px;
                transition: all 0.3s ease;
            }
            
            .array-content {
                font-family: monospace;
                font-size: 14px;
                white-space: nowrap;
                overflow: auto;
                max-width: 100%;
                padding: 5px;
            }
            
            .root-subarray {
                background-color: #ffebee;
                border: 1px solid #ffcdd2;
            }
            
            .completed-subarray {
                background-color: #e8f5e9;
                border: 1px solid #c8e6c9;
            }
            
            .pending-subarray {
                background-color: #e3f2fd;
                border: 1px solid #bbdefb;
            }
            
            .single-element {
                background-color: #f3e5f5;
                border: 1px solid #e1bee7;
            }
            
            .pivot-mark {
                position: absolute;
                bottom: -25px;
                transform: translateX(-50%);
                font-size: 12px;
                color: #222;
                text-align: center;
                line-height: 1.2;
            }
            
            .current-step {
                box-shadow: 0 0 8px #222;
                border-color: #222;
                z-index: 10;
                transform: scale(1.05);
            }
            
            .left-partition {
                box-shadow: 0 0 5px #444;
                border-color: #444;
            }
            
            .right-partition {
                box-shadow: 0 0 5px #666;
                border-color: #666;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 當文件加載完成後，初始化快速排序視覺化
    document.addEventListener('DOMContentLoaded', function() {
        // 等待頁面完全加載後執行
        setTimeout(() => {
            try {
                console.log("初始化樹狀快速排序視覺化");
                
                // 首先添加樣式
                addQuickSortStyles();
                
                // 檢查快速排序區塊是否存在
                const quickTab = document.querySelector('.tab[data-tab="quick"]');
                if (quickTab) {
                    // 確保 quick-structure 存在
                    let structureView = document.getElementById('quick-structure');
                    if (!structureView) {
                        const quickContent = document.getElementById('quick');
                        if (quickContent) {
                            console.log("创建 quick-structure 元素");
                            
                            // 創建結構視圖容器
                            structureView = document.createElement('div');
                            structureView.id = 'quick-structure';
                            structureView.className = 'structure-view';
                            structureView.style.display = 'block';
                            structureView.innerHTML = '<div style="text-align: center; padding: 20px;">生成數組後，這裡將顯示快速排序的分治過程</div>';
                            
                            // 找到控制區塊
                            const controlsContainer = quickContent.querySelector('.controls');
                            if (controlsContainer) {
                                // 將結構視圖放在控制區塊前面
                                quickContent.insertBefore(structureView, controlsContainer);
                            } else {
                                // 假如找不到控制區，就加到內容尾部
                                quickContent.appendChild(structureView);
                            }
                        }
                    }
                }
                
                // 初始化快速排序
                initQuickSort();
                
            } catch (e) {
                console.error('初始化樹狀快速排序視覺化失敗:', e);
            }
        }, 1000); // 增加等待時間，確保頁面元素加載完成
    });
})(); // 立即執行函數結束