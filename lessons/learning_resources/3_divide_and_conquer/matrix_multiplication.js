// ----- 矩陣乘法 -----
let matrixA = [];
let matrixB = [];
let resultMatrix = [];
let matrixRunning = false;
let matrixPaused = false;
let matrixAnimationSteps = [];
let currentAnimationStep = 0;

function initMatrixMultiplication() {
    const container = document.getElementById('matrix-container');
    const generateBtn = document.getElementById('matrix-generate');
    const sizeSelect = document.getElementById('matrix-size');
    const methodSelect = document.getElementById('matrix-method');
    const startBtn = document.getElementById('matrix-start');
    const pauseBtn = document.getElementById('matrix-pause');
    const resetBtn = document.getElementById('matrix-reset');
    const speedSlider = document.getElementById('matrix-speed');
    const structureView = document.getElementById('matrix-structure');
    const statusText = document.getElementById('matrix-status');
    
    // 初始化事件監聽器
    generateBtn.addEventListener('click', generateMatrices);
    startBtn.addEventListener('click', startMatrixMultiplication);
    pauseBtn.addEventListener('click', pauseMatrixMultiplication);
    resetBtn.addEventListener('click', resetMatrixMultiplication);
    
    // 監聽矩陣大小變化
    sizeSelect.addEventListener('change', () => {
        // 當選擇非方陣時，自動切換到標準算法
        if (sizeSelect.value.includes('x')) {
            methodSelect.value = 'standard';
        }
    });
    
    // 監聽方法變化
    methodSelect.addEventListener('change', () => {
        // 當選擇 Strassen 算法但矩陣不是方陣時，顯示提示
        if (methodSelect.value === 'strassen' && sizeSelect.value.includes('x')) {
            statusText.textContent = 'Strassen 算法只支援方陣，請選擇方陣或使用標準算法';
        }
    });
    
    function generateMatrices() {
        resetMatrixMultiplication();
        
        // 讀取矩陣大小
        const sizeValue = sizeSelect.value;
        let rowsA, colsA, rowsB, colsB;
        
        // 解析所選大小
        if (sizeValue === "2x3_3x2") {
            rowsA = 2; colsA = 3;
            rowsB = 3; colsB = 2;
        } else if (sizeValue === "3x4_4x2") {
            rowsA = 3; colsA = 4;
            rowsB = 4; colsB = 2;
        } else if (sizeValue === "4x3_3x2") {
            rowsA = 4; colsA = 3;
            rowsB = 3; colsB = 2;
        } else {
            // 預設為方陣
            const size = parseInt(sizeValue);
            rowsA = colsA = rowsB = colsB = size;
        }
        
        // 生成隨機矩陣 A 和 B
        matrixA = Array(rowsA).fill().map(() => Array(colsA).fill().map(() => Math.floor(Math.random() * 10)));
        matrixB = Array(rowsB).fill().map(() => Array(colsB).fill().map(() => Math.floor(Math.random() * 10)));
        
        // 初始化結果矩陣 (A的行數 x B的列數)
        resultMatrix = Array(rowsA).fill().map(() => Array(colsB).fill(0));
        
        renderMatrices();
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        statusText.textContent = '矩陣已生成，點擊「開始計算」按鈕開始乘法運算';
        structureView.textContent = `矩陣 A (${rowsA}x${colsA}):\n${matrixToString(matrixA)}\n\n矩陣 B (${rowsB}x${colsB}):\n${matrixToString(matrixB)}`;
    }
    
    function renderMatrices() {
        container.innerHTML = '';
        
        // 創建矩陣 A 的顯示
        const matrixAContainer = document.createElement('div');
        matrixAContainer.className = 'matrix-display';
        matrixAContainer.id = 'matrix-a-container';
        matrixAContainer.innerHTML = '<h3>矩陣 A</h3>';
        
        const tableA = createMatrixTable(matrixA, 'A');
        matrixAContainer.appendChild(tableA);
        
        // 創建矩陣 B 的顯示
        const matrixBContainer = document.createElement('div');
        matrixBContainer.className = 'matrix-display';
        matrixBContainer.id = 'matrix-b-container';
        matrixBContainer.innerHTML = '<h3>矩陣 B</h3>';
        
        const tableB = createMatrixTable(matrixB, 'B');
        matrixBContainer.appendChild(tableB);
        
        // 創建結果矩陣 C 的顯示
        const matrixCContainer = document.createElement('div');
        matrixCContainer.className = 'matrix-display';
        matrixCContainer.id = 'matrix-c-container';
        matrixCContainer.innerHTML = '<h3>結果矩陣 C</h3>';
        
        const tableC = createMatrixTable(resultMatrix, 'C');
        matrixCContainer.appendChild(tableC);
        
        // 添加到容器
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.overflow = 'auto';
        container.appendChild(matrixAContainer);
        container.appendChild(document.createTextNode('×'));
        container.appendChild(matrixBContainer);
        container.appendChild(document.createTextNode('='));
        container.appendChild(matrixCContainer);
    }
    
    function createMatrixTable(matrix, matrixName) {
        const table = document.createElement('table');
        table.className = 'matrix-table';
        table.id = `matrix-${matrixName.toLowerCase()}-table`;
        
        for (let i = 0; i < matrix.length; i++) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < matrix[i].length; j++) {
                const cell = document.createElement('td');
                cell.textContent = matrix[i][j];
                cell.id = `matrix-${matrixName.toLowerCase()}-cell-${i}-${j}`;
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.matrix = matrixName;
                row.appendChild(cell);
            }
            
            table.appendChild(row);
        }
        
        return table;
    }
    
    function matrixToString(matrix) {
        return matrix.map(row => row.join('\t')).join('\n');
    }
    
    async function startMatrixMultiplication() {
        if (matrixRunning && matrixPaused) {
            matrixPaused = false;
            continueAnimation();
            return;
        }
        
        if (matrixRunning) return;
        
        matrixRunning = true;
        matrixPaused = false;
        disableButtons('matrix', true);
        
        // 重置結果矩陣
        const size = matrixA.length;
        resultMatrix = Array(size).fill().map(() => Array(size).fill(0));
        renderMatrices();
        
        // 準備動畫步驟
        matrixAnimationSteps = [];
        currentAnimationStep = 0;
        
        // 選擇算法
        const method = methodSelect.value;
        if (method === 'standard') {
            prepareStandardMultiplicationAnimation();
        } else if (method === 'strassen') {
            await prepareStrassenMultiplicationAnimation();
        }
        
        // 開始動畫
        statusText.textContent = '正在執行矩陣乘法...';
        await playAnimation();
    }
    
    function prepareStandardMultiplicationAnimation() {
        const rowsA = matrixA.length;
        const colsB = matrixB[0].length;
        const colsA = matrixA[0].length; // 同時等於 rowsB
        
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                // 開始計算 C[i][j]
                matrixAnimationSteps.push({
                    type: 'highlightCell',
                    matrix: 'C',
                    row: i,
                    col: j,
                    message: `計算 C[${i}][${j}] = `
                });
                
                // 高亮 A 的整行和 B 的整列
                matrixAnimationSteps.push({
                    type: 'highlightRowCol',
                    rowA: i,
                    colB: j,
                    message: `計算 C[${i}][${j}] 會使用 A 的第 ${i} 行和 B 的第 ${j} 列`
                });
                
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    // 高亮相乘的兩個元素
                    matrixAnimationSteps.push({
                        type: 'highlightMultiplyCells',
                        cells: [
                            { matrix: 'A', row: i, col: k },
                            { matrix: 'B', row: k, col: j }
                        ],
                        message: `C[${i}][${j}] += A[${i}][${k}] * B[${k}][${j}] = ${matrixA[i][k]} * ${matrixB[k][j]} = ${matrixA[i][k] * matrixB[k][j]}`
                    });
                    
                    sum += matrixA[i][k] * matrixB[k][j];
                    
                    // 更新當前和
                    matrixAnimationSteps.push({
                        type: 'updateSum',
                        row: i,
                        col: j,
                        sum: sum,
                        message: `C[${i}][${j}] 當前和: ${sum}`
                    });
                }
                
                // 設置結果
                matrixAnimationSteps.push({
                    type: 'setResult',
                    row: i,
                    col: j,
                    value: sum,
                    message: `設置 C[${i}][${j}] = ${sum}`
                });
            }
        }
        
        // 完成
        matrixAnimationSteps.push({
            type: 'complete',
            message: '矩陣乘法計算完成！'
        });
    }
    
    async function prepareStrassenMultiplicationAnimation() {
        // 使用標準算法代替，因為 Strassen 算法需要平方矩陣
        if (matrixA.length !== matrixA[0].length || matrixB.length !== matrixB[0].length || matrixA[0].length !== matrixB.length) {
            statusText.textContent = `Strassen 算法僅支援方陣，將使用標準算法代替`;
            structureView.textContent = `警告: Strassen 算法僅支援方陣，將使用標準算法代替\n`;
            prepareStandardMultiplicationAnimation();
            return;
        }
        
        const n = matrixA.length;
        
        // 只實現 2x2, 4x4, 8x8 的 Strassen 算法
        if (n !== 2 && n !== 4 && n !== 8) {
            statusText.textContent = `Strassen 算法目前只支援 2x2, 4x4, 8x8 矩陣`;
            structureView.textContent = `警告: Strassen 算法目前只支援 2x2, 4x4, 8x8 矩陣\n`;
            prepareStandardMultiplicationAnimation();
            return;
        }
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `開始使用 Strassen 算法計算 ${n}x${n} 矩陣乘法`
        });
        
        // 初始化結果矩陣
        resultMatrix = await strassenMultiply(matrixA, matrixB, 0);
        
        // 完成
        matrixAnimationSteps.push({
            type: 'complete',
            message: 'Strassen 矩陣乘法計算完成！'
        });
    }
    
    async function strassenMultiply(A, B, depth) {
        const n = A.length;
        
        // 添加動畫步驟
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}處理 ${n}x${n} 矩陣...`
        });
        
        // 基本情況：2x2 矩陣
        if (n === 2) {
            matrixAnimationSteps.push({
                type: 'message',
                message: `${' '.repeat(depth * 2)}達到基本情況：2x2 矩陣，使用標準乘法`
            });
            
            const C = [
                [0, 0],
                [0, 0]
            ];
            
            // 標準矩陣乘法
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    for (let k = 0; k < 2; k++) {
                        C[i][j] += A[i][k] * B[k][j];
                        
                        matrixAnimationSteps.push({
                            type: 'message',
                            message: `${' '.repeat(depth * 2)}C[${i}][${j}] += A[${i}][${k}] * B[${k}][${j}] = ${A[i][k]} * ${B[k][j]} = ${A[i][k] * B[k][j]}`
                        });
                    }
                    
                    matrixAnimationSteps.push({
                        type: 'message',
                        message: `${' '.repeat(depth * 2)}C[${i}][${j}] = ${C[i][j]}`
                    });
                }
            }
            
            return C;
        }
        
        const mid = n / 2;
        
        // 分割矩陣
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}分割 ${n}x${n} 矩陣為四個 ${mid}x${mid} 子矩陣`
        });
        
        // 分割矩陣 A
        const A11 = splitMatrix(A, 0, 0, mid);
        const A12 = splitMatrix(A, 0, mid, mid);
        const A21 = splitMatrix(A, mid, 0, mid);
        const A22 = splitMatrix(A, mid, mid, mid);
        
        // 分割矩陣 B
        const B11 = splitMatrix(B, 0, 0, mid);
        const B12 = splitMatrix(B, 0, mid, mid);
        const B21 = splitMatrix(B, mid, 0, mid);
        const B22 = splitMatrix(B, mid, mid, mid);
        
        // 計算 7 個矩陣積
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}計算 7 個矩陣乘法：`
        });
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M1 = (A11 + A22) * (B11 + B22)`
        });
        const M1 = await strassenMultiply(
            matrixAdd(A11, A22), 
            matrixAdd(B11, B22), 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M2 = (A21 + A22) * B11`
        });
        const M2 = await strassenMultiply(
            matrixAdd(A21, A22), 
            B11, 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M3 = A11 * (B12 - B22)`
        });
        const M3 = await strassenMultiply(
            A11, 
            matrixSubtract(B12, B22), 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M4 = A22 * (B21 - B11)`
        });
        const M4 = await strassenMultiply(
            A22, 
            matrixSubtract(B21, B11), 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M5 = (A11 + A12) * B22`
        });
        const M5 = await strassenMultiply(
            matrixAdd(A11, A12), 
            B22, 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M6 = (A21 - A11) * (B11 + B12)`
        });
        const M6 = await strassenMultiply(
            matrixSubtract(A21, A11), 
            matrixAdd(B11, B12), 
            depth + 1
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}M7 = (A12 - A22) * (B21 + B22)`
        });
        const M7 = await strassenMultiply(
            matrixSubtract(A12, A22), 
            matrixAdd(B21, B22), 
            depth + 1
        );
        
        // 計算結果矩陣的四個部分
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}計算結果矩陣的四個部分：`
        });
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}C11 = M1 + M4 - M5 + M7`
        });
        const C11 = matrixAdd(
            matrixSubtract(
                matrixAdd(M1, M4), 
                M5
            ), 
            M7
        );
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}C12 = M3 + M5`
        });
        const C12 = matrixAdd(M3, M5);
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}C21 = M2 + M4`
        });
        const C21 = matrixAdd(M2, M4);
        
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}C22 = M1 + M3 - M2 + M6`
        });
        const C22 = matrixAdd(
            matrixSubtract(
                matrixAdd(M1, M3), 
                M2
            ), 
            M6
        );
        
        // 合併結果
        matrixAnimationSteps.push({
            type: 'message',
            message: `${' '.repeat(depth * 2)}合併四個子矩陣得到 ${n}x${n} 結果矩陣`
        });
        return combineMatrix(C11, C12, C21, C22);
    }
    
    function splitMatrix(matrix, rowStart, colStart, size) {
        const result = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = matrix[rowStart + i][colStart + j];
            }
        }
        
        return result;
    }
    
    function combineMatrix(C11, C12, C21, C22) {
        const n = C11.length * 2;
        const result = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n/2; i++) {
            for (let j = 0; j < n/2; j++) {
                result[i][j] = C11[i][j];
                result[i][j + n/2] = C12[i][j];
                result[i + n/2][j] = C21[i][j];
                result[i + n/2][j + n/2] = C22[i][j];
            }
        }
        
        return result;
    }
    
    function matrixAdd(A, B) {
        const n = A.length;
        const result = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = A[i][j] + B[i][j];
            }
        }
        
        return result;
    }
    
    function matrixSubtract(A, B) {
        const n = A.length;
        const result = Array(n).fill().map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = A[i][j] - B[i][j];
            }
        }
        
        return result;
    }
    
    async function playAnimation() {
        if (currentAnimationStep >= matrixAnimationSteps.length) {
            matrixRunning = false;
            disableButtons('matrix', false);
            statusText.textContent = '計算完成！';
            return;
        }
        
        if (matrixPaused) {
            return;
        }
        
        const speed = 101 - speedSlider.value;
        const step = matrixAnimationSteps[currentAnimationStep];
        
        // 更新狀態文本
        if (step.message) {
            statusText.textContent = step.message;
        }
        
        // 執行動畫步驟
        switch (step.type) {
            case 'highlightCell':
                highlightMatrixCell(step.matrix, step.row, step.col);
                break;
                
            case 'highlightRowCol':
                highlightMatrixRowCol(step.rowA, step.colB);
                if (step.message) {
                    structureView.textContent = step.message;
                }
                break;
                
            case 'highlightMultiplyCells':
                highlightMatrixMultiplyCells(step.cells);
                if (step.message) {
                    structureView.textContent = step.message;
                }
                break;
                
            case 'updateSum':
                updateMatrixCell('C', step.row, step.col, step.sum, true);
                if (step.message) {
                    structureView.textContent = step.message;
                }
                break;
                
            case 'setResult':
                resultMatrix[step.row][step.col] = step.value;
                updateMatrixCell('C', step.row, step.col, step.value);
                break;
                
            case 'message':
                structureView.textContent += `\n${step.message}`;
                // 滾動到底部
                structureView.scrollTop = structureView.scrollHeight;
                break;
                
            case 'complete':
                renderMatrices();
                break;
        }
        
        // 移動到下一步
        currentAnimationStep++;
        
        // 暫停一段時間
        await sleep(speed * 20);
        
        // 繼續動畫
        await playAnimation();
    }
    
    function highlightMatrixCell(matrixName, row, col) {
        console.log(`高亮 ${matrixName} 矩陣元素 [${row}][${col}]`);
        clearMatrixHighlights();
        
        let displayIndex;
        if (matrixName === 'A') displayIndex = 1;
        else if (matrixName === 'B') displayIndex = 3;
        else displayIndex = 5; // C 矩陣
        
        const cell = container.querySelector(`.matrix-display:nth-child(${displayIndex}) table tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        console.log(`選擇器: .matrix-display:nth-child(${displayIndex}) table tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        
        if (cell) {
            cell.classList.add('highlight');
            console.log(`已高亮 ${matrixName} 矩陣元素 [${row}][${col}]`);
        } else {
            console.log(`未找到 ${matrixName} 矩陣元素 [${row}][${col}]`);
        }
    }
    
    function highlightMatrixRowCol(rowA, colB) {
        clearMatrixHighlights();
        
        // 高亮 A 矩陣的整行
        const colsA = matrixA[0].length;
        for (let j = 0; j < colsA; j++) {
            const cellA = document.getElementById(`matrix-a-cell-${rowA}-${j}`);
            if (cellA) {
                cellA.classList.add('highlight-row');
            }
        }
        
        // 高亮 B 矩陣的整列
        const rowsB = matrixB.length;
        for (let i = 0; i < rowsB; i++) {
            const cellB = document.getElementById(`matrix-b-cell-${i}-${colB}`);
            if (cellB) {
                cellB.classList.add('highlight-col');
            }
        }
        
        // 高亮 C 矩陣中將被計算的元素
        const cellC = document.getElementById(`matrix-c-cell-${rowA}-${colB}`);
        if (cellC) {
            cellC.classList.add('highlight-result');
        }
    }
    
    function highlightMatrixMultiplyCells(cells) {
        // 不完全清除高亮，保留行列高亮的同時移除之前的highlight-result
        document.querySelectorAll('.highlight, .highlight-result').forEach(cell => {
            cell.classList.remove('highlight', 'highlight-result');
        });
        
        if (cells.length >= 2) {
            const rowA = cells[0].row;
            const colA = cells[0].col;
            const rowB = cells[1].row;
            const colB = cells[1].col;
            
            // 高亮 A 矩陣的特定元素
            const cellA = document.getElementById(`matrix-a-cell-${rowA}-${colA}`);
            if (cellA) {
                cellA.classList.add('highlight');
            }
            
            // 高亮 B 矩陣的特定元素
            const cellB = document.getElementById(`matrix-b-cell-${rowB}-${colB}`);
            if (cellB) {
                cellB.classList.add('highlight');
            }
            
            // 只高亮當前計算的 C 矩陣元素
            const cellC = document.getElementById(`matrix-c-cell-${rowA}-${colB}`);
            if (cellC) {
                // 使用highlight-result而非highlight類
                cellC.classList.add('highlight-result');
            }
        }
    }
    
    function updateMatrixCell(matrixName, row, col, value, isTemporary = false) {
        const tableSelector = matrixName === 'A' ? 'table:nth-of-type(1)' : 
                             matrixName === 'B' ? 'table:nth-of-type(2)' : 
                             'table:nth-of-type(3)';
        
        const cell = container.querySelector(`${tableSelector} tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        if (cell) {
            cell.textContent = value;
            
            if (!isTemporary) {
                cell.classList.add('sorted'); // 使用sorted類標記已完成的單元格
            }
        }
    }
    
    function clearMatrixHighlights() {
        // 除去所有高亮類別
        const allElements = container.querySelectorAll('.highlight, .highlight-row, .highlight-col, .highlight-result');
        allElements.forEach(cell => {
            cell.classList.remove('highlight', 'highlight-row', 'highlight-col', 'highlight-result');
        });
    }
    
    function continueAnimation() {
        disableButtons('matrix', true);
        playAnimation();
    }
    
    function pauseMatrixMultiplication() {
        matrixPaused = true;
        disableButtons('matrix', false);
    }
    
    function resetMatrixMultiplication() {
        if (matrixRunning) {
            matrixPaused = true;
            matrixRunning = false;
        }
        
        currentAnimationStep = 0;
        matrixAnimationSteps = [];
        
        // 重置矩陣
        if (matrixA.length > 0) {
            const size = matrixA.length;
            resultMatrix = Array(size).fill().map(() => Array(size).fill(0));
            renderMatrices();
        }
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成矩陣」按鈕開始';
        
        disableButtons('matrix', false, true);
        document.getElementById('matrix-start').disabled = true;
        document.getElementById('matrix-reset').disabled = true;
    }
}

// 幫助函數：在按鈕的啟用/禁用狀態之間切換
function disableButtons(prefix, disableStart, exceptReset = false) {
    document.getElementById(`${prefix}-generate`).disabled = disableStart;
    document.getElementById(`${prefix}-start`).disabled = disableStart;
    document.getElementById(`${prefix}-pause`).disabled = !disableStart;
    if (!exceptReset) {
        document.getElementById(`${prefix}-reset`).disabled = disableStart;
    }
}

// 幫助函數：等待指定的毫秒數
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 頁面加載時初始化矩陣乘法
document.addEventListener('DOMContentLoaded', () => {
    initMatrixMultiplication();
});