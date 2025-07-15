class SubsetsEnumeration {
    constructor() {
        this.elements = [1, 2, 3];
        this.currentSubset = [];
        this.allSubsets = [];
        this.isRunning = false;
        this.isAutoMode = false;
        this.autoInterval = null;
        this.recursionSteps = [];
        this.stepIndex = 0;
        this.treeNodes = {};
        this.treeEdges = [];
        this.currentPath = [];
        
        this.initializeElements();
        this.bindEvents();
        this.generateAllSteps();
        this.createTreeStructure();
        this.updateDisplay();
        this.updateButtonStates();
    }

    previousStep() {
        if (this.stepIndex <= 0) {
            return;
        }

        this.stepIndex--;
        
        // 重建狀態到上一步
        this.recreateStateAtStep();
        this.updateDisplay();
        this.updateButtonStates();
    }

    recreateStateAtStep() {
        // 重設狀態
        this.currentSubset = [];
        this.subsetsList.innerHTML = '';
        this.resetTreeHighlights();
        
        // 重新執行所有步驟到當前位置（不包括當前步驟）
        for (let i = 0; i < this.stepIndex; i++) {
            const step = this.recursionSteps[i];
            this.executeStepForRecreation(step);
        }
        
        // 設置當前步驟並更新說明文字和視覺化
        if (this.stepIndex < this.recursionSteps.length) {
            this.currentStep = this.recursionSteps[this.stepIndex];
            // 更新說明文字為當前步驟的描述
            this.status.textContent = this.currentStep.description;
            // 更新視覺化狀態但不執行動作
            this.updateVisualizationForStep(this.currentStep);
        } else {
            this.currentStep = null;
            this.status.textContent = '枚舉完成！找到所有 8 個子集';
        }
    }

    executeStepForRecreation(step) {
        // 簡化版本的步驟執行，只更新狀態不更新視覺化
        switch (step.type) {
            case 'set_select':
            case 'backtrack':
                this.currentSubset = [...step.subset];
                break;
            case 'solution':
                this.addSubsetToDisplay(step.subset, step.solutionIndex);
                break;
        }
    }

    updateVisualizationForStep(step) {
        // 只更新視覺化，不更新狀態
        this.resetTreeHighlights();
        
        // 根據步驟類型更新視覺化
        switch (step.type) {
            case 'enter':
            case 'select':
            case 'set_select':
            case 'backtrack':
            case 'skip':
                this.highlightCurrentPath(step.path);
                break;
            case 'solution':
                this.highlightSolutionPath(step.path);
                break;
        }
    }

    updateButtonStates() {
        if (!this.isRunning) {
            this.prevBtn.disabled = true;
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            return;
        }
        
        // 更新上一步按鈕狀態
        this.prevBtn.disabled = this.stepIndex <= 0 || this.isAutoMode;
        
        // 更新下一步按鈕狀態
        this.stepBtn.disabled = this.stepIndex >= this.recursionSteps.length || this.isAutoMode;
        
        // 更新自動執行按鈕狀態
        this.autoBtn.disabled = this.stepIndex >= this.recursionSteps.length;
    }

    initializeElements() {
        this.elementsArray = document.getElementById('elements-array');
        this.currentSubsetDisplay = document.getElementById('current-subset');
        this.status = document.getElementById('status');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.subsetsCount = document.getElementById('subset-count');
        this.subsetsList = document.getElementById('subsets-list');
        this.decisionTree = document.getElementById('decision-tree');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.autoBtn.addEventListener('click', () => this.toggleAuto());
    }

    // 預先生成所有步驟
    generateAllSteps() {
        this.recursionSteps = [];
        this.allSubsets = [];
        this.generateStepsRecursive(0, [], []);
    }

    generateStepsRecursive(index, currentSubset, currentPath) {
        // 記錄進入函式的步驟
        const enterStep = {
            type: 'enter',
            index: index,
            subset: [...currentSubset],
            path: [...currentPath],
            description: `進入 backtrack(${index}) - 考慮元素 ${index < this.elements.length ? this.elements[index] : '(結束)'}`
        };
        this.recursionSteps.push(enterStep);

        // 檢查終止條件
        if (index === this.elements.length) {
            const subset = [...currentSubset];
            this.allSubsets.push(subset);
            
            const solutionStep = {
                type: 'solution',
                index: index,
                subset: subset,
                path: [...currentPath],
                description: `找到子集: {${subset.length > 0 ? subset.join(', ') : '空集合'}}`,
                solutionIndex: this.allSubsets.length
            };
            this.recursionSteps.push(solutionStep);
            return;
        }

        // 情況1：選取第 index 個元素
        const selectStep = {
            type: 'select',
            index: index,
            element: this.elements[index],
            subset: [...currentSubset],
            path: [...currentPath, 'select'],
            description: `選擇元素 ${this.elements[index]}`
        };
        this.recursionSteps.push(selectStep);

        currentSubset.push(this.elements[index]);
        
        const selectSetStep = {
            type: 'set_select',
            index: index,
            element: this.elements[index],
            subset: [...currentSubset],
            path: [...currentPath, 'select'],
            description: `將 ${this.elements[index]} 加入子集`
        };
        this.recursionSteps.push(selectSetStep);

        // 遞迴處理下一個元素
        this.generateStepsRecursive(index + 1, currentSubset, [...currentPath, 'select']);

        // 回溯：移除剛加入的元素
        currentSubset.pop();
        
        const backtrackStep = {
            type: 'backtrack',
            index: index,
            element: this.elements[index],
            subset: [...currentSubset],
            path: [...currentPath],
            description: `回溯：從子集移除 ${this.elements[index]}`
        };
        this.recursionSteps.push(backtrackStep);

        // 情況2：不選取第 index 個元素
        const skipStep = {
            type: 'skip',
            index: index,
            element: this.elements[index],
            subset: [...currentSubset],
            path: [...currentPath, 'skip'],
            description: `不選擇元素 ${this.elements[index]}`
        };
        this.recursionSteps.push(skipStep);

        // 遞迴處理下一個元素（不選當前元素）
        this.generateStepsRecursive(index + 1, currentSubset, [...currentPath, 'skip']);
    }

    // 創建完整的樹狀結構
    createTreeStructure() {
        this.decisionTree.innerHTML = '';
        
        // 計算節點位置
        const nodePositions = this.calculateNodePositions();
        
        // 創建所有節點
        this.createAllNodes(nodePositions);
        
        // 創建所有邊
        this.createAllEdges(nodePositions);
        
        // 添加圖例和標籤
        this.addLegend();
    }

    calculateNodePositions() {
        const positions = {};
        const levelHeight = 120;
        const rootX = 400;
        const rootY = 40;
        
        // 根節點
        positions['root'] = { x: rootX, y: rootY };
        
        // 第一層 (元素1的選擇)
        const level1Y = rootY + levelHeight;
        positions['select'] = { x: rootX - 120, y: level1Y };
        positions['skip'] = { x: rootX + 120, y: level1Y };
        
        // 第二層 (元素2的選擇)
        const level2Y = level1Y + levelHeight;
        positions['select,select'] = { x: rootX - 180, y: level2Y };
        positions['select,skip'] = { x: rootX - 60, y: level2Y };
        positions['skip,select'] = { x: rootX + 60, y: level2Y };
        positions['skip,skip'] = { x: rootX + 180, y: level2Y };
        
        // 第三層 (元素3的選擇) - 解節點
        const level3Y = level2Y + levelHeight;
        positions['select,select,select'] = { x: rootX - 210, y: level3Y };
        positions['select,select,skip'] = { x: rootX - 150, y: level3Y };
        positions['select,skip,select'] = { x: rootX - 90, y: level3Y };
        positions['select,skip,skip'] = { x: rootX - 30, y: level3Y };
        positions['skip,select,select'] = { x: rootX + 30, y: level3Y };
        positions['skip,select,skip'] = { x: rootX + 90, y: level3Y };
        positions['skip,skip,select'] = { x: rootX + 150, y: level3Y };
        positions['skip,skip,skip'] = { x: rootX + 210, y: level3Y };
        
        return positions;
    }

    createAllNodes(positions) {
        // 根節點
        const rootNode = this.createNode('root', '', 0, positions['root'].x, positions['root'].y);
        this.treeNodes['root'] = rootNode;
        
        // 第一層節點
        const selectNode1 = this.createNode('select', '', 1, positions['select'].x, positions['select'].y);
        const skipNode1 = this.createNode('skip', '', 1, positions['skip'].x, positions['skip'].y);
        this.treeNodes['select'] = selectNode1;
        this.treeNodes['skip'] = skipNode1;
        
        // 第二層節點
        const level2Paths = ['select,select', 'select,skip', 'skip,select', 'skip,skip'];
        level2Paths.forEach((path, index) => {
            const node = this.createNode(path, '', 2, positions[path].x, positions[path].y);
            this.treeNodes[path] = node;
        });
        
        // 第三層節點（解節點）
        const level3Paths = [
            'select,select,select', 'select,select,skip', 'select,skip,select', 'select,skip,skip',
            'skip,select,select', 'skip,select,skip', 'skip,skip,select', 'skip,skip,skip'
        ];
        level3Paths.forEach((path, index) => {
            const node = this.createNode(path, '', 3, positions[path].x, positions[path].y);
            this.treeNodes[path] = node;
        });
    }

    createNode(id, text, level, x, y) {
        const node = document.createElement('div');
        node.className = `tree-node level-${level}`;
        node.id = `node-${id}`;
        node.textContent = text;
        node.style.left = `${x - 17.5}px`;
        node.style.top = `${y - 17.5}px`;
        this.decisionTree.appendChild(node);
        return node;
    }

    createAllEdges(positions) {
        // 從根到第一層的邊
        this.createEdge('root', 'select', positions);
        this.createEdge('root', 'skip', positions);
        
        // 從第一層到第二層的邊
        this.createEdge('select', 'select,select', positions);
        this.createEdge('select', 'select,skip', positions);
        this.createEdge('skip', 'skip,select', positions);
        this.createEdge('skip', 'skip,skip', positions);
        
        // 從第二層到第三層的邊
        this.createEdge('select,select', 'select,select,select', positions);
        this.createEdge('select,select', 'select,select,skip', positions);
        this.createEdge('select,skip', 'select,skip,select', positions);
        this.createEdge('select,skip', 'select,skip,skip', positions);
        this.createEdge('skip,select', 'skip,select,select', positions);
        this.createEdge('skip,select', 'skip,select,skip', positions);
        this.createEdge('skip,skip', 'skip,skip,select', positions);
        this.createEdge('skip,skip', 'skip,skip,skip', positions);
    }

    createEdge(fromId, toId, positions) {
        const fromPos = positions[fromId];
        const toPos = positions[toId];
        
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        const edge = document.createElement('div');
        edge.className = 'tree-edge black';
        edge.id = `edge-${fromId}-${toId}`;
        edge.style.left = `${fromPos.x}px`;
        edge.style.top = `${fromPos.y}px`;
        edge.style.width = `${length}px`;
        edge.style.transform = `rotate(${angle}deg)`;
        
        this.decisionTree.appendChild(edge);
        this.treeEdges.push(edge);
        return edge;
    }

    addLegend() {
        // 在樹的左側添加層級指示器
        const levelLabels = [
            { text: '根節點', y: 40 },
            { text: '元素 1', y: 160 },
            { text: '元素 2', y: 280 },
            { text: '元素 3', y: 400 }
        ];
        
        levelLabels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'tree-level-indicator';
            labelElement.style.left = '20px';
            labelElement.style.top = `${label.y - 10}px`;
            labelElement.textContent = label.text;
            this.decisionTree.appendChild(labelElement);
        });
        
        // 在樹的下方添加路徑信息
        const pathInfo = document.createElement('div');
        pathInfo.className = 'tree-path-info';
        pathInfo.innerHTML = `
            <strong>當前決策路徑：</strong>
            <span id="current-path-display">尚未開始</span>
        `;
        this.decisionTree.appendChild(pathInfo);
    }

    start() {
        this.isRunning = true;
        this.stepIndex = 0;
        this.currentStep = null;
        this.startBtn.disabled = true;
        this.prevBtn.disabled = true;
        this.stepBtn.disabled = false;
        this.autoBtn.disabled = false;
        this.status.textContent = '開始枚舉所有子集...';
        this.updateDisplay();
    }

    nextStep() {
        if (this.stepIndex >= this.recursionSteps.length) {
            this.status.textContent = '枚舉完成！找到所有 8 個子集';
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            return;
        }

        const step = this.recursionSteps[this.stepIndex];
        this.executeStep(step);
        this.stepIndex++;
        this.updateDisplay();
        this.updateButtonStates();
    }

    executeStep(step) {
        this.currentStep = step;
        
        // 重置所有節點和邊的狀態
        this.resetTreeHighlights();
        
        switch (step.type) {
            case 'enter':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'select':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'set_select':
                this.status.textContent = step.description;
                this.currentSubset = [...step.subset];
                this.highlightCurrentPath(step.path);
                break;
            case 'backtrack':
                this.status.textContent = step.description;
                this.currentSubset = [...step.subset];
                this.highlightCurrentPath(step.path);
                break;
            case 'skip':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'solution':
                this.status.textContent = step.description;
                this.addSubsetToDisplay(step.subset, step.solutionIndex);
                this.highlightSolutionPath(step.path);
                break;
        }
    }

    resetTreeHighlights() {
        // 重置所有節點的樣式
        Object.entries(this.treeNodes).forEach(([nodeId, node]) => {
            node.className = node.className.replace(/\s*(current|exploring|completed|solution)/g, '');
            
            // 重設為初始的灰色狀態
            if (nodeId === 'root') {
                node.style.backgroundColor = '#333';
                node.style.borderColor = '#000';
                node.style.color = 'white';
            } else {
                // 所有非根節點都設為灰色
                node.style.backgroundColor = '#f0f0f0';
                node.style.borderColor = '#333';
                node.style.color = '#333';
            }
        });
        
        // 重置所有邊的樣式
        this.treeEdges.forEach(edge => {
            edge.className = edge.className.replace(/\s*(active|completed)/g, '');
        });
    }

    highlightCurrentPath(path) {
        if (!path || path.length === 0) {
            // 高亮根節點
            if (this.treeNodes['root']) {
                this.treeNodes['root'].classList.add('current');
            }
            this.updatePathDisplay('根節點');
            return;
        }

        // 高亮根節點
        if (this.treeNodes['root']) {
            this.treeNodes['root'].classList.add('completed');
        }

        // 構建路徑並高亮節點和邊
        let currentPath = '';
        for (let i = 0; i < path.length; i++) {
            if (i > 0) currentPath += ',';
            currentPath += path[i];
            
            const node = this.treeNodes[currentPath];
            if (node) {
                if (i === path.length - 1) {
                    node.classList.add('current');
                    // 當前節點：根據決策類型設置顏色
                    if (path[i] === 'select') {
                        node.style.backgroundColor = '#2ecc71';
                        node.style.borderColor = '#27ae60';
                        node.style.color = 'white';
                    } else {
                        node.style.backgroundColor = '#e74c3c';
                        node.style.borderColor = '#c0392b';
                        node.style.color = 'white';
                    }
                } else {
                    node.classList.add('completed');
                    // 已完成節點：根據決策類型設置顏色
                    if (path[i] === 'select') {
                        node.style.backgroundColor = '#2ecc71';
                        node.style.borderColor = '#27ae60';
                        node.style.color = 'white';
                    } else {
                        node.style.backgroundColor = '#e74c3c';
                        node.style.borderColor = '#c0392b';
                        node.style.color = 'white';
                    }
                }
            }
            
            // 高亮邊
            if (i === 0) {
                const edge = document.getElementById(`edge-root-${path[0]}`);
                if (edge) edge.classList.add('active');
            } else {
                const prevPath = path.slice(0, i).join(',');
                const edge = document.getElementById(`edge-${prevPath}-${currentPath}`);
                if (edge) edge.classList.add('active');
            }
        }

        this.updatePathDisplay(this.pathToString(path));
    }

    highlightSolutionPath(path) {
        // 重置所有高亮
        this.resetTreeHighlights();
        
        // 高亮根節點
        if (this.treeNodes['root']) {
            this.treeNodes['root'].classList.add('completed');
        }

        // 高亮整個解路徑
        let currentPath = '';
        for (let i = 0; i < path.length; i++) {
            if (i > 0) currentPath += ',';
            currentPath += path[i];
            
            const node = this.treeNodes[currentPath];
            if (node) {
                node.classList.add('completed');
                // 根據決策類型設置顏色
                if (path[i] === 'select') {
                    node.style.backgroundColor = '#2ecc71';
                    node.style.borderColor = '#27ae60';
                    node.style.color = 'white';
                } else {
                    node.style.backgroundColor = '#e74c3c';
                    node.style.borderColor = '#c0392b';
                    node.style.color = 'white';
                }
            }
            
            // 高亮邊
            if (i === 0) {
                const edge = document.getElementById(`edge-root-${path[0]}`);
                if (edge) edge.classList.add('completed');
            } else {
                const prevPath = path.slice(0, i).join(',');
                const edge = document.getElementById(`edge-${prevPath}-${currentPath}`);
                if (edge) edge.classList.add('completed');
            }
        }

        this.updatePathDisplay(`解: ${this.pathToString(path)}`);
    }

    pathToString(path) {
        if (!path || path.length === 0) return '根節點';
        
        const pathStrings = path.map((decision, index) => {
            const element = this.elements[index];
            return decision === 'select' ? `選${element}` : `不選${element}`;
        });
        
        return `[${pathStrings.join(', ')}]`;
    }

    updatePathDisplay(pathText) {
        const pathDisplay = document.getElementById('current-path-display');
        if (pathDisplay) {
            pathDisplay.textContent = pathText;
        }
    }

    addSubsetToDisplay(subset, index) {
        const subsetElement = document.createElement('div');
        subsetElement.className = 'solution-item';
        const subsetText = subset.length > 0 ? subset.join(', ') : '空集合';
        subsetElement.innerHTML = `
            <span class="solution-number">${index}</span>
            <span>{${subsetText}}</span>
        `;
        this.subsetsList.appendChild(subsetElement);
    }

    toggleAuto() {
        if (this.isAutoMode) {
            this.stopAuto();
        } else {
            this.startAuto();
        }
    }

    startAuto() {
        this.isAutoMode = true;
        this.autoBtn.textContent = '暫停自動';
        this.stepBtn.disabled = true;
        this.prevBtn.disabled = true;
        
        this.autoInterval = setInterval(() => {
            this.nextStep();
            if (this.stepIndex >= this.recursionSteps.length) {
                this.stopAuto();
            }
        }, 1200);
    }

    stopAuto() {
        this.isAutoMode = false;
        this.autoBtn.textContent = '自動執行';
        this.updateButtonStates();
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    reset() {
        this.stopAuto();
        this.currentSubset = [];
        this.currentStep = null;
        this.stepIndex = 0;
        this.isRunning = false;
        
        this.startBtn.disabled = false;
        this.prevBtn.disabled = true;
        this.stepBtn.disabled = true;
        this.autoBtn.disabled = true;
        this.autoBtn.textContent = '自動執行';
        
        this.status.textContent = '準備開始枚舉所有子集';
        this.subsetsList.innerHTML = '';
        
        // 重新創建樹狀結構
        this.createTreeStructure();
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateElementsArray();
        this.updateCurrentSubset();
        this.updateSubsetsCount();
    }

    updateElementsArray() {
        const cells = this.elementsArray.children;
        for (let i = 0; i < this.elements.length; i++) {
            const cell = cells[i];
            cell.className = 'element-cell';
            
            // 移除舊的選擇指示器
            const oldIndicator = cell.querySelector('.choice-indicator');
            if (oldIndicator) {
                oldIndicator.remove();
            }
            
            if (!this.currentStep) continue;
            
            // 根據當前步驟設置狀態
            if (this.currentStep.index === i) {
                if (this.currentStep.type === 'select' || this.currentStep.type === 'set_select') {
                    cell.classList.add('current');
                    const indicator = document.createElement('div');
                    indicator.className = 'choice-indicator select';
                    indicator.textContent = '選擇';
                    cell.appendChild(indicator);
                } else if (this.currentStep.type === 'skip') {
                    cell.classList.add('current');
                    const indicator = document.createElement('div');
                    indicator.className = 'choice-indicator skip';
                    indicator.textContent = '跳過';
                    cell.appendChild(indicator);
                }
            } else if (this.currentStep.index > i) {
                // 已經決定的元素
                if (this.currentSubset.includes(this.elements[i])) {
                    cell.classList.add('selected');
                } else {
                    cell.classList.add('not-selected');
                }
            }
        }
    }

    updateCurrentSubset() {
        if (this.currentSubset.length === 0) {
            this.currentSubsetDisplay.textContent = '{ }';
            this.currentSubsetDisplay.classList.add('empty');
        } else {
            this.currentSubsetDisplay.textContent = `{ ${this.currentSubset.join(', ')} }`;
            this.currentSubsetDisplay.classList.remove('empty');
        }
    }

    updateSubsetsCount() {
        let count = 0;
        if (this.currentStep && this.currentStep.type === 'solution') {
            count = this.currentStep.solutionIndex;
        } else {
            // 計算到目前為止找到的子集數量
            for (let i = 0; i <= this.stepIndex; i++) {
                if (this.recursionSteps[i] && this.recursionSteps[i].type === 'solution') {
                    count = this.recursionSteps[i].solutionIndex;
                }
            }
        }
        this.subsetsCount.textContent = count;
    }
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    new SubsetsEnumeration();
});