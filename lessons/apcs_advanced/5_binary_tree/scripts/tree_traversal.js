// 樹走訪動畫 JavaScript - 修正版

class TreeNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = x;
        this.y = y;
    }
}

class TreeTraversalVisualizer {
    constructor() {
        this.svg = document.getElementById('traversalTreeSvg');
        this.nodesGroup = document.getElementById('traversalNodes');
        this.linksGroup = document.getElementById('traversalLinks');
        
        this.tree = this.createSampleTree();
        this.currentMethod = 'preorder';
        this.traversalSteps = [];
        this.currentStep = -1;
        this.isTraversing = false;
        
        // 維護全局的已訪問節點列表
        this.globalVisited = [];
        
        this.results = {
            preorder: [],
            inorder: [],
            postorder: []
        };
        
        this.render();
        this.generateAllResults();
    }

    createSampleTree() {
        // 建立範例樹: A(B(D,E), C(null,F))
        const root = new TreeNode('A', 400, 80);
        
        root.left = new TreeNode('B', 250, 200);
        root.right = new TreeNode('C', 550, 200);
        
        root.left.left = new TreeNode('D', 150, 320);
        root.left.right = new TreeNode('E', 350, 320);
        root.right.left = null; // C 沒有左子節點
        root.right.right = new TreeNode('F', 650, 320);
        
        return root;
    }

    render() {
        this.renderLinks();
        this.renderNodes();
    }

