// 合併排序視覺化渲染器
class MergeSortRenderer {
    constructor() {
        this.container = document.getElementById('sorting-tree');
    }

    // 渲染初始狀態
    renderInitialState(array) {
        this.container.innerHTML = this.createArrayVisualization(array, 'initial');
    }

    // 根據步驟類型渲染視覺化
    renderStep(step) {
        switch (step.type) {
            case 'divide':
                this.container.innerHTML = this.createDivideVisualization(step);
                break;
                
            case 'merge_start':
                this.container.innerHTML = this.createMergeVisualization(step);
                break;
                
            case 'merge_compare':
                this.container.innerHTML = this.createCompareVisualization(step);
                break;
                
            case 'merge_remaining':
                this.container.innerHTML = this.createArrayVisualization(step.array, 'merging', [step.position]);
                break;
                
            case 'merge_complete':
                this.container.innerHTML = this.createArrayVisualization(step.array, 'completed');
                break;
        }
    }

    // 創建基本陣列視覺化
    createArrayVisualization(array, type = 'normal', highlightIndices = []) {
        const elements = array.map((value, index) => {
            let className = 'array-element';
            if (highlightIndices.includes(index)) {
                className += ' comparing';
            }
            return `<div class="${className}">${value}</div>`;
        }).join('');

        return `
            <div class="array-level">
                <div class="array-segment ${type}">
                    ${elements}
                </div>
            </div>
        `;
    }

    // 創建分割視覺化
    createDivideVisualization(step) {
        const leftPart = step.array.slice(step.left, Math.floor((step.left + step.right) / 2) + 1);
        const rightPart = step.array.slice(Math.floor((step.left + step.right) / 2) + 1, step.right + 1);
        
        return `
            <div class="array-level">
                <div class="level-label">層級 ${step.level}</div>
                <div class="array-segment dividing">
                    ${step.array.slice(step.left, step.right + 1).map(val => `<div class="array-element">${val}</div>`).join('')}
                </div>
            </div>
            ${step.left < step.right ? `
                <div class="merge-arrow">↓ 分割 ↓</div>
                <div class="array-level">
                    <div class="array-segment">
                        ${leftPart.map(val => `<div class="array-element">${val}</div>`).join('')}
                    </div>
                    <div class="array-segment">
                        ${rightPart.map(val => `<div class="array-element">${val}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    // 創建合併開始視覺化
    createMergeVisualization(step) {
        return `
            <div class="array-level">
                <div class="level-label">層級 ${step.level}</div>
                <div class="array-segment merging">
                    ${step.leftArr.map(val => `<div class="array-element">${val}</div>`).join('')}
                </div>
                <div style="margin: 0 20px; font-size: 18px; color: #4ecdc4;">+</div>
                <div class="array-segment merging">
                    ${step.rightArr.map(val => `<div class="array-element">${val}</div>`).join('')}
                </div>
            </div>
            <div class="merge-arrow">↓ 合併 ↓</div>
        `;
    }

    // 創建比較視覺化
    createCompareVisualization(step) {
        return `
            <div class="array-level">
                <div class="level-label">比較</div>
                <div class="array-segment">
                    ${step.comparing.map(val => 
                        `<div class="array-element comparing">${val}</div>`
                    ).join('')}
                </div>
            </div>
            <div style="text-align: center; margin: 10px 0; color: #4ecdc4; font-weight: bold;">
                選擇：${step.chosen}
            </div>
            <div class="array-level">
                <div class="array-segment completed">
                    ${step.array.map((val, idx) => {
                        let className = 'array-element';
                        if (idx === step.position) className += ' sorted';
                        return `<div class="${className}">${val}</div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
}