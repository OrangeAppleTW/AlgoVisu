/**
 * 導覽列活動連結自動設置功能
 * 根據當前頁面的URL自動設置對應的導覽連結為活動狀態
 */
document.addEventListener('DOMContentLoaded', function() {
    // 獲取當前頁面的路徑
    const currentPath = window.location.pathname;
    
    // 獲取所有下拉選單連結
    const dropdownLinks = document.querySelectorAll('.dropdown-link');
    const navDropdowns = document.querySelectorAll('.nav-dropdown');
    
    // 為每個下拉連結檢查是否匹配當前路徑
    dropdownLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // 獲取主要路徑部分進行匹配
        if (linkPath) {
            // 提取關鍵路徑片段進行匹配
            const linkSegments = linkPath.split('/').filter(seg => seg && seg !== '..' && seg !== 'index.html');
            const currentSegments = currentPath.split('/').filter(seg => seg && seg !== 'index.html');
            
            // 檢查是否有匹配的路徑片段
            const hasMatch = linkSegments.some(segment => 
                currentSegments.some(currentSeg => 
                    currentSeg.includes(segment) || segment.includes(currentSeg)
                )
            );
            
            if (hasMatch) {
                link.classList.add('active');
                // 同時為父級下拉選單加上活動狀態
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) {
                    const parentToggle = parentDropdown.querySelector('.dropdown-toggle');
                    if (parentToggle) {
                        parentToggle.classList.add('active');
                    }
                }
            }
        }
    });
    
    // 為下拉選單加上點擊事件處理
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            // 不做任何操作，保持hover效果
        });
    });
});
