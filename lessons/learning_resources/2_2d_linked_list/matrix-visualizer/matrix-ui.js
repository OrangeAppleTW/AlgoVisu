// 矩陣視覺化工具 - UI介面模組
// 負責用戶介面的創建、更新和交互

class MatrixUI {
    constructor(matrixCore) {
        this.core = matrixCore;
        this.elements = {};
        this.currentStatus = 'idle';
        this.initializeElements();
    }

    // 初始化DOM元素引用
    initializeElements() {
        this.elements = {
            matrixInput: document.getElementById('matrix-input'),
            visualizeBtn: document.getElementById('visualize-btn'),
            clearBtn: document.getElementById('clear-btn'),
            exampleBtn: document.getElementById('example-btn'),
            exportBtn: document.getElementById('export-btn'),
            statusMessage: document.getElementById('status-message'),
            displayArea: document.getElementById('matrix-display-area'),
            d3Section: document.getElementById('d3-visualization-section'),
            animateBtn: document.getElementById('animate-btn'),
            highlightBtn: document.getElementById('highlight-btn'),
            animationType: document.getElementById('animation-type'),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            zoomResetBtn: document.getElementById('zoom-reset-btn')
        };

        // 檢查必要元素是否存在
        if (!this.elements.matrixInput) {
            console.error('Matrix input element not found');
        }
        if (!this.elements.displayArea) {
            console.error('Display area element not found');
        }
    }

