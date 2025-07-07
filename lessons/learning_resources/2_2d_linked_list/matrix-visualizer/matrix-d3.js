// 矩陣視覺化工具 - D3.js互動視覺化模組
// 負責使用D3.js創建互動式矩陣動畫和視覺效果

// 檢查是否已載入
if (typeof window.MatrixD3 !== 'undefined') {
    console.warn('MatrixD3 already loaded');
}

class MatrixD3 {
    constructor() {
        this.svg = null;
        this.container = null;
        this.matrices = [];
        this.selectedMatrixIndex = 0;
        this.animationRunning = false;
        this.highlightMode = false;
        this.cellSize = 40;
        this.padding = 5;
        this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
        this.zoomScale = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        
        // 拖曳相關屬性
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.panOffset = { x: 0, y: 0 };
        
        this.initializeContainer();
    }

    // 初始化D3容器
    initializeContainer() {
        this.container = d3.select('#d3-container');
        if (this.container.empty()) {
            console.warn('D3 container not found');
            return;
        }

        // 清空容器
        this.container.selectAll('*').remove();
        
        // 創建SVG
        this.svg = this.container
            .append('svg')
            .attr('width', '100%')
            .attr('height', '600')
            .style('background-color', '#ffffff')
            .style('border', '1px solid #e0e0e0')
            .style('border-radius', '8px')
            .style('cursor', 'grab');

        // 添加滾輪縮放事件
        this.container.node().addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        });

        // 添加拖曳事件
        this.addDragEvents();

        console.log('D3 container initialized');
    }

    // 添加拖曳事件
    addDragEvents() {
        const svgNode = this.svg.node();
        
        // 滑鼠按下
        svgNode.addEventListener('mousedown', (event) => {
            this.isDragging = true;
            this.dragStart.x = event.clientX - this.panOffset.x;
            this.dragStart.y = event.clientY - this.panOffset.y;
            this.svg.style('cursor', 'grabbing');
            event.preventDefault();
        });

        // 滑鼠移動
        svgNode.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.panOffset.x = event.clientX - this.dragStart.x;
                this.panOffset.y = event.clientY - this.dragStart.y;
                this.applyTransform();
                event.preventDefault();
            }
        });

        // 滑鼠釋放
        svgNode.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.svg.style('cursor', 'grab');
        });

        // 滑鼠離開
        svgNode.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.svg.style('cursor', 'grab');
        });

        // 全局滑鼠釋放（防止拖曳時滑鼠離開SVG區域）
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.svg.style('cursor', 'grab');
            }
        });
    }

    // 應用變換（包括縮放和平移）
    applyTransform() {
        if (this.svg) {
            const matrixGroup = this.svg.select('g');
            if (!matrixGroup.empty()) {
                const baseTransform = matrixGroup.attr('data-base-transform') || '';
                const transform = `${baseTransform} translate(${this.panOffset.x}, ${this.panOffset.y}) scale(${this.zoomScale})`;
                matrixGroup.attr('transform', transform);
            }
        }
    }

    // 更新矩陣數據而不重置視圖狀態
    updateMatrices(matrices) {
        // 保存當前的視圖狀態
        const currentZoom = this.zoomScale;
        const currentPan = { ...this.panOffset };
        const currentSelection = this.selectedMatrixIndex;
        
        // 更新矩陣數據
        this.matrices = matrices;
        
        // 保持當前選擇（如果索引仍然有效）
        if (currentSelection < matrices.length) {
            this.selectedMatrixIndex = currentSelection;
        } else {
            this.selectedMatrixIndex = Math.max(0, matrices.length - 1);
        }
        
        // 渲染矩陣
        this.renderCurrentMatrix();
        
        // 恢復視圖狀態
        this.zoomScale = currentZoom;
        this.panOffset = currentPan;
        this.applyTransform();
    }

    // 設置矩陣數據（初始載入用）
    setMatrices(matrices) {
        this.matrices = matrices;
        this.selectedMatrixIndex = 0;
        this.renderCurrentMatrix();
    }

    // 選擇矩陣
    selectMatrix(index) {
        if (index >= 0 && index < this.matrices.length) {
            this.selectedMatrixIndex = index;
            this.renderCurrentMatrix();
        }
    }

    // 渲染當前選中的矩陣
    renderCurrentMatrix() {
        if (!this.svg || this.matrices.length === 0) return;

        const matrix = this.matrices[this.selectedMatrixIndex];
        const data = matrix.data;
        
        // 清空SVG
        this.svg.selectAll('*').remove();
        
        // 計算布局
        const layout = this.calculateLayout(data);
        
        // 創建矩陣組
        const matrixGroup = this.svg
            .append('g')
            .attr('data-base-transform', `translate(${layout.offsetX}, ${layout.offsetY})`)
            .attr('transform', `translate(${layout.offsetX}, ${layout.offsetY}) translate(${this.panOffset.x}, ${this.panOffset.y}) scale(${this.zoomScale})`);

        // 添加標題
        this.svg
            .append('text')
            .attr('x', layout.centerX)
            .attr('y', 30)
            .attr('class', 'matrix-label-d3')
            .text(`矩陣 ${this.selectedMatrixIndex + 1} - ${matrix.metadata.size}`);

        // 創建矩陣格子和文字
        this.createMatrixCells(matrixGroup, data, layout);
        
        // 添加行列標籤
        this.createAxisLabels(matrixGroup, data, layout);
        
        // 更新縮放顯示
        this.updateZoomDisplay();
    }

    // 計算布局參數
    calculateLayout(data) {
        const rows = data.length;
        const cols = data[0].length;
        
        const matrixWidth = cols * (this.cellSize + this.padding) - this.padding;
        const matrixHeight = rows * (this.cellSize + this.padding) - this.padding;
        
        const svgWidth = parseInt(this.svg.style('width')) || 800;
        const svgHeight = parseInt(this.svg.attr('height')) || 600;
        
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        
        const offsetX = centerX - matrixWidth / 2;
        const offsetY = centerY - matrixHeight / 2;
        
        return {
            rows,
            cols,
            matrixWidth,
            matrixHeight,
            centerX,
            centerY,
            offsetX,
            offsetY
        };
    }

    // 創建矩陣格子
    createMatrixCells(group, data, layout) {
        const cells = [];
        
        // 準備數據
        for (let i = 0; i < layout.rows; i++) {
            for (let j = 0; j < layout.cols; j++) {
                cells.push({
                    row: i,
                    col: j,
                    value: data[i][j],
                    x: j * (this.cellSize + this.padding),
                    y: i * (this.cellSize + this.padding)
                });
            }
        }

        // 創建格子
        const cellGroups = group
            .selectAll('.cell-group')
            .data(cells)
            .enter()
            .append('g')
            .attr('class', 'cell-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        // 添加矩形
        cellGroups
            .append('rect')
            .attr('class', 'matrix-cell-d3')
            .attr('width', this.cellSize)
            .attr('height', this.cellSize)
            .attr('fill', '#ffffff')
            .attr('stroke', '#cccccc')
            .attr('stroke-width', 1)
            .on('mouseover', (event, d) => this.handleCellMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleCellMouseOut(event, d))
            .on('click', (event, d) => this.handleCellClick(event, d))
            .on('dblclick', (event, d) => this.handleCellDoubleClick(event, d));

        // 添加文字
        cellGroups
            .append('text')
            .attr('class', 'matrix-text-d3')
            .attr('x', this.cellSize / 2)
            .attr('y', this.cellSize / 2)
            .attr('dy', '0.35em')
            .text(d => this.formatValue(d.value));

        return cellGroups;
    }

    // 創建軸標籤
    createAxisLabels(group, data, layout) {
        // 行標籤 (左側)
        group.selectAll('.row-label')
            .data(d3.range(layout.rows))
            .enter()
            .append('text')
            .attr('class', 'row-label matrix-text-d3')
            .attr('x', -20)
            .attr('y', d => d * (this.cellSize + this.padding) + this.cellSize / 2)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', '#666666')
            .text(d => d);

        // 列標籤 (上方)
        group.selectAll('.col-label')
            .data(d3.range(layout.cols))
            .enter()
            .append('text')
            .attr('class', 'col-label matrix-text-d3')
            .attr('x', d => d * (this.cellSize + this.padding) + this.cellSize / 2)
            .attr('y', -10)
            .style('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('fill', '#666666')
            .text(d => d);
    }

    // 格式化數值顯示
    formatValue(value) {
        if (Number.isInteger(value)) {
            return value.toString();
        }
        if (Math.abs(value) < 0.01) {
            return value.toExponential(1);
        }
        return parseFloat(value.toFixed(2)).toString();
    }

    // 處理格子滑鼠懸停
    handleCellMouseOver(event, d) {
        const cell = d3.select(event.currentTarget);
        cell.transition()
            .duration(150)
            .attr('fill', '#f0f0f0')
            .attr('stroke', '#333333')
            .attr('stroke-width', 2);

        // 顯示工具提示
        this.showTooltip(event, d);
        
        // 高亮同行同列
        if (this.highlightMode) {
            this.highlightRowCol(d.row, d.col, true);
        }
    }

    // 處理格子滑鼠離開
    handleCellMouseOut(event, d) {
        const cell = d3.select(event.currentTarget);
        cell.transition()
            .duration(150)
            .attr('fill', '#ffffff')
            .attr('stroke', '#cccccc')
            .attr('stroke-width', 1);

        // 隱藏工具提示
        this.hideTooltip();
        
        // 取消高亮
        if (this.highlightMode) {
            this.highlightRowCol(d.row, d.col, false);
        }
    }

    // 處理格子雙擊
    handleCellDoubleClick(event, d) {
        console.log(`Double clicked cell (${d.row}, ${d.col}) with value ${d.value}`);
        
        // 阻止事件冒泡，避免觸發單擊事件
        event.stopPropagation();
        
        // 取消任何現有的動畫
        const cellGroup = d3.select(event.currentTarget.parentNode);
        cellGroup.interrupt();
        
        // 確保格子回到正常大小（不添加動畫）
        cellGroup.attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
        
        // 只記錄雙擊事件，不做任何視覺效果
        console.log('D3 cell double-clicked, no visual effect applied');
    }

    // 處理格子點擊
    handleCellClick(event, d) {
        console.log(`Clicked cell (${d.row}, ${d.col}) with value ${d.value}`);
        
        // 修改點擊動畫，確保動畫結束後正確恢復
        const cellGroup = d3.select(event.currentTarget.parentNode);
        
        // 取消任何現有的動畫
        cellGroup.interrupt();
        
        // 添加點擊動畫（使用 group 而不是 cell）
        cellGroup
            .transition()
            .duration(150)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1.15)`)
            .transition()
            .duration(150)
            .attr('transform', `translate(${d.x}, ${d.y}) scale(1)`);
    }

    // 顯示工具提示
    showTooltip(event, d) {
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'matrix-tooltip')
            .style('position', 'absolute')
            .style('background-color', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '10000')
            .style('opacity', 0);

        tooltip.html(`位置: (${d.row}, ${d.col})<br/>數值: ${this.formatValue(d.value)}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    // 隱藏工具提示
    hideTooltip() {
        d3.selectAll('.matrix-tooltip')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .remove();
    }

    // 高亮行列
    highlightRowCol(row, col, highlight) {
        const cells = this.svg.selectAll('.matrix-cell-d3');
        
        cells.each(function(d, i) {
            const cell = d3.select(this);
            if (d.row === row || d.col === col) {
                cell.attr('fill', highlight ? '#f5f5f5' : '#ffffff');
            }
        });
    }

    // 開始動畫
    startAnimation(type, matrices) {
        if (this.animationRunning) {
            this.stopAnimation();
        }

        this.animationRunning = true;
        
        switch (type) {
            case 'traverse':
                this.animateTraverse();
                break;
            case 'multiply':
                this.animateMatrixMultiply();
                break;
            case 'transpose':
                this.animateTranspose();
                break;
            default:
                console.warn('Unknown animation type:', type);
        }
    }

    // 停止動畫
    stopAnimation() {
        this.animationRunning = false;
        this.svg.selectAll('.matrix-cell-d3')
            .transition()
            .attr('fill', '#ffffff');
    }

    // 遍歷動畫
    animateTraverse() {
        if (this.matrices.length === 0) return;
        
        const matrix = this.matrices[this.selectedMatrixIndex];
        const data = matrix.data;
        const cells = this.svg.selectAll('.matrix-cell-d3');
        
        let currentIndex = 0;
        const totalCells = data.length * data[0].length;
        
        const traverse = () => {
            if (!this.animationRunning || currentIndex >= totalCells) {
                this.animationRunning = false;
                return;
            }
            
            const row = Math.floor(currentIndex / data[0].length);
            const col = currentIndex % data[0].length;
            
            // 重置所有格子
            cells.attr('fill', '#ffffff');
            
            // 高亮當前格子
            cells.filter(d => d.row === row && d.col === col)
                .transition()
                .duration(200)
                .attr('fill', '#333333');
            
            currentIndex++;
            setTimeout(traverse, 500);
        };
        
        traverse();
    }

    // 矩陣乘法動畫
    animateMatrixMultiply() {
        if (this.matrices.length < 2) {
            console.warn('需要至少兩個矩陣進行乘法動畫');
            return;
        }
        
        // 這裡可以實現矩陣乘法的視覺化動畫
        console.log('Matrix multiply animation not fully implemented yet');
    }

    // 轉置動畫
    animateTranspose() {
        if (this.matrices.length === 0) return;
        
        const matrix = this.matrices[this.selectedMatrixIndex];
        const data = matrix.data;
        const cells = this.svg.selectAll('.matrix-cell-d3');
        
        // 創建轉置矩陣的視覺效果
        let step = 0;
        const maxSteps = Math.max(data.length, data[0].length);
        
        const transpose = () => {
            if (!this.animationRunning || step >= maxSteps) {
                this.animationRunning = false;
                return;
            }
            
            // 重置所有格子
            cells.attr('fill', '#ffffff');
            
            // 高亮對角線
            cells.filter(d => d.row === step || d.col === step)
                .transition()
                .duration(300)
                .attr('fill', '#666666');
            
            step++;
            setTimeout(transpose, 600);
        };
        
        transpose();
    }

    // 切換高亮模式
    toggleHighlight() {
        this.highlightMode = !this.highlightMode;
        
        if (!this.highlightMode) {
            // 取消所有高亮
            this.svg.selectAll('.matrix-cell-d3')
                .attr('fill', '#ffffff');
        }
        
        console.log('Highlight mode:', this.highlightMode ? 'ON' : 'OFF');
    }

    // 縮放矩陣
    scaleMatrix(scaleFactor) {
        this.cellSize = Math.max(20, Math.min(60, this.cellSize * scaleFactor));
        this.renderCurrentMatrix();
    }

    // 縮放放大
    zoomIn() {
        if (this.zoomScale < this.maxZoom) {
            this.zoomScale = Math.min(this.maxZoom, this.zoomScale * 1.2);
            this.applyTransform();
            this.updateZoomDisplay();
        }
    }

    // 縮放縮小
    zoomOut() {
        if (this.zoomScale > this.minZoom) {
            this.zoomScale = Math.max(this.minZoom, this.zoomScale / 1.2);
            this.applyTransform();
            this.updateZoomDisplay();
        }
    }

    // 重置縮放
    resetZoom() {
        this.zoomScale = 1;
        this.panOffset = { x: 0, y: 0 };
        this.applyTransform();
        this.updateZoomDisplay();
    }

    // 更新縮放顯示
    updateZoomDisplay() {
        // 這個功能可以在UI中顯示當前縮放級別
        console.log(`Zoom: ${Math.round(this.zoomScale * 100)}%`);
    }

    // 重置視圖
    resetView() {
        this.cellSize = 40;
        this.selectedMatrixIndex = 0;
        this.highlightMode = false;
        this.zoomScale = 1;
        this.panOffset = { x: 0, y: 0 };
        this.stopAnimation();
        this.renderCurrentMatrix();
        this.updateZoomDisplay();
    }

    // 獲取當前狀態
    getCurrentState() {
        return {
            selectedMatrix: this.selectedMatrixIndex,
            animationRunning: this.animationRunning,
            highlightMode: this.highlightMode,
            cellSize: this.cellSize,
            zoomScale: this.zoomScale,
            panOffset: this.panOffset
        };
    }

    // 清理資源
    cleanup() {
        this.stopAnimation();
        this.hideTooltip();
        if (this.container) {
            this.container.selectAll('*').remove();
        }
    }
}

// 將MatrixD3設為全局可訪問
window.MatrixD3 = MatrixD3;
console.log('MatrixD3 loaded successfully');