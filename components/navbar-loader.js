/**
 * 動態載入導覽列組件
 * 根據頁面層級自動調整路徑
 */

class NavbarLoader {
    constructor() {
        this.currentDepth = this.calculateDepth();
        this.loadNavbar();
    }

    /**
     * 計算當前頁面相對於根目錄的深度
     */
    calculateDepth() {
        const pathname = window.location.pathname;
        const segments = pathname.split('/').filter(segment => segment.length > 0);
        
        // 找到 AlgoVisu 目錄的位置
        const algoVisuIndex = segments.findIndex(segment => segment === 'AlgoVisu');
        
        if (algoVisuIndex !== -1) {
            // 計算從 AlgoVisu 根目錄的深度
            return segments.length - algoVisuIndex - 1;
        }
        
        // 備用方案：根據檔案路徑估算
        if (pathname.includes('.html')) {
            const htmlFile = pathname.split('/').pop();
            if (htmlFile === 'index.html' && !pathname.includes('/')) {
                return 0; // 根目錄
            }
        }
        
        // 估算深度（這個可能需要根據實際結構調整）
        return segments.length > 0 ? Math.max(1, segments.length - 1) : 0;
    }

    /**
     * 獲取相對路徑前綴
     */
    getPathPrefix() {
        if (this.currentDepth === 0) {
            return './'; // 根目錄
        }
        return '../'.repeat(this.currentDepth);
    }

    /**
     * 載入並插入導覽列
     */
    async loadNavbar() {
        try {
            const pathPrefix = this.getPathPrefix();
            const navbarPath = `${pathPrefix}components/navbar.html`;
            
            const response = await fetch(navbarPath);
            if (!response.ok) {
                throw new Error(`Failed to load navbar: ${response.status}`);
            }
            
            let navbarHTML = await response.text();
            
            // 調整導覽列中的所有相對路徑
            navbarHTML = this.adjustPaths(navbarHTML, pathPrefix);
            
            // 插入導覽列到頁面
            this.insertNavbar(navbarHTML);
            
            // 設置活動狀態
            this.setActiveLinks();
            
            // 綁定事件
            this.bindEvents();
            
            console.log('✅ 導覽列載入成功');
        } catch (error) {
            console.error('❌ 導覽列載入失敗:', error);
            this.showFallbackNavbar();
        }
    }

    /**
     * 調整HTML中的相對路徑
     */
    adjustPaths(html, pathPrefix) {
        // 調整圖片路徑
        html = html.replace(/src="\.\.\/picture\//g, `src="${pathPrefix}picture/`);
        
        // 調整連結路徑
        html = html.replace(/href="\.\.\/index\.html"/g, `href="${pathPrefix}index.html"`);
        html = html.replace(/href="\.\.\/([^"]+)"/g, `href="${pathPrefix}$1"`);
        
        return html;
    }

    /**
     * 將導覽列插入到頁面
     */
    insertNavbar(navbarHTML) {
        // 檢查是否已經有導覽列
        const existingNavbar = document.querySelector('.navbar');
        if (existingNavbar) {
            existingNavbar.outerHTML = navbarHTML;
        } else {
            // 在 body 開始處插入
            document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        }
    }

    /**
     * 設置活動連結狀態
     */
    setActiveLinks() {
        const currentPath = window.location.pathname;
        const dropdownLinks = document.querySelectorAll('.dropdown-link');
        const navDropdowns = document.querySelectorAll('.nav-dropdown');
        
        dropdownLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && currentPath.includes(this.extractMainPath(linkPath))) {
                link.classList.add('active');
                
                // 為父級下拉選單加上活動狀態
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) {
                    const parentToggle = parentDropdown.querySelector('.dropdown-toggle');
                    if (parentToggle) {
                        parentToggle.classList.add('active');
                    }
                }
            }
        });
    }

    /**
     * 從連結路徑中提取主要路徑部分
     */
    extractMainPath(linkPath) {
        const pathSegments = linkPath.split('/');
        return pathSegments.find(segment => 
            segment.includes('_') || segment.includes('index.html')
        ) || pathSegments[pathSegments.length - 1];
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 為下拉選單加上點擊事件處理
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                // 保持hover效果，不需要額外操作
            });
        });
    }

    /**
     * 顯示備用導覽列（當載入失敗時）
     */
    showFallbackNavbar() {
        const pathPrefix = this.getPathPrefix();
        const fallbackNavbar = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="${pathPrefix}index.html" class="navbar-logo">
                        <img src="${pathPrefix}picture/OA_logo2.png" alt="OA Logo" class="logo-img">
                    </a>
                    <div class="navbar-links">
                        <div class="nav-dropdown">
                            <a href="#" class="nav-link dropdown-toggle">APCS進階班</a>
                            <div class="dropdown-menu">
                                <div class="dropdown-section">
                                    <h4>APCS教學資源</h4>
                                    <a href="${pathPrefix}lessons/apcs_advanced/1_maze_recursion/index.html" class="dropdown-link">老鼠走迷宮</a>
                                </div>
                            </div>
                        </div>
                        <div class="nav-dropdown">
                            <a href="#" class="nav-link dropdown-toggle">學習資源</a>
                            <div class="dropdown-menu">
                                <a href="${pathPrefix}lessons/learning_resources/1_sorting/index.html" class="dropdown-link">排序演算法</a>
                                <a href="${pathPrefix}lessons/learning_resources/2_2d_linked_list/index.html" class="dropdown-link">二維鏈表</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        
        this.insertNavbar(fallbackNavbar);
        this.setActiveLinks();
        this.bindEvents();
        
        console.log('⚠️ 使用備用導覽列');
    }
}

// 當 DOM 載入完成後自動載入導覽列
document.addEventListener('DOMContentLoaded', function() {
    new NavbarLoader();
});

// 導出供手動使用
window.NavbarLoader = NavbarLoader;