/**
 * 狀態轉移樹頁面的渲染器
 */

class StateTreeRenderer {
    constructor() {
        this.svg = null;
        this.selectedNode = null;
        this.highlightedPath = [];
        this.dpTableContainer = null;
        this.currentAnimationType = 'dp'; // 'dp' 或 'recursive'
        this.currentDPProgress = 2; // 當前DP計算進度
    }

    /**
     * 初始化渲染器
     */
    initialize() {
        this.elements = {
            treeContainer: document.getElementById('tree-container'),
            dpTableContainer: document.getElementById('dp-table-container'),
            totalNodes: document.getElementById('total-nodes'),
            uniqueProblems: document.getElementById('unique-problems'),
            duplicateCalculations: document.getElementById('duplicate-calculations'),
            memoizationSavings: document.getElementById('memoization-savings'),
            duplicationMatrix: document.getElementById('duplication-matrix'),
            nodeInspector: document.getElementById('node-inspector'),
            traceTarget: document.getElementById('trace-target'),
            traceInfo: document.getElementById('trace-info'),
            animationProgress: document.getElementById('animation-progress'),
            progressText: document.getElementById('progress-text'),
            animationInfo: document.getElementById('animation-info'),
            dpComparison: document.getElementById('dp-comparison'),
            recursiveStats: document.getElementById('recursive-stats'),
            dpStats: document.getElementById('dp-stats')
        };
    }

    /**
     * 渲染DP表格
     */
    renderDPTable(dpTable, highlightValues = [], newlyComputed = []) {
        if (!this.elements.dpTableContainer) return;

        let html = '<div class="dp-table-header">動態規劃表格</div>';
        html += '<div class="dp-table-wrapper">';
        html += '<table class="dp-table">';
        html += '<thead><tr><th>子問題</th><th>計算值</th><th>狀態</th></tr></thead>';
        html += '<tbody>';

        const maxValue = Math.max(...Object.keys(dpTable).map(Number), stateTreeData.n);
        
        for (let i = 1; i <= maxValue; i++) {
            const value = dpTable[i];
            const isComputed = value !== undefined;
            const isHighlighted = highlightValues.includes(i);
            const isNewlyComputed = newlyComputed.includes(i);
            
            let rowClass = '';
            let statusText = '未計算';
            let statusClass = 'not-computed';
            
            if (isNewlyComputed) {
                rowClass = 'newly-computed';
                statusText = '剛計算';
                statusClass = 'newly-computed';
            } else if (isHighlighted) {
                rowClass = 'highlighted';
                statusText = '查詢中';
                statusClass = 'highlighted';
            } else if (isComputed) {
                statusText = '已計算';
                statusClass = 'computed';
            }

            html += `
                <tr class="dp-table-row ${rowClass}">
                    <td class="dp-problem">f(${i})</td>
                    <td class="dp-value">${value !== undefined ? value : '-'}</td>
                    <td class="dp-status ${statusClass}">${statusText}</td>
                </tr>
            `;
        }

        html += '</tbody></table></div>';
        this.elements.dpTableContainer.innerHTML = html;
    }

    /**
     * 渲染狀態轉移樹
     */
    renderTree(treeData, options = {}) {
        if (!this.elements.treeContainer || !treeData) return;

        // 清空容器
        this.elements.treeContainer.innerHTML = '';

        // 創建SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '500');
        this.svg.setAttribute('viewBox', '0 0 800 500');

        // 添加箭頭標記定義
        this.addArrowMarker();

        // 計算布局
        stateTreeData.calculateLayout(800, 500);

        // 根據動畫類型渲染不同的樹
        if (this.currentAnimationType === 'dp') {
            this.renderDPTree(treeData, options);
        } else {
            this.renderRecursiveTree(treeData, options);
        }

        this.elements.treeContainer.appendChild(this.svg);
    }

    /**
     * 渲染DP版本的樹（從底部向上構建）
     */
    renderDPTree(treeData, options) {
        // 渲染漸進式樹（隨DP進度增長）
        this.renderProgressiveDPTree();
    }

