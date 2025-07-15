/**
 * 比較分析頁面的數據模型
 */

class ComparisonData {
    constructor() {
        this.n = 6;
        this.recursiveCalls = 0;
        this.dpOperations = 0;
        this.callSequence = [];
        this.duplicateCounts = {};
    }

    /**
     * 計算純遞迴的調用次數
     */
    calculateRecursiveCalls(n, memo = {}) {
        if (memo[n]) return memo[n];
        
        if (n <= 2) {
            memo[n] = 1;
            return 1;
        }
        
        const calls = 1 + this.calculateRecursiveCalls(n - 1, memo) + 
                          this.calculateRecursiveCalls(n - 2, memo);
        memo[n] = calls;
        return calls;
    }

    /**
     * 模擬遞迴調用序列
     */
    simulateRecursiveSequence(n, sequence = [], visited = {}) {
        const callInfo = {
            value: n,
            type: n <= 2 ? 'base' : (visited[n] ? 'repeated' : 'first'),
            depth: sequence.length
        };
        
        sequence.push(callInfo);
        
        if (!visited[n]) {
            visited[n] = 0;
        }
        visited[n]++;
        
        if (n > 2) {
            this.simulateRecursiveSequence(n - 1, sequence, visited);
            this.simulateRecursiveSequence(n - 2, sequence, visited);
        }
        
        return sequence;
    }

    /**
     * 獲取重複計算統計
     */
    getDuplicationStats(n) {
        const counts = {};
        this.countDuplicates(n, counts);
        return counts;
    }

    /**
     * 遞歸計算重複次數
     */
    countDuplicates(n, counts = {}) {
        if (!counts[n]) counts[n] = 0;
        counts[n]++;
        
        if (n > 2) {
            this.countDuplicates(n - 1, counts);
            this.countDuplicates(n - 2, counts);
        }
        
        return counts;
    }

    /**
     * 獲取效能比較數據
     */
    getPerformanceComparison(n) {
        const recursiveCalls = this.calculateRecursiveCalls(n);
        const dpOperations = n; // DP只需要n次操作
        
        return {
            recursive: {
                calls: recursiveCalls,
                complexity: `O(2^${n})`,
                time: Math.pow(2, n) // 模擬時間
            },
            dp: {
                calls: dpOperations,
                complexity: `O(${n})`,
                time: n // 模擬時間
            },
            improvement: {
                speedup: Math.round((recursiveCalls / dpOperations) * 100) / 100,
                reduction: Math.round(((recursiveCalls - dpOperations) / recursiveCalls) * 100)
            }
        };
    }

    /**
     * 生成複雜度成長數據
     */
    getComplexityGrowthData(maxN = 10) {
        const data = [];
        for (let i = 1; i <= maxN; i++) {
            data.push({
                n: i,
                recursive: this.calculateRecursiveCalls(i),
                dp: i
            });
        }
        return data;
    }
}

// 全域實例
const comparisonData = new ComparisonData();