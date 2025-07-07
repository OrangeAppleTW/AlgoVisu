// 初始化標籤切換功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('標籤切換初始化開始');
    const tabs = document.querySelectorAll('.tabs .tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 獲取要顯示的標籤 ID
            const tabId = this.getAttribute('data-tab');
            console.log('點擊標籤:', tabId);
            
            // 移除所有標籤和內容的 active 類
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 將當前標籤和內容添加 active 類
            this.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('已切換到標籤內容:', tabId);
                
                // 如果切換到樹的標籤，確保樹的視覺化已經初始化
                if (tabId === 'tree-traversal') {
                    console.log('偵測到樹的標籤');
                    // 不做任何干擾選擇器的操作，讓用戶的選擇保持不變
                }
            } else {
                console.error('找不到目標內容:', tabId);
            }
        });
    });
    
    console.log('標籤切換初始化完成');
});