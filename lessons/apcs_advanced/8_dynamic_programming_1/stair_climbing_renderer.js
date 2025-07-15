/**
 * 爬樓梯問題的渲染和視覺化邏輯
 */

class StairClimbingRenderer {
    constructor() {
        this.dpTableElement = null;
        this.treeContainer = null;
        this.currentCalculation = null;
    }

    /**
     * 初始化渲染器
     */
    initialize() {
        this.dpTableElement = document.getElementById('dp-table');
        this.treeContainer = document.getElementById('tree-container');
        this.currentCalculation = document.getElementById('current-calculation');
    }

    /**
     * 渲染DP表格
     * @param {number} n - 樓梯階數
     * @param {Array} dpState - 當前DP表格狀態
     * @param {Object} stepInfo - 當前步驟信息
     */
    renderDPTable(n, dpState, stepInfo = null) {
        if (!this.dpTableElement) return;

        // 清空現有表格
        this.dpTableElement.innerHTML = '';

        // 創建表頭
        const headerRow1 = document.createElement('tr');
        const headerRow2 = document.createElement('tr');
        
        // 階數行
        const indexHeader = document.createElement('th');
        indexHeader.textContent = '階數 (i)';
        headerRow1.appendChild(indexHeader);
        
        // dp值行
        const valueHeader = document.createElement('th');
        valueHeader.textContent = 'dp[i]';
        headerRow2.appendChild(valueHeader);

        // 創建數據單元格
        for (let i = 1; i <= n; i++) {
            // 階數
            const indexCell = document.createElement('th');
            indexCell.textContent = i;
            headerRow1.appendChild(indexCell);
            
            // dp值
            const valueCell = document.createElement('td');
            valueCell.id = `dp-cell-${i}`;
            
            if (dpState[i] !== null) {
                valueCell.textContent = dpState[i];
                valueCell.className = 'completed';
            } else {
                valueCell.textContent = '?';
                valueCell.className = 'empty';
            }
            
            headerRow2.appendChild(valueCell);
        }

        this.dpTableElement.appendChild(headerRow1);
        this.dpTableElement.appendChild(headerRow2);

        // 高亮當前計算的單元格
        if (stepInfo) {
            this.highlightCurrentCalculation(stepInfo);
        }
    }

    /**
     * 高亮當前計算
     * @param {Object} stepInfo - 步驟信息
     */
    highlightCurrentCalculation(stepInfo) {
        // 清除之前的高亮
        const allCells = this.dpTableElement.querySelectorAll('td');
        allCells.forEach(cell => {
            cell.classList.remove('highlight', 'calculating');
        });

        if (stepInfo.type === 'prepare' || stepInfo.type === 'calculate') {
            // 高亮當前計算的位置
            const currentCell = document.getElementById(`dp-cell-${stepInfo.currentIndex}`);
            if (currentCell) {
                currentCell.classList.add(stepInfo.type === 'prepare' ? 'calculating' : 'highlight');
            }

            // 高亮依賴的位置
            if (stepInfo.dependencies) {
                stepInfo.dependencies.forEach(dep => {
                    const depCell = document.getElementById(`dp-cell-${dep}`);
                    if (depCell) {
                        depCell.classList.add('highlight');
                    }
                });
            }
        }
    }

    /**
     * 更新當前計算說明
     * @param {Object} stepInfo - 步驟信息
     */
    updateCurrentCalculation(stepInfo) {
        if (!this.currentCalculation || !stepInfo) return;

        this.currentCalculation.innerHTML = `
            <strong>${stepInfo.message}</strong><br>
            <span class="details">${stepInfo.details}</span>
        `;

        // 根據步驟類型設置樣式
        this.currentCalculation.className = 'current-calculation';
        if (stepInfo.type === 'calculate' || stepInfo.type === 'prepare') {
            this.currentCalculation.classList.add('calculating');
        }
    }

    /**
     * 渲染狀態轉移樹
     * @param {Object} treeData - 樹數據
     * @param {Object} stepInfo - 當前步驟信息
     */
    renderStateTree(treeData, stepInfo = null) {
        if (!this.treeContainer) return;

        this.treeContainer.innerHTML = '';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '450');
        svg.setAttribute('viewBox', '0 0 900 450');
        
        // 計算節點位置
        const positions = this.calculateNodePositions(treeData, 900, 450);
        
        // 繪製連接線
        this.drawTreeConnections(svg, positions);
        
        // 繪製節點
        this.drawTreeNodes(svg, positions, stepInfo);
        
