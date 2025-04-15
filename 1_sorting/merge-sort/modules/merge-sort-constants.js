// merge-sort-constants.js
// 合併排序常量和狀態定義

// 狀態管理對象
export const MergeState = {
    array: [],
    running: false,
    comparisonCount: 0,
    swapCount: 0,
    animationTimer: null,
    
    // 初始化/重置狀態
    reset() {
        this.array = [];
        this.running = false;
        this.comparisonCount = 0;
        this.swapCount = 0;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
    },
    
    // 生成新數組
    generate(length = 15, min = 5, max = 100) {
        this.reset();
        this.array = Array.from({ length }, (_, i) => ({
            id: i,
            value: Math.floor(Math.random() * (max - min + 1)) + min,
            position: i,
            state: 'unsorted'
        }));
        console.log('數組生成完成：', this.array.length);
        return this.array;
    },
    
    // 檢查狀態是否正確
    checkState() {
        if (!this.array || this.array.length === 0) {
            console.warn('MergeState: 數組為空');
            return false;
        }
        return true;
    },
    
    // 排序數組（用於測試）
    sortArray() {
        this.array.sort((a, b) => a.value - b.value);
        // 更新位置
        this.array.forEach((element, index) => {
            element.position = index;
        });
        return this.array;
    }
};

// 顏色定義
export const MERGE_COLORS = {
    UNSORTED: '#3498db',      // 未排序
    COMPARING: '#f39c12',     // 正在比較
    DIVIDING: '#9b59b6',      // 正在分割
    MERGING: '#e74c3c',       // 正在合併
    SORTED: '#2ecc71',        // 已排序
    ACTIVE_COMPARING: '#FF5733', // 活躍比較元素
    COMPLETED: '#27ae60'      // 完成排序（深綠色）
};

// 根據柱子狀態獲取顏色
export function getMergeBarColor(state) {
    switch (state) {
        case 'comparing': return MERGE_COLORS.COMPARING;
        case 'dividing': return MERGE_COLORS.DIVIDING;
        case 'merging': return MERGE_COLORS.MERGING;
        case 'sorted': return MERGE_COLORS.SORTED;
        case 'activeComparing': return MERGE_COLORS.ACTIVE_COMPARING;
        default: return MERGE_COLORS.UNSORTED;
    }
}

// 更新效能指標
export function updateMergePerformanceMetrics() {
    const comparisonsElement = document.getElementById('merge-comparisons');
    const swapsElement = document.getElementById('merge-swaps');
    
    if (comparisonsElement) {
        comparisonsElement.textContent = MergeState.comparisonCount;
    }
    
    if (swapsElement) {
        swapsElement.textContent = MergeState.swapCount;
    }
}

// 取得動畫速度
export function getMergeAnimationSpeed() {
    const speedSlider = document.getElementById('merge-speed');
    const speedValue = speedSlider ? parseInt(speedSlider.value) : 50;
    const speed = (101 - speedValue) * 5; // 速度轉換，符合氣泡排序
    return speed;
}

// 等待指定的毫秒數，同時捕獲取消事件
export function sleep(ms) {
    return new Promise((resolve, reject) => {
        MergeState.animationTimer = setTimeout(() => {
            if (!MergeState.running) {
                reject(new Error('排序已取消'));
            } else {
                resolve();
            }
        }, ms);
    });
}