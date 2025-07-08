/**
 * 舊版 navbar.js 兼容性檔案
 * 
 * 此檔案已被 navbar-loader.js 取代
 * 保留此檔案僅為向後兼容，避免舊版頁面出現 404 錯誤
 * 
 * 新功能已整合到 navbar-loader.js 中，包括：
 * - 自動路徑計算
 * - GitHub Pages 支援
 * - 更精確的活動連結檢測
 * - 更好的錯誤處理
 */

console.warn('⚠️ navbar.js 已被棄用，請使用 navbar-loader.js');
console.log('🔄 導覽列功能已由 navbar-loader.js 提供');

// 如果 navbar-loader.js 未載入，提供基本的備用功能
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否已有 NavbarLoader
    if (window.NavbarLoader) {
        console.log('✅ NavbarLoader 已載入，跳過舊版 navbar.js 邏輯');
        return;
    }
    
    console.warn('⚠️ NavbarLoader 未找到，使用簡化版導覽列邏輯');
    
    // 簡化版的活動連結設置
    setTimeout(() => {
        const currentPath = window.location.pathname;
        const dropdownLinks = document.querySelectorAll('.dropdown-link');
        
        dropdownLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && currentPath.includes(linkPath.split('/').pop().replace('.html', ''))) {
                link.classList.add('active');
                
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) {
                    const parentToggle = parentDropdown.querySelector('.dropdown-toggle, .nav-link');
                    if (parentToggle) {
                        parentToggle.classList.add('active');
                    }
                }
            }
        });
        
        // 為下拉選單加上基本的點擊事件處理
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
            });
        });
    }, 100);
});