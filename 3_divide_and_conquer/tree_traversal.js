// ----- 樹的走訪方法 -----
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

let treeRoot = null;
let treeRunning = false;
let treePaused = false;
let treeAnimationSteps = [];
let currentTreeStep = 0;
let treeData = null; // 添加全局變量保存樹的資料

// 查找樹的最大深度
function findMaxDepth(node, currentDepth = 0) {
    if (!node) return currentDepth - 1;
    
    const leftDepth = findMaxDepth(node.left, currentDepth + 1);
    const rightDepth = findMaxDepth(node.right, currentDepth + 1);
    
    return Math.max(leftDepth, rightDepth);
}

function initTreeTraversal() {
    console.log('樹的走訪初始化開始');
    console.log('開始了樹的走訪初始化');
    const container = document.getElementById('tree-container');
    if (!container) {
        console.error('找不到樹容器元素');
        return;
    }
    const generateBtn = document.getElementById('tree-generate');
    const depthSelect = document.getElementById('tree-depth');
    const traversalSelect = document.getElementById('tree-traversal');
    const startBtn = document.getElementById('tree-start');
    const pauseBtn = document.getElementById('tree-pause');
    const resetBtn = document.getElementById('tree-reset');
    const speedSlider = document.getElementById('tree-speed');
    const structureView = document.getElementById('tree-structure');
    const statusText = document.getElementById('tree-status');
    
    // 設置自訂選擇器的事件處理
    const traversalButtons = document.querySelectorAll('#traversal-method-container .select-btn');
    const hiddenTraversalInput = document.getElementById('tree-traversal');
    
    traversalButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按鈕的選中狀態
            traversalButtons.forEach(b => b.classList.remove('selected'));
            
            // 選中當前按鈕
            this.classList.add('selected');
            
            // 設置隱藏輸入元素的值
            const value = this.getAttribute('data-value');
            hiddenTraversalInput.value = value;
            
            console.log('用戶選擇了新的走訪方法:', value);
        });
    });
    
    // 補免 物理初始化 職摘器
    if (hiddenTraversalInput && hiddenTraversalInput.value) {
        // 根據隱藏輸入元素的值選中對應的按鈕
        const currentValue = hiddenTraversalInput.value;
        const targetButton = document.querySelector(`.select-btn[data-value="${currentValue}"]`);
        if (targetButton) {
            traversalButtons.forEach(b => b.classList.remove('selected'));
            targetButton.classList.add('selected');
        }
    }
    
    // 離樹的裝獨立的走訪方法選擇器事件監聽器，除了初始化外再添加一次
    // 移除這個獨立的監聽器，因為我們已經在上面設置了
    
    // D3.js設置 - 取消預計算寬度和高度，改為在renderTree中動態計算
    let svg = null;
    
    generateBtn.addEventListener('click', generateTree);
    startBtn.addEventListener('click', startTreeTraversal);
    pauseBtn.addEventListener('click', pauseTreeTraversal);
    resetBtn.addEventListener('click', resetTreeTraversal);
    
    function generateTree() {
        console.log('開始生成樹');
        resetTreeTraversal();
        const depth = parseInt(depthSelect.value);
        console.log(`深度: ${depth}`);
        
        // 直接讀取選擇器的選擇值
        const traversalMethod = document.getElementById('tree-traversal');
        if (!traversalMethod) {
            console.error('找不到走訪方法選擇器');
        } else {
            console.log('當前選擇的走訪方法元素:', traversalMethod);
            console.log('選擇的走訪方法值:', traversalMethod.value);
            console.log('選擇器選中的選項:', traversalMethod.selectedIndex);
            
            // 如果沒有值，則設置預設值
            if (!traversalMethod.value || traversalMethod.value === '') {
                traversalMethod.value = 'preorder';
                console.log('設置預設走訪方法為前序走訪');
            }
            
            // 確保選擇器也已設定選項
            if (traversalMethod.selectedIndex === -1) {
                // 尚未選擇任何選項，將設置為前序走訪
                for (let i = 0; i < traversalMethod.options.length; i++) {
                    if (traversalMethod.options[i].value === 'preorder') {
                        traversalMethod.selectedIndex = i;
                        console.log('設置選擇器的選擇項為前序走訪');
                        break;
                    }
                }
            }
        }
        
        // 生成二叉樹
        treeRoot = generateBalancedTree(depth);
        console.log('樹的結構:', JSON.stringify(convertToD3Format(treeRoot)).substring(0, 100) + '...');
        
        // 繪製樹
        renderTree();
        
        startBtn.disabled = false;
        resetBtn.disabled = false;
        
        statusText.textContent = '樹已生成，點擊「開始走訪」按鈕開始遍歷';
        
        // 更新結構視圖
        structureView.textContent = `生成了深度為 ${depth} 的平衡二叉樹\n`;
        const currentMethod = hiddenTraversalInput.value || 'preorder';
        console.log('生成樹時讀取走訪方法:', currentMethod);
        
        // 直接使用選擇器的當前值
        let methodName;
        switch (currentMethod) {
            case 'preorder':
                methodName = '前序走訪 (Preorder)';
                break;
            case 'inorder':
                methodName = '中序走訪 (Inorder)';
                break;
            case 'postorder':
                methodName = '後序走訪 (Postorder)';
                break;
            default:
                methodName = '前序走訪 (Preorder)';
        }
        
        structureView.textContent += `選擇走訪方法: ${methodName}\n`;
    }
    
    function generateBalancedTree(depth) {
        console.log('生成深度為 ' + depth + ' 的平衡二叉樹');
        
        // 我們可以根據深度生成完全二叉樹，但比較貴在待解決方案中先使用固定物物
        if (depth === 3) {
            // 影片中顯示的樹結構
            const root = new TreeNode(4);
            root.left = new TreeNode(2);
            root.right = new TreeNode(6);
            root.left.left = new TreeNode(1);
            root.left.right = new TreeNode(3);
            root.right.left = new TreeNode(5);
            root.right.right = new TreeNode(7);
            
            console.log('生成了物物結構的樹');
            return root;
        }
        
        // 其他深度使用原来的方法
        const nodeCount = Math.pow(2, depth) - 1;
        return buildTreeNode(1, nodeCount);
    }
    
    function buildTreeNode(start, end) {
        if (start > end) return null;
        
        // 取中間節點作為根節點，保證樹的平衡
        const mid = Math.floor((start + end) / 2);
        const node = new TreeNode(mid);
        
        // 遞迴建立左右子樹
        node.left = buildTreeNode(start, mid - 1);
        node.right = buildTreeNode(mid + 1, end);
        
        return node;
    }
    
    function renderTree() {
        console.log('開始繪製樹');
        // 清空容器
        container.innerHTML = '';
        
        try {
            // 確保容器有足夠的大小
            container.style.height = '450px'; // 增加高度以避免最上方節點超出邊界
            container.style.width = '100%';
            console.log('容器尺寸:', container.clientWidth, container.clientHeight);
            
            // 重置上一次的 SVG 引用
            svg = null;
            
            // 重新計算寬度和高度確保標記正確
            const containerWidth = container.clientWidth || 800;
            const containerHeight = container.clientHeight || 400;
            const margin = { top: 40, right: 20, bottom: 20, left: 20 }; // 增加頂部margin
            const width = containerWidth - margin.left - margin.right;
            const height = containerHeight - margin.top - margin.bottom;
            
            // 創建新的svg元素
            svg = d3.select('#tree-container')
                .append('svg')
                .attr('width', containerWidth)
                .attr('height', containerHeight)
                .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            console.log('SVG 元素已創建:', svg ? '成功' : '失敗');
            
            if (!svg) {
                throw new Error('SVG 元素創建失敗');
            }

            // 重新定義樹的節點間距，讓不同深度的樹都能正確顯示
            const treeDepth = findMaxDepth(treeRoot);
            console.log('樹的深度:', treeDepth);
            
            // 根據樹的深度調整垂直間距
            const verticalSpacing = Math.min(height / (treeDepth + 2), 70); // 調整高度難於減少層間間距
            
            // 準備樹的布局 - 寬度使用容器寬度，高度根據樹的深度調整
            const treeLayout = d3.tree()
                .size([width - 40, Math.min((treeDepth + 1) * verticalSpacing, height - 60)]);
                
            console.log('樹布局設置:', width - 40, Math.min((treeDepth + 1) * verticalSpacing, height - 60));
            
            // 將樹數據轉換為d3.hierarchy
            const d3Data = convertToD3Format(treeRoot);
            console.log('轉換後d3格式的數據:', d3Data);
            const root = d3.hierarchy(d3Data);
            console.log('D3 hierarchy root:', root);
            
            // 計算每個節點的位置
            treeData = treeLayout(root); // 將區域變量改為全局變量資料
            console.log('生成樹數據完成:', treeData);
            console.log('節點列表:', treeData.descendants());
            
            // 新增: 設定節點半徑大小根據樹的大小自動調整
            const nodeRadius = Math.min(Math.max(15, 30 - treeDepth * 2), 25); // 設定最小半徑15，最大25
            console.log('節點半徑:', nodeRadius);
            
            // 首先創建一個容器元素用於連接線，確保連接線最先繪製
            const linksGroup = svg.append("g")
                .attr("class", "links-group");
                
            // 再創建一個容器元素用於節點，確保節點在連接線之上
            const nodesGroup = svg.append("g")
                .attr("class", "nodes-group");
            
            // 繪製連接線
            linksGroup.selectAll('.link')
                .data(treeData.links())
                .enter()
                .append('path')
                .attr('class', 'tree-link')
                .attr('stroke-width', '2px')
                .attr('stroke', '#999')
                .attr('fill', 'none')
                .attr('d', d => `M${d.source.x},${d.source.y}C${d.source.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${d.target.y}`);
            
            // 繪製節點
            const nodes = nodesGroup.selectAll('.node')
                .data(treeData.descendants())
                .enter()
                .append('g')
                .attr('class', 'tree-node')
                .attr('id', d => `node-group-${d.data.value}`)
                .attr('transform', d => `translate(${d.x},${d.y})`);
            
            // 添加節點圓圈
            const nodeCircles = nodes.append('circle')
                .attr('r', nodeRadius)
                .attr('id', d => `node-${d.data.value}`)
                .attr('value', d => d.data.value) // 用來儲存節點值
                .attr('fill', 'white')
                .attr('stroke', '#3498db')
                .attr('stroke-width', '1.5px')
                .classed('tree-node-default', true); // 添加預設類別
                
            // 確保使用更直接的方法設置內聯樣式
            nodeCircles.each(function() {
                const node = d3.select(this).node();
                if (node) {
                    node.style.fill = 'white';
                    node.style.stroke = '#3498db';
                    node.style.strokeWidth = '1.5px';
                }
            });
                
            // 測試打印所有節點的ID
            console.log('所有節點 ID:');
            treeData.descendants().forEach(node => {
                console.log(`node-${node.data.value}`);
            });
            
            // 添加節點文本
            nodes.append('text')
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(d => d.data.value);
                
            // 為每個節點添加title元素，在懸停時顯示信息，幫助調試
            nodeCircles.append('title')
                .text(d => `節點: ${d.data.value}`);
                
            console.log('樹的視覺化繪製完成');
            
            // 更新狀態文本
            statusText.textContent = '樹已生成，點擊「開始走訪」按鈕開始遍歷';
        } catch (error) {
            console.error('繪製樹時發生錯誤:', error);
            statusText.textContent = '繪製樹失敗，請查看控制台了解詳情';
        }
    }
    
    function convertToD3Format(node) {
        if (!node) return null;
        
        return {
            value: node.value,
            children: [
                node.left ? convertToD3Format(node.left) : null,
                node.right ? convertToD3Format(node.right) : null
            ].filter(Boolean) // 過濾掉null值
        };
    }
    
    function getTraversalMethodName() {
        // 先從選擇器中獲取值
        let method = '';
        if (traversalSelect) {
            method = traversalSelect.value;
            console.log(`從選擇器取得的方法: "${method}"`);
        }
        
        // 如果無法取得值，則使用預設值
        if (!method || method === '') {
            method = 'preorder';
            console.log(`使用預設方法: "${method}"`);
            // 嘗試設置選擇器的值
            if (traversalSelect) {
                traversalSelect.value = method;
                console.log(`已重新設置選擇器值為: "${method}"`);
            }
        }
        
        // 轉換為顯示文字
        switch (method) {
            case 'preorder':
                return '前序走訪 (Preorder)';
            case 'inorder':
                return '中序走訪 (Inorder)';
            case 'postorder':
                return '後序走訪 (Postorder)';
            default:
                console.log(`未知的方法: "${method}"，使用前序走訪`);
                return '前序走訪 (Preorder)';
        }
    }
    
    async function startTreeTraversal() {
        console.log('開始走訪函數被調用');
        try {
            if (treeRunning && treePaused) {
                treePaused = false;
                continueTreeAnimation();
                return;
            }
            
            if (treeRunning) return;
            
            if (!treeRoot) {
                console.error('樹的根節點為null，請先生成樹');
                statusText.textContent = '請先點擊「生成樹」按鈕';
                return;
            }
            
            if (!treeData) {
                console.error('treeData 未定義，無法進行走訪');
                statusText.textContent = '樹的數據未準備好，請重新生成樹';
                return;
            }
            
            // 測試打印 SVG 中的節點元素
            console.log('測試 SVG 中的節點:');
            if (svg) {
                const nodeElements = svg.selectAll('circle').nodes();
                console.log(`找到 ${nodeElements.length} 個節點元素`);
                nodeElements.forEach(node => {
                    console.log('Node ID:', node.id, 'Node:', node);
                });
            } else {
                console.error('SVG 不存在');
            }
            
            treeRunning = true;
            treePaused = false;
            disableButtons('tree', true);
            
            // 重置節點顏色
            resetNodeColors();
            
            // 檢查重置後節點的顏色狀態
            console.log('檢查重置後節點的顏色狀態:');
            if (svg) {
                const sampleNode = svg.select('circle').node();
                if (sampleNode) {
                    console.log('節點屬性:', {
                        fillAttribute: sampleNode.getAttribute('fill'),
                        fillStyle: sampleNode.style.fill,
                        computedFill: window.getComputedStyle(sampleNode).fill
                    });
                }
            }
            
            // 準備動畫步驟
            treeAnimationSteps = [];
            currentTreeStep = 0;
            
            // 直接讀取隱藏輸入的值
            const traversalValue = hiddenTraversalInput.value || 'preorder';
            console.log('走訪函數使用的方法值:', traversalValue);
            
            // 使用隱藏輸入的值
            const methodToUse = traversalValue;
            
            // 取得方法名稱
            let methodName;
            switch (methodToUse) {
                case 'preorder':
                    methodName = '前序走訪 (Preorder)';
                    break;
                case 'inorder':
                    methodName = '中序走訪 (Inorder)';
                    break;
                case 'postorder':
                    methodName = '後序走訪 (Postorder)';
                    break;
                default:
                    methodName = '前序走訪 (Preorder)';
            }
            
            console.log(`最終使用的走訪方法: ${methodToUse}, 名稱: ${methodName}`);
            
            statusText.textContent = `正在執行${methodName}...`;
            structureView.textContent = `開始進行${methodName}\n`;
        
            // 根據選擇的方法生成走訪步驟
            let traversalResult = [];
            
            switch (methodToUse) {
                case 'preorder':
                    generatePreorderSteps(treeRoot, traversalResult);
                    break;
                case 'inorder':
                    generateInorderSteps(treeRoot, traversalResult);
                    break;
                case 'postorder':
                    generatePostorderSteps(treeRoot, traversalResult);
                    break;
                default:
                    // 預設使用前序走訪
                    console.log('未知的走訪方法，預設使用前序走訪');
                    generatePreorderSteps(treeRoot, traversalResult);
                    break;
            }
        
            if (treeAnimationSteps.length === 0) {
                console.error('生成的動畫步驟為空');
                statusText.textContent = '生成的動畫步驟為空，請重試';
                treeRunning = false;
                disableButtons('tree', false);
                return;
            }
            
            // 添加完成步驟
            treeAnimationSteps.push({
                type: 'complete',
                result: traversalResult,
                message: `${methodName}完成！結果：[${traversalResult.join(', ')}]`
            });
            
            console.log(`生成了 ${treeAnimationSteps.length} 個動畫步驟`);
            
            // 開始動畫
            await playTreeAnimation();
        } catch (error) {
            console.error('走訪過程中發生錯誤:', error);
            statusText.textContent = '走訪過程中發生錯誤，請查看控制台';
            treeRunning = false;
            disableButtons('tree', false);
        }
    }
    
    function generatePreorderSteps(node, result) {
        if (!node) return;
        
        // 前序：根 -> 左 -> 右
        treeAnimationSteps.push({
            type: 'visitNode',
            node: node,
            message: `訪問節點 ${node.value}`,
            currentPath: [...result]
        });
        
        result.push(node.value);
        
        treeAnimationSteps.push({
            type: 'addToResult',
            node: node,
            message: `將節點 ${node.value} 添加到結果`,
            currentPath: [...result]
        });
        
        if (node.left) {
            treeAnimationSteps.push({
                type: 'moveToLeft',
                node: node,
                message: `從節點 ${node.value} 移動到左子節點 ${node.left.value}`,
                currentPath: [...result]
            });
            
            generatePreorderSteps(node.left, result);
            
            treeAnimationSteps.push({
                type: 'returnFromLeft',
                node: node,
                message: `從左子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noLeftChild',
                node: node,
                message: `節點 ${node.value} 沒有左子節點`,
                currentPath: [...result]
            });
        }
        
        if (node.right) {
            treeAnimationSteps.push({
                type: 'moveToRight',
                node: node,
                message: `從節點 ${node.value} 移動到右子節點 ${node.right.value}`,
                currentPath: [...result]
            });
            
            generatePreorderSteps(node.right, result);
            
            treeAnimationSteps.push({
                type: 'returnFromRight',
                node: node,
                message: `從右子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noRightChild',
                node: node,
                message: `節點 ${node.value} 沒有右子節點`,
                currentPath: [...result]
            });
        }
    }
    
    function generateInorderSteps(node, result) {
        if (!node) return;
        
        // 中序：左 -> 根 -> 右
        if (node.left) {
            treeAnimationSteps.push({
                type: 'moveToLeft',
                node: node,
                message: `從節點 ${node.value} 移動到左子節點 ${node.left.value}`,
                currentPath: [...result]
            });
            
            generateInorderSteps(node.left, result);
            
            treeAnimationSteps.push({
                type: 'returnFromLeft',
                node: node,
                message: `從左子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noLeftChild',
                node: node,
                message: `節點 ${node.value} 沒有左子節點`,
                currentPath: [...result]
            });
        }
        
        treeAnimationSteps.push({
            type: 'visitNode',
            node: node,
            message: `訪問節點 ${node.value}`,
            currentPath: [...result]
        });
        
        result.push(node.value);
        
        treeAnimationSteps.push({
            type: 'addToResult',
            node: node,
            message: `將節點 ${node.value} 添加到結果`,
            currentPath: [...result]
        });
        
        if (node.right) {
            treeAnimationSteps.push({
                type: 'moveToRight',
                node: node,
                message: `從節點 ${node.value} 移動到右子節點 ${node.right.value}`,
                currentPath: [...result]
            });
            
            generateInorderSteps(node.right, result);
            
            treeAnimationSteps.push({
                type: 'returnFromRight',
                node: node,
                message: `從右子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noRightChild',
                node: node,
                message: `節點 ${node.value} 沒有右子節點`,
                currentPath: [...result]
            });
        }
    }
    
    function generatePostorderSteps(node, result) {
        if (!node) return;
        
        // 後序：左 -> 右 -> 根
        if (node.left) {
            treeAnimationSteps.push({
                type: 'moveToLeft',
                node: node,
                message: `從節點 ${node.value} 移動到左子節點 ${node.left.value}`,
                currentPath: [...result]
            });
            
            generatePostorderSteps(node.left, result);
            
            treeAnimationSteps.push({
                type: 'returnFromLeft',
                node: node,
                message: `從左子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noLeftChild',
                node: node,
                message: `節點 ${node.value} 沒有左子節點`,
                currentPath: [...result]
            });
        }
        
        if (node.right) {
            treeAnimationSteps.push({
                type: 'moveToRight',
                node: node,
                message: `從節點 ${node.value} 移動到右子節點 ${node.right.value}`,
                currentPath: [...result]
            });
            
            generatePostorderSteps(node.right, result);
            
            treeAnimationSteps.push({
                type: 'returnFromRight',
                node: node,
                message: `從右子樹返回到節點 ${node.value}`,
                currentPath: [...result]
            });
        } else {
            treeAnimationSteps.push({
                type: 'noRightChild',
                node: node,
                message: `節點 ${node.value} 沒有右子節點`,
                currentPath: [...result]
            });
        }
        
        treeAnimationSteps.push({
            type: 'visitNode',
            node: node,
            message: `訪問節點 ${node.value}`,
            currentPath: [...result]
        });
        
        result.push(node.value);
        
        treeAnimationSteps.push({
            type: 'addToResult',
            node: node,
            message: `將節點 ${node.value} 添加到結果`,
            currentPath: [...result]
        });
    }
    
    async function playTreeAnimation() {
        console.log(`播放動畫步驟: ${currentTreeStep}/${treeAnimationSteps.length}`);
        try {
            if (currentTreeStep >= treeAnimationSteps.length) {
                treeRunning = false;
                disableButtons('tree', false);
                return;
            }
            
            if (treePaused) {
                return;
            }
            
            // 確保 SVG 存在
            if (!svg) {
                console.error('SVG 不存在，無法繼續動畫');
                statusText.textContent = 'SVG 不存在，請先生成樹';
                treeRunning = false;
                disableButtons('tree', false);
                return;
            }
        
            // 進入每一個新的步驟，先將所有節點設置為還沒進到的狀態
            if (currentTreeStep === 0) {
                // 如果是第一個步驟，先預設所有節點的狀態
                if (treeData) {
                    console.log('預設所有節點的狀態');
                    const allNodes = treeData.descendants();
                    console.log('節點數量:', allNodes.length);
                    allNodes.forEach(node => {
                        const nodeId = node.data.value;
                        console.log('設置節點為尚未訪問:', nodeId);
                        highlightNode(nodeId, 'pending');
                    });
                } else {
                    console.error('treeData 未定義，無法預設節點狀態');
                }
            }
            
            const speed = 101 - speedSlider.value;
            const step = treeAnimationSteps[currentTreeStep];
            
            // 更新狀態文本
            if (step.message) {
                statusText.textContent = step.message;
            }
            
            // 執行動畫步驟 - 確保在每個步驟後等待足夠的時間
            switch (step.type) {
                case 'visitNode':
                    highlightNode(step.node.value, 'comparing');
                    structureView.textContent += `\n${step.message}`;
                    
                    // 顯示當前路徑
                    if (step.currentPath && step.currentPath.length > 0) {
                        structureView.textContent += `\n當前結果: [${step.currentPath.join(', ')}]`;
                    }
                    
                    // 添加更長的等待時間
                    await sleep(speed * 50);
                    break;
                    
                case 'addToResult':
                    // 將節點標記為已加入結果
                    highlightNode(step.node.value, 'sorted');
                    
                    // 顯示當前路徑
                    if (step.currentPath && step.currentPath.length > 0) {
                        structureView.textContent += `\n當前結果: [${step.currentPath.join(', ')}]`;
                    }
                    
                    // 添加更長的等待時間
                    await sleep(speed * 50);
                    break;
                    
                case 'moveToLeft':
                case 'moveToRight':
                    // 當前訪問的節點標記為已訪問
                    highlightNode(step.node.value, 'visited');
                    structureView.textContent += `\n${step.message}`;
                    await sleep(speed * 30);
                    break;
                    
                case 'returnFromLeft':
                case 'returnFromRight':
                    // 從子樹回來的節點標記為回溯
                    highlightNode(step.node.value, 'returning');
                    structureView.textContent += `\n${step.message}`;
                    await sleep(speed * 30);
                    break;
                    
                case 'noLeftChild':
                case 'noRightChild':
                    structureView.textContent += `\n${step.message}`;
                    await sleep(speed * 20);
                    break;
                    
                case 'complete':
                    // 完成時，將所有結果中的節點標記為綠色
                    step.result.forEach(value => {
                        highlightNode(value, 'sorted');
                    });
                    
                    statusText.textContent = step.message;
                    structureView.textContent += `\n\n走訪完成！結果: [${step.result.join(', ')}]`;
                    break;
            }
        
        // 滾動到視圖底部
        structureView.scrollTop = structureView.scrollHeight;
        
        // 移動到下一步
        currentTreeStep++;
        
        // 暫停一段時間
        await sleep(speed * 50);
        
        // 強制重繪，確保頁面更新
        window.requestAnimationFrame(() => {
            // 繼續動畫
            playTreeAnimation();
        });
        } catch (error) {
            console.error('播放動畫時發生錯誤:', error);
            statusText.textContent = '播放動畫時發生錯誤，請查看控制台';
            treeRunning = false;
            disableButtons('tree', false);
        }
    }
    
    function resetNodeColors() {
        // 確保只在 svg 存在時才嘗試重置節點顏色
        if (svg) {
            console.log('開始重置所有節點顏色');
            
            // 1. 使用D3選擇器找到所有節點
            const circles = svg.selectAll('circle');
            
            // 2. 移除所有狀態類別
            circles.classed('tree-node-pending', false)
                .classed('tree-node-comparing', false)
                .classed('tree-node-visited', false)
                .classed('tree-node-sorted', false)
                .classed('tree-node-returning', false)
                .classed('tree-node-default', true);
            
            // 3. 使用D3 style方法重置樣式
            circles.style('fill', 'white')
                .style('stroke', '#3498db')
                .style('stroke-width', '1.5px');
                
            // 4. 使用DOM API直接設置屬性
            circles.nodes().forEach(node => {
                // 設置SVG屬性
                node.setAttribute('fill', 'white');
                node.setAttribute('stroke', '#3498db');
                node.setAttribute('stroke-width', '1.5px');
                
                // 設置內聯樣式
                node.style.fill = 'white';
                node.style.stroke = '#3498db';
                node.style.strokeWidth = '1.5px';
            });
            
            console.log('完成重置所有節點顏色');
        }
    }
    
    function highlightNode(value, type) {
        if (!svg) {
            console.error('SVG 不存在，無法高亮節點');
            return;
        }
        
        console.log(`高亮節點: ${value}, 類型: ${type}`);
        
        // 特定節點條件下不移除之前的高亮，以便顯示步驟追蹤
        if (type === 'reset') {
            // 當要重置所有節點時，調用resetNodeColors函數來確保使用所有可用的方法
            resetNodeColors();
            return;
        }

        // 如果value為null，我們不需要高亮特定節點
        if (value === null) return;
        
        // 找到當前節點
        // 首先嘗試直接ID選擇器，這是最可靠的方式
        const nodeById = svg.select(`#node-${value}`);
        
        if (!nodeById.empty()) {
            console.log(`通過 ID 選擇器找到節點: #node-${value}`);
            applyStyle(nodeById, type);
            return;
        }

        // 如果ID選擇器失敗，則嘗試屬性選擇器
        const nodeByValue = svg.select(`circle[value="${value}"]`);
        
        if (!nodeByValue.empty()) {
            console.log(`通過 value 屬性選擇器找到節點`);
            applyStyle(nodeByValue, type);
            return;
        }

        // 最後嘗試查找包含指定值的文本節點的父元素
        const allNodes = svg.selectAll('circle').nodes();
        for (const node of allNodes) {
            const parent = d3.select(node.parentNode);
            const text = parent.select('text');
            if (text.text() === String(value)) {
                console.log(`通過文本內容找到節點: ${value}`);
                applyStyle(d3.select(node), type);
                return;
            }
        }
        
        console.error(`無法找到節點: 值=${value}`);
    }
    
    // 執行樣式設置，從 highlightNode 提取出來的函數
    function applyStyle(node, type) {
        // 使用多種方法確保顏色套用
        try {
            // 確保節點存在且是有效的D3選擇器
            if (node && !node.empty()) {
                // 準備顏色設置
                let fillColor, strokeColor, strokeWidth;
                
                switch (type) {
                    case 'comparing':
                        fillColor = '#f39c12';
                        strokeColor = '#e67e22';
                        strokeWidth = '3px';
                        break;
                    case 'visited':
                        fillColor = '#3498db';
                        strokeColor = '#2980b9';
                        strokeWidth = '2px';
                        break;
                    case 'sorted':
                        fillColor = '#2ecc71';
                        strokeColor = '#27ae60';
                        strokeWidth = '2px';
                        break;
                    case 'pending':
                        fillColor = '#ecf0f1';
                        strokeColor = '#bdc3c7';
                        strokeWidth = '1.5px';
                        break;
                    case 'returning':
                        fillColor = '#9b59b6';
                        strokeColor = '#8e44ad';
                        strokeWidth = '2px';
                        break;
                    default:
                        fillColor = 'white';
                        strokeColor = '#3498db';
                        strokeWidth = '1.5px';
                }
                
                // 1. 先移除所有類別
                node.classed('tree-node-pending', false)
                    .classed('tree-node-comparing', false)
                    .classed('tree-node-visited', false)
                    .classed('tree-node-sorted', false)
                    .classed('tree-node-returning', false)
                    .classed('tree-node-default', false);
                
                // 2. 根據狀態加上適當的類別
                node.classed(`tree-node-${type}`, true);
                
                // 3. 使用D3的style方法設置樣式
                node.style('fill', fillColor)
                    .style('stroke', strokeColor)
                    .style('stroke-width', strokeWidth);
                
                // 4. 直接設置 DOM 元素的屬性（最直接的方法）
                const domNode = node.node();
                if (domNode) {
                    try {
                        // 直接設置 DOM 節點的顏色屬性
                        domNode.setAttribute('fill', fillColor);
                        domNode.setAttribute('stroke', strokeColor);
                        domNode.setAttribute('stroke-width', strokeWidth);
                        
                        // 另外使用內聯樣式作為備選
                        domNode.style.fill = fillColor;
                        domNode.style.stroke = strokeColor;
                        domNode.style.strokeWidth = strokeWidth;
                        
                        // 最直接的方法：使用 cssText 直接設置多個樣式
                        const cssStyles = `fill: ${fillColor}; stroke: ${strokeColor}; stroke-width: ${strokeWidth};`;
                        domNode.style.cssText += cssStyles;
                        
                        console.log('已應用DOM元素的直接樣式:', cssStyles);
                    } catch (err) {
                        console.error('設置DOMNode屬性時發生錯誤:', err);
                    }
                }
                
                console.log("成功應用樣式：", {
                    type: type,
                    node: node.node(),
                    fill: fillColor,
                    stroke: strokeColor
                });
            } else {
                console.error("無法應用樣式：節點選擇器為空");
            }
        } catch (error) {
            console.error("應用樣式時發生錯誤:", error);
        }
    }
    
    function continueTreeAnimation() {
        disableButtons('tree', true);
        playTreeAnimation();
    }
    
    function pauseTreeTraversal() {
        treePaused = true;
        disableButtons('tree', false);
    }
    
    function resetTreeTraversal() {
        if (treeRunning) {
            treePaused = true;
            treeRunning = false;
        }
        
        currentTreeStep = 0;
        treeAnimationSteps = [];
        
        // 重置節點顏色 - 只在 svg 存在時進行
        resetNodeColors();
        
        structureView.textContent = '';
        statusText.textContent = '請點擊「生成樹」按鈕開始';
        
        disableButtons('tree', false, true);
        document.getElementById('tree-start').disabled = true;
        document.getElementById('tree-reset').disabled = true;
    }
}

// 確保D3.js已載入後再初始化
function initTreeVisualization() {
    console.log('樹的視覺化初始化');
// 確保D3.js已載入後再初始化
    try {
        initTreeTraversal();
        console.log('樹的走訪初始化完成，檢查走訪方法選擇器:');
        const traversalSelect = document.getElementById('tree-traversal');
        if (traversalSelect) {
            // 如果選擇器沒有選定值，則設置為預設值
            if (!traversalSelect.value || traversalSelect.value === '') {
                traversalSelect.value = 'preorder';
                console.log('初始化完成後設置預設走訪方法為前序走訪');
            }
            console.log(`当前選定的走訪方法: ${traversalSelect.value}`);
        } else {
            console.error('找不到走訪方法選擇器元素');
        }
    } catch (error) {
        console.error('初始化樹的走訪時發生錯誤:', error);
    }
}

// 頁面加載時初始化樹的走訪
// 頁面加載時初始化樹的走訪
document.addEventListener('DOMContentLoaded', function() {
    // 先初始化視覺化
    initTreeVisualization();
});