    /**
     * 渲染漸進式DP樹
     */
    renderProgressiveDPTree() {
        const n = stateTreeData.n;
        
        // 計算節點位置 - 改為水平布局，從左到右
        const startX = 50;
        const nodeSpacing = 100;
        const y = 250; // 統一高度
        
        // 繪製所有已計算的節點
        for (let i = 1; i <= Math.min(this.currentDPProgress, n); i++) {
            const x = startX + (i - 1) * nodeSpacing;
            const node = {
                value: i,
                x: x,
                y: y,
                isBaseCase: i <= 2,
                isComputed: true
            };

            // 繪製節點間的依賴關係箭頭
            if (i > 2) {
                // 從f(i-1)到f(i)的箭頭
                this.drawDPDependencyArrow(i-1, i, 'left');
                // 從f(i-2)到f(i)的箭頭
                this.drawDPDependencyArrow(i-2, i, 'right');
            }

            // 繪製節點
            this.drawDPNode(node);
        }

        // 如果有下一個要計算的節點，顯示為虛線
        if (this.currentDPProgress < n) {
            const nextValue = this.currentDPProgress + 1;
            const x = startX + (nextValue - 1) * nodeSpacing;
            const nextNode = {
                value: nextValue,
                x: x,
                y: y,
                isPlanned: true
            };
            this.drawDPNode(nextNode);
        }
    }

