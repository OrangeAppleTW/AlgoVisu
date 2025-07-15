/**
 * 圖形搜尋 UI 控制器
 * 負責統合所有元件和用戶介面互動
 * 注意：SVGRenderer、QueueRenderer、StackRenderer 現在定義在 renderers.js 中
 */
class GraphSearchUI {
    constructor() {
        this.currentTab = 'bfs';
        this.initializeComponents();
        this.setupEventListeners();
        this.setupTabSwitching();
        this.setupCodeTabSwitching();
    }

    /**
     * 初始化所有元件
     */
    initializeComponents() {
        // 圖形結構
        this.graph = new GraphStructure();
        this.graph.initializeGraph();

        // BFS 元件
        this.bfsSvgRenderer = new SVGRenderer('bfs-graph', this.graph);
        this.bfsQueueRenderer = new QueueRenderer('bfs-queue');
        this.bfsAlgorithm = new BFSAlgorithm(this.graph, this.bfsSvgRenderer, this.bfsQueueRenderer);

        // DFS 元件
        this.dfsSvgRenderer = new SVGRenderer('dfs-graph', this.graph);
        this.dfsStackRenderer = new StackRenderer('dfs-stack');
        this.dfsAlgorithm = new DFSAlgorithm(this.graph, this.dfsSvgRenderer, this.dfsStackRenderer);

        // 初始渲染
        this.bfsSvgRenderer.render();
        this.dfsSvgRenderer.render();
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // BFS 控制按鈕
        document.getElementById('bfs-start')?.addEventListener('click', () => {
            this.bfsAlgorithm.start();
        });

        document.getElementById('bfs-step')?.addEventListener('click', () => {
            this.bfsAlgorithm.step();
        });

        document.getElementById('bfs-reset')?.addEventListener('click', () => {
            this.bfsAlgorithm.reset();
        });

        document.getElementById('bfs-random')?.addEventListener('click', () => {
            this.graph.generateRandomGraph();
            this.bfsSvgRenderer.render();
            this.bfsAlgorithm.reset();
        });

        // BFS 速度控制
        document.getElementById('bfs-speed')?.addEventListener('input', (e) => {
            this.bfsAlgorithm.setSpeed(parseInt(e.target.value));
        });

        // DFS 控制按鈕
        document.getElementById('dfs-start')?.addEventListener('click', () => {
            this.dfsAlgorithm.start();
        });

        document.getElementById('dfs-step')?.addEventListener('click', () => {
            this.dfsAlgorithm.step();
        });

        document.getElementById('dfs-reset')?.addEventListener('click', () => {
            this.dfsAlgorithm.reset();
        });

        document.getElementById('dfs-random')?.addEventListener('click', () => {
            this.graph.generateRandomGraph();
            this.dfsSvgRenderer.render();
            this.dfsAlgorithm.reset();
        });

        // DFS 速度控制
        document.getElementById('dfs-speed')?.addEventListener('input', (e) => {
            this.dfsAlgorithm.setSpeed(parseInt(e.target.value));
        });
    }

    /**
     * 設置分頁切換
     */
    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // 移除所有活動狀態
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                
                // 添加活動狀態
                tab.classList.add('active');
                document.getElementById(targetTab)?.classList.add('active');
                
                // 更新當前分頁
                this.currentTab = targetTab;
                
                // 當切換到不同分頁時，重新渲染圖形
                if (targetTab === 'bfs') {
                    setTimeout(() => this.bfsSvgRenderer.render(), 100);
                } else if (targetTab === 'dfs') {
                    setTimeout(() => this.dfsSvgRenderer.render(), 100);
                }
            });
        });
    }

    /**
     * 設置程式碼分頁切換
     */
    setupCodeTabSwitching() {
        // BFS 程式碼分頁
        const bfsCodeTabs = document.querySelectorAll('#bfs .code-tab');
        const bfsCodeViews = document.querySelectorAll('#bfs .code-view');

        bfsCodeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetCode = tab.getAttribute('data-code');
                
                bfsCodeTabs.forEach(t => t.classList.remove('active'));
                bfsCodeViews.forEach(cv => cv.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetCode)?.classList.add('active');
            });
        });

        // DFS 程式碼分頁
        const dfsCodeTabs = document.querySelectorAll('#dfs .code-tab');
        const dfsCodeViews = document.querySelectorAll('#dfs .code-view');

        dfsCodeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetCode = tab.getAttribute('data-code');
                
                dfsCodeTabs.forEach(t => t.classList.remove('active'));
                dfsCodeViews.forEach(cv => cv.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetCode)?.classList.add('active');
            });
        });
    }
}

// 當頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化圖形搜尋 UI
    window.graphSearchUI = new GraphSearchUI();
    
    console.log('圖形搜尋演算法視覺化已初始化');
});