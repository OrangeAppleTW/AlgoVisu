/**
 * 氣泡排序核心邏輯和工具函數
 * 用於時間與空間複雜度教學
 */

class BubbleSortVisualizer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.width = options.width || 800;
        this.height = options.height || 300;
        this.margin = { top: 20, right: 20, bottom: 50, left: 20 };
        
        this.data = [];
        this.originalData = [];
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.speed = 500; // 動畫間隔時間 (毫秒)
        this.direction = 'ascending'; // 'ascending' 或 'descending'
        
        // 統計數據
        this.comparisons = 0;
        this.swaps = 0;
        this.passes = 0;
        this.currentI = -1;
        this.currentJ = -1;
        
        // 回調函數
        this.onUpdate = options.onUpdate || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onStep = options.onStep || (() => {});
        
        this.initSVG();
    }
    
    initSVG() {
        // 完全清除舊的內容
        this.container.innerHTML = '';
        
        // 創建新的 SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background-color', '#ffffff')
            .style('border', '1px solid #e0e0e0')
            .style('border-radius', '4px')
            .style('display', 'block') // 確保顯示為區塊元素
            .style('margin', '0 auto'); // 置中顯示
            
        // 創建圖表區域
        this.chartArea = this.svg.append('g')
            .attr('class', 'chart-area')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    }
    
    /**
     * 設定要排序的資料
     */
    setData(data, label = '') {
        this.data = [...data];
        this.originalData = [...data];
        this.currentStep = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.passes = 0;
        this.currentI = -1;
        this.currentJ = -1;
        this.isRunning = false;
        this.isPaused = false;
        this.dataLabel = label;
        
        this.render();
        this.onUpdate(this.getStats());
    }
    
    /**
     * 設定排序方向
     */
    setDirection(direction) {
        this.direction = direction;
    }
    
    /**
     * 生成不同情況的測試資料
     */
    generateTestData(type, size = 8) {
        let data = [];
        
        switch (type) {
            case 'best': // 最佳情況：已按目標方向排序
                if (this.direction === 'ascending') {
                    // 由小到大：已排序(小到大)
                    data = Array.from({ length: size }, (_, i) => i + 1);
                } else {
                    // 由大到小：已排序(大到小)
                    data = Array.from({ length: size }, (_, i) => size - i);
                }
                break;
                
            case 'worst': // 最差情況：與目標方向相反的排序
                if (this.direction === 'ascending') {
                    // 由小到大：反向排序(大到小)
                    data = Array.from({ length: size }, (_, i) => size - i);
                } else {
                    // 由大到小：反向排序(小到大)
                    data = Array.from({ length: size }, (_, i) => i + 1);
                }
                break;
                
            case 'average': // 平均情況：隨機排列
                data = Array.from({ length: size }, (_, i) => i + 1);
                // Fisher-Yates 洗牌演算法
                for (let i = data.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [data[i], data[j]] = [data[j], data[i]];
                }
                break;
                
            case 'custom':
                data = [...arguments[1]]; // 使用傳入的自訂資料
                break;
                
            default:
                data = [4, 2, 7, 1, 3, 6, 5, 8];
        }
        
        return data;
    }
    
    /**
     * 渲染視覺化圖表
     */
    render() {
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        const maxValue = Math.max(...this.data);
        
        // 維持原本的長方形寬度，但縮小間距
        const dataCount = this.data.length;
        let barWidthRatio = 0.5; // 維持原本的長方形寬度
        
        // 根據元素數量調整寬度
        if (dataCount >= 12) {
            barWidthRatio = 0.4;
        } else if (dataCount >= 10) {
            barWidthRatio = 0.45;
        } else if (dataCount >= 8) {
            barWidthRatio = 0.5;
        } else if (dataCount >= 6) {
            barWidthRatio = 0.55;
        } else {
            barWidthRatio = 0.6;
        }
        
        // 計算實際的長方形寬度（固定大小）
        const barWidth = chartWidth / dataCount * barWidthRatio;
        
        // 縮小間距為原本的 60%
        const spacingReduction = 0.6;
        const originalSpacing = chartWidth / dataCount * (1 - barWidthRatio);
        const newSpacing = originalSpacing * spacingReduction;
        
        // 計算總寬度（所有長方形 + 所有間距）
        const totalContentWidth = (barWidth * dataCount) + (newSpacing * (dataCount - 1));
        
        // 計算置中偏移量
        const centerOffset = (chartWidth - totalContentWidth) / 2;
        
        // x 座標計算函數（加入置中偏移）
        const xScale = (i) => centerOffset + i * (barWidth + newSpacing);
        
        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0]);
        
        // 完全清除舊的元素，確保沒有重複
        this.chartArea.selectAll('*').remove();
        
        // 創建柱狀圖群組
        const barGroups = this.chartArea.selectAll('.bar-group')
            .data(this.data)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', (d, i) => `translate(${xScale(i)}, 0)`);
        
        // 創建柱狀圖
        barGroups.append('rect')
            .attr('class', 'bar')
            .attr('width', barWidth)
            .attr('height', (d) => chartHeight - yScale(d))
            .attr('y', (d) => yScale(d))
            .attr('fill', '#A0AEC0') // 預設顏色：未排序
            .attr('stroke', '#888')
            .attr('stroke-width', 1)
            .attr('rx', 2) // 圓角
            .attr('ry', 2);
        
        // 加入數值標籤（根據長方形寬度調整字體大小）
        const fontSize = Math.max(10, Math.min(12, barWidth * 0.8));
        barGroups.append('text')
            .attr('class', 'bar-text')
            .attr('x', barWidth / 2)
            .attr('y', (d) => yScale(d) - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', '#333')
            .attr('font-family', 'monospace')
            .attr('font-size', `${fontSize}px`)
            .attr('font-weight', 'bold')
            .text((d) => d);
        
        // 加入索引標籤
        const indexFontSize = Math.max(8, Math.min(10, barWidth * 0.6));
        barGroups.append('text')
            .attr('class', 'index-text')
            .attr('x', barWidth / 2)
            .attr('y', chartHeight + 15)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .attr('font-family', 'monospace')
            .attr('font-size', `${indexFontSize}px`)
            .text((d, i) => i);
    }
    
    /**
     * 更新視覺化（用於動畫）
     */
    updateVisualization() {
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        const maxValue = Math.max(...this.data);
        
        const yScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([chartHeight, 0]);
        
        // 更新柱狀圖高度和位置
        this.chartArea.selectAll('.bar')
            .data(this.data)
            .transition()
            .duration(200)
            .attr('height', (d) => chartHeight - yScale(d))
            .attr('y', (d) => yScale(d));
        
        // 更新數值標籤
        this.chartArea.selectAll('.bar-text')
            .data(this.data)
            .transition()
            .duration(200)
            .attr('y', (d) => yScale(d) - 5)
            .text((d) => d);
    }
    
    /**
     * 突出顯示正在比較的元素
     */
    highlightComparing(i, j) {
        this.chartArea.selectAll('.bar')
            .attr('fill', (d, index) => {
                if (index === i || index === j) return '#E53E3E'; // 比較中（紅色）
                if (this.direction === 'ascending' && index >= this.data.length - this.passes) return '#2D5A27'; // 已排序（綠色）
                if (this.direction === 'descending' && index <= this.passes - 1) return '#2D5A27'; // 已排序（綠色）
                return '#A0AEC0'; // 未排序
            });
    }
    
    /**
     * 突出顯示正在交換的元素
     */
    highlightSwapping(i, j) {
        this.chartArea.selectAll('.bar')
            .attr('fill', (d, index) => {
                if (index === i || index === j) return '#3182CE'; // 交換中（藍色）
                if (this.direction === 'ascending' && index >= this.data.length - this.passes) return '#2D5A27'; // 已排序（綠色）
                if (this.direction === 'descending' && index <= this.passes - 1) return '#2D5A27'; // 已排序（綠色）
                return '#A0AEC0'; // 未排序
            });
    }
    
    /**
     * 標記已排序區域
     */
    markSorted(sortedIndex) {
        this.chartArea.selectAll('.bar')
            .attr('fill', (d, index) => {
                if (this.direction === 'ascending' && index >= sortedIndex) return '#2D5A27'; // 已排序（綠色）
                if (this.direction === 'descending' && index <= sortedIndex) return '#2D5A27'; // 已排序（綠色）
                return '#A0AEC0'; // 未排序
            });
    }
    
    /**
     * 標記全部完成
     */
    markAllSorted() {
        this.chartArea.selectAll('.bar')
            .attr('fill', '#2D5A27'); // 全部已排序（綠色）
    }
    
    /**
     * 執行單步氣泡排序
     */
    bubbleSortStep() {
        const n = this.data.length;
        
        // 如果已經完成所有輪次
        if (this.passes >= n - 1) {
            this.markAllSorted();
            return { finished: true, action: 'completed' };
        }
        
        // 計算當前輪次應該比較的範圍
        const currentPass = this.passes;
        const maxComparisons = n - 1 - currentPass; // 當前輪次的最大比較次數
        
        // 如果當前輪次已經完成所有比較
        if (this.currentStep >= maxComparisons) {
            this.passes++;
            this.currentStep = 0;
            
            // 標記已排序的元素
            if (this.direction === 'ascending') {
                this.markSorted(n - currentPass - 1); // 標記右邊已排序
            } else {
                this.markSorted(currentPass + 1); // 標記左邊已排序
            }
            
            return { finished: false, action: 'pass_completed', pass: currentPass + 1 };
        }
        
        let i, j;
        
        if (this.direction === 'ascending') {
            // 由左到右排序，每輪把最大值推到右邊
            i = this.currentStep;
            j = this.currentStep + 1;
        } else {
            // 由右到左排序，每輪把最小值推到左邊
            i = n - 1 - this.currentStep;
            j = n - 2 - this.currentStep;
        }
        
        this.currentI = i;
        this.currentJ = j;
        
        // 進行比較
        this.comparisons++;
        this.highlightComparing(i, j);
        
        let action = 'compare';
        let shouldSwap = false;
        
        // 檢查是否需要交換
        if (this.direction === 'ascending') {
            shouldSwap = this.data[i] > this.data[j];
        } else {
            shouldSwap = this.data[i] < this.data[j];
        }
        
        if (shouldSwap) {
            // 執行交換
            [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
            this.swaps++;
            this.highlightSwapping(i, j);
            action = 'swap';
        }
        
        this.currentStep++;
        
        return {
            finished: false,
            action: action,
            indices: [i, j],
            values: [this.data[i], this.data[j]],
            swapped: shouldSwap
        };
    }
    
    /**
     * 自動執行氣泡排序
     */
    async autoSort() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        while (!this.isPaused && this.passes < this.data.length - 1) {
            const result = this.bubbleSortStep();
            this.updateVisualization();
            
            this.onStep(result);
            this.onUpdate(this.getStats());
            
            if (result.finished) {
                break;
            }
            
            // 等待動畫時間
            await this.sleep(this.speed);
        }
        
        if (this.passes >= this.data.length - 1) {
            this.markAllSorted();
            this.onComplete(this.getStats());
        }
        
        this.isRunning = false;
    }
    
    /**
     * 暫停自動排序
     */
    pause() {
        this.isPaused = true;
        this.isRunning = false;
    }
    
    /**
     * 重置排序
     */
    reset() {
        this.pause();
        this.data = [...this.originalData];
        this.currentStep = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.passes = 0;
        this.currentI = -1;
        this.currentJ = -1;
        
        this.render();
        this.onUpdate(this.getStats());
    }
    
    /**
     * 設定動畫速度
     */
    setSpeed(speed) {
        this.speed = speed;
    }
    
    /**
     * 獲取統計資料
     */
    getStats() {
        const n = this.data.length;
        const progress = this.passes / (n - 1) * 100;
        
        return {
            comparisons: this.comparisons,
            swaps: this.swaps,
            passes: this.passes,
            progress: Math.min(progress, 100),
            isCompleted: this.passes >= n - 1,
            currentData: [...this.data],
            originalData: [...this.originalData],
            currentIndices: [this.currentI, this.currentJ],
            direction: this.direction
        };
    }
    
    /**
     * 檢查是否已排序完成
     */
    isSorted() {
        for (let i = 0; i < this.data.length - 1; i++) {
            if (this.direction === 'ascending' && this.data[i] > this.data[i + 1]) {
                return false;
            }
            if (this.direction === 'descending' && this.data[i] < this.data[i + 1]) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * 計算理論複雜度
     */
    calculateTheoretical(dataType, size) {
        switch (dataType) {
            case 'best': // 最佳情況：已按目標方向排序
                return {
                    comparisons: size - 1, // 只需要一輪比較
                    swaps: 0, // 不需要交換
                    timeComplexity: 'O(n)'
                };
                
            case 'worst': // 最差情況：與目標方向相反
                return {
                    comparisons: size * (size - 1) / 2, // 所有可能的比較
                    swaps: size * (size - 1) / 2, // 所有可能的交換
                    timeComplexity: 'O(n²)'
                };
                
            case 'average': // 平均情況：隨機排列
                return {
                    comparisons: size * (size - 1) / 2, // 所有可能的比較
                    swaps: size * (size - 1) / 4, // 平均交換次數
                    timeComplexity: 'O(n²)'
                };
                
            default:
                return {
                    comparisons: '未知',
                    swaps: '未知',
                    timeComplexity: 'O(n²)'
                };
        }
    }
    
    /**
     * 工具函數：睡眠
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 工具函數：驗證陣列是否已排序
 */
function isArraySorted(arr, direction = 'ascending') {
    for (let i = 0; i < arr.length - 1; i++) {
        if (direction === 'ascending' && arr[i] > arr[i + 1]) {
            return false;
        }
        if (direction === 'descending' && arr[i] < arr[i + 1]) {
            return false;
        }
    }
    return true;
}

/**
 * 工具函數：格式化數字
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * 工具函數：計算百分比差異
 */
function calculatePercentageDifference(actual, theoretical) {
    if (theoretical === 0) return actual === 0 ? 0 : 100;
    return Math.abs((actual - theoretical) / theoretical * 100);
}

// 導出供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BubbleSortVisualizer,
        isArraySorted,
        formatNumber,
        calculatePercentageDifference
    };
}
