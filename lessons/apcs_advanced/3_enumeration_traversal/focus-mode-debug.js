// 專注模式調試工具 - focus-mode-debug.js

/**
 * 專注模式的調試和診斷工具
 */

// 調試模式開關
window.FOCUS_DEBUG = true;

// 調試日誌函數
function debugLog(message, data = null) {
    if (window.FOCUS_DEBUG) {
        console.log(`[專注模式調試] ${message}`, data || '');
    }
}

// 檢查專注模式組件狀態
function checkFocusModeStatus() {
    debugLog('=== 專注模式狀態檢查 ===');
    
    // 檢查組合枚舉器
    debugLog('組合枚舉器狀態:', {
        exists: !!window.combinationEnumerator,
        type: typeof window.combinationEnumerator,
        methods: window.combinationEnumerator ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.combinationEnumerator)) : null
    });
    
    // 檢查DOM元素
    const elements = {
        'combination-tree': document.getElementById('combination-tree'),
        'combination-slots': document.getElementById('combination-slots'),
        'combination-count': document.getElementById('combination-count'),
        'status': document.getElementById('status'),
        'start-btn': document.getElementById('start-btn')
    };
    
    debugLog('DOM元素狀態:');
    Object.keys(elements).forEach(id => {
        debugLog(`  ${id}: ${elements[id] ? '✓ 存在' : '✗ 缺失'}`);
    });
    
    // 檢查樹狀圖容器
    const treeContainer = document.getElementById('combination-tree');
    if (treeContainer) {
        debugLog('樹狀圖容器:', {
            children: treeContainer.children.length,
            innerHTML: treeContainer.innerHTML.substring(0, 200) + '...'
        });
    }
    
    // 檢查腳本載入
    const scripts = Array.from(document.scripts).map(s => s.src.split('/').pop());
    debugLog('已載入的腳本:', scripts);
    
    debugLog('=== 檢查完成 ===');
}

// 強制重新初始化
function forceReinitialize() {
    debugLog('強制重新初始化專注模式...');
    
    try {
        // 清除現有的枚舉器
        if (window.combinationEnumerator) {
            delete window.combinationEnumerator;
        }
        
        // 重新創建
        if (typeof CombinationsEnumeration === 'function') {
            window.combinationEnumerator = new CombinationsEnumeration();
            debugLog('組合枚舉器重新創建成功');
            
            // 強制更新顯示
            setTimeout(() => {
                if (window.combinationEnumerator.updateDisplay) {
                    window.combinationEnumerator.updateDisplay();
                }
                if (window.focusModeSync && window.focusModeSync.forceRefreshTree) {
                    window.focusModeSync.forceRefreshTree();
                }
                debugLog('強制重新初始化完成');
            }, 100);
        } else {
            debugLog('錯誤: CombinationsEnumeration 類不存在');
        }
    } catch (error) {
        debugLog('強制重新初始化失敗:', error);
    }
}

// 手動創建樹狀圖
function manualCreateTree() {
    debugLog('手動創建樹狀圖...');
    
    const treeContainer = document.getElementById('combination-tree');
    if (!treeContainer) {
        debugLog('錯誤: 樹狀圖容器不存在');
        return;
    }
    
    // 清除現有內容（保留圖例）
    const legend = treeContainer.querySelector('.tree-legend');
    treeContainer.innerHTML = '';
    if (legend) {
        treeContainer.appendChild(legend);
    }
    
    // 創建簡單的樹狀結構
    const rootNode = document.createElement('div');
    rootNode.className = 'tree-node root';
    rootNode.textContent = '{}';
    rootNode.style.left = '50px';
    rootNode.style.top = '50px';
    
    treeContainer.appendChild(rootNode);
    
    // 創建第一層節點
    const nodes = [
        { text: '1', left: '20px', top: '150px' },
        { text: '2', left: '60px', top: '150px' },
        { text: '3', left: '100px', top: '150px' },
        { text: '4', left: '140px', top: '150px' },
        { text: '5', left: '180px', top: '150px' }
    ];
    
    nodes.forEach(nodeData => {
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.textContent = nodeData.text;
        node.style.left = nodeData.left;
        node.style.top = nodeData.top;
        treeContainer.appendChild(node);
    });
    
    debugLog('手動樹狀圖創建完成');
}

// 診斷並修復問題
function diagnoseAndFix() {
    debugLog('開始診斷專注模式問題...');
    
    checkFocusModeStatus();
    
    // 如果組合枚舉器不存在，嘗試重新創建
    if (!window.combinationEnumerator) {
        debugLog('組合枚舉器不存在，嘗試重新創建...');
        forceReinitialize();
    }
    
    // 檢查樹狀圖容器是否為空
    const treeContainer = document.getElementById('combination-tree');
    if (treeContainer && treeContainer.children.length <= 1) { // 只有圖例
        debugLog('樹狀圖容器為空，嘗試手動創建...');
        setTimeout(() => {
            if (window.combinationEnumerator && window.combinationEnumerator.createTreeStructure) {
                window.combinationEnumerator.createTreeStructure();
                window.combinationEnumerator.updateDisplay();
            } else {
                manualCreateTree();
            }
        }, 500);
    }
    
    debugLog('診斷完成');
}

// 在控制台提供調試命令
window.focusDebug = {
    check: checkFocusModeStatus,
    reinit: forceReinitialize,
    createTree: manualCreateTree,
    diagnose: diagnoseAndFix,
    log: debugLog
};

// 自動診斷（在初始化後3秒執行）
setTimeout(diagnoseAndFix, 3000);