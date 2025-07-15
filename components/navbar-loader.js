/**
 * 動態載入導覽列組件
 * 專為 GitHub Pages 部署優化，自動處理路徑問題
 */

class NavbarLoader {
    constructor() {
        this.basePath = this.getBasePath();
        this.rootPath = this.getRootPath();
        console.log(`🔧 基礎路徑: ${this.basePath}`);
        console.log(`🏠 根目錄路徑: ${this.rootPath}`);
        this.loadNavbar();
    }

    /**
     * 獲取基礎路徑（相對於 GitHub Pages 的路徑）
     */
    getBasePath() {
        const pathname = window.location.pathname;
        
        // GitHub Pages 環境檢測
        if (pathname.includes('/AlgoVisu/')) {
            return '/AlgoVisu/';
        }
        
        // 本地開發環境或其他環境
        return '/';
    }

    /**
     * 獲取從當前頁面到 AlgoVisu 根目錄的相對路徑
     */
    getRootPath() {
        const pathname = window.location.pathname;
        const basePath = this.basePath;
        
        // 移除基礎路徑，獲取相對路徑
        const relativePath = pathname.replace(basePath, '');
        
        // 計算目錄深度
        const segments = relativePath.split('/').filter(segment => segment.length > 0);
        
        // 移除檔案名稱（如果存在）
        if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
            segments.pop();
        }
        
        // 計算需要返回的層級數
        const depth = segments.length;
        
        if (depth === 0) {
            return './'; // 已在根目錄
        }
        
        return '../'.repeat(depth);
    }

    /**
     * 載入並插入導覽列
     */
    async loadNavbar() {
        try {
            const navbarPath = `${this.rootPath}components/navbar.html`;
            
            console.log(`🔄 正在載入導覽列: ${navbarPath}`);
            
            const response = await fetch(navbarPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            let navbarHTML = await response.text();
            
            // 替換模板中的 {{ROOT}} 為實際的根路徑
            navbarHTML = navbarHTML.replace(/\{\{ROOT\}\}/g, this.rootPath);
            
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
        const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
        
        // 正規化當前路徑
        const normalizedCurrentPath = this.normalizePath(currentPath);
        
        // 為下拉選單連結設置活動狀態
        dropdownLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && this.isCurrentPage(linkPath, normalizedCurrentPath)) {
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
        
        // 為主導覽連結設置活動狀態
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && this.isCurrentPage(linkPath, normalizedCurrentPath)) {
                link.classList.add('active');
            }
        });
    }

    /**
     * 正規化路徑，移除基礎路徑部分
     */
    normalizePath(path) {
        return path.replace(this.basePath, '/').replace(/\/+/g, '/');
    }

    /**
     * 判斷連結是否指向當前頁面
     */
    isCurrentPage(linkPath, currentPath) {
        // 將相對路徑轉換為絕對路徑進行比較
        let absoluteLinkPath = linkPath;
        
        // 如果是相對路徑，轉換為絕對路徣
        if (linkPath.startsWith('./') || linkPath.startsWith('../')) {
            // 這裡簡化處理，在實際場景中可能需要更複雜的路徑解析
            absoluteLinkPath = this.basePath + linkPath.replace(/^\.\//, '').replace(/\.\.\//g, '');
        }
        
        const normalizedLinkPath = this.normalizePath(absoluteLinkPath);
        
        // 檢查是否為當前頁面或所在目錄
        return currentPath === normalizedLinkPath ||
               currentPath.includes(normalizedLinkPath.replace('/index.html', '')) ||
               normalizedLinkPath.includes(currentPath.replace('/index.html', ''));
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 為下拉選單加上 hover 和 click 事件處理
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // 防止連結跳轉（僅對下拉選單）
                toggle.addEventListener('click', function(e) {
                    if (this.classList.contains('dropdown-toggle')) {
                        e.preventDefault();
                    }
                });

                // 觸控設備支援
                dropdown.addEventListener('touchstart', function() {
                    this.classList.add('touched');
                });

                document.addEventListener('touchstart', function(e) {
                    if (!dropdown.contains(e.target)) {
                        dropdown.classList.remove('touched');
                    }
                });
            }
        });

        // 為所有導覽連結添加點擊事件記錄
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', function() {
                const href = this.getAttribute('href');
                console.log(`🔗 導覽至: ${href}`);
                
                // 檢查連結是否為相對路徑，如果是，可能需要調整
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    console.log(`📍 當前頁面: ${window.location.pathname}`);
                }
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
                    <a href="${this.rootPath}index.html" class="navbar-logo">
                        <img src="${this.rootPath}picture/OA_logo2.png" alt="OA Logo" class="logo-img">
                    </a>
                    <div class="navbar-links">
                        <div class="nav-dropdown">
                            <a href="${this.rootPath}lessons/apcs_advanced/index.html" class="nav-link dropdown-toggle">APCS進階班</a>
                            <div class="dropdown-menu">
                                <a href="${this.rootPath}lessons/apcs_advanced/1_maze_recursion/index.html" class="dropdown-link">L1 遞迴函式</a>
                                <a href="${this.rootPath}lessons/apcs_advanced/2_time_space_complexity/index.html" class="dropdown-link">L2 複雜度</a>
                                <a href="${this.rootPath}lessons/apcs_advanced/4_2d_array_applications/index.html" class="dropdown-link">L4 二維串列應用</a>
                                <a href="${this.rootPath}lessons/apcs_advanced/5_binary_tree/index.html" class="dropdown-link">L5 二元樹與樹走訪</a>
                                <a href="${this.rootPath}lessons/apcs_advanced/6_graph_search/index.html" class="dropdown-link">L6 圖形搜索方法</a>
                            </div>
                        </div>
                        <div class="nav-dropdown">
                            <a href="${this.rootPath}lessons/learning_resources/index.html" class="nav-link dropdown-toggle">學習資源</a>
                            <div class="dropdown-menu">
                                <div class="dropdown-section">
                                    <h4>基礎演算法</h4>
                                    <a href="${this.rootPath}lessons/learning_resources/1_sorting/index.html" class="dropdown-link">排序演算法</a>
                                    <a href="${this.rootPath}lessons/learning_resources/2_2d_linked_list/index.html" class="dropdown-link">二維鏈表</a>
                                    <a href="${this.rootPath}lessons/learning_resources/3_divide_and_conquer/index.html" class="dropdown-link">分治演算法</a>
                                    <a href="${this.rootPath}lessons/learning_resources/4_coin_change/index.html" class="dropdown-link">動態規劃</a>
                                    <a href="${this.rootPath}lessons/learning_resources/5_graph_theory/index.html" class="dropdown-link">圖論基礎</a>
                                    <a href="${this.rootPath}lessons/learning_resources/6_shortest_path/index.html" class="dropdown-link">最短路徑</a>
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
    console.log('🚀 開始載入導覽列...');
    new NavbarLoader();
});

// 導出供手動使用
window.NavbarLoader = NavbarLoader;