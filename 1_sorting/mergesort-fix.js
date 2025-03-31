// 修復合併排序暫停問題的完整程式碼
// 使用這個檔案來替換 sorting.js 中對應的 initMergeSort 函數

function fixedInitMergeSort() {
    const container = document.getElementById('merge-array');
    const structureView = document.getElementById('merge-structure');
    const generateBtn = document.getElementById('merge-generate');
    const startBtn = document.getElementById('merge-start');
    const pauseBtn = document.getElementById('merge-pause');
    const resetBtn = document.getElementById('merge-reset');
    const speedSlider = document.getElementById('merge-speed');
    const statusText = document.getElementById('merge-status');
    
    // 新增一個變數追蹤排序是否已完成
    let sortCompleted = false;
    
    generateBtn.addEventListener('click', generateMergeArray);
    startBtn.addEventListener('click', startMergeSort);
    pauseBtn.addEventListener('click', pauseMergeSort);
    resetBtn.addEventListener('click', resetMergeSort);
    
    function generateMergeArray() {
        resetMergeSort();
        mergeArray = getRandomArray();
        mergeArrayAux = [...mergeArray];
        renderMergeArray();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        statusText.textContent = '數組已生成，點擊「開始排序」按鈕開始';
        structureView.textContent = `原始數組: [${mergeArray.join(', ')}]`;
    }
    
    function renderMergeArray(highlights = [], merging = [], sorted = []) {
        container.innerHTML = '';
        
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
    
    function updateStructureView(message) {
        structureView.textContent = message;
    }
    
    // 修改後的合併排序算法
    async function mergeSortAlgorithm() {
        const speed = 101 - speedSlider.value;
        const aux = [...mergeArray];
        const n = mergeArray.length;
        
        // 開始排序前重置完成標記
        sortCompleted = false;
        
        try {
            // 顯示分治過程
            await splitAndMerge(0, n - 1);
            
            // 檢查是否完成整個排序過程（沒有被暫停中斷）
            if (!mergeSortPaused) {
                sortCompleted = true;
                statusText.textContent = `合併排序完成！最終數組: [${mergeArray.join(', ')}]`;
                updateStructureView(`排序完成: [${mergeArray.join(', ')}]`);
                renderMergeArray([], [], Array.from({ length: n }, (_, i) => i));
            }
        } catch (error) {
            console.error('排序過程中發生錯誤:', error);
        } finally {
            // 只有在排序真正完成且沒有被暫停時，才設置為非運行狀態
            if (sortCompleted && !mergeSortPaused) {
                mergeSortRunning = false;
            }
            
            // 不論排序是否完成，都確保按鈕狀態正確
            disableButtons('merge', mergeSortRunning);
        }
        
        // 分割並合併子數組
        async function splitAndMerge(left, right) {
            // 處理基本情況
            if (left >= right) return;
            
            // 檢查暫停狀態
            if (mergeSortPaused) {
                return; // 如果已暫停，直接返回不繼續執行
            }
            
            const mid = Math.floor((left + right) / 2);
            
            // 可視化分割過程
            const leftPart = mergeArray.slice(left, mid + 1);
            const rightPart = mergeArray.slice(mid + 1, right + 1);
            
            statusText.textContent = `分割區間 [${left}...${right}] 為 [${left}...${mid}] 和 [${mid+1}...${right}]`;
            
            const highlightRange = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            renderMergeArray(highlightRange);
            
            let structureMessage = `分割: [${mergeArray.slice(left, right + 1).join(', ')}]\n`;
            structureMessage += `左半部分: [${leftPart.join(', ')}]\n`;
            structureMessage += `右半部分: [${rightPart.join(', ')}]`;
            updateStructureView(structureMessage);
            
            await sleep(speed * 10);
            
            // 遞迴分割左右兩部分
            await splitAndMerge(left, mid);
            if (mergeSortPaused) return; // 再次檢查暫停狀態
            
            await splitAndMerge(mid + 1, right);
            if (mergeSortPaused) return; // 再次檢查暫停狀態
            
            // 合併兩個已排序的子數組
            await merge(left, mid, right);
        }
        
        // 合併兩個已排序的子數組
        async function merge(left, mid, right) {
            if (mergeSortPaused) {
                // 暫停時更新狀態但不返回，以維持目前進度的顯示
                updateStructureView(`合併過程已暂停於 [${left}...${right}] 區間`);
                return; // 暫停時不繼續執行
            }
            
            const leftPart = mergeArray.slice(left, mid + 1);
            const rightPart = mergeArray.slice(mid + 1, right + 1);
            
            // 更新狀態文字和結構視圖前檢查暫停狀態
            if (!mergeSortPaused) {
                statusText.textContent = `合併區間 [${left}...${mid}] 和 [${mid+1}...${right}]`;
                
                let structureMessage = `合併: \n`;
                structureMessage += `左半部分: [${leftPart.join(', ')}]\n`;
                structureMessage += `右半部分: [${rightPart.join(', ')}]\n`;
                updateStructureView(structureMessage);
            }
            
            let i = left;
            let j = mid + 1;
            let k = left;
            
            const mergingIndices = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            if (!mergeSortPaused) {
                renderMergeArray([], mergingIndices);
                await sleep(speed * 10);
            }
            
            while (i <= mid && j <= right) {
                if (mergeSortPaused) {
                    // 暫停狀態下更新顯示但不修改數據
                    updateStructureView(`合併過程已暂停於比較階段`);
                    return;
                }
                
                statusText.textContent = `比較: ${mergeArray[i]} 和 ${mergeArray[j]}`;
                renderMergeArray([i, j], mergingIndices);
                await sleep(speed * 10);
                
                if (mergeArray[i] <= mergeArray[j]) {
                    aux[k] = mergeArray[i];
                    i++;
                } else {
                    aux[k] = mergeArray[j];
                    j++;
                }
                k++;
                
                // 更新當前合併狀態
                let structureMessage = `合併中: [${aux.slice(left, k).join(', ')}]`;
                updateStructureView(structureMessage);
            }
            
            // 複製剩餘元素
            while (i <= mid) {
                if (mergeSortPaused) {
                    // 暫停時更新顯示但不繼續執行
                    updateStructureView(`合併過程已暂停於複製左部分時`);
                    return;
                }
                
                aux[k] = mergeArray[i];
                i++;
                k++;
                
                let structureMessage = `合併中: [${aux.slice(left, k).join(', ')}]`;
                updateStructureView(structureMessage);
            }
            
            while (j <= right) {
                if (mergeSortPaused) {
                    // 暫停時更新顯示但不繼續執行
                    updateStructureView(`合併過程已暂停於複製右部分時`);
                    return;
                }
                
                aux[k] = mergeArray[j];
                j++;
                k++;
                
                let structureMessage = `合併中: [${aux.slice(left, k).join(', ')}]`;
                updateStructureView(structureMessage);
            }
            
            // 將合併結果複製回原數組
            for (let m = left; m <= right; m++) {
                if (mergeSortPaused) {
                    // 暫停時更新顯示但不繼續執行
                    updateStructureView(`合併過程已暂停於複製結果時`);
                    return;
                }
                
                mergeArray[m] = aux[m];
            }
            
            // 顯示合併後的結果
            let structureMessage = `合併完成: [${mergeArray.slice(left, right + 1).join(', ')}]`;
            updateStructureView(structureMessage);
            
            const sortedIndices = Array.from({ length: right - left + 1 }, (_, i) => left + i);
            renderMergeArray([], [], sortedIndices);
            await sleep(speed * 10);
        }
    }
    
    function startMergeSort() {
        if (!mergeSortRunning) {
            mergeSortRunning = true;
            mergeSortPaused = false;
            sortCompleted = false; // 重置完成標記
            disableButtons('merge', true);
            mergeSortAlgorithm();
        } else if (mergeSortPaused) {
            mergeSortPaused = false;
            disableButtons('merge', true);
            mergeSortAlgorithm();
        }
    }
    
    function pauseMergeSort() {
        mergeSortPaused = true;
        // 不覆蓋原狀態文字，只在文字後面添加暫停提示
        statusText.textContent = statusText.textContent + ' (已暫停)';
        disableButtons('merge', false);
    }
    
    function resetMergeSort() {
        if (mergeSortRunning) {
            mergeSortPaused = true;
            mergeSortRunning = false;
        }
        sortCompleted = false; // 重置完成標記
        mergeArray = [];
        mergeArrayAux = [];
        container.innerHTML = '';
        structureView.textContent = '';
        disableButtons('merge', false, true);
        document.getElementById('merge-start').disabled = true;
        document.getElementById('merge-reset').disabled = true;
        statusText.textContent = '請點擊「生成數組」按鈕開始';
    }
}