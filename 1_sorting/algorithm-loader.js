// 演算法模組載入管理器

// 當前載入的演算法內容
let currentAlgorithm = null;

// 處理演算法頁面的動態載入
async function loadAlgorithmContent(algorithmName) {
    try {
        // 獲取演算法內容
        const response = await fetch(`algorithms/${algorithmName}.html`);
        if (!response.ok) {
            throw new Error(`無法載入 ${algorithmName} 演算法內容`);
        }
        
        const htmlContent = await response.text();
        
        // 更新網頁內容
        const contentContainer = document.getElementById('algorithm-content');
        if (!contentContainer) {
            throw new Error('找不到內容容器元素');
        }
        
        contentContainer.innerHTML = htmlContent;
        
        // 更新 URL 參數，但不重新載入頁面
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('algorithm', algorithmName);
        window.history.pushState({ algorithm: algorithmName }, '', newUrl);
        
        // 更新當前算法引用
        currentAlgorithm = algorithmName;
        
        // 更新導航選項卡的活動狀態
        updateActiveTab(algorithmName);
        
        // 重新初始化正確的演算法視覺化
        if (algorithmName === 'bubble') {
            initBubbleSort();
        } else if (algorithmName === 'insertion') {
            initInsertionSort();
        } else if (algorithmName === 'quick') {
            initQuickSort();
        } else if (algorithmName === 'merge') {
            initMergeSort();
        }
        
        // 重新初始化程式碼標籤功能
        initCodeTabs();
    } catch (error) {
        console.error('載入演算法內容時發生錯誤:', error);
        
        // 顯示錯誤訊息給使用者
        const contentContainer = document.getElementById('algorithm-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="error-message">
                    <h2>載入內容時發生錯誤</h2>
                    <p>${error.message}</p>
                    <button onclick="loadAlgorithmContent('bubble')">返回到氣泡排序</button>
                </div>
            `;
        }
    }
}

// 更新導航標籤的活動狀態
function updateActiveTab(algorithmName) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === algorithmName) {
            tab.classList.add('active');
        }
    });
}

// 初始化導航事件
function initNavigationEvents() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const algorithmName = this.getAttribute('data-tab');
            loadAlgorithmContent(algorithmName);
        });
    });
}

// 從 URL 參數載入特定演算法
function loadAlgorithmFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const algorithm = urlParams.get('algorithm') || 'bubble'; // 默認為氣泡排序
    loadAlgorithmContent(algorithm);
}

// 初始化模組
document.addEventListener('DOMContentLoaded', function() {
    // 初始化導航事件
    initNavigationEvents();
    
    // 從 URL 載入正確的演算法
    loadAlgorithmFromUrl();
    
    // 處理瀏覽器的前進/後退按鈕
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.algorithm) {
            loadAlgorithmContent(event.state.algorithm);
        } else {
            loadAlgorithmContent('bubble'); // 默認
        }
    });
});