    renderLinks() {
        this.linksGroup.innerHTML = '';
        
        const links = [
            {from: this.tree, to: this.tree.left},
            {from: this.tree, to: this.tree.right},
            {from: this.tree.left, to: this.tree.left.left},
            {from: this.tree.left, to: this.tree.left.right},
            // 留意 C 沒有左子節點，只有右子節點
            {from: this.tree.right, to: this.tree.right.right}
        ];

        links.forEach(({from, to}) => {
            if (from && to) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'traversal-link');
                line.setAttribute('x1', from.x);
                line.setAttribute('y1', from.y);
                line.setAttribute('x2', to.x);
                line.setAttribute('y2', to.y);
                line.setAttribute('data-from', from.value);
                line.setAttribute('data-to', to.value);
                this.linksGroup.appendChild(line);
            }
        });
    }

    renderNodes() {
        this.nodesGroup.innerHTML = '';
        
        const nodes = [
            this.tree,
            this.tree.left, this.tree.right,
            this.tree.left.left, this.tree.left.right,
            this.tree.right.right  // 只有 F 節點，C 沒有左子節點
        ];

        nodes.forEach(node => {
            if (node) {
                const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                group.setAttribute('class', 'traversal-node');
                group.setAttribute('data-value', node.value);
                
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', node.x);
                circle.setAttribute('cy', node.y);
                circle.setAttribute('r', 25);
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', node.x);
                text.setAttribute('y', node.y);
                text.textContent = node.value;
                
                group.appendChild(circle);
                group.appendChild(text);
                this.nodesGroup.appendChild(group);
            }
        });
    }

    generateAllResults() {
        // 生成所有走訪方式的結果
        this.results.preorder = this.preorderTraversal(this.tree);
        this.results.inorder = this.inorderTraversal(this.tree);
        this.results.postorder = this.postorderTraversal(this.tree);
    }

    preorderTraversal(node) {
        if (!node) return [];
        const result = [];
        
        function traverse(node) {
            if (!node) return;
            result.push(node.value);  // 訪問根
            traverse(node.left);      // 遞迴左子樹
            traverse(node.right);     // 遞迴右子樹
        }
        
        traverse(node);
        return result;
    }

    inorderTraversal(node) {
        if (!node) return [];
        const result = [];
        
        function traverse(node) {
            if (!node) return;
            traverse(node.left);      // 遞迴左子樹
            result.push(node.value);  // 訪問根
            traverse(node.right);     // 遞迴右子樹
        }
        
        traverse(node);
        return result;
    }

    postorderTraversal(node) {
        if (!node) return [];
        const result = [];
        
        function traverse(node) {
            if (!node) return;
            traverse(node.left);      // 遞迴左子樹
            traverse(node.right);     // 遞迴右子樹
            result.push(node.value);  // 訪問根
        }
        
        traverse(node);
        return result;
    }

    generateTraversalSteps(method) {
        this.traversalSteps = [];
        this.globalVisited = []; // 重置全局已訪問列表
        
        switch (method) {
            case 'preorder':
                this.generatePreorderSteps(this.tree);
                break;
            case 'inorder':
                this.generateInorderSteps(this.tree);
                break;
            case 'postorder':
                this.generatePostorderSteps(this.tree);
                break;
        }
    }

    generatePreorderSteps(node) {
        if (!node) return;
        
        // 1. 訪問當前節點
        this.globalVisited.push(node.value); // 加入全局已訪問列表
        this.traversalSteps.push({
            action: 'visit',
            node: node.value,
            description: `訪問根節點 ${node.value}`,
            visited: [...this.globalVisited] // 複製當前已訪問列表
        });
        
        // 2. 遞迴左子樹
        if (node.left) {
            this.traversalSteps.push({
                action: 'move',
                node: node.left.value,
                description: `移動到左子樹 ${node.left.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generatePreorderSteps(node.left);
        }
        
        // 3. 遞迴右子樹
        if (node.right) {
            this.traversalSteps.push({
                action: 'move',
                node: node.right.value,
                description: `移動到右子樹 ${node.right.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generatePreorderSteps(node.right);
        }
    }

    generateInorderSteps(node) {
        if (!node) return;
        
        // 1. 先遞迴左子樹
        if (node.left) {
            this.traversalSteps.push({
                action: 'move',
                node: node.left.value,
                description: `移動到左子樹 ${node.left.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generateInorderSteps(node.left);
        }
        
        // 2. 訪問當前節點
        this.globalVisited.push(node.value); // 加入全局已訪問列表
        this.traversalSteps.push({
            action: 'visit',
            node: node.value,
            description: `訪問根節點 ${node.value}`,
            visited: [...this.globalVisited] // 複製當前已訪問列表
        });
        
        // 3. 再遞迴右子樹
        if (node.right) {
            this.traversalSteps.push({
                action: 'move',
                node: node.right.value,
                description: `移動到右子樹 ${node.right.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generateInorderSteps(node.right);
        }
    }

    generatePostorderSteps(node) {
        if (!node) return;
        
        // 1. 先遞迴左子樹
        if (node.left) {
            this.traversalSteps.push({
                action: 'move',
                node: node.left.value,
                description: `移動到左子樹 ${node.left.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generatePostorderSteps(node.left);
        }
        
        // 2. 再遞迴右子樹
        if (node.right) {
            this.traversalSteps.push({
                action: 'move',
                node: node.right.value,
                description: `移動到右子樹 ${node.right.value}`,
                visited: [...this.globalVisited] // 複製當前已訪問列表
            });
            this.generatePostorderSteps(node.right);
        }
        
        // 3. 最後訪問當前節點
        this.globalVisited.push(node.value); // 加入全局已訪問列表
        this.traversalSteps.push({
            action: 'visit',
            node: node.value,
            description: `訪問根節點 ${node.value}`,
            visited: [...this.globalVisited] // 複製當前已訪問列表
        });
    }

    updateDisplay() {
        // 清除所有狀態
        const allNodes = this.svg.querySelectorAll('.traversal-node');
        allNodes.forEach(node => {
            node.classList.remove('current', 'visited', 'next');
        });

        const allLinks = this.svg.querySelectorAll('.traversal-link');
        allLinks.forEach(link => {
            link.classList.remove('active');
        });

        if (this.currentStep >= 0 && this.currentStep < this.traversalSteps.length) {
            const step = this.traversalSteps[this.currentStep];
            
            // 高亮當前節點
            const currentNode = this.svg.querySelector(`[data-value=\"${step.node}\"]`);
            if (currentNode) {
                if (step.action === 'visit') {
                    currentNode.classList.add('current');
                } else {
                    currentNode.classList.add('next');
                }
            }

            // 高亮已訪問的節點（變成灰色）
            step.visited.forEach(value => {
                const visitedNode = this.svg.querySelector(`[data-value=\"${value}\"]`);
                if (visitedNode && value !== step.node) {
                    visitedNode.classList.add('visited');
                }
            });

            // 更新步驟資訊
            document.getElementById('currentStepText').textContent = step.description;
            document.getElementById('stepCounter').textContent = `${this.currentStep + 1} / ${this.traversalSteps.length}`;

            // 更新結果顯示 - 只顯示已被訪問的節點
            this.updateResultDisplay(step.visited, step.action === 'visit' ? step.node : null);
        }
    }

    updateResultDisplay(visited, currentVisitNode) {
        const resultContainer = document.getElementById(`${this.currentMethod}Result`);
        
        if (visited.length === 0) {
            resultContainer.innerHTML = '<div class=\"sequence-placeholder\">走訪進行中...</div>';
            return;
        }

        const items = visited.map((value, index) => {
            // 如果是當前正在訪問的節點，則高亮顯示
            const isCurrentVisit = (value === currentVisitNode);
            const itemClass = isCurrentVisit ? 'sequence-item current' : 'sequence-item';
            const arrow = index < visited.length - 1 ? '<span class=\"sequence-arrow\">→</span>' : '';
            return `<span class=\"${itemClass}\">${value}</span>${arrow}`;
        }).join('');

        resultContainer.innerHTML = items;
    }

    resetDisplay() {
        // 清除所有狀態
        const allNodes = this.svg.querySelectorAll('.traversal-node');
        allNodes.forEach(node => {
            node.classList.remove('current', 'visited', 'next');
        });

        const allLinks = this.svg.querySelectorAll('.traversal-link');
        allLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 重置結果顯示
        const resultContainer = document.getElementById(`${this.currentMethod}Result`);
        resultContainer.innerHTML = '<div class=\"sequence-placeholder\">點擊「開始走訪」開始演示</div>';

        // 重置步驟資訊
        document.getElementById('currentStepText').textContent = '點擊「開始走訪」開始演示';
        document.getElementById('stepCounter').textContent = '0 / 0';
    }
}

// 全局變數和函數
let traversalVisualizer;

function selectTraversalMethod(method) {
    // 更新按鈕狀態
    const buttons = document.querySelectorAll('.method-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-method=\"${method}\"]`).classList.add('active');
    
    // 更新當前方法
    traversalVisualizer.currentMethod = method;
    
    // 重置顯示
    resetTraversal();
}

function startTraversal() {
    const startBtn = document.getElementById('startBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // 生成步驟
    traversalVisualizer.generateTraversalSteps(traversalVisualizer.currentMethod);
    traversalVisualizer.currentStep = -1;
    traversalVisualizer.isTraversing = true;
    
    // 更新按鈕狀態
    startBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = false;
    
    // 顯示完整結果
    displayCompleteResult(traversalVisualizer.currentMethod);
}

function nextStep() {
    if (traversalVisualizer.currentStep < traversalVisualizer.traversalSteps.length - 1) {
        traversalVisualizer.currentStep++;
        traversalVisualizer.updateDisplay();
        
        // 更新按鈕狀態
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = false;
        
        if (traversalVisualizer.currentStep >= traversalVisualizer.traversalSteps.length - 1) {
            nextBtn.disabled = true;
        }
    }
}

function previousStep() {
    if (traversalVisualizer.currentStep > 0) {
        traversalVisualizer.currentStep--;
        traversalVisualizer.updateDisplay();
        
        // 更新按鈕狀態
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        nextBtn.disabled = false;
        
        if (traversalVisualizer.currentStep <= 0) {
            prevBtn.disabled = true;
        }
    }
}

function resetTraversal() {
    traversalVisualizer.currentStep = -1;
    traversalVisualizer.isTraversing = false;
    traversalVisualizer.traversalSteps = [];
    traversalVisualizer.globalVisited = []; // 重置全局已訪問列表
    
    // 重置按鈕狀態
    const startBtn = document.getElementById('startBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    startBtn.disabled = false;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    
    // 重置顯示
    traversalVisualizer.resetDisplay();
}

function displayCompleteResult(method) {
    const result = traversalVisualizer.results[method];
    const resultContainer = document.getElementById(`${method}Result`);
    
    const items = result.map((value, index) => {
        const arrow = index < result.length - 1 ? '<span class=\"sequence-arrow\">→</span>' : '';
        return `<span class=\"sequence-item\">${value}</span>${arrow}`;
    }).join('');
    
    resultContainer.innerHTML = items;
}

function showAnswer() {
    document.getElementById('quizAnswer').style.display = 'block';
}

function hideAnswer() {
    document.getElementById('quizAnswer').style.display = 'none';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    traversalVisualizer = new TreeTraversalVisualizer();
    
    // 顯示所有完整結果
    displayCompleteResult('preorder');
    displayCompleteResult('inorder');
    displayCompleteResult('postorder');
});