    /**
     * 繪製DP依賴關係箭頭
     */
    drawDPDependencyArrow(fromValue, toValue, direction) {
        const startX = 50;
        const nodeSpacing = 100;
        const y = 250;
        
        const fromX = startX + (fromValue - 1) * nodeSpacing;
        const toX = startX + (toValue - 1) * nodeSpacing;
        
        // 曲線箭頭，避免重疊
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlOffset = direction === 'left' ? -30 : -50;
        
        const pathData = `M ${fromX + 25} ${y} Q ${(fromX + toX) / 2} ${y + controlOffset} ${toX - 25} ${y}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#28a745');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('class', 'dp-dependency-arrow');
        
        this.svg.appendChild(path);
    }

    /**
     * 繪製DP節點
     */
    drawDPNode(node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'dp-node-group');

        // 設置節點樣式
        let fillColor, strokeColor, textColor;
        
        if (node.isPlanned) {
            // 計劃中的節點
            fillColor = '#f8f9fa';
            strokeColor = '#6c757d';
            textColor = '#6c757d';
        } else if (node.isBaseCase) {
            // 基礎情況
            fillColor = '#d4edda';
            strokeColor = '#28a745';
            textColor = '#155724';
        } else {
            // 已計算的節點
            fillColor = '#cce5ff';
            strokeColor = '#007bff';
            textColor = '#0056b3';
        }

        // 創建圓形
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', node.isPlanned ? '2' : '3');
        
        if (node.isPlanned) {
            circle.setAttribute('stroke-dasharray', '5,5');
        }

        // 創建文字
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `f(${node.value})`;

        // 在節點下方顯示值（如果已計算）
        const dpTable = stateTreeData.getCurrentDPTable();
        if (dpTable[node.value] !== undefined) {
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', node.x);
            valueText.setAttribute('y', node.y + 45);
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('fill', textColor);
            valueText.setAttribute('font-size', '12');
            valueText.setAttribute('font-weight', 'bold');
            valueText.textContent = `= ${dpTable[node.value]}`;
            group.appendChild(valueText);
        }

        // 添加點擊事件
        group.addEventListener('click', () => {
            this.onNodeClick(node);
        });

        group.appendChild(circle);
        group.appendChild(text);
        this.svg.appendChild(group);
    }

    /**
     * 渲染遞迴版本的樹（傳統從上到下）
     */
    renderRecursiveTree(treeData, options) {
        // 繪製邊
        this.drawEdges(treeData);
        
        // 繪製節點
        this.drawNodes(treeData, options);
    }

    /**
     * 添加箭頭標記
     */
    addArrowMarker() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#28a745');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);
    }

    /**
     * 繪製邊
     */
    drawEdges(node) {
        if (!node.children || node.children.length === 0) return;

        node.children.forEach(child => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y);
            line.setAttribute('x2', child.x);
            line.setAttribute('y2', child.y);
            line.setAttribute('class', 'tree-edge');
            line.setAttribute('stroke', '#6c757d');
            line.setAttribute('stroke-width', '2');

            this.svg.appendChild(line);
            this.drawEdges(child);
        });
    }

    /**
     * 繪製節點
     */
    drawNodes(node, options = {}) {
        if (!node) return;

        // 創建節點群組
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'tree-node-group');

        // 創建圓形
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '25');
        circle.setAttribute('class', 'tree-node-circle');

        // 設置節點樣式
        let fillColor, strokeColor, textColor;
        
        if (node.value === stateTreeData.n) {
            // 根節點
            fillColor = '#fff3cd';
            strokeColor = '#ffc107';
            textColor = '#856404';
        } else if (node.isBaseCase) {
            // 基礎情況
            fillColor = '#d4edda';
            strokeColor = '#28a745';
            textColor = '#155724';
        } else if (node.isDuplicate && options.showDuplicates) {
            // 重複節點
            fillColor = '#f8d7da';
            strokeColor = '#dc3545';
            textColor = '#721c24';
        } else if (node.isComputed && options.showMemoization) {
            // 已計算
            fillColor = '#cce5ff';
            strokeColor = '#007bff';
            textColor = '#0056b3';
        } else {
            // 普通節點
            fillColor = '#f8f9fa';
            strokeColor = '#6c757d';
            textColor = '#495057';
        }

        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', '2');

        // 創建文字
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'tree-node-text');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `f(${node.value})`;

        // 添加點擊事件
        group.addEventListener('click', () => {
            this.onNodeClick(node);
        });

        group.appendChild(circle);
        group.appendChild(text);
        this.svg.appendChild(group);

        // 遞歸繪製子節點
        node.children.forEach(child => {
            this.drawNodes(child, options);
        });
    }

    /**
     * 繪製單個節點
     */
    drawSingleNode(node, style) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'tree-node-group');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '25');
        circle.setAttribute('fill', style.fillColor);
        circle.setAttribute('stroke', style.strokeColor);
        circle.setAttribute('stroke-width', '3');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', style.textColor);
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.textContent = `f(${node.value})`;

        group.appendChild(circle);
        group.appendChild(text);
        this.svg.appendChild(group);
    }

    /**
     * 設置當前DP進度
     */
    setDPProgress(progress) {
        this.currentDPProgress = progress;
    }

    /**
     * 設置動畫類型
     */
    setAnimationType(type) {
        this.currentAnimationType = type;
    }

    /**
     * 高亮特定值的節點
     */
    highlightDPNodes(values, type = 'lookup') {
        // 移除之前的高亮
        this.clearDPHighlights();
        
        values.forEach(value => {
            const nodeElements = this.svg.querySelectorAll('.dp-node-group');
            nodeElements.forEach(group => {
                const text = group.querySelector('text');
                if (text && text.textContent === `f(${value})`) {
                    const circle = group.querySelector('circle');
                    if (type === 'lookup') {
                        circle.setAttribute('stroke', '#ffc107');
                        circle.setAttribute('stroke-width', '4');
                        circle.style.filter = 'drop-shadow(2px 2px 4px rgba(255, 193, 7, 0.5))';
                    } else if (type === 'compute') {
                        circle.setAttribute('stroke', '#28a745');
                        circle.setAttribute('stroke-width', '4');
                        circle.style.filter = 'drop-shadow(2px 2px 4px rgba(40, 167, 69, 0.5))';
                    }
                }
            });
        });
    }

    /**
     * 清除DP高亮
     */
    clearDPHighlights() {
        const circles = this.svg.querySelectorAll('circle');
        circles.forEach(circle => {
            circle.setAttribute('stroke-width', circle.hasAttribute('stroke-dasharray') ? '2' : '3');
            circle.style.filter = 'none';
        });
    }

    /**
     * 節點點擊處理
     */
    onNodeClick(node) {
        this.selectedNode = node;
        this.showNodeDetails(node);
        this.highlightNode(node);
    }

    /**
     * 顯示節點詳細信息
     */
    showNodeDetails(node) {
        if (!this.elements.nodeInspector) return;

        const details = stateTreeData.getNodeDetails(node.value);
        
        this.elements.nodeInspector.innerHTML = `
            <h5>節點 f(${node.value}) 詳細信息</h5>
            <div class="node-detail-item">
                <strong>值:</strong> ${node.value}
            </div>
            <div class="node-detail-item">
                <strong>DP表格值:</strong> ${details.dpValue}
            </div>
            <div class="node-detail-item">
                <strong>遞迴調用次數:</strong> ${details.recursiveCount}
            </div>
            <div class="node-detail-item">
                <strong>DP計算次數:</strong> ${details.dpCount}
            </div>
            <div class="node-detail-item">
                <strong>效率提升:</strong> ${details.recursiveCount}x
            </div>
            <div class="node-detail-item">
                <strong>依賴:</strong> ${details.dependsOn.length > 0 ? 
                    details.dependsOn.map(d => `f(${d})`).join(', ') : '無'}
            </div>
            ${node.isBaseCase ? 
                `<div class="base-case-note">這是基礎情況，返回 ${node.value === 1 ? 1 : 2}</div>` : 
                `<div class="recursive-note">f(${node.value}) = f(${node.value - 1}) + f(${node.value - 2})</div>`
            }
        `;
    }

    /**
     * 高亮節點
     */
    highlightNode(node) {
        // 清除之前的高亮
        this.clearHighlights();

        // 高亮當前節點
        const circles = this.svg.querySelectorAll('circle');
        circles.forEach(circle => {
            if (parseFloat(circle.getAttribute('cx')) === node.x && 
                parseFloat(circle.getAttribute('cy')) === node.y) {
                circle.setAttribute('stroke-width', '4');
                circle.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))';
            }
        });
    }

    /**
     * 清除高亮
     */
    clearHighlights() {
        const circles = this.svg.querySelectorAll('circle');
        circles.forEach(circle => {
            const originalWidth = circle.hasAttribute('stroke-dasharray') ? '2' : '3';
            circle.setAttribute('stroke-width', originalWidth);
            circle.style.filter = 'none';
        });

        const edges = this.svg.querySelectorAll('.tree-edge');
        edges.forEach(edge => {
            edge.classList.remove('highlighted');
        });
    }

    /**
     * 更新統計信息
     */
    updateStatistics(stats) {
        if (this.elements.totalNodes) {
            this.elements.totalNodes.textContent = stats.totalNodes;
        }
        if (this.elements.uniqueProblems) {
            this.elements.uniqueProblems.textContent = stats.uniqueProblems;
        }
        if (this.elements.duplicateCalculations) {
            this.elements.duplicateCalculations.textContent = stats.duplicateCalculations;
        }
        if (this.elements.memoizationSavings) {
            this.elements.memoizationSavings.textContent = `${stats.memoizationSavings}%`;
        }

        // 更新對比統計
        if (this.elements.recursiveStats) {
            this.elements.recursiveStats.innerHTML = `
                <div class="stat-item">總計算次數: ${stats.recursiveCalculations}</div>
                <div class="stat-item">重複計算: ${stats.duplicateCalculations}</div>
                <div class="stat-item">時間複雜度: O(2ⁿ)</div>
            `;
        }

        if (this.elements.dpStats) {
            this.elements.dpStats.innerHTML = `
                <div class="stat-item">總計算次數: ${stats.dpCalculations}</div>
                <div class="stat-item">重複計算: 0</div>
                <div class="stat-item">時間複雜度: O(n)</div>
            `;
        }
    }

    /**
     * 渲染重複計算矩陣
     */
    renderDuplicationMatrix(matrix) {
        if (!this.elements.duplicationMatrix) return;

        let html = '<table class="matrix-table">';
        html += '<thead><tr><th>子問題</th><th>遞迴次數</th><th>DP次數</th><th>效率提升</th></tr></thead>';
        html += '<tbody>';

        matrix.forEach(item => {
            const efficiencyClass = item.efficiency > 10 ? 'high-efficiency' : 
                                  item.efficiency > 5 ? 'medium-efficiency' : 'low-efficiency';
            
            html += `
                <tr>
                    <td>f(${item.value})</td>
                    <td class="recursive-count">${item.recursiveCount}</td>
                    <td class="dp-count">${item.dpCount}</td>
                    <td class="efficiency ${efficiencyClass}">${item.efficiency}x</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        this.elements.duplicationMatrix.innerHTML = html;
    }

