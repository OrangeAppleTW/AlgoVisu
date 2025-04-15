/**
 * 導覽列活動連結自動設置功能
 * 根據當前頁面的URL自動設置對應的導覽連結為活動狀態
 */
document.addEventListener('DOMContentLoaded', function() {
    // 獲取當前頁面的路徑
    const currentPath = window.location.pathname;
    
    // 獲取所有導覽連結
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 為每個連結檢查是否匹配當前路徑
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // 獲取主要路徑部分進行匹配
        // 例如，如果當前路徑包含 "1_sorting"，則相應的導覽連結應該高亮
        if (currentPath.includes(linkPath.split('/')[1])) {
            link.classList.add('active');
        }
    });
});
