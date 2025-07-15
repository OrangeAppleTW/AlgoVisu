/**
 * 狀態轉移樹頁面的數據模型
 */

class StateTreeData {
    constructor() {
        this.n = 6;
        this.treeData = null;
        this.duplicateCounts = {};
        this.animationSteps = [];
        this.currentStep = 0;
        this.dpTable = {};
        this.dpAnimationSteps = [];
    }

    /**
     * 構建狀態轉移樹
     */
    buildStateTree(n) {
        this.n = n;
        this.duplicateCounts = {};
        this.dpTable = {};
        this.treeData = this.buildTreeRecursive(n, 0, new Set());
        this.calculateStatistics();
        return this.treeData;
    }

    /**
     * 遞歸構建樹
     */
    buildTreeRecursive(value, level, visited) {
        // 計算重複次數
        if (!this.duplicateCounts[value]) {
            this.duplicateCounts[value] = 0;
        }
        this.duplicateCounts[value]++;

        const node = {
            value: value,
            level: level,
            children: [],
            isBaseCase: value <= 2,
            isDuplicate: visited.has(value),
            isComputed: false, // 將在DP過程中標記
            isMemorized: false, // 是否已記憶化
            x: 0, // 將在布局時設置
            y: 0
        };

        // 如果不是基礎情況且層級不太深，繼續展開
        if (value > 2 && level < 4) {
            visited.add(value);
            
            // 左子樹 (value - 1)
            node.children.push(this.buildTreeRecursive(value - 1, level + 1, new Set(visited)));
            
            // 右子樹 (value - 2)
            node.children.push(this.buildTreeRecursive(value - 2, level + 1, new Set(visited)));
        }

        return node;
    }

    /**
     * 生成動態規劃動畫步驟（從底部向上）
     */
    generateDPAnimationSteps() {
        this.dpAnimationSteps = [];
        this.dpTable = {};

        // 第一步：介紹動態規劃方法
        this.dpAnimationSteps.push({
            type: 'introduction',
            message: '動態規劃方法：從最小的子問題開始，逐步建構解答',
            dpTable: {...this.dpTable},
            highlightNodes: [],
            description: '與遞迴不同，DP從已知的基礎情況開始向上計算'
        });

        // 第二步：初始化基礎情況
        this.dpTable[1] = 1;
        this.dpAnimationSteps.push({
            type: 'base-case',
            message: '初始化基礎情況：f(1) = 1',
            dpTable: {...this.dpTable},
            highlightNodes: [1],
            newlyComputed: [1],
            description: 'f(1) 是爬樓梯問題的基礎情況，只有一種方法'
        });

        this.dpTable[2] = 2;
        this.dpAnimationSteps.push({
            type: 'base-case',
            message: '初始化基礎情況：f(2) = 2',
            dpTable: {...this.dpTable},
            highlightNodes: [2],
            newlyComputed: [2],
            description: 'f(2) 也是基礎情況，有兩種方法：(1+1) 或 (2)'
        });

        // 第三步：從f(3)開始向上計算
        for (let i = 3; i <= this.n; i++) {
            // 顯示需要計算f(i)
            this.dpAnimationSteps.push({
                type: 'need-compute',
                message: `現在需要計算 f(${i})`,
                dpTable: {...this.dpTable},
                highlightNodes: [i],
                description: `根據轉移方程：f(${i}) = f(${i-1}) + f(${i-2})`
            });

            // 顯示從表格中查詢f(i-1)
            this.dpAnimationSteps.push({
                type: 'lookup',
                message: `從DP表格查詢 f(${i-1}) = ${this.dpTable[i-1]}`,
                dpTable: {...this.dpTable},
                highlightNodes: [i-1],
                lookupValue: i-1,
                description: `f(${i-1}) 已經計算過，直接從表格取得，無需重複計算`
            });

            // 顯示從表格中查詢f(i-2)
            this.dpAnimationSteps.push({
                type: 'lookup',
                message: `從DP表格查詢 f(${i-2}) = ${this.dpTable[i-2]}`,
                dpTable: {...this.dpTable},
                highlightNodes: [i-2],
                lookupValue: i-2,
                description: `f(${i-2}) 也已經計算過，直接從表格取得`
            });

            // 計算並存儲f(i)
            const result = this.dpTable[i-1] + this.dpTable[i-2];
            this.dpTable[i] = result;
            
            this.dpAnimationSteps.push({
                type: 'compute',
                message: `計算並存儲：f(${i}) = ${this.dpTable[i-1]} + ${this.dpTable[i-2]} = ${result}`,
                dpTable: {...this.dpTable},
                highlightNodes: [i],
                newlyComputed: [i],
                computation: {
                    target: i,
                    left: i-1,
                    right: i-2,
                    result: result
                },
                description: `將結果存入DP表格，供後續使用`
            });

            // 如果不是最後一個，顯示樹的成長
            if (i < this.n) {
                this.dpAnimationSteps.push({
                    type: 'tree-growth',
                    message: `狀態轉移樹向上延伸，f(${i}) 成為新節點`,
                    dpTable: {...this.dpTable},
                    highlightNodes: [i],
                    description: '每次計算都讓樹向上成長一層'
                });
            }
        }

        // 最後一步：完成動畫
        this.dpAnimationSteps.push({
            type: 'completion',
            message: `動態規劃完成！f(${this.n}) = ${this.dpTable[this.n]}`,
            dpTable: {...this.dpTable},
            highlightNodes: [this.n],
            description: `僅用 ${this.n} 次計算就得到答案，相比遞迴的 ${Math.pow(2, this.n) - 1} 次計算大幅提升效率`
        });

        return this.dpAnimationSteps;
    }