        this.treeContainer.appendChild(svg);
    }

    /**
     * 計算樹節點位置
     * @param {Object} treeData - 樹數據
     * @param {number} width - SVG寬度
     * @param {number} height - SVG高度
     */
    calculateNodePositions(treeData, width, height) {
        const positions = new Map();
        const levelHeight = height / 5; // 最多5層
        
        this.calculatePositionsRecursive(treeData, width / 2, 50, positions, levelHeight, width / 4);
        return positions;
    }

    /**
     * 遞歸計算節點位置
     */
    calculatePositionsRecursive(node, x, y, positions, levelHeight, hSpacing) {
        positions.set(node, { x, y, data: node });
        
        if (node.children && node.children.length > 0) {
            const childY = y + levelHeight;
            const childSpacing = hSpacing;
            const startX = x - (childSpacing * (node.children.length - 1)) / 2;
            
            node.children.forEach((child, index) => {
                const childX = startX + index * childSpacing;
                this.calculatePositionsRecursive(child, childX, childY, positions, levelHeight, hSpacing / 2);
            });
        }
    }

    /**
     * 繪製樹的連接線
     */
    drawTreeConnections(svg, positions) {
        positions.forEach((pos, node) => {
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    const childPos = positions.get(child);
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', pos.x);
                    line.setAttribute('y1', pos.y + 25); // 節點半徑
                    line.setAttribute('x2', childPos.x);
                    line.setAttribute('y2', childPos.y - 25);
                    line.setAttribute('stroke', '#6c757d');
                    line.setAttribute('stroke-width', '2');
                    svg.appendChild(line);
                });
            }
        });
    }

    /**
     * 繪製樹節點
     */
    drawTreeNodes(svg, positions, stepInfo) {
        positions.forEach((pos, node) => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // 創建圓形節點
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', '25'); // 預設半徑增加
            
            // 設置節點樣式
            let fillColor = '#f8f9fa';
            let strokeColor = '#6c757d';
            let textColor = '#000';
            
            if (node.baseCase) {
                fillColor = '#d4edda';
                strokeColor = '#28a745';
                textColor = '#155724';
            } else if (node.computed) {
                fillColor = '#cce5ff';
                strokeColor = '#007bff';
                textColor = '#0056b3';
            } else if (node.duplicate) {
                fillColor = '#f8d7da';
                strokeColor = '#dc3545';
                textColor = '#721c24';
            }
            
            // 如果是當前步驟中的節點，特殊高亮
            if (stepInfo && stepInfo.currentIndex === node.value) {
                fillColor = '#fff3cd';
                strokeColor = '#ffc107';
                textColor = '#856404';
                circle.setAttribute('r', '30'); // 放大當前節點
            }
            
            circle.setAttribute('fill', fillColor);
            circle.setAttribute('stroke', strokeColor);
            circle.setAttribute('stroke-width', '2');
            
            // 創建文字
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pos.x);
            text.setAttribute('y', pos.y + 6);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '16');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', textColor);
            text.textContent = `f(${node.value})`;
            
            group.appendChild(circle);
            group.appendChild(text);
            svg.appendChild(group);
        });
    }

    /**
     * 高亮DP步驟卡片
     * @param {string} stepId - 步驟ID
     */
    highlightDPStep(stepId) {
        // 清除之前的高亮
        const allSteps = document.querySelectorAll('.step-card');
        allSteps.forEach(step => step.classList.remove('active'));

        // 高亮當前步驟
        const currentStep = document.getElementById(stepId);
        if (currentStep) {
            currentStep.classList.add('active');
        }
    }

    /**
     * 顯示複雜度比較
     * @param {Object} comparisonData - 比較數據
     */
    renderComplexityComparison(comparisonData) {
        const comparisonHtml = `
            <div class="complexity-comparison">
                <h4>演算法效率比較</h4>
                <div class="comparison-grid">
                    <div class="comparison-item recursive">
                        <h5>純遞迴方法</h5>
                        <p>函數調用次數: <strong>${comparisonData.recursive.calls}</strong></p>
                        <p>時間複雜度: <strong>${comparisonData.recursive.complexity}</strong></p>
                        <p class="description">${comparisonData.recursive.description}</p>
                    </div>
                    <div class="comparison-item dp">
                        <h5>動態規劃方法</h5>
                        <p>計算次數: <strong>${comparisonData.dp.calls}</strong></p>
                        <p>時間複雜度: <strong>${comparisonData.dp.complexity}</strong></p>
                        <p class="description">${comparisonData.dp.description}</p>
                    </div>
                </div>
                <div class="improvement-note">
                    <strong>效率提升: ${comparisonData.improvement}倍</strong>
                    <p>動態規劃通過避免重複計算，顯著提升了演算法效率！</p>
                </div>
            </div>
        `;

        // 將比較結果添加到頁面適當位置
        const targetElement = document.querySelector('.key-insights');
        if (targetElement) {
            const existingComparison = targetElement.querySelector('.complexity-comparison');
            if (existingComparison) {
                existingComparison.innerHTML = comparisonHtml;
            } else {
                targetElement.insertAdjacentHTML('afterend', comparisonHtml);
            }
        }
    }

    /**
     * 顯示載入動畫
     */
    showLoading() {
        if (this.currentCalculation) {
            this.currentCalculation.innerHTML = `
                <div class="loading-animation">
                    <span>準備動畫...</span>
                    <div class="spinner"></div>
                </div>
            `;
        }
    }

    /**
     * 隱藏載入動畫
     */
    hideLoading() {
        if (this.currentCalculation) {
            this.currentCalculation.innerHTML = '';
        }
    }

    /**
     * 添加表格動畫效果
     * @param {number} index - 位置索引
     * @param {number} value - 新值
     */
    animateTableUpdate(index, value) {
        const cell = document.getElementById(`dp-cell-${index}`);
        if (cell) {
            // 添加動畫類
            cell.classList.add('new-value');
            cell.textContent = value;
            
            // 移除動畫類
            setTimeout(() => {
                cell.classList.remove('new-value');
            }, 500);
        }
    }

    /**
     * 重置所有視覺化元素
     */
    resetVisualization() {
        if (this.dpTableElement) {
            const allCells = this.dpTableElement.querySelectorAll('td');
            allCells.forEach(cell => {
                cell.classList.remove('highlight', 'calculating', 'new-value');
            });
        }

        if (this.currentCalculation) {
            this.currentCalculation.innerHTML = '點擊「開始動畫」來觀察表格建立過程';
            this.currentCalculation.className = 'current-calculation';
        }

        // 重置DP步驟卡片
        const allStepCards = document.querySelectorAll('.step-card');
        allStepCards.forEach(card => card.classList.remove('active'));
    }
}

// 全域渲染器實例
const stairClimbingRenderer = new StairClimbingRenderer();