// 合併排序演算法核心邏輯
class MergeSortAlgorithm {
    constructor() {
        this.steps = [];
    }

    // 生成所有排序步驟
    generateSteps(array) {
        this.steps = [];
        const workingArray = [...array];
        this.mergeSort(workingArray, 0, array.length - 1, 0);
        return this.steps;
    }

    // 主要的合併排序函數
    mergeSort(arr, left, right, level) {
        if (left >= right) return arr;

        // 記錄分割步驟
        this.steps.push({
            type: 'divide',
            array: [...arr],
            left: left,
            right: right,
            level: level,
            description: `將陣列分割：索引 ${left} 到 ${right}`
        });

        const mid = Math.floor((left + right) / 2);
        
        // 遞迴處理左半部
        arr = this.mergeSort(arr, left, mid, level + 1);
        // 遞迴處理右半部  
        arr = this.mergeSort(arr, mid + 1, right, level + 1);
        
        // 合併
        return this.merge(arr, left, mid, right, level);
    }

    // 合併兩個有序陣列
    merge(arr, left, mid, right, level) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        this.steps.push({
            type: 'merge_start',
            array: [...arr],
            left: left,
            mid: mid,
            right: right,
            leftArr: [...leftArr],
            rightArr: [...rightArr],
            level: level,
            description: `開始合併：[${leftArr.join(',')}] 和 [${rightArr.join(',')}]`
        });

        let i = 0, j = 0, k = left;
        
        // 比較並合併
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                this.steps.push({
                    type: 'merge_compare',
                    array: [...arr],
                    comparing: [leftArr[i], rightArr[j]],
                    chosen: leftArr[i],
                    position: k,
                    level: level,
                    description: `比較 ${leftArr[i]} 和 ${rightArr[j]}，選擇 ${leftArr[i]}`
                });
                i++;
            } else {
                arr[k] = rightArr[j];
                this.steps.push({
                    type: 'merge_compare',
                    array: [...arr],
                    comparing: [leftArr[i], rightArr[j]],
                    chosen: rightArr[j],
                    position: k,
                    level: level,
                    description: `比較 ${leftArr[i]} 和 ${rightArr[j]}，選擇 ${rightArr[j]}`
                });
                j++;
            }
            k++;
        }

        // 複製剩餘元素
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            this.steps.push({
                type: 'merge_remaining',
                array: [...arr],
                value: leftArr[i],
                position: k,
                level: level,
                description: `複製剩餘元素：${leftArr[i]}`
            });
            i++;
            k++;
        }

        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            this.steps.push({
                type: 'merge_remaining',
                array: [...arr],
                value: rightArr[j],
                position: k,
                level: level,
                description: `複製剩餘元素：${rightArr[j]}`
            });
            j++;
            k++;
        }

        this.steps.push({
            type: 'merge_complete',
            array: [...arr],
            left: left,
            right: right,
            level: level,
            description: `合併完成：[${arr.slice(left, right + 1).join(',')}]`
        });

        return arr;
    }
}