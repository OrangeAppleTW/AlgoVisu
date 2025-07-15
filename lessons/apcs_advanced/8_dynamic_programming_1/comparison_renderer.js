/**
 * 比較分析頁面的渲染器
 */

class ComparisonRenderer {
    constructor() {
        this.elements = {};
    }

    /**
     * 初始化渲染器
     */
    initialize() {
        this.elements = {
            recursiveCalls: document.getElementById('recursive-calls'),
            recursiveComplexity: document.getElementById('recursive-complexity'),
            recursiveTime: document.getElementById('recursive-time'),
            dpCalls: document.getElementById('dp-calls'),
            dpComplexity: document.getElementById('dp-complexity'),
            dpTime: document.getElementById('dp-time'),
            speedImprovement: document.getElementById('speed-improvement'),
            callReduction: document.getElementById('call-reduction'),
            recursiveTree: document.getElementById('recursive-tree'),
            callSequence: document.querySelector('.sequence-container'),
            comparisonDpTable: document.getElementById('comparison-dp-table'),
            executionSteps: document.getElementById('execution-steps'),
            duplicationChart: document.getElementById('duplication-chart'),
            duplicationDetails: document.getElementById('duplication-details'),
            growthChart: document.getElementById('growth-chart')
        };
    }

    /**
     * 更新效能統計
     */
    updatePerformanceStats(data) {
        if (this.elements.recursiveCalls) {
            this.elements.recursiveCalls.textContent = data.recursive.calls.toLocaleString();
        }
        if (this.elements.recursiveTime) {
            this.elements.recursiveTime.textContent = `${data.recursive.time}ms`;
        }
        if (this.elements.dpCalls) {
            this.elements.dpCalls.textContent = data.dp.calls;
        }
        if (this.elements.dpTime) {
            this.elements.dpTime.textContent = `${data.dp.time}ms`;
        }
        if (this.elements.speedImprovement) {
            this.elements.speedImprovement.textContent = `${data.improvement.speedup}x`;
        }
        if (this.elements.callReduction) {
            this.elements.callReduction.textContent = `${data.improvement.reduction}%`;
        }
    }

    /**
     * 渲染遞迴調用序列
     */
    renderCallSequence(sequence) {
        if (!this.elements.callSequence) return;
        
        this.elements.callSequence.innerHTML = '';
        
        sequence.slice(0, 50).forEach((call, index) => { // 限制顯示數量
            const callDiv = document.createElement('div');
            callDiv.className = `call-item ${call.type}`;
            callDiv.textContent = `${index + 1}. f(${call.value})${call.type === 'repeated' ? ' (重複)' : ''}`;
            callDiv.style.marginLeft = `${call.depth * 10}px`;
            this.elements.callSequence.appendChild(callDiv);
        });
        
        if (sequence.length > 50) {
            const moreDiv = document.createElement('div');
            moreDiv.className = 'call-item';
            moreDiv.textContent = `... 還有 ${sequence.length - 50} 個調用`;
            moreDiv.style.fontStyle = 'italic';
            this.elements.callSequence.appendChild(moreDiv);
        }
    }

    /**
     * 渲染DP表格
     */
    renderDPTable(n) {
        if (!this.elements.comparisonDpTable) return;
        
        this.elements.comparisonDpTable.innerHTML = '';
        
        // 創建表頭
        const headerRow1 = document.createElement('tr');
        const headerRow2 = document.createElement('tr');
        
        headerRow1.appendChild(this.createTableCell('th', '階數'));
        headerRow2.appendChild(this.createTableCell('th', 'dp[i]'));
        
        for (let i = 1; i <= n; i++) {
            headerRow1.appendChild(this.createTableCell('th', i.toString()));
            const cell = this.createTableCell('td', i <= 2 ? (i === 1 ? '1' : '2') : '?');
            cell.className = i <= 2 ? 'filled' : 'empty';
            cell.id = `comp-dp-${i}`;
            headerRow2.appendChild(cell);
        }
        
        this.elements.comparisonDpTable.appendChild(headerRow1);
        this.elements.comparisonDpTable.appendChild(headerRow2);
    }

    /**
     * 渲染重複計算分析
     */
    renderDuplicationAnalysis(duplicationStats) {
        if (!this.elements.duplicationDetails) return;
        
        let html = '<h5>重複計算統計</h5>';
        html += '<div class="duplicate-stats">';
        
        Object.entries(duplicationStats)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .forEach(([value, count]) => {
                const percentage = count > 1 ? Math.round(((count - 1) / count) * 100) : 0;
                html += `
                    <div class="duplicate-item">
                        <span class="duplicate-value">f(${value})</span>
                        <span class="duplicate-count">調用 ${count} 次</span>
                        <span class="duplicate-waste">${percentage}% 浪費</span>
                    </div>
                `;
            });
        
        html += '</div>';
        this.elements.duplicationDetails.innerHTML = html;
    }

