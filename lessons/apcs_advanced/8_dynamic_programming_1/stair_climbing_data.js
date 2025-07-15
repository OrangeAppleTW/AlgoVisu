/**
 * 爬樓梯問題的數據模型和動態規劃算法邏輯
 */

class StairClimbingData {
    constructor() {
        this.n = 5; // 樓梯階數
        this.dpTable = []; // DP表格
        this.calculationSteps = []; // 計算步驟
        this.currentStep = 0; // 當前步驟
        this.isAnimating = false; // 是否正在動畫
        this.animationSpeed = 1000; // 動畫速度（毫秒）
    }

    /**
     * 初始化DP問題
     * @param {number} n - 樓梯階數
     */
    initialize(n) {
        this.n = n;
        this.dpTable = new Array(n + 1).fill(null);
        this.calculationSteps = [];
        this.currentStep = 0;
        this.isAnimating = false;
        
        // 設定基礎情況
        if (n >= 1) this.dpTable[1] = 1;
        if (n >= 2) this.dpTable[2] = 2;
        
        // 生成計算步驟
        this.generateCalculationSteps();
    }

    /**
     * 生成計算步驟序列
     */
    generateCalculationSteps() {
        this.calculationSteps = [];
        
        // 添加初始化步驟
        this.calculationSteps.push({
            type: 'init',
            message: '初始化邊界條件',
            details: 'dp[1] = 1 (1種方法), dp[2] = 2 (2種方法)',
            currentIndex: null,
            dpState: [...this.dpTable]
        });

        // 為每個需要計算的位置生成步驟
        for (let i = 3; i <= this.n; i++) {
            // 計算準備步驟
            this.calculationSteps.push({
                type: 'prepare',
                message: `準備計算 dp[${i}]`,
                details: `根據轉移公式: dp[${i}] = dp[${i-1}] + dp[${i-2}]`,
                currentIndex: i,
                dependencies: [i-1, i-2],
                dpState: [...this.dpTable]
            });

            // 實際計算步驟
            const value = this.dpTable[i-1] + this.dpTable[i-2];
            this.dpTable[i] = value;
            
            this.calculationSteps.push({
                type: 'calculate',
                message: `計算完成 dp[${i}] = ${value}`,
                details: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${this.dpTable[i-1]} + ${this.dpTable[i-2]} = ${value}`,
                currentIndex: i,
                dependencies: [i-1, i-2],
                result: value,
                dpState: [...this.dpTable]
            });
        }

        // 完成步驟
        this.calculationSteps.push({
            type: 'complete',
            message: `計算完成！爬 ${this.n} 階樓梯共有 ${this.dpTable[this.n]} 種方法`,
            details: `動態規劃成功避免了重複計算，時間複雜度為 O(n)`,
            currentIndex: this.n,
            dpState: [...this.dpTable]
        });
    }

    /**
     * 獲取當前步驟信息
     */
    getCurrentStep() {
        if (this.currentStep >= this.calculationSteps.length) {
            return null;
        }
        return this.calculationSteps[this.currentStep];
    }

    /**
     * 前進到下一步
     */
    nextStep() {
        if (this.currentStep < this.calculationSteps.length - 1) {
            this.currentStep++;
            return this.getCurrentStep();
        }
        return null;
    }

    /**
     * 重置到開始狀態
     */
    reset() {
        this.currentStep = 0;
        this.isAnimating = false;
        // 重新初始化DP表格到初始狀態
        this.dpTable = new Array(this.n + 1).fill(null);
        if (this.n >= 1) this.dpTable[1] = 1;
        if (this.n >= 2) this.dpTable[2] = 2;
    }

    /**
     * 獲取當前DP表格狀態
     */
    getDPTableState() {
        return [...this.dpTable];
    }

    /**
     * 設定動畫速度
     * @param {number} speed - 速度值 (1-10)
     */
    setAnimationSpeed(speed) {
        this.animationSpeed = 1200 - (speed * 100); // 速度越高，間隔越短
    }

    /**
     * 檢查是否為基礎情況
     * @param {number} index - 位置索引
     */
    isBaseCase(index) {
        return index === 1 || index === 2;
    }

    /**
     * 檢查是否已計算
     * @param {number} index - 位置索引
     */
    isComputed(index) {
        return this.dpTable[index] !== null;
    }

    /**
     * 生成狀態轉移樹的數據結構
     * @param {number} targetN - 目標值
     */
    generateStateTree(targetN) {
        const tree = {
            value: targetN,
            level: 0,
            children: [],
            computed: this.isComputed(targetN),
            baseCase: this.isBaseCase(targetN)
        };

        this.buildTreeRecursive(tree, targetN, 0, new Set());
        return tree;
    }

    /**
     * 遞歸構建狀態樹
     * @param {Object} node - 當前節點
     * @param {number} value - 當前值
     * @param {number} level - 當前層級
     * @param {Set} visited - 已訪問的節點
     */
    buildTreeRecursive(node, value, level, visited) {
        if (value <= 2 || level > 4) { // 限制樹的深度
            return;
        }

        // 添加左子樹 (value - 1)
        const leftChild = {
            value: value - 1,
            level: level + 1,
            children: [],
            computed: this.isComputed(value - 1),
            baseCase: this.isBaseCase(value - 1),
            duplicate: visited.has(value - 1)
        };
        node.children.push(leftChild);
        
        if (!leftChild.baseCase && level < 3) {
            visited.add(value - 1);
            this.buildTreeRecursive(leftChild, value - 1, level + 1, visited);
        }

        // 添加右子樹 (value - 2)
        const rightChild = {
            value: value - 2,
            level: level + 1,
            children: [],
            computed: this.isComputed(value - 2),
            baseCase: this.isBaseCase(value - 2),
            duplicate: visited.has(value - 2)
        };
        node.children.push(rightChild);
        
        if (!rightChild.baseCase && level < 3) {
            visited.add(value - 2);
            this.buildTreeRecursive(rightChild, value - 2, level + 1, visited);
        }
    }

    /**
     * 計算遞迴版本的執行次數（用於比較）
     * @param {number} n - 目標值
     */
    countRecursiveCalls(n) {
        if (n <= 2) return 1;
        return 1 + this.countRecursiveCalls(n - 1) + this.countRecursiveCalls(n - 2);
    }

    /**
     * 獲取演算法複雜度比較數據
     */
    getComplexityComparison() {
        const recursiveCalls = this.countRecursiveCalls(this.n);
        const dpCalls = this.n; // DP只需要計算n次
        
        return {
            recursive: {
                calls: recursiveCalls,
                complexity: `O(2^${this.n})`,
                description: '指數級時間複雜度，會重複計算相同子問題'
            },
            dp: {
                calls: dpCalls,
                complexity: `O(${this.n})`,
                description: '線性時間複雜度，每個子問題只計算一次'
            },
            improvement: Math.round((recursiveCalls / dpCalls) * 100) / 100
        };
    }
}

// 全域數據實例
const stairClimbingData = new StairClimbingData();