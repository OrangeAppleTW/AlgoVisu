    // 測試縮放功能
    testZoomControls: function() {
        console.log('測試縮放功能...');
        
        if (window.matrixVisualizer) {
            // 先載入矩陣
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                if (window.matrixD3) {
                    console.log('測試放大...');
                    window.matrixD3.zoomIn();
                    console.log(`放大後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                    
                    setTimeout(() => {
                        console.log('測試縮小...');
                        window.matrixD3.zoomOut();
                        console.log(`縮小後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                        
                        setTimeout(() => {
                            console.log('測試重設縮放...');
                            window.matrixD3.resetZoom();
                            console.log(`重設後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                            
                            if (window.matrixD3.zoomScale === 1) {
                                console.log('✓ 縮放功能測試成功！');
                            } else {
                                console.error('✗ 縮放功能測試失敗');
                            }
                        }, 500);
                    }, 500);
                } else {
                    console.error('找不到 D3 模組');
                }
            }, 1000);
        }
    },// 矩陣視覺化工具測試腳本
// 這個檔案用於測試所有功能是否正常工作

console.log('=== 矩陣視覺化工具功能測試 ===');

// 等待頁面完全載入
window.addEventListener('load', function() {
    setTimeout(runTests, 1000);
});

function runTests() {
    console.log('開始執行功能測試...');
    
    // 測試 1: 檢查所有必要的全局變數
    testGlobalVariables();
    
    // 測試 2: 檢查 DOM 元素
    testDOMElements();
    
    // 測試 3: 測試核心功能
    testCoreFunctionality();
    
    // 測試 4: 測試 UI 功能
    testUIFunctionality();
    
    // 測試 5: 測試 D3 功能
    testD3Functionality();
    
    console.log('=== 測試完成 ===');
}

function testGlobalVariables() {
    console.log('測試 1: 檢查全局變數');
    
    const globals = [
        { name: 'd3', obj: window.d3 },
        { name: 'MatrixCore', obj: window.MatrixCore },
        { name: 'MatrixUI', obj: window.MatrixUI },
        { name: 'MatrixD3', obj: window.MatrixD3 },
        { name: 'matrixVisualizer', obj: window.matrixVisualizer },
        { name: 'matrixD3', obj: window.matrixD3 }
    ];
    
    globals.forEach(item => {
        if (item.obj) {
            console.log(`✓ ${item.name} 已載入`);
        } else {
            console.error(`✗ ${item.name} 未載入`);
        }
    });
}

function testDOMElements() {
    console.log('測試 2: 檢查 DOM 元素');
    
    const elements = [
        'matrix-input',
        'visualize-btn',
        'clear-btn',
        'example-btn',
        'export-btn',
        'status-message',
        'matrix-display-area',
        'd3-visualization-section',
        'd3-container'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✓ ${id} 元素存在`);
        } else {
            console.error(`✗ ${id} 元素不存在`);
        }
    });
}

function testCoreFunctionality() {
    console.log('測試 3: 測試核心功能');
    
    if (!window.MatrixCore) {
        console.error('✗ MatrixCore 未載入，跳過核心功能測試');
        return;
    }
    
    try {
        const core = new MatrixCore();
        
        // 測試矩陣解析
        const testInput = "1 2 3\n4 5 6\n\n7 8\n9 10";
        const matrices = core.parseMatrixInput(testInput);
        
        if (matrices.length === 2) {
            console.log('✓ 矩陣解析功能正常');
        } else {
            console.error('✗ 矩陣解析功能異常');
        }
        
        // 測試格式化功能
        if (core.formatNumber(3.14159) === '3.142') {
            console.log('✓ 數字格式化功能正常');
        } else {
            console.log('? 數字格式化結果可能不同於預期');
        }
        
        // 測試範例生成
        const example = core.getRandomExample();
        if (example && example.data) {
            console.log('✓ 範例生成功能正常');
        } else {
            console.error('✗ 範例生成功能異常');
        }
        
    } catch (error) {
        console.error('✗ 核心功能測試失敗:', error.message);
    }
}

function testUIFunctionality() {
    console.log('測試 4: 測試 UI 功能');
    
    if (!window.matrixVisualizer || !window.matrixVisualizer.ui) {
        console.error('✗ UI 模組未初始化，跳過 UI 功能測試');
        return;
    }
    
    try {
        const ui = window.matrixVisualizer.ui;
        
        // 測試元素初始化
        if (ui.elements && ui.elements.matrixInput) {
            console.log('✓ UI 元素初始化正常');
        } else {
            console.error('✗ UI 元素初始化異常');
        }
        
        // 測試狀態訊息
        ui.showStatusMessage('測試訊息', 'info');
        setTimeout(() => {
            ui.hideStatusMessage();
        }, 1000);
        console.log('✓ 狀態訊息功能測試完成');
        
    } catch (error) {
        console.error('✗ UI 功能測試失敗:', error.message);
    }
}

function testD3Functionality() {
    console.log('測試 5: 測試 D3 功能');
    
    if (!window.matrixD3) {
        console.error('✗ D3 模組未初始化，跳過 D3 功能測試');
        return;
    }
    
    try {
        const d3Module = window.matrixD3;
        
        // 測試容器初始化
        if (d3Module.container && !d3Module.container.empty()) {
            console.log('✓ D3 容器初始化正常');
        } else {
            console.error('✗ D3 容器初始化異常');
        }
        
        // 測試狀態獲取
        const state = d3Module.getCurrentState();
        if (state && typeof state === 'object') {
            console.log('✓ D3 狀態獲取功能正常');
        } else {
            console.error('✗ D3 狀態獲取功能異常');
        }
        
    } catch (error) {
        console.error('✗ D3 功能測試失敗:', error.message);
    }
}

// 提供手動測試功能
window.manualTest = {
    // 測試視覺化功能
    testVisualization: function() {
        if (window.matrixVisualizer && window.matrixVisualizer.ui) {
            console.log('執行視覺化測試...');
            window.matrixVisualizer.ui.handleVisualize();
        } else {
            console.error('無法執行視覺化測試');
        }
    },
    
    // 測試動畫功能
    testAnimation: function(type = 'traverse') {
        if (window.matrixD3) {
            console.log(`執行 ${type} 動畫測試...`);
            const matrices = window.matrixVisualizer.core.getMatrices();
            window.matrixD3.startAnimation(type, matrices);
        } else {
            console.error('無法執行動畫測試');
        }
    },
    
    // 測試匯出功能
    testExport: function(format = 'json') {
        if (window.matrixVisualizer && window.matrixVisualizer.ui) {
            console.log(`執行 ${format} 匯出測試...`);
            window.matrixVisualizer.ui.performExport(format);
        } else {
            console.error('無法執行匯出測試');
        }
    },
    
    // 測試矩陣表格結構
    testMatrixStructure: function() {
        console.log('測試矩陣表格結構...');
        
        if (window.matrixVisualizer) {
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                const tables = document.querySelectorAll('.matrix-table');
                console.log(`找到 ${tables.length} 個表格`);
                
                tables.forEach((table, index) => {
                    const rows = table.querySelectorAll('tr');
                    console.log(`表格 ${index + 1}: ${rows.length} 行`);
                    
                    rows.forEach((row, rowIndex) => {
                        const cells = row.querySelectorAll('td');
                        console.log(`  行 ${rowIndex}: ${cells.length} 儲存格`);
                    });
                    
                    // 檢查 CSS 顯示屬性
                    const computedStyle = window.getComputedStyle(table);
                    console.log(`表格顯示樣式: ${computedStyle.display}`);
                    
                    const firstRow = table.querySelector('tr');
                    if (firstRow) {
                        const rowStyle = window.getComputedStyle(firstRow);
                        console.log(`行顯示樣式: ${rowStyle.display}`);
                        
                        const firstCell = firstRow.querySelector('td');
                        if (firstCell) {
                            const cellStyle = window.getComputedStyle(firstCell);
                            console.log(`儲存格顯示樣式: ${cellStyle.display}`);
                        }
                    }
                });
            }, 1000);
        }
    },

    // 測試矩陣選擇同步功能
    testMatrixSelectionSync: function() {
        console.log('測試矩陣選擇同步功能...');
        
        if (window.matrixVisualizer) {
            // 先確保有多個矩陣
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                const matrices = window.matrixVisualizer.core.getMatrices();
                if (matrices.length > 1) {
                    console.log(`找到 ${matrices.length} 個矩陣，測試選擇同步...`);
                    
                    // 測試點擊第二個矩陣
                    const secondMatrix = document.querySelectorAll('.matrix-display-container')[1];
                    if (secondMatrix) {
                        console.log('點擊第二個矩陣...');
                        secondMatrix.click();
                        
                        setTimeout(() => {
                            // 檢查D3是否切換到第二個矩陣
                            if (window.matrixD3) {
                                const currentIndex = window.matrixD3.selectedMatrixIndex;
                                console.log(`D3當前選擇的矩陣索引: ${currentIndex}`);
                                
                                if (currentIndex === 1) {
                                    console.log('✓ 矩陣選擇同步測試成功！');
                                } else {
                                    console.error('✗ 矩陣選擇同步失敗');
                                }
                            }
                            
                            // 測試編輯同步
                            setTimeout(() => {
                                this.testEditSync();
                            }, 500);
                        }, 200);
                    }
                } else {
                    console.log('只有一個矩陣，無法測試選擇同步');
                }
            }, 1000);
        }
    },

    // 測試編輯同步功能
    testEditSync: function() {
        console.log('測試編輯同步功能...');
        
        // 找到第二個矩陣的第一個儲存格
        const secondMatrixCells = document.querySelectorAll('.matrix-display-container')[1]?.querySelectorAll('.matrix-table td');
        if (secondMatrixCells && secondMatrixCells.length > 0) {
            const firstCell = secondMatrixCells[0];
            console.log('模擬編輯第二個矩陣的第一個儲存格...');
            
            // 模擬雙擊編輯
            const dblclickEvent = new MouseEvent('dblclick', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            firstCell.dispatchEvent(dblclickEvent);
            
            setTimeout(() => {
                const input = document.querySelector('.cell-edit-input');
                if (input) {
                    console.log('編輯模式開啟，設定新數值...');
                    input.value = '888';
                    
                    // 模擬按下 Enter
                    const enterEvent = new KeyboardEvent('keydown', {
                        bubbles: true,
                        cancelable: true,
                        key: 'Enter'
                    });
                    input.dispatchEvent(enterEvent);
                    
                    setTimeout(() => {
                        // 檢查D3是否切換到被編輯的矩陣
                        if (window.matrixD3) {
                            const currentIndex = window.matrixD3.selectedMatrixIndex;
                            console.log(`編輯後 D3 當前選擇的矩陣索引: ${currentIndex}`);
                            
                            if (currentIndex === 1) {
                                console.log('✓ 編輯同步測試成功！D3正確切換到被編輯的矩陣');
                            } else {
                                console.error('✗ 編輯同步失敗，D3沒有切換到被編輯的矩陣');
                            }
                        }
                    }, 300);
                } else {
                    console.error('未找到編輯輸入框');
                }
            }, 100);
        } else {
            console.error('未找到第二個矩陣的儲存格');
        }
    },

    // 測試縮放保持功能
    testZoomPreservation: function() {
        console.log('測試縮放保持功能...');
        
        if (window.matrixVisualizer && window.matrixD3) {
            // 先載入矩陣
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                // 放大D3視覺化
                console.log('放大D3視覺化...');
                window.matrixD3.zoomIn();
                window.matrixD3.zoomIn(); // 放大兩次
                
                const zoomBefore = window.matrixD3.zoomScale;
                console.log(`編輯前縮放級別: ${Math.round(zoomBefore * 100)}%`);
                
                setTimeout(() => {
                    // 編輯一個儲存格
                    const firstCell = document.querySelector('.matrix-table td');
                    if (firstCell) {
                        console.log('編輯儲存格...');
                        
                        const dblclickEvent = new MouseEvent('dblclick', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        
                        firstCell.dispatchEvent(dblclickEvent);
                        
                        setTimeout(() => {
                            const input = document.querySelector('.cell-edit-input');
                            if (input) {
                                input.value = '777';
                                
                                const enterEvent = new KeyboardEvent('keydown', {
                                    bubbles: true,
                                    cancelable: true,
                                    key: 'Enter'
                                });
                                input.dispatchEvent(enterEvent);
                                
                                setTimeout(() => {
                                    const zoomAfter = window.matrixD3.zoomScale;
                                    console.log(`編輯後縮放級別: ${Math.round(zoomAfter * 100)}%`);
                                    
                                    if (Math.abs(zoomBefore - zoomAfter) < 0.01) {
                                        console.log('✓ 縮放保持測試成功！編輯後縮放狀態被保持');
                                    } else {
                                        console.error('✗ 縮放保持失敗，編輯後縮放狀態被重置');
                                    }
                                }, 300);
                            }
                        }, 100);
                    }
                }, 500);
            }, 1000);
        }
    },

    // 測試縮放功能
    testZoomControls: function() {
        console.log('測試縮放功能...');
        
        if (window.matrixVisualizer) {
            // 先載入矩陣
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                if (window.matrixD3) {
                    console.log('測試放大...');
                    window.matrixD3.zoomIn();
                    console.log(`放大後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                    
                    setTimeout(() => {
                        console.log('測試縮小...');
                        window.matrixD3.zoomOut();
                        console.log(`縮小後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                        
                        setTimeout(() => {
                            console.log('測試重設縮放...');
                            window.matrixD3.resetZoom();
                            console.log(`重設後縮放級別: ${Math.round(window.matrixD3.zoomScale * 100)}%`);
                            
                            if (window.matrixD3.zoomScale === 1) {
                                console.log('✓ 縮放功能測試成功！');
                            } else {
                                console.error('✗ 縮放功能測試失敗');
                            }
                        }, 500);
                    }, 500);
                } else {
                    console.error('找不到 D3 模組');
                }
            }, 1000);
        }
    },

    // 測試編輯功能
    testEditFunction: function() {
        console.log('測試編輯功能...');
        
        // 先確保矩陣已載入
        if (window.matrixVisualizer) {
            window.matrixVisualizer.ui.handleVisualize();
            
            setTimeout(() => {
                // 尋找第一個矩陣的第一個儲存格
                const firstCell = document.querySelector('.matrix-table td');
                if (firstCell) {
                    console.log('找到儲存格，模擬雙擊編輯...');
                    
                    // 模擬雙擊事件
                    const dblclickEvent = new MouseEvent('dblclick', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    
                    firstCell.dispatchEvent(dblclickEvent);
                    
                    setTimeout(() => {
                        const input = document.querySelector('.cell-edit-input');
                        if (input) {
                            console.log('編輯模式開啟成功！');
                            input.value = '999';
                            
                            // 模擬按下 Enter
                            const enterEvent = new KeyboardEvent('keydown', {
                                bubbles: true,
                                cancelable: true,
                                key: 'Enter'
                            });
                            input.dispatchEvent(enterEvent);
                            
                            console.log('測試完成！數值應該已更新為 999');
                        } else {
                            console.error('未找到編輯輸入框');
                        }
                    }, 100);
                } else {
                    console.error('未找到矩陣儲存格');
                }
            }, 1000);
        }
    },
    
    // 重置所有功能
    reset: function() {
        if (window.matrixVisualizer) {
            console.log('重置系統...');
            window.matrixVisualizer.reset();
        }
    }
};

console.log('測試腳本已載入。可使用 window.manualTest 進行手動測試。');
console.log('可用的手動測試:');
console.log('- window.manualTest.testVisualization() - 測試視覺化');
console.log('- window.manualTest.testMatrixStructure() - 測試矩陣結構');
console.log('- window.manualTest.testMatrixSelectionSync() - 測試矩陣選擇同步');
console.log('- window.manualTest.testZoomPreservation() - 測試縮放保持');
console.log('- window.manualTest.testZoomControls() - 測試縮放功能');
console.log('- window.manualTest.testAnimation("traverse") - 測試動畫');
console.log('- window.manualTest.testExport("json") - 測試匯出');
console.log('- window.manualTest.testEditFunction() - 測試編輯功能');
console.log('- window.manualTest.reset() - 重置系統');