// 合併排序樹狀結構渲染器
class MergeSortTreeRenderer {
    constructor() {
        this.container = document.getElementById('merge-sort-tree');
    }

    // 渲染指定步驟的樹狀結構
    renderStep(stepData) {
        this.container.innerHTML = '';
        
        const tree = stepData.tree;
        const levels = ['level0', 'level1', 'level2', 'level3'];
        
        // 渲染每個層級
        levels.forEach((levelKey, levelIndex) => {
            if (tree[levelKey] && tree[levelKey].length > 0) {
                const levelElement = this.createLevel(tree[levelKey], levelIndex, levelKey);
                this.container.appendChild(levelElement);
            }
        });
    }

    // 創建層級元素
    createLevel(levelData, levelIndex, levelKey) {
        const levelDiv = document.createElement('div');
        levelDiv.className = `tree-level ${levelKey}`;
        
        // 過濾掉空的陣列節點
        const validNodes = levelData.filter(node => node.array.length > 0);
        
        validNodes.forEach(nodeData => {
            const nodeElement = this.createNode(nodeData);
            levelDiv.appendChild(nodeElement);
        });
        
        return levelDiv;
    }

    // 創建節點元素
    createNode(nodeData) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        
        const segmentDiv = document.createElement('div');
        segmentDiv.className = `array-segment ${nodeData.status}`;
        
        // 創建陣列元素
        nodeData.array.forEach(value => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'array-element';
            elementDiv.textContent = value;
            segmentDiv.appendChild(elementDiv);
        });
        
        nodeDiv.appendChild(segmentDiv);
        
        // 添加索引標籤（如果需要）
        if (nodeData.indices && nodeData.indices !== '') {
            const indexLabel = document.createElement('div');
            indexLabel.className = 'index-label';
            indexLabel.textContent = nodeData.indices;
            indexLabel.style.cssText = `
                font-size: 10px;
                color: #666;
                text-align: center;
                margin-top: 2px;
            `;
            nodeDiv.appendChild(indexLabel);
        }
        
        return nodeDiv;
    }

    // 高亮特定元素
    highlightElements(indices) {
        const elements = this.container.querySelectorAll('.array-element');
        elements.forEach((element, index) => {
            if (indices.includes(index)) {
                element.classList.add('highlighted');
            } else {
                element.classList.remove('highlighted');
            }
        });
    }

    // 清除所有高亮
    clearHighlights() {
        const elements = this.container.querySelectorAll('.array-element');
        elements.forEach(element => {
            element.classList.remove('highlighted');
        });
    }

    // 添加動畫效果
    animateStep(stepData) {
        // 先渲染基本結構
        this.renderStep(stepData);
        
        // 然後添加動畫效果
        setTimeout(() => {
            const currentElements = this.container.querySelectorAll('.array-segment.current');
            currentElements.forEach(element => {
                element.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    element.style.transform = 'scale(1.05)';
                }, 200);
            });
        }, 100);
    }

    // 創建連接線（用於顯示父子關係）
    drawConnections() {
        // 這個功能可以後續添加，用SVG畫線連接父子節點
        // 暫時先實現基本的樹狀顯示
    }
}