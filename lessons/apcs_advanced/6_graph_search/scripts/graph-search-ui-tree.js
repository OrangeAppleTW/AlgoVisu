/**
 * 樹遍歷 DFS 頁面專用 UI 控制器
 * 支援前序、中序、後序三種遍歷方式
 */
class TreeTraversalUI {
    constructor() {
        this.currentTraversal = 'preorder'; // 預設前序
        this.initializeComponents();
        this.setupEventListeners();
        this.setupCodeTabSwitching();
        this.setupTraversalSwitching();
    }

    /**
     * 初始化所有元件
     */
    initializeComponents() {
        // 樹結構
        this.tree = new BinaryTreeStructure();
        this.tree.initializeTree();

        // 樹遍歷 DFS 元件
        this.svgRenderer = new TreeSVGRenderer('dfs-graph', this.tree);
        this.stackRenderer = new StackRenderer('dfs-stack');
        this.algorithm = new TreeTraversalDFS(this.tree, this.svgRenderer, this.stackRenderer);
        this.algorithm.setTraversalType(this.currentTraversal);

        // 初始渲染
        this.svgRenderer.render();
        this.updateTraversalInfo();
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

        document.getElementById('dfs-random')?.addEventListener('click', () => {
            this.tree.generateRandomTree();
            this.svgRenderer.render();
            this.algorithm.reset();
        });

        // DFS 速度控制
        document.getElementById('dfs-speed')?.addEventListener('input', (e) => {
            this.algorithm.setSpeed(parseInt(e.target.value));
        });
    }

    /**
     * 設置遍歷方式切換
     */
    setupTraversalSwitching() {
        // 前序遍歷按鈕
        document.getElementById('traversal-preorder')?.addEventListener('click', () => {
            this.switchTraversal('preorder');
        });

        // 中序遍歷按鈕
        document.getElementById('traversal-inorder')?.addEventListener('click', () => {
            this.switchTraversal('inorder');
        });

        // 後序遍歷按鈕
        document.getElementById('traversal-postorder')?.addEventListener('click', () => {
            this.switchTraversal('postorder');
        });
    }

    /**
     * 切換遍歷方式
     */
    switchTraversal(traversalType) {
        if (this.algorithm.isRunning) {
            alert('請先停止當前執行的演算法');
            return;
        }

        this.currentTraversal = traversalType;
        this.algorithm.setTraversalType(traversalType);
        this.algorithm.reset();
        this.updateTraversalButtons();
        this.updateTraversalInfo();
        this.updateCodeTabs();
    }

    /**
     * 更新遍歷按鈕狀態
     */
    updateTraversalButtons() {
        // 重置所有按鈕
        document.querySelectorAll('.traversal-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 啟用當前選中的按鈕
        document.getElementById(`traversal-${this.currentTraversal}`)?.classList.add('active');
    }

    /**
     * 更新遍歷資訊顯示
     */
    updateTraversalInfo() {
        const infoElement = document.getElementById('traversal-info');
        if (infoElement) {
            const info = {
                'preorder': {
                    name: '前序遍歷 (Preorder)',
                    order: '根 → 左 → 右',
                    description: '先訪問根節點，再遍歷左子樹，最後遍歷右子樹'
                },
                'inorder': {
                    name: '中序遍歷 (Inorder)', 
                    order: '左 → 根 → 右',
                    description: '先遍歷左子樹，再訪問根節點，最後遍歷右子樹'
                },
                'postorder': {
                    name: '後序遍歷 (Postorder)',
                    order: '左 → 右 → 根',
                    description: '先遍歷左子樹，再遍歷右子樹，最後訪問根節點'
                }
            };

            const currentInfo = info[this.currentTraversal];
            infoElement.innerHTML = `
                <h4>${currentInfo.name}</h4>
                <p><strong>遍歷順序：</strong>${currentInfo.order}</p>
                <p>${currentInfo.description}</p>
            `;
        }
    }

    /**
     * 更新程式碼分頁
     */
    updateCodeTabs() {
        // 更新程式碼內容
        const codeContents = {
            'preorder': {
                python: `def preorder_traversal(node):
    if node is None:
        return []
    
    result = []
    result.append(node.val)  # 訪問根節點
    result.extend(preorder_traversal(node.left))   # 左子樹
    result.extend(preorder_traversal(node.right))  # 右子樹
    
    return result`,
                cpp: `vector<int> preorderTraversal(TreeNode* root) {
    vector<int> result;
    if (root == nullptr) return result;
    
    result.push_back(root->val);  // 訪問根節點
    
    // 左子樹
    vector<int> left = preorderTraversal(root->left);
    result.insert(result.end(), left.begin(), left.end());
    
    // 右子樹
    vector<int> right = preorderTraversal(root->right);
    result.insert(result.end(), right.begin(), right.end());
    
    return result;
}`,
                pseudocode: `PREORDER(節點):
1. IF 節點 為空 THEN 返回
2. 訪問節點
3. PREORDER(左子節點)
4. PREORDER(右子節點)`
            },
            'inorder': {
                python: `def inorder_traversal(node):
    if node is None:
        return []
    
    result = []
    result.extend(inorder_traversal(node.left))    # 左子樹
    result.append(node.val)  # 訪問根節點
    result.extend(inorder_traversal(node.right))   # 右子樹
    
    return result`,
                cpp: `vector<int> inorderTraversal(TreeNode* root) {
    vector<int> result;
    if (root == nullptr) return result;
    
    // 左子樹
    vector<int> left = inorderTraversal(root->left);
    result.insert(result.end(), left.begin(), left.end());
    
    result.push_back(root->val);  // 訪問根節點
    
    // 右子樹
    vector<int> right = inorderTraversal(root->right);
    result.insert(result.end(), right.begin(), right.end());
    
    return result;
}`,
                pseudocode: `INORDER(節點):
1. IF 節點 為空 THEN 返回
2. INORDER(左子節點)
3. 訪問節點
4. INORDER(右子節點)`
            },
            'postorder': {
                python: `def postorder_traversal(node):
    if node is None:
        return []
    
    result = []
    result.extend(postorder_traversal(node.left))   # 左子樹
    result.extend(postorder_traversal(node.right))  # 右子樹
    result.append(node.val)  # 訪問根節點
    
    return result`,
                cpp: `vector<int> postorderTraversal(TreeNode* root) {
    vector<int> result;
    if (root == nullptr) return result;
    
    // 左子樹
    vector<int> left = postorderTraversal(root->left);
    result.insert(result.end(), left.begin(), left.end());
    
    // 右子樹
    vector<int> right = postorderTraversal(root->right);
    result.insert(result.end(), right.begin(), right.end());
    
    result.push_back(root->val);  // 訪問根節點
    
    return result;
}`,
                pseudocode: `POSTORDER(節點):
1. IF 節點 為空 THEN 返回
2. POSTORDER(左子節點)
3. POSTORDER(右子節點)
4. 訪問節點`
            }
        };

        const currentCode = codeContents[this.currentTraversal];
        
        // 更新程式碼內容
        document.getElementById('dfs-python').textContent = currentCode.python;
        document.getElementById('dfs-cpp').textContent = currentCode.cpp;
        document.getElementById('dfs-pseudocode').textContent = currentCode.pseudocode;
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
    // 初始化樹遍歷 UI
    window.treeTraversalUI = new TreeTraversalUI();
    
    console.log('樹遍歷 DFS 演算法視覺化已初始化');
});