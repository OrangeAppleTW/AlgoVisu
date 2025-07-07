// 快速功能測試腳本
// 用於檢查所有修復是否正常工作

console.log('🔧 開始快速功能測試...');

// 等待頁面載入
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('📋 執行修復後的功能測試...');
        
        // 測試 1: 基本功能
        testBasicFunctionality();
        
        // 測試 2: 縮放功能
        setTimeout(() => testZoomFunctionality(), 2000);
        
        // 測試 3: 編輯同步功能
        setTimeout(() => testEditSyncFunctionality(), 4000);
        
        // 測試 4: 事件處理
        setTimeout(() => testEventHandling(), 6000);
        
    }, 1000);
});

function testBasicFunctionality() {
    console.log('✅ 測試 1: 基本功能');
    
    // 檢查全局變數
    const globalChecks = [
        { name: 'matrixVisualizer', obj: window.matrixVisualizer },
        { name: 'matrixD3', obj: window.matrixD3 },
        { name: 'MatrixVisualizerAPI', obj: window.MatrixVisualizerAPI }
    ];
    
    globalChecks.forEach(check => {
        if (check.obj) {
            console.log(`   ✓ ${check.name} 已正確載入`);
        } else {
            console.error(`   ✗ ${check.name} 未載入`);
        }
    });
    
    // 測試視覺化
    if (window.matrixVisualizer && window.matrixVisualizer.ui) {
        try {
            window.matrixVisualizer.ui.handleVisualize();
            console.log('   ✓ 視覺化功能正常');
        } catch (error) {
            console.error('   ✗ 視覺化功能異常:', error.message);
        }
    }
}

function testZoomFunctionality() {
    console.log('🔍 測試 2: 縮放功能');
    
    if (window.matrixD3) {
        const initialZoom = window.matrixD3.zoomScale;
        console.log(`   初始縮放: ${Math.round(initialZoom * 100)}%`);
        
        // 測試放大
        window.matrixD3.zoomIn();
        const zoomedIn = window.matrixD3.zoomScale;
        console.log(`   放大後: ${Math.round(zoomedIn * 100)}%`);
        
        // 測試縮小
        window.matrixD3.zoomOut();
        const zoomedOut = window.matrixD3.zoomScale;
        console.log(`   縮小後: ${Math.round(zoomedOut * 100)}%`);
        
        // 測試重設
        window.matrixD3.resetZoom();
        const resetZoom = window.matrixD3.zoomScale;
        console.log(`   重設後: ${Math.round(resetZoom * 100)}%`);
        
        if (zoomedIn > initialZoom && resetZoom === 1) {
            console.log('   ✓ 縮放功能測試通過');
        } else {
            console.error('   ✗ 縮放功能測試失敗');
        }
    } else {
        console.error('   ✗ D3 模組未載入');
    }
}

function testEditSyncFunctionality() {
    console.log('✏️ 測試 3: 編輯同步功能');
    
    // 尋找第一個儲存格
    const firstCell = document.querySelector('.matrix-table td');
    if (firstCell) {
        console.log('   ✓ 找到可編輯的儲存格');
        
        // 檢查是否可以觸發編輯
        const originalValue = firstCell.dataset.value;
        console.log(`   原始值: ${originalValue}`);
        
        // 模擬雙擊
        const dblclickEvent = new MouseEvent('dblclick', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        firstCell.dispatchEvent(dblclickEvent);
        
        setTimeout(() => {
            const input = document.querySelector('.cell-edit-input');
            if (input) {
                console.log('   ✓ 編輯模式成功開啟');
                
                // 測試取消編輯
                const escEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    key: 'Escape'
                });
                input.dispatchEvent(escEvent);
                
                setTimeout(() => {
                    const stillHasInput = document.querySelector('.cell-edit-input');
                    if (!stillHasInput) {
                        console.log('   ✓ 編輯取消功能正常');
                    } else {
                        console.error('   ✗ 編輯取消功能異常');
                    }
                }, 100);
            } else {
                console.error('   ✗ 無法開啟編輯模式');
            }
        }, 100);
    } else {
        console.error('   ✗ 找不到可編輯的儲存格');
    }
}

function testEventHandling() {
    console.log('⚡ 測試 4: 事件處理');
    
    // 測試縮放按鈕
    const zoomButtons = [
        { id: 'zoom-in-btn', name: '放大按鈕' },
        { id: 'zoom-out-btn', name: '縮小按鈕' },
        { id: 'zoom-reset-btn', name: '重設按鈕' }
    ];
    
    zoomButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            console.log(`   ✓ ${button.name} 存在`);
            
            // 測試點擊事件
            try {
                element.click();
                console.log(`   ✓ ${button.name} 點擊事件正常`);
            } catch (error) {
                console.error(`   ✗ ${button.name} 點擊事件異常:`, error.message);
            }
        } else {
            console.error(`   ✗ ${button.name} 不存在`);
        }
    });
    
    // 測試動畫按鈕
    const animateBtn = document.getElementById('animate-btn');
    if (animateBtn) {
        console.log('   ✓ 動畫按鈕存在');
        try {
            animateBtn.click();
            console.log('   ✓ 動畫按鈕點擊事件正常');
        } catch (error) {
            console.error('   ✗ 動畫按鈕點擊事件異常:', error.message);
        }
    }
    
    console.log('🎉 快速功能測試完成！');
}

// 提供手動測試接口
window.quickTest = {
    runAll: function() {
        console.log('🔧 手動運行所有測試...');
        testBasicFunctionality();
        setTimeout(() => testZoomFunctionality(), 1000);
        setTimeout(() => testEditSyncFunctionality(), 2000);
        setTimeout(() => testEventHandling(), 3000);
    },
    
    testBasic: testBasicFunctionality,
    testZoom: testZoomFunctionality,
    testEdit: testEditSyncFunctionality,
    testEvents: testEventHandling
};

console.log('🔧 快速測試腳本已載入。使用 window.quickTest.runAll() 來運行所有測試。');
