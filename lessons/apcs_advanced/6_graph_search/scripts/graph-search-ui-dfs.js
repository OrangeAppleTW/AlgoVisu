/**
 * DFS 頁面專用 UI 控制器
 * 只處理 DFS 相關的功能
 */
class DFSPageUI {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.setupCodeTabSwitching();
    }

    /**
     * 初始化所有元件
     */
    initializeComponents() {
        // 圖形結構
        this.graph = new GraphStructure();
        this.graph.initializeGraph();

        // DFS 元件
        this.svgRenderer = new SVGRenderer('dfs-graph', this.graph);
        this.stackRenderer = new StackRenderer('dfs-stack');
        this.algorithm = new DFSAlgorithm(this.graph, this.svgRenderer, this.stackRenderer);

        // 初始渲染
        this.svgRenderer.render();
    }

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // DFS 控制按鈕
        document.getElementById('dfs-start')?.addEventListener('click', () => {
            this.algorithm.start();
        });

        document.getElementById('dfs-step')?.addEventListener('click', () => {
            this.algorithm.step();
        });

        document.getElementById('dfs-reset')?.addEventListener('click', () => {
            this.algorithm.reset();
        });

        // DFS 速度控制
        document.getElementById('dfs-speed')?.addEventListener('input', (e) => {
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
    // 初始化 DFS 頁面 UI
    window.dfsPageUI = new DFSPageUI();
    
    console.log('DFS 演算法視覺化已初始化');
});