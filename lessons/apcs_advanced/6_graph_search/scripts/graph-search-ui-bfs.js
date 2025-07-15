/**
 * BFS 頁面專用 UI 控制器
 * 只處理 BFS 相關的功能
 */
class BFSPageUI {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.setupCodeTabSwitching();
    }

    /**
     * 初始化所有元件
     */
    initializeComponents() {
        // BFS 專用圖形結構
        this.graph = new BFSGraphStructure();
        this.graph.initializeGraph();

        // BFS 元件
        this.svgRenderer = new SVGRenderer('bfs-graph', this.graph);
        this.queueRenderer = new QueueRenderer('bfs-queue');
        this.algorithm = new BFSAlgorithm(this.graph, this.svgRenderer, this.queueRenderer);

        // 初始渲染
        this.svgRenderer.render();
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // BFS 控制按鈕
        document.getElementById('bfs-start')?.addEventListener('click', () => {
            this.algorithm.start();
        });

        document.getElementById('bfs-step')?.addEventListener('click', () => {
            this.algorithm.step();
        });

        document.getElementById('bfs-reset')?.addEventListener('click', () => {
            this.algorithm.reset();
        });

        // BFS 速度控制
        document.getElementById('bfs-speed')?.addEventListener('input', (e) => {
            this.algorithm.setSpeed(parseInt(e.target.value));
        });
    }

    /**
     * 設置程式碼分頁切換
     */
    setupCodeTabSwitching() {
        const codeTabs = document.querySelectorAll('.code-tab');
        const codeViews = document.querySelectorAll('.code-view');

        codeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetCode = tab.getAttribute('data-code');
                
                codeTabs.forEach(t => t.classList.remove('active'));
                codeViews.forEach(cv => cv.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetCode)?.classList.add('active');
            });
        });
    }
}

// 當頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 BFS 頁面 UI
    window.bfsPageUI = new BFSPageUI();
    
    console.log('BFS 演算法視覺化已初始化');
});