    /**
     * 更新追蹤目標選項
     */
    updateTraceTargets(n) {
        if (!this.elements.traceTarget) return;

        this.elements.traceTarget.innerHTML = '';
        for (let i = 1; i <= n; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `f(${i})`;
            this.elements.traceTarget.appendChild(option);
        }
    }

    /**
     * 追蹤路徑
     */
    tracePath(targetValue) {
        const path = stateTreeData.findPath(targetValue);
        this.highlightPath(path);
        this.showPathInfo(path);
    }

    /**
     * 高亮路徑
     */
    highlightPath(path) {
        this.clearHighlights();
        
        // 高亮路徑上的節點
        path.forEach(node => {
            this.highlightNode(node);
        });
    }

    /**
     * 顯示路徑信息
     */
    showPathInfo(path) {
        if (!this.elements.traceInfo) return;

        let html = '<h5>DP計算順序</h5>';
        html += '<div class="dp-order-sequence">';
        
        // 顯示DP的計算順序而不是遞迴路徑
        for (let i = 1; i <= stateTreeData.n; i++) {
            const isHighlighted = path.some(node => node.value === i);
            html += `
                <div class="dp-order-item ${isHighlighted ? 'highlighted' : ''}">
                    <span class="order-step">${i}.</span>
                    <span class="order-node">f(${i})</span>
                    <span class="order-desc">${i <= 2 ? '基礎情況' : `= f(${i-1}) + f(${i-2})`}</span>
                </div>
            `;
        }
        
        html += '</div>';
        
        this.elements.traceInfo.innerHTML = html;
    }