    // 綁定事件監聽器
    bindEventListeners() {
        // 主要按鈕事件
        if (this.elements.visualizeBtn) {
            this.elements.visualizeBtn.addEventListener('click', () => this.handleVisualize());
        }
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        }
        if (this.elements.exampleBtn) {
            this.elements.exampleBtn.addEventListener('click', () => this.handleLoadExample());
        }
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.handleExport());
        }

        // D3動畫按鈕事件
        if (this.elements.animateBtn) {
            this.elements.animateBtn.addEventListener('click', () => this.handleAnimate());
        }
        if (this.elements.highlightBtn) {
            this.elements.highlightBtn.addEventListener('click', () => this.handleHighlight());
        }
        
        // 縮放按鈕事件
        if (this.elements.zoomInBtn) {
            this.elements.zoomInBtn.addEventListener('click', () => this.handleZoomIn());
        }
        if (this.elements.zoomOutBtn) {
            this.elements.zoomOutBtn.addEventListener('click', () => this.handleZoomOut());
        }
        if (this.elements.zoomResetBtn) {
            this.elements.zoomResetBtn.addEventListener('click', () => this.handleZoomReset());
        }

        // 輸入框變化事件
        if (this.elements.matrixInput) {
            this.elements.matrixInput.addEventListener('input', () => this.hideStatusMessage());
        }

        // 鍵盤快捷鍵
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        console.log('Event listeners bound successfully');
    }

    // 處理視覺化按鈕點擊
    handleVisualize() {
        if (!this.elements.matrixInput) {
            this.showStatusMessage('輸入區域不可用', 'error');
            return;
        }

        const input = this.elements.matrixInput.value.trim();
        
        if (!input) {
            this.showStatusMessage('請輸入矩陣數據', 'error');
            return;
        }

        try {
            this.showLoading('正在解析矩陣...');
            
            // 解析矩陣
            const matrices = this.core.parseMatrixInput(input);
            this.core.setMatrices(matrices);
            
            // 渲染矩陣
            this.renderMatrices(matrices);
            
            // 顯示成功訊息
            if (matrices.length > this.core.maxMatrices) {
                this.showStatusMessage(`最多只能顯示 ${this.core.maxMatrices} 個矩陣，已顯示前 ${this.core.maxMatrices} 個`, 'warning');
            } else {
                this.showStatusMessage(`成功載入 ${matrices.length} 個矩陣`, 'success');
            }

            // 啟用D3視覺化
            this.enableD3Visualization();

        } catch (error) {
            this.showStatusMessage(`解析錯誤：${error.message}`, 'error');
            console.error('Matrix parsing error:', error);
        } finally {
            this.hideLoading();
        }
    }

    // 處理清除按鈕點擊
    handleClear() {
        if (this.elements.matrixInput) {
            this.elements.matrixInput.value = '';
        }
        this.core.clearMatrices();
        this.renderEmptyState();
        this.hideStatusMessage();
        this.disableD3Visualization();
    }

    // 處理載入範例按鈕點擊
    handleLoadExample() {
        const example = this.core.getRandomExample();
        if (this.elements.matrixInput) {
            this.elements.matrixInput.value = example.data;
        }
        this.hideStatusMessage();
        
        // 自動視覺化
        setTimeout(() => {
            this.handleVisualize();
        }, 100);
    }

    // 處理匯出按鈕點擊
    handleExport() {
        if (this.core.getMatrices().length === 0) {
            this.showStatusMessage('沒有矩陣可以匯出', 'warning');
            return;
        }

        // 創建匯出選項對話框
        this.showExportDialog();
    }

    // 處理動畫按鈕點擊
    handleAnimate() {
        const animationType = this.elements.animationType ? this.elements.animationType.value : 'traverse';
        const matrices = this.core.getMatrices();
        
        if (matrices.length === 0) {
            this.showStatusMessage('請先載入矩陣數據', 'warning');
            return;
        }

        // 觸發相應的動畫
        if (window.matrixD3) {
            window.matrixD3.startAnimation(animationType, matrices);
            this.showStatusMessage(`開始 ${this.getAnimationName(animationType)} 動畫`, 'info');
        } else {
            this.showStatusMessage('D3視覺化模組未載入', 'error');
        }
    }

    // 獲取動畫名稱
    getAnimationName(type) {
        const names = {
            'traverse': '遍歷',
            'multiply': '矩陣乘法',
            'transpose': '轉置'
        };
        return names[type] || type;
    }

    // 處理高亮按鈕點擊
    handleHighlight() {
        if (window.matrixD3) {
            window.matrixD3.toggleHighlight();
            const isHighlightOn = window.matrixD3.highlightMode;
            this.showStatusMessage(`高亮模式已${isHighlightOn ? '開啟' : '關閉'}`, 'info');
        } else {
            this.showStatusMessage('D3視覺化模組未載入', 'error');
        }
    }

    // 處理放大按鈕點擊
    handleZoomIn() {
        if (window.matrixD3) {
            window.matrixD3.zoomIn();
            const zoomLevel = Math.round(window.matrixD3.zoomScale * 100);
            this.showStatusMessage(`放大至 ${zoomLevel}%`, 'info');
        } else {
            this.showStatusMessage('D3視覺化模組未載入', 'error');
        }
    }

    // 處理縮小按鈕點擊
    handleZoomOut() {
        if (window.matrixD3) {
            window.matrixD3.zoomOut();
            const zoomLevel = Math.round(window.matrixD3.zoomScale * 100);
            this.showStatusMessage(`縮小至 ${zoomLevel}%`, 'info');
        } else {
            this.showStatusMessage('D3視覺化模組未載入', 'error');
        }
    }

    // 處理重設縮放按鈕點擊
    handleZoomReset() {
        if (window.matrixD3) {
            window.matrixD3.resetZoom();
            this.showStatusMessage('縮放已重設為 100%', 'info');
        } else {
            this.showStatusMessage('D3視覺化模組未載入', 'error');
        }
    }

    // 處理鍵盤事件
    handleKeyboard(event) {
        // Ctrl+Enter 或 Cmd+Enter 觸發視覺化
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.handleVisualize();
        }
        
        // Escape 清除
        if (event.key === 'Escape') {
            this.handleClear();
        }
    }

    // 渲染矩陣
    renderMatrices(matrices) {
        if (!this.elements.displayArea) {
            console.error('Display area not available');
            return;
        }

        this.elements.displayArea.innerHTML = '';
        
        matrices.forEach((matrix, index) => {
            const container = this.createMatrixContainer(matrix, index);
            this.elements.displayArea.appendChild(container);
        });

        // 添加淡入動畫
        this.elements.displayArea.classList.add('fade-in');
        setTimeout(() => {
            this.elements.displayArea.classList.remove('fade-in');
        }, 500);
    }

    // 創建矩陣容器
    createMatrixContainer(matrix, index) {
        const container = document.createElement('div');
        container.className = 'matrix-display-container slide-in-left';
        container.style.animationDelay = `${index * 0.1}s`;
        
        // 添加矩陣編號
        const counter = document.createElement('div');
        counter.className = 'matrix-counter';
        counter.textContent = `${index + 1}`;
        container.appendChild(counter);

        // 矩陣標題
        const title = document.createElement('div');
        title.className = 'matrix-title';
        title.textContent = `矩陣 ${index + 1}`;
        container.appendChild(title);

        // 創建矩陣表格
        const table = this.createMatrixTable(matrix.data);
        container.appendChild(table);

        // 矩陣資訊
        const info = this.createMatrixInfo(matrix.metadata);
        container.appendChild(info);

        // 添加點擊事件（用於D3視覺化）
        container.addEventListener('click', () => {
            this.selectMatrix(index, container);
        });

        return container;
    }

    // 選擇矩陣（用於 D3 視覺化）
    selectMatrix(index, container) {
        // 移除其他選中狀態
        document.querySelectorAll('.matrix-display-container').forEach(c => {
            c.classList.remove('selected');
        });
        
        // 添加選中狀態
        container.classList.add('selected');
        
        // 通知 D3 模組並切換視覺化
        if (window.matrixD3) {
            window.matrixD3.selectMatrix(index);
            this.showStatusMessage(`已選擇矩陣 ${index + 1}`, 'info');
        }
    }

    // 創建矩陣表格
    createMatrixTable(matrix) {
        const table = document.createElement('table');
        table.className = 'matrix-table';
        
        // 創建 tbody 元素
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        matrix.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            row.forEach((value, colIndex) => {
                const td = document.createElement('td');
                td.textContent = this.core.formatNumber(value);
                td.dataset.row = rowIndex;
                td.dataset.col = colIndex;
                td.dataset.value = value;
                td.className = 'matrix-cell editable-cell';
                
                // 添加懸停效果
                td.addEventListener('mouseenter', () => this.highlightCell(td));
                td.addEventListener('mouseleave', () => this.unhighlightCell(td));
                
                // 添加雙擊編輯功能
                td.addEventListener('dblclick', (e) => this.startCellEdit(e, td, rowIndex, colIndex));
                
                // 添加單擊選擇功能
                td.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectCell(td, rowIndex, colIndex);
                });
                
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        return table;
    }

    // 創建矩陣資訊
    createMatrixInfo(metadata) {
        const info = document.createElement('div');
        info.className = 'matrix-info';
        
        const details = [
            `維度：${metadata.size}`,
            `元素：${metadata.totalElements}`,
            `範圍：${this.core.formatNumber(metadata.min)} ~ ${this.core.formatNumber(metadata.max)}`
        ];
        
        if (metadata.isSquare) {
            details.push('方陣');
        }
        
        info.textContent = details.join(' | ');
        return info;
    }

    // 選擇矩陣（用於D3視覺化）
    selectMatrix(index, container) {
        // 移除其他選中狀態
        document.querySelectorAll('.matrix-display-container').forEach(c => {
            c.classList.remove('selected');
        });
        
        // 添加選中狀態
        container.classList.add('selected');
        
        // 通知D3模組
        if (window.matrixD3) {
            window.matrixD3.selectMatrix(index);
            this.showStatusMessage(`已選擇矩陣 ${index + 1}`, 'info');
        }
    }

    // 高亮單元格
    highlightCell(cell) {
        cell.style.backgroundColor = '#f0f0f0';
        cell.style.transform = 'scale(1.05)';
        cell.style.fontWeight = 'bold';
        cell.style.transition = 'all 0.2s ease';
    }

    // 取消高亮單元格
    unhighlightCell(cell) {
        cell.style.backgroundColor = '';
        cell.style.transform = '';
        cell.style.fontWeight = '';
    }

    // 渲染空狀態
    renderEmptyState() {
        if (!this.elements.displayArea) return;
        
        this.elements.displayArea.innerHTML = `
            <div class="empty-state">
                <p>請在上方輸入矩陣數據，然後點擊「視覺化矩陣」按鈕開始</p>
            </div>
        `;
    }

    // 顯示狀態訊息
    showStatusMessage(message, type = 'info') {
        if (!this.elements.statusMessage) return;
        
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message status-${type}`;
        this.elements.statusMessage.style.display = 'block';
        
        // 自動隱藏（除了錯誤訊息）
        if (type !== 'error') {
            setTimeout(() => {
                this.hideStatusMessage();
            }, 3000);
        }
    }

    // 隱藏狀態訊息
    hideStatusMessage() {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.style.display = 'none';
        }
    }

    // 啟用D3視覺化
    enableD3Visualization() {
        if (this.elements.d3Section) {
            this.elements.d3Section.style.display = 'block';
        }
    }

    // 禁用D3視覺化
    disableD3Visualization() {
        if (this.elements.d3Section) {
            this.elements.d3Section.style.display = 'none';
        }
    }

    // 顯示匯出對話框
    showExportDialog() {
        const formats = ['json', 'csv', 'txt'];
        const formatNames = {
            'json': 'JSON格式',
            'csv': 'CSV格式', 
            'txt': '純文字格式'
        };

        const formatList = formats.map(format => 
            `<button class="export-format-btn" data-format="${format}">${formatNames[format]}</button>`
        ).join('');

        const dialog = document.createElement('div');
        dialog.className = 'export-dialog-overlay';
        dialog.innerHTML = `
            <div class="export-dialog">
                <h3>選擇匯出格式</h3>
                <div class="export-format-buttons">
                    ${formatList}
                </div>
                <button class="export-cancel-btn">取消</button>
            </div>
        `;

        // 添加樣式
        const style = document.createElement('style');
        style.textContent = `
            .export-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .export-dialog {
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                text-align: center;
                min-width: 300px;
            }
            .export-format-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin: 15px 0;
            }
            .export-format-btn {
                padding: 10px 15px;
                background-color: #333333;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .export-format-btn:hover {
                background-color: #555555;
            }
            .export-cancel-btn {
                padding: 8px 16px;
                background-color: #666666;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);

        // 綁定事件
        dialog.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-format-btn')) {
                const format = e.target.dataset.format;
                this.performExport(format);
                document.body.removeChild(dialog);
                document.head.removeChild(style);
            } else if (e.target.classList.contains('export-cancel-btn') || 
                      e.target.classList.contains('export-dialog-overlay')) {
                document.body.removeChild(dialog);
                document.head.removeChild(style);
            }
        });

        document.body.appendChild(dialog);
    }

    // 執行匯出
    performExport(format) {
        try {
            const exportData = this.core.exportMatrices(format);
            this.downloadFile(exportData.data, exportData.filename, exportData.mimeType);
            this.showStatusMessage(`矩陣已匯出為 ${exportData.filename}`, 'success');
        } catch (error) {
            this.showStatusMessage(`匯出失敗：${error.message}`, 'error');
        }
    }

    // 下載檔案
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 更新按鈕狀態
    updateButtonStates(isProcessing = false) {
        const buttons = [
            this.elements.visualizeBtn,
            this.elements.clearBtn,
            this.elements.exampleBtn,
            this.elements.exportBtn
        ];

        buttons.forEach(btn => {
            if (btn) {
                btn.disabled = isProcessing;
            }
        });
    }

    // 顯示載入狀態
    showLoading(message = '處理中...') {
        this.showStatusMessage(message, 'info');
        this.updateButtonStates(true);
    }

    // 隱藏載入狀態
    hideLoading() {
        this.updateButtonStates(false);
    }

    // 獲取當前狀態
    getCurrentStatus() {
        return this.currentStatus;
    }

    // 設置當前狀態
    setCurrentStatus(status) {
        this.currentStatus = status;
    }

    // 初始化界面
    initialize() {
        this.bindEventListeners();
        this.renderEmptyState();
        this.hideStatusMessage();
        this.disableD3Visualization();
        console.log('Matrix UI initialized');
    }

    // 選擇儲存格
    selectCell(cell, row, col) {
        // 移除之前的選中狀態
        document.querySelectorAll('.matrix-cell.selected').forEach(c => {
            c.classList.remove('selected');
        });
        
        // 添加選中狀態
        cell.classList.add('selected');
        
        // 顯示編輯提示
        this.showStatusMessage(`已選擇儲存格 (${row}, ${col})，雙擊可編輯`, 'info');
    }

    // 開始編輯儲存格
    startCellEdit(event, cell, row, col) {
        event.stopPropagation();
        
        const currentValue = cell.dataset.value;
        const matrixContainer = cell.closest('.matrix-display-container');
        const matrixIndex = Array.from(matrixContainer.parentNode.children).indexOf(matrixContainer);
        
        // 創建輸入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'cell-edit-input';
        input.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: #fff3cd;
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 0;
            margin: 0;
            outline: 2px solid #ffc107;
            box-sizing: border-box;
        `;
        
        // 替換儲存格內容
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
        
        // 處理輸入完成
        const finishEdit = (save = true) => {
            let newValue = parseFloat(currentValue);
            
            if (save) {
                const inputValue = input.value.trim();
                
                // 驗證輸入
                if (inputValue === '') {
                    this.showStatusMessage('數值不能為空', 'error');
                    input.focus();
                    return;
                }
                
                const parsedValue = parseFloat(inputValue);
                if (isNaN(parsedValue)) {
                    this.showStatusMessage('請輸入有效的數字', 'error');
                    input.focus();
                    return;
                }
                
                newValue = parsedValue;
                
                // 更新矩陣數據
                this.updateMatrixValue(matrixIndex, row, col, newValue);
                
                // 顯示成功訊息
                this.showStatusMessage(`成功更新儲存格 (${row}, ${col}) 為 ${this.core.formatNumber(newValue)}`, 'success');
            }
            
            // 恢復儲存格顯示
            cell.innerHTML = this.core.formatNumber(newValue);
            cell.dataset.value = newValue;
            cell.classList.add('updated-cell');
            
            // 移除更新樣式（動畫效果）
            setTimeout(() => {
                cell.classList.remove('updated-cell');
            }, 1500);
        };
        
        // 鍵盤事件
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit(true);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                finishEdit(false);
            }
        });
        
        // 失去焦點時儲存
        input.addEventListener('blur', () => {
            finishEdit(true);
        });
    }

    // 更新矩陣數值
    updateMatrixValue(matrixIndex, row, col, newValue) {
        const matrices = this.core.getMatrices();
        if (matrixIndex >= 0 && matrixIndex < matrices.length) {
            const matrix = matrices[matrixIndex];
            if (row >= 0 && row < matrix.data.length && col >= 0 && col < matrix.data[row].length) {
                // 更新矩陣數據
                matrix.data[row][col] = newValue;
                
                // 重新計算元數據
                matrix.metadata = this.core.calculateMatrixMetadata(matrix.data);
                
                // 更新矩陣資訊顯示
                this.updateMatrixInfo(matrixIndex);
                
                // 同步到D3視覺化並切換到當前編輯的矩陣
                if (window.matrixD3) {
                    // 使用 updateMatrices 保持縮放狀態
                    window.matrixD3.updateMatrices(matrices);
                    // 重要：切換到當前編輯的矩陣
                    window.matrixD3.selectMatrix(matrixIndex);
                    // 更新視覺選中狀態
                    this.updateMatrixSelection(matrixIndex);
                }
                
                // 更新輸入框的內容（如果用戶想重新編輯）
                this.updateInputAreaFromMatrices();
            }
        }
    }

    // 更新矩陣資訊顯示
    updateMatrixInfo(matrixIndex) {
        const container = document.querySelectorAll('.matrix-display-container')[matrixIndex];
        if (container) {
            const infoElement = container.querySelector('.matrix-info');
            const matrices = this.core.getMatrices();
            if (infoElement && matrices[matrixIndex]) {
                const metadata = matrices[matrixIndex].metadata;
                const details = [
                    `維度：${metadata.size}`,
                    `元素：${metadata.totalElements}`,
                    `範圍：${this.core.formatNumber(metadata.min)} ~ ${this.core.formatNumber(metadata.max)}`
                ];
                
                if (metadata.isSquare) {
                    details.push('方陣');
                }
                
                infoElement.textContent = details.join(' | ');
            }
        }
    }

    // 更新矩陣選擇狀態
    updateMatrixSelection(matrixIndex) {
        // 移除所有矩陣的選中狀態
        document.querySelectorAll('.matrix-display-container').forEach(container => {
            container.classList.remove('selected');
        });
        
        // 添加當前矩陣的選中狀態
        const containers = document.querySelectorAll('.matrix-display-container');
        if (containers[matrixIndex]) {
            containers[matrixIndex].classList.add('selected');
        }
        
        // 顯示狀態訊息
        this.showStatusMessage(`D3視覺化已切換到矩陣 ${matrixIndex + 1}`, 'info');
    }

    // 從矩陣數據更新輸入框
    updateInputAreaFromMatrices() {
        if (!this.elements.matrixInput) return;
        
        const matrices = this.core.getMatrices();
        const matrixStrings = matrices.map(matrix => 
            this.core.matrixToString(matrix.data)
        );
        
        this.elements.matrixInput.value = matrixStrings.join('\n\n');
    }
}

// 將MatrixUI設為全局可訪問
window.MatrixUI = MatrixUI;