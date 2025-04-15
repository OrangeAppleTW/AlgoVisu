// merge-sort-visualization.js
// 視覺化相關功能：渲染數組、動畫等

import { 
    MergeState, 
    getMergeBarColor
} from './merge-sort-constants.js';

// 初始化SVG圖表
function initMergeSvg() {
    // 清空SVG內容
    d3.select('#merge-svg').remove();
    
    // 創建SVG元素
    const visualizationContainer = document.querySelector('#merge .visualization-container');
    if (!visualizationContainer) {
        console.warn('找不到視覺化容器元素');
        return;
    }
    
    try {
        const svg = d3.select(visualizationContainer)
            .append('svg')
            .attr('id', 'merge-svg')
            .attr('width', '100%')
            .attr('height', '300px');
        
        // 設置邊界 - 足夠的邊距讓視覺效果美觀
        const margin = { top: 30, right: 80, bottom: 30, left: 80 };
        
        // 添加一個圖形容器，用於繪製柱狀圖
        svg.append('g')
           .attr('class', 'bars-container')
           .attr('transform', `translate(${margin.left}, ${margin.top})`);
           
        console.log('SVG初始化完成');
    } catch (error) {
        console.error('SVG初始化失敗:', error);
    }
}

// 使用D3.js渲染數組
// highlightIndices 可以是一個包含需要突出顯示的元素索引的數組
// 例如：[{index: 2, color: 'red'}, {index: 5, color: 'blue'}]
function renderMergeArray(highlightIndices = []) {
    // 防止在沒有DOM元素的情況下執行
    if (!document.getElementById('merge-svg')) {
        console.warn('SVG 元素不存在，初始化SVG');
        initMergeSvg();
        
        // 如果仍然沒有元素，直接返回
        if (!document.getElementById('merge-svg')) {
            return;
        }
    }
    
    // 確保有數組可以渲染
    if (!MergeState.array || MergeState.array.length === 0) {
        console.warn('數組為空，不進行渲染');
        return;
    }
    
    try {
        // 設置SVG基本參數
        const svg = d3.select('#merge-svg');
        const margin = { top: 30, right: 80, bottom: 30, left: 80 };
        const width = parseInt(svg.style('width')) || 800;
        const height = parseInt(svg.style('height')) || 300;
        const contentWidth = width - margin.left - margin.right;
        const contentHeight = height - margin.top - margin.bottom;
        
        // 建立比例尺 - 使用更合適的比例尺
        const xScale = d3.scaleBand()
            .domain(d3.range(MergeState.array.length))
            .range([0, contentWidth * 0.8]) // 使用80%的空間
            .padding(0.25); // 適當的填充
            
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(MergeState.array, d => d.value) * 1.1])
            .range([contentHeight - 30, 0]); // 保留空間給數字
            
        // 選擇容器
        const container = svg.select('.bars-container');
        
        // 計算中心偏移，讓柱子居中
        const centerOffset = (contentWidth - xScale.range()[1]) / 2;
        
        // 按position排序數組以便正確渲染
        const sortedArray = [...MergeState.array].sort((a, b) => a.position - b.position);
        
        // 數據綁定 - 使用id作為key
        const barGroups = container.selectAll('.bar')
            .data(sortedArray, d => d.id);
            
        // 刪除不需要的元素
        barGroups.exit().remove();
        
        // 添加新元素
        const barGroupsEnter = barGroups.enter()
            .append('g')
            .attr('class', 'bar')
            .attr('id', d => `bar-${d.id}`)
            .attr('transform', d => `translate(${centerOffset + xScale(d.position)}, 0)`);
        
        // 添加矩形
        barGroupsEnter.append('rect')
            .attr('x', 0)
            .attr('y', d => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', d => contentHeight - yScale(d.value) - 30)
            .attr('fill', d => {
                // 檢查是否需要突出顯示
                const highlight = highlightIndices.find(h => h.index === d.position);
                if (highlight) {
                    return highlight.color || getMergeBarColor(d.state);
                }
                return getMergeBarColor(d.state);
            })
            .attr('rx', 2)
            .attr('ry', 2);
        
        // 添加文字 - 數值顯示在柱子上方
        barGroupsEnter.append('text')
            .attr('x', xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value) - 5)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .attr('font-size', '11px')
            .text(d => d.value);
        
        // 更新現有元素 - 根據速度設置調整動畫時間
        const speedSlider = document.getElementById('merge-speed');
        const speedValue = speedSlider ? parseInt(speedSlider.value) : 50;
        const duration = 1000 - (speedValue * 8); // 速度越快，動畫時間越短
        
        // 使用transform移動整個組，這樣更流暢，加入彈跳效果
        barGroups.transition()
            .duration(duration)
            .attr('transform', d => `translate(${centerOffset + xScale(d.position)}, 0)`)
            .ease(d3.easeBounce); // 添加彈跳效果模擬物理運動
        
        // 更新矩形顏色
        barGroups.select('rect')
            .transition()
            .duration(duration)
            .attr('fill', d => {
                // 檢查是否需要突出顯示
                const highlight = highlightIndices.find(h => h.index === d.position);
                if (highlight) {
                    return highlight.color || getMergeBarColor(d.state);
                }
                return getMergeBarColor(d.state);
            })
            .attr('y', d => yScale(d.value))
            .attr('height', d => contentHeight - yScale(d.value) - 30);
            
        // 更新文字位置
        barGroups.select('text')
            .transition()
            .duration(duration)
            .attr('y', d => yScale(d.value) - 5);
    } catch (error) {
        console.error('渲染數組時發生錯誤:', error);
    }
}

// 導出所有需要的函數
export {
    initMergeSvg,
    renderMergeArray
};