    /**
     * 清除路徑追蹤
     */
    clearTrace() {
        this.clearHighlights();
        if (this.elements.traceInfo) {
            this.elements.traceInfo.innerHTML = '<p>DP按順序計算，無需追蹤複雜路徑</p>';
        }
    }

    /**
     * 更新動畫進度
     */
    updateAnimationProgress(current, total) {
        if (this.elements.animationProgress) {
            const percentage = (current / total) * 100;
            this.elements.animationProgress.style.width = `${percentage}%`;
        }
        if (this.elements.progressText) {
            this.elements.progressText.textContent = `${Math.round((current / total) * 100)}%`;
        }
    }

    /**
     * 顯示動畫信息
     */
    showAnimationInfo(message) {
        if (this.elements.animationInfo) {
            this.elements.animationInfo.textContent = message;
        }
    }

    /**
     * 顯示計算過程
     */
    showComputationProcess(computation) {
        if (!computation) return;

        // 在樹中顯示計算過程
        const message = `f(${computation.target}) = f(${computation.left}) + f(${computation.right}) = ${stateTreeData.dpTable[computation.left]} + ${stateTreeData.dpTable[computation.right]} = ${computation.result}`;
        
        // 創建臨時文字元素顯示計算過程
        const computationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        computationText.setAttribute('x', 400);
        computationText.setAttribute('y', 50);
        computationText.setAttribute('text-anchor', 'middle');
        computationText.setAttribute('fill', '#28a745');
        computationText.setAttribute('font-size', '16');
        computationText.setAttribute('font-weight', 'bold');
        computationText.textContent = message;
        computationText.setAttribute('id', 'computation-display');

        // 移除之前的計算顯示
        const oldDisplay = this.svg.querySelector('#computation-display');
        if (oldDisplay) {
            this.svg.removeChild(oldDisplay);
        }

        this.svg.appendChild(computationText);

        // 3秒後移除
        setTimeout(() => {
            if (this.svg.contains(computationText)) {
                this.svg.removeChild(computationText);
            }
        }, 3000);
    }
}

// 全域渲染器實例
const stateTreeRenderer = new StateTreeRenderer();