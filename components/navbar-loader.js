/**
 * 動態載入導覽列組件
 * 確保所有連結都從 AlgoVisu 根目錄開始
 */

class NavbarLoader {
    constructor() {
        this.algoVisuPath = this.findAlgoVisuPath();
        this.loadNavbar();
    }

    /**
     * 尋找 AlgoVisu 根目錄的相對路徑
     */
    findAlgoVisuPath() {
        const pathname = window.location.pathname;
        const segments = pathname.split('/').filter(segment => segment.length > 0);
        
        // 找到 AlgoVisu 目錄的位置
        const algoVisuIndex = segments.findIndex(segment => segment === 'AlgoVisu');
        
        if (algoVisuIndex !== -1) {
            // 計算從當前位置到 AlgoVisu 根目錄的相對路徑
            const depth = segments.length - algoVisuIndex - 1;
            if (depth === 0) {
                return './'; // 已經在 AlgoVisu 根目錄
            }
            return '../'.repeat(depth);
        }
        
        // 備用方案：根據檔案路徑結構估算
        const htmlFile = pathname.split('/').pop();
        if (htmlFile && htmlFile.endsWith('.html')) {
            // 計算目錄層級
            const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
            let depth = 0;
            
            // 檢查是否在 lessons 子目錄中
            if (pathname.includes('/lessons/')) {
                const lessonsIndex = pathSegments.findIndex(segment => segment === 'lessons');
                if (lessonsIndex !== -1) {
                    depth = pathSegments.length - lessonsIndex - 1;
                    if (htmlFile !== 'index.html') {
                        depth++; // 如果不是 index.html，再加一層
                    }
                }
            } else if (pathname.includes('/components/')) {
                depth = 1;
            }
            
            return depth > 0 ? '../'.repeat(depth) : './';
        }
        
        return './'; // 預設為當前目錄
    }

    /**
     * 載入並插入導覽列
     */
    async loadNavbar() {
        try {
            const navbarPath = `${this.algoVisuPath}components/navbar.html`;
            
            console.log(`🔄 正在載入導覽列: ${navbarPath}`);
            
            const response = await fetch(navbarPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let navbarHTML = await response.text();
            
            // 調整導覽列中的絕對路徑為相對路徑
            navbarHTML = this.adjustAbsolutePaths(navbarHTML);
            
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
     * 將導覽列中的絕對路徑調整為當前頁面的相對路徑
     */
    adjustAbsolutePaths(html) {
        // 將 /AlgoVisu/ 開頭的路徑替換為相對路徑
        const regex = /\/AlgoVisu\//g;
        return html.replace(regex, this.algoVisuPath);
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
        const navLinks = document.querySelectorAll('.nav-link');
        
        // 為下拉選單連結設置活動狀態
        dropdownLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && this.isCurrentPage(linkPath, currentPath)) {
                link.classList.add('active');
                
                // 為父級下拉選單加上活動狀態
                const parentDropdown = link.closest('.nav-dropdown');
                if (parentDropdown) {
                    const parentToggle = parentDropdown.querySelector('.nav-link');
                    if (parentToggle) {
                        parentToggle.classList.add('active');
                    }
                }
            }
        });
        
        // 為主導覽連結設置活動狀態
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && this.isCurrentPage(linkPath, currentPath)) {
                link.classList.add('active');
            }
        });
    }

    /**
     * 判斷連結是否指向當前頁面
     */
    isCurrentPage(linkPath, currentPath) {
        // 移除可能的 AlgoVisu 前綴進行比較
        const normalizedLinkPath = linkPath.replace(/^.*\/AlgoVisu/, '');
        const normalizedCurrentPath = currentPath.replace(/^.*\/AlgoVisu/, '');
        
        return normalizedCurrentPath.includes(normalizedLinkPath.replace('/index.html', '')) ||
               normalizedCurrentPath === normalizedLinkPath;
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

        // 為所有導覽連結添加點擊事件記錄
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', function() {
                console.log(`🔗 導覽至: ${this.getAttribute('href')}`);
            });
        });
    }

    /**
     * 顯示備用導覽列（當載入失敗時）
     */
    showFallbackNavbar() {
        const fallbackNavbar = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="${this.algoVisuPath}index.html" class="navbar-logo">
                        <img src="${this.algoVisuPath}picture/OA_logo2.png" alt="OA Logo" class="logo-img">
                    </a>
                    <div class="navbar-links">
                        <div class="nav-dropdown">
                            <a href="${this.algoVisuPath}lessons/apcs_advanced/index.html" class="nav-link">APCS進階班</a>
                            <div class="dropdown-menu">
                                <a href="${this.algoVisuPath}lessons/apcs_advanced/1_maze_recursion/index.html" class="dropdown-link">遞迴函式</a>
                            </div>
                        </div>
                        <div class="nav-dropdown">
                            <a href="${this.algoVisuPath}lessons/learning_resources/index.html" class="nav-link">學習資源</a>
                            <div class="dropdown-menu">
                                <div class="dropdown-section">
                                    <h4>基礎演算法</h4>
                                    <a href="${this.algoVisuPath}lessons/learning_resources/1_sorting/index.html" class="dropdown-link">排序演算法</a>
                                    <a href="${this.algoVisuPath}lessons/learning_resources/2_2d_linked_list/index.html" class="dropdown-link">二維鏈表</a>
                                </div>
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