    /**
     * 渲染複雜度成長圖
     */
    renderGrowthChart(data) {
        if (!this.elements.growthChart) return;
        
        // 簡單的HTML/CSS圖表
        let html = '<div class="chart-container">';
        
        const maxRecursive = Math.max(...data.map(d => d.recursive));
        const maxDp = Math.max(...data.map(d => d.dp));
        const maxHeight = 250;
        
        html += '<div class="chart-bars">';
        data.forEach(item => {
            const recursiveHeight = (item.recursive / maxRecursive) * maxHeight;
            const dpHeight = (item.dp / maxDp) * maxHeight;
            
            html += `
                <div class="bar-group">
                    <div class="bar recursive-bar" style="height: ${recursiveHeight}px;" 
                         title="遞迴: ${item.recursive}"></div>
                    <div class="bar dp-bar" style="height: ${dpHeight}px;" 
                         title="DP: ${item.dp}"></div>
                    <div class="bar-label">n=${item.n}</div>
                </div>
            `;
        });
        html += '</div>';
        
        html += `
            <div class="chart-legend">
                <span class="legend-item">
                    <span class="legend-color recursive-color"></span>
                    遞迴 O(2ⁿ)
                </span>
                <span class="legend-item">
                    <span class="legend-color dp-color"></span>
                    DP O(n)
                </span>
            </div>
        `;
        
        html += '</div>';
        this.elements.growthChart.innerHTML = html;
        
        // 添加樣式
        this.addChartStyles();
    }

    /**
     * 添加圖表樣式
     */
    addChartStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chart-container {
                position: relative;
                height: 300px;
                padding: 20px;
            }
            .chart-bars {
                display: flex;
                align-items: flex-end;
                height: 250px;
                gap: 10px;
                justify-content: space-around;
            }
            .bar-group {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            .bar {
                width: 20px;
                margin: 0 2px;
                border-radius: 3px 3px 0 0;
                transition: all 0.3s ease;
            }
            .recursive-bar {
                background: linear-gradient(to top, #dc3545, #ff6b7a);
            }
            .dp-bar {
                background: linear-gradient(to top, #28a745, #5cbf60);
            }
            .bar:hover {
                opacity: 0.8;
                transform: scale(1.1);
            }
            .bar-label {
                font-size: 0.8em;
                font-weight: bold;
                margin-top: 5px;
            }
            .chart-legend {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 20px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .legend-color {
                width: 15px;
                height: 15px;
                border-radius: 3px;
            }
            .recursive-color {
                background: #dc3545;
            }
            .dp-color {
                background: #28a745;
            }
            .duplicate-stats {
                display: grid;
                gap: 8px;
            }
            .duplicate-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 5px;
                border-left: 3px solid #dc3545;
            }
            .duplicate-value {
                font-weight: bold;
                font-family: monospace;
            }
            .duplicate-count {
                color: #6c757d;
            }
            .duplicate-waste {
                color: #dc3545;
                font-weight: bold;
            }
        `;
        
        if (!document.querySelector('#comparison-chart-styles')) {
            style.id = 'comparison-chart-styles';
            document.head.appendChild(style);
        }
    }

    /**
     * 創建表格單元格
     */
    createTableCell(tag, content) {
        const cell = document.createElement(tag);
        cell.textContent = content;
        return cell;
    }

    /**
     * 模擬DP執行步驟
     */
    animateDPExecution(n) {
        if (!this.elements.executionSteps) return;
        
        this.elements.executionSteps.innerHTML = '';
        
        const steps = [
            '初始化: dp[1] = 1, dp[2] = 2',
            ...Array.from({length: n - 2}, (_, i) => {
                const index = i + 3;
                return `計算 dp[${index}] = dp[${index-1}] + dp[${index-2}]`;
            })
        ];
        
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'execution-step';
            stepDiv.textContent = `${index + 1}. ${step}`;
            this.elements.executionSteps.appendChild(stepDiv);
        });
    }

    /**
     * 顯示方法比較
     */
    showMethodComparison(method) {
        const recursiveViz = document.getElementById('recursive-visualization');
        const dpViz = document.getElementById('dp-visualization');
        
        if (method === 'recursive') {
            recursiveViz.style.display = 'block';
            dpViz.style.display = 'none';
        } else if (method === 'dp') {
            recursiveViz.style.display = 'none';
            dpViz.style.display = 'block';
        } else {
            recursiveViz.style.display = 'block';
            dpViz.style.display = 'block';
        }
    }
}

// 全域渲染器實例
const comparisonRenderer = new ComparisonRenderer();