    /**
     * 生成遞迴動畫步驟（傳統從上到下）
     */
    generateRecursiveAnimationSteps() {
        this.animationSteps = [];
        this.generateStepsRecursive(this.treeData);
        return this.animationSteps;
    }

    /**
     * 遞歸生成動畫步驟
     */
    generateStepsRecursive(node) {
        if (!node) return;

        this.animationSteps.push({
            type: 'visit',
            node: node,
            message: `訪問節點 f(${node.value})`
        });

        if (node.isBaseCase) {
            this.animationSteps.push({
                type: 'base-case',
                node: node,
                message: `f(${node.value}) 是基礎情況，值為 ${node.value === 1 ? 1 : 2}`
            });
        } else {
            node.children.forEach(child => {
                this.generateStepsRecursive(child);
            });

            this.animationSteps.push({
                type: 'compute',
                node: node,
                message: `計算 f(${node.value}) = f(${node.value - 1}) + f(${node.value - 2})`
            });
        }
    }

    /**
     * 生成對比動畫步驟（顯示DP vs 遞迴的差異）
     */
    generateComparisonSteps() {
        const comparisonSteps = [];
        
        // 顯示遞迴的重複計算問題
        comparisonSteps.push({
            type: 'comparison-intro',
            message: '比較遞迴與動態規劃的計算過程',
            description: '遞迴會重複計算相同的子問題，而DP只計算一次'
        });

        // 標記重複計算的節點
        const duplicateNodes = this.findDuplicateNodes();
        comparisonSteps.push({
            type: 'show-duplicates',
            message: '遞迴中的重複計算問題',
            duplicateNodes: duplicateNodes,
            description: `在遞迴中，f(${this.n}) 的計算會導致許多重複的子問題`
        });

        // 展示DP如何解決這個問題
        comparisonSteps.push({
            type: 'dp-solution',
            message: 'DP透過記憶化避免重複計算',
            dpTable: this.dpTable,
            description: '每個子問題只計算一次，結果存在表格中供重複使用'
        });

        return comparisonSteps;
    }

    /**
     * 找出重複的節點
     */
    findDuplicateNodes() {
        const duplicates = [];
        Object.entries(this.duplicateCounts).forEach(([value, count]) => {
            if (count > 1) {
                duplicates.push({
                    value: parseInt(value),
                    count: count
                });
            }
        });
        return duplicates;
    }

