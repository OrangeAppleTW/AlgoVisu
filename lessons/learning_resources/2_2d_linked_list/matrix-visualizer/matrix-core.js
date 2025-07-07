// 矩陣視覺化工具 - 核心邏輯模組
// 負責矩陣數據的解析、驗證和基本操作

// 檢查是否已載入
if (typeof window.MatrixCore !== 'undefined') {
    console.warn('MatrixCore already loaded');
}

class MatrixCore {
    constructor() {
        this.matrices = [];
        this.maxMatrices = 4;
        this.examples = this.initializeExamples();
    }

    // 初始化範例矩陣
    initializeExamples() {
        return [
            {
                name: "基本矩陣",
                data: `1 2 3
4 5 6
7 8 9

10 11
12 13`
            },
            {
                name: "數學計算",
                data: `1 0 0
0 1 0
0 0 1

2 3
1 4
5 6`
            },
            {
                name: "程式應用",
                data: `1 2 3 4
5 6 7 8
9 10 11 12

0 1 0
1 0 1
0 1 0

-1 2.5
3.7 -4`
            },
            {
                name: "教學範例",
                data: `1
2
3

5 10 15
20 25 30

1 2
3 4
5 6

100 200 300 400`
            }
        ];
    }

    // 解析矩陣輸入
    parseMatrixInput(input) {
        const lines = input.split('\n');
        const parsedMatrices = [];
        let currentMatrix = [];
        let expectedCols = null;
        let lineNumber = 0;

        for (let i = 0; i < lines.length; i++) {
            lineNumber = i + 1;
            const line = lines[i].trim();
            
            // 空行表示矩陣結束
            if (line === '') {
                if (currentMatrix.length > 0) {
                    parsedMatrices.push({
                        data: [...currentMatrix],
                        metadata: this.calculateMatrixMetadata(currentMatrix)
                    });
                    currentMatrix = [];
                    expectedCols = null;
                }
                continue;
            }

            // 解析當前行的數字
            const elements = line.split(/\s+/).filter(el => el !== '');
            
            if (elements.length === 0) continue;

            // 驗證數字格式
            const row = [];
            for (const element of elements) {
                const num = parseFloat(element);
                if (isNaN(num)) {
                    throw new Error(`第 ${lineNumber} 行包含無效的數字格式："${element}"`);
                }
                row.push(num);
            }

            // 檢查列數一致性
            if (expectedCols === null) {
                expectedCols = row.length;
            } else if (row.length !== expectedCols) {
                throw new Error(`矩陣第 ${currentMatrix.length + 1} 行有 ${row.length} 個元素，但第 1 行有 ${expectedCols} 個元素`);
            }

            currentMatrix.push(row);
        }

        // 添加最後一個矩陣（如果有的話）
        if (currentMatrix.length > 0) {
            parsedMatrices.push({
                data: currentMatrix,
                metadata: this.calculateMatrixMetadata(currentMatrix)
            });
        }

        if (parsedMatrices.length === 0) {
            throw new Error('未找到有效的矩陣數據');
        }

        if (parsedMatrices.length > this.maxMatrices) {
            console.warn(`最多只能顯示 ${this.maxMatrices} 個矩陣，已截取前 ${this.maxMatrices} 個`);
            return parsedMatrices.slice(0, this.maxMatrices);
        }

        return parsedMatrices;
    }

    // 計算矩陣元數據
    calculateMatrixMetadata(matrix) {
        const allValues = matrix.flat();
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        return {
            rows: rows,
            cols: cols,
            size: `${rows} × ${cols}`,
            isSquare: rows === cols,
            totalElements: rows * cols,
            min: Math.min(...allValues),
            max: Math.max(...allValues),
            sum: allValues.reduce((a, b) => a + b, 0),
            average: allValues.reduce((a, b) => a + b, 0) / allValues.length,
            hasNegative: allValues.some(val => val < 0),
            hasDecimal: allValues.some(val => !Number.isInteger(val))
        };
    }

    // 驗證矩陣
    validateMatrix(matrix) {
        if (!Array.isArray(matrix) || matrix.length === 0) {
            return { valid: false, error: '矩陣不能為空' };
        }
        
        const expectedLength = matrix[0].length;
        if (expectedLength === 0) {
            return { valid: false, error: '矩陣行不能為空' };
        }
        
        for (let i = 0; i < matrix.length; i++) {
            if (!Array.isArray(matrix[i])) {
                return { valid: false, error: `第 ${i + 1} 行格式錯誤` };
            }
            
            if (matrix[i].length !== expectedLength) {
                return { valid: false, error: `第 ${i + 1} 行長度不一致` };
            }
            
            for (let j = 0; j < matrix[i].length; j++) {
                if (typeof matrix[i][j] !== 'number' || isNaN(matrix[i][j])) {
                    return { valid: false, error: `第 ${i + 1} 行第 ${j + 1} 列不是有效數字` };
                }
            }
        }
        
        return { valid: true };
    }

