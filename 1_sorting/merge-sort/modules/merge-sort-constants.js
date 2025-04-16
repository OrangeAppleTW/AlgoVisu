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

// 顏色定義 (黑白簡約風格)
export const MERGE_COLORS = {
    UNSORTED: '#A0AEC0',      // 未排序 - 淺灰色
    COMPARING: '#4A5568',     // 正在比較 - 深灰色
    DIVIDING: '#805AD5',      // 正在分割 - 紫色
    MERGING: '#1A365D',       // 正在合併 - 深藍色
    SORTED: '#2C5282',        // 已排序 - 藍色
    ACTIVE_COMPARING: '#2B6CB0', // 活躍比較元素 - 深藍色
    COMPLETED: '#1A365D'      // 完成排序 (深藍色)
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