    /**
     * 計算統計信息
     */
    calculateStatistics() {
        const stats = {
            totalNodes: this.countNodes(this.treeData),
            uniqueProblems: Object.keys(this.duplicateCounts).length,
            duplicateCalculations: 0,
            memoizationSavings: 0,
            dpCalculations: this.n, // DP只需要n次計算
            recursiveCalculations: Math.pow(2, this.n) - 1 // 遞迴需要2^n - 1次
        };

        // 計算重複計算次數
        Object.values(this.duplicateCounts).forEach(count => {
            if (count > 1) {
                stats.duplicateCalculations += count - 1;
            }
        });

        stats.memoizationSavings = Math.round(
            ((stats.recursiveCalculations - stats.dpCalculations) / stats.recursiveCalculations) * 100
        );

        this.statistics = stats;
        return stats;
    }

    /**
     * 計算節點總數
     */
    countNodes(node) {
        if (!node) return 0;
        let count = 1;
        node.children.forEach(child => {
            count += this.countNodes(child);
        });
        return count;
    }

    /**
     * 計算樹布局
     */
    calculateLayout(width = 800, height = 500) {
        if (!this.treeData) return;

        const levels = this.getLevels(this.treeData);
        const levelHeight = height / (levels.length + 1);

        levels.forEach((levelNodes, levelIndex) => {
            const y = (levelIndex + 1) * levelHeight;
            const levelWidth = width - 100; // 留邊距
            const nodeSpacing = levelWidth / (levelNodes.length + 1);

            levelNodes.forEach((node, nodeIndex) => {
                node.x = 50 + (nodeIndex + 1) * nodeSpacing; // 50px左邊距
                node.y = y;
            });
        });
    }

    /**
     * 獲取每層的節點
     */
    getLevels(node, levels = [], level = 0) {
        if (!levels[level]) {
            levels[level] = [];
        }
        levels[level].push(node);

        node.children.forEach(child => {
            this.getLevels(child, levels, level + 1);
        });

        return levels;
    }

    /**
     * 生成重複計算矩陣
     */
    getDuplicationMatrix() {
        const matrix = [];
        const maxValue = Math.max(...Object.keys(this.duplicateCounts).map(Number));
        
        for (let i = 1; i <= maxValue; i++) {
            matrix.push({
                value: i,
                recursiveCount: this.duplicateCounts[i] || 0,
                dpCount: 1, // DP中每個問題只計算一次
                isRepeated: (this.duplicateCounts[i] || 0) > 1,
                efficiency: this.duplicateCounts[i] || 1 // 效率提升倍數
            });
        }
        
        return matrix;
    }

    /**
     * 找到節點路徑
     */
    findPath(targetValue) {
        const path = [];
        this.findPathRecursive(this.treeData, targetValue, path);
        return path;
    }

    /**
     * 遞歸查找路徑
     */
    findPathRecursive(node, targetValue, path) {
        if (!node) return false;

        path.push(node);

        if (node.value === targetValue) {
            return true;
        }

        for (const child of node.children) {
            if (this.findPathRecursive(child, targetValue, path)) {
                return true;
            }
        }

        path.pop();
        return false;
    }

    /**
     * 獲取節點詳細信息
     */
    getNodeDetails(value) {
        return {
            value: value,
            recursiveCount: this.duplicateCounts[value] || 0,
            dpCount: 1,
            isRepeated: (this.duplicateCounts[value] || 0) > 1,
            dependsOn: value > 2 ? [value - 1, value - 2] : [],
            level: this.findNodeLevel(this.treeData, value),
            computationCost: value <= 2 ? 1 : Math.pow(2, value - 2),
            dpValue: this.dpTable[value] || '未計算'
        };
    }

    /**
     * 查找節點層級
     */
    findNodeLevel(node, targetValue, currentLevel = 0) {
        if (!node) return -1;
        
        if (node.value === targetValue) {
            return currentLevel;
        }

        for (const child of node.children) {
            const level = this.findNodeLevel(child, targetValue, currentLevel + 1);
            if (level !== -1) {
                return level;
            }
        }

        return -1;
    }

    /**
     * 獲取當前DP表格狀態
     */
    getCurrentDPTable() {
        return {...this.dpTable};
    }

    /**
     * 重置所有數據
     */
    reset() {
        this.dpTable = {};
        this.duplicateCounts = {};
        this.animationSteps = [];
        this.dpAnimationSteps = [];
        this.currentStep = 0;
        this.treeData = null;
    }
}

// 全域實例
const stateTreeData = new StateTreeData();