    // 格式化數字顯示
    formatNumber(num) {
        // 如果是整數，直接顯示
        if (Number.isInteger(num)) {
            return num.toString();
        }
        
        // 如果是小數，保留適當的小數位數
        if (Math.abs(num) < 0.001) {
            return num.toExponential(2);
        } else if (Math.abs(num) >= 1000000) {
            return num.toExponential(2);
        } else {
            return parseFloat(num.toFixed(3)).toString();
        }
    }

    // 矩陣操作：轉置
    transpose(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const transposed = [];
        
        for (let j = 0; j < cols; j++) {
            transposed[j] = [];
            for (let i = 0; i < rows; i++) {
                transposed[j][i] = matrix[i][j];
            }
        }
        
        return transposed;
    }

    // 矩陣操作：加法
    add(matrixA, matrixB) {
        if (matrixA.length !== matrixB.length || matrixA[0].length !== matrixB[0].length) {
            throw new Error('矩陣維度不匹配，無法進行加法運算');
        }
        
        const result = [];
        for (let i = 0; i < matrixA.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrixA[0].length; j++) {
                result[i][j] = matrixA[i][j] + matrixB[i][j];
            }
        }
        
        return result;
    }

    // 矩陣操作：乘法
    multiply(matrixA, matrixB) {
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;
        
        if (colsA !== rowsB) {
            throw new Error(`矩陣A的列數(${colsA})必須等於矩陣B的行數(${rowsB})`);
        }
        
        const result = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += matrixA[i][k] * matrixB[k][j];
                }
                result[i][j] = sum;
            }
        }
        
        return result;
    }

    // 矩陣操作：標量乘法
    scalarMultiply(matrix, scalar) {
        return matrix.map(row => row.map(val => val * scalar));
    }

    // 獲取隨機範例
    getRandomExample() {
        const randomIndex = Math.floor(Math.random() * this.examples.length);
        return this.examples[randomIndex];
    }

    // 獲取所有範例
    getAllExamples() {
        return this.examples;
    }

    // 將矩陣轉換為字符串格式
    matrixToString(matrix) {
        return matrix.map(row => row.map(val => this.formatNumber(val)).join(' ')).join('\n');
    }

    // 生成隨機矩陣
    generateRandomMatrix(rows, cols, min = -10, max = 10, isInteger = true) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                if (isInteger) {
                    matrix[i][j] = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    matrix[i][j] = Math.random() * (max - min) + min;
                }
            }
        }
        return matrix;
    }

    // 創建單位矩陣
    createIdentityMatrix(size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = (i === j) ? 1 : 0;
            }
        }
        return matrix;
    }

    // 創建零矩陣
    createZeroMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = 0;
            }
        }
        return matrix;
    }

    // 設置當前矩陣
    setMatrices(matrices) {
        this.matrices = matrices;
    }

    // 獲取當前矩陣
    getMatrices() {
        return this.matrices;
    }

    // 清空矩陣
    clearMatrices() {
        this.matrices = [];
    }

    // 匯出矩陣數據
    exportMatrices(format = 'json') {
        if (this.matrices.length === 0) {
            throw new Error('沒有矩陣可以匯出');
        }

        switch (format) {
            case 'json':
                return {
                    data: JSON.stringify(this.matrices.map(m => m.data), null, 2),
                    filename: 'matrices.json',
                    mimeType: 'application/json'
                };
            
            case 'csv':
                const csvContent = this.matrices.map((matrix, index) => {
                    const header = `Matrix ${index + 1}`;
                    const content = matrix.data.map(row => row.join(',')).join('\n');
                    return header + '\n' + content;
                }).join('\n\n');
                
                return {
                    data: csvContent,
                    filename: 'matrices.csv',
                    mimeType: 'text/csv'
                };
            
            case 'txt':
                const txtContent = this.matrices.map((matrix, index) => {
                    const header = `矩陣 ${index + 1} (${matrix.metadata.size})`;
                    const separator = '-'.repeat(header.length);
                    const content = this.matrixToString(matrix.data);
                    return header + '\n' + separator + '\n' + content;
                }).join('\n\n');
                
                return {
                    data: txtContent,
                    filename: 'matrices.txt',
                    mimeType: 'text/plain'
                };
            
            default:
                throw new Error(`不支援的匯出格式: ${format}`);
        }
    }
}

// 將MatrixCore設為全局可訪問
window.MatrixCore = MatrixCore;
console.log('MatrixCore loaded successfully');