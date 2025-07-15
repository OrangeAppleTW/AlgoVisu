class NumbersEnumeration {
    constructor() {
        this.solution = [0, 0, 0];
        this.solutions = [];
        this.currentStep = 0;
        this.isRunning = false;
        this.isAutoMode = false;
        this.autoInterval = null;
        this.callStack = [];
        this.maxSolutions = 27; // 顯示所有27個解
        this.currentPosition = 0;
        this.currentNumber = 1;
        this.recursionSteps = [];
        this.stepIndex = 0;
        this.treeNodes = {};
        this.treeEdges = [];
        this.currentPath = [];
        this.visibleLevel3Nodes = new Set(); // 追蹤可見的第三層節點
        
        this.initializeElements();
        this.bindEvents();
        this.generateAllSteps();
        this.createTreeStructure();
        this.updateDisplay();
    }

    initializeElements() {
        this.solutionArray = document.getElementById('solution-array');
        this.status = document.getElementById('status');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.stepBtn = document.getElementById('step-btn');
        this.autoBtn = document.getElementById('auto-btn');
        this.stackDisplay = document.getElementById('stack-display');
        this.solutionsList = document.getElementById('solutions-list');
        this.solutionCount = document.getElementById('solution-count');
        this.recursionTree = document.getElementById('recursion-tree');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.stepBtn.addEventListener('click', () => this.nextStep());
        this.autoBtn.addEventListener('click', () => this.toggleAuto());
    }

    // 生成所有步驟（3^3 = 27個解）
    generateAllSteps() {
        this.recursionSteps = [];
        this.solutions = [];
        this.generateStepsRecursive(0, [0, 0, 0], []);
    }

    generateStepsRecursive(position, currentSolution, currentStack) {
        // 記錄進入函式的步驟
        const enterStep = {
            type: 'enter',
            position: position,
            solution: [...currentSolution],
            stack: [...currentStack, `backtrack(${position})`],
            description: `進入 backtrack(${position})`,
            path: [...currentSolution.slice(0, position)]
        };
        this.recursionSteps.push(enterStep);

        // 檢查終止條件
        if (position === 3) {
            const solution = [...currentSolution];
            this.solutions.push(solution);
            
            const solutionStep = {
                type: 'solution',
                position: position,
                solution: solution,
                stack: [...currentStack, `backtrack(${position})`],
                description: `找到解: [${solution.join(', ')}]`,
                solutionIndex: this.solutions.length,
                path: [...solution]
            };
            this.recursionSteps.push(solutionStep);
            return false;
        }

        // 嘗試每個數字 1, 2, 3
        for (let i = 1; i <= 3; i++) {
            // 記錄嘗試數字的步驟
            const tryStep = {
                type: 'try',
                position: position,
                number: i,
                solution: [...currentSolution],
                stack: [...currentStack, `backtrack(${position})`],
                description: `在位置${position}嘗試數字${i}`,
                path: [...currentSolution.slice(0, position), i]
            };
            this.recursionSteps.push(tryStep);

            // 設置數字
            currentSolution[position] = i;
            
            const setStep = {
                type: 'set',
                position: position,
                number: i,
                solution: [...currentSolution],
                stack: [...currentStack, `backtrack(${position})`],
                description: `設置 solution[${position}] = ${i}`,
                path: [...currentSolution.slice(0, position + 1)]
            };
            this.recursionSteps.push(setStep);

            // 遞迴呼叫
            this.generateStepsRecursive(position + 1, currentSolution, [...currentStack, `backtrack(${position})`]);

            // 記錄返回步驟
            const returnStep = {
                type: 'return',
                position: position,
                number: i,
                solution: [...currentSolution],
                stack: [...currentStack, `backtrack(${position})`],
                description: `從 backtrack(${position + 1}) 返回`,
                path: [...currentSolution.slice(0, position)]
            };
            this.recursionSteps.push(returnStep);
        }

        return false;
    }

    // 創建完整的樹狀結構
    createTreeStructure() {
        this.recursionTree.innerHTML = '';
        this.visibleLevel3Nodes.clear();
        
        // 計算節點位置
        const nodePositions = this.calculateNodePositions();
        
        // 創建節點（第三層initially隱藏）
        this.createAllNodes(nodePositions);
        
        // 創建所有邊
        this.createAllEdges(nodePositions);
        
        // 添加圖例和標籤
        this.addLegend();
    }

    calculateNodePositions() {
        const positions = {};
        const levelHeight = 100;
        const rootX = 400;
        const rootY = 40;
        
        // 根節點
        positions['root'] = { x: rootX, y: rootY };
        
        // 第一層 (位置0的選擇)
        const level1Y = rootY + levelHeight;
        const level1Spacing = 150;
        for (let i = 1; i <= 3; i++) {
            positions[`${i}`] = { 
                x: rootX + (i - 2) * level1Spacing, 
                y: level1Y 
            };
        }
        
        // 第二層 (位置1的選擇)
        const level2Y = level1Y + levelHeight;
        const level2Spacing = 50;
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                positions[`${i},${j}`] = { 
                    x: rootX + (i - 2) * level1Spacing + (j - 2) * level2Spacing, 
                    y: level2Y 
                };
            }
        }
        
        // 第三層 (位置2的選擇 - 解節點)
        const level3Y = level2Y + levelHeight;
        const level3Spacing = 40; // 增加間距避免重疊
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                for (let k = 1; k <= 3; k++) {
                    positions[`${i},${j},${k}`] = { 
                        x: rootX + (i - 2) * level1Spacing + (j - 2) * level2Spacing + (k - 2) * level3Spacing, 
                        y: level3Y 
                    };
                }
            }
        }
        
        return positions;
    }

    createAllNodes(positions) {
        // 根節點
        const rootNode = this.createNode('root', '', 0, positions['root'].x, positions['root'].y);
        this.treeNodes['root'] = rootNode;
        
        // 第一層節點（藍色，永遠顯示）
        for (let i = 1; i <= 3; i++) {
            const nodeId = `${i}`;
            const node = this.createNode(nodeId, i.toString(), 1, positions[nodeId].x, positions[nodeId].y);
            this.treeNodes[nodeId] = node;
        }
        
        // 第二層節點（橘色，永遠顯示）
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                const nodeId = `${i},${j}`;
                const node = this.createNode(nodeId, j.toString(), 2, positions[nodeId].x, positions[nodeId].y);
                this.treeNodes[nodeId] = node;
            }
        }
        
        // 第三層節點（綠色，初始隱藏）
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                for (let k = 1; k <= 3; k++) {
                    const nodeId = `${i},${j},${k}`;
                    const node = this.createNode(nodeId, k.toString(), 3, positions[nodeId].x, positions[nodeId].y);
                    node.style.display = 'none'; // 初始隱藏
                    this.treeNodes[nodeId] = node;
                }
            }
        }
    }

    createNode(id, text, level, x, y) {
        const node = document.createElement('div');
        node.className = `tree-node level-${level}`;
        node.id = `node-${id}`;
        node.textContent = text;
        node.style.left = `${x - 17.5}px`;
        node.style.top = `${y - 17.5}px`;
        this.recursionTree.appendChild(node);
        return node;
    }

    createAllEdges(positions) {
        // 從根到第一層的邊
        for (let i = 1; i <= 3; i++) {
            this.createEdge('root', `${i}`, positions);
        }
        
        // 從第一層到第二層的邊
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                this.createEdge(`${i}`, `${i},${j}`, positions);
            }
        }
        
        // 從第二層到第三層的邊（初始隱藏）
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 3; j++) {
                for (let k = 1; k <= 3; k++) {
                    const edge = this.createEdge(`${i},${j}`, `${i},${j},${k}`, positions);
                    edge.style.display = 'none'; // 初始隱藏
                }
            }
        }
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
        
        this.recursionTree.appendChild(edge);
        this.treeEdges.push(edge);
        return edge;
    }

    addLegend() {
        // 在樹的左側添加層級指示器
        const levelLabels = [
            { text: '根節點', y: 40 },
            { text: '位置 0', y: 140 },
            { text: '位置 1', y: 240 },
            { text: '位置 2', y: 340 }
        ];
        
        levelLabels.forEach(label => {
            const labelElement = document.createElement('div');
            labelElement.className = 'tree-level-indicator';
            labelElement.style.left = '20px';
            labelElement.style.top = `${label.y - 10}px`;
            labelElement.textContent = label.text;
            this.recursionTree.appendChild(labelElement);
        });
        
        // 在右上角添加路徑信息
        const pathInfo = document.createElement('div');
        pathInfo.className = 'tree-path-info';
        pathInfo.innerHTML = `
            <strong>當前路徑：</strong><br>
            <span id="current-path-display">尚未開始</span>
        `;
        this.recursionTree.appendChild(pathInfo);
    }

    // 顯示特定父節點下的第三層子節點
    showLevel3Children(parentPath) {
        const parentId = parentPath.slice(0, 2).join(',');
        
        // 顯示該父節點的所有子節點
        for (let k = 1; k <= 3; k++) {
            const childId = `${parentId},${k}`;
            const childNode = this.treeNodes[childId];
            const childEdge = document.getElementById(`edge-${parentId}-${childId}`);
            
            if (childNode) {
                childNode.style.display = 'flex';
                this.visibleLevel3Nodes.add(childId);
            }
            if (childEdge) {
                childEdge.style.display = 'block';
            }
        }
    }

    // 隱藏所有第三層節點
    hideAllLevel3Nodes() {
        this.visibleLevel3Nodes.forEach(nodeId => {
            const node = this.treeNodes[nodeId];
            const parentId = nodeId.split(',').slice(0, 2).join(',');
            const edge = document.getElementById(`edge-${parentId}-${nodeId}`);
            
            if (node) node.style.display = 'none';
            if (edge) edge.style.display = 'none';
        });
        this.visibleLevel3Nodes.clear();
    }

    start() {
        this.isRunning = true;
        this.stepIndex = 0; // 確保從0開始
        this.currentStep = null; // 重置當前步驟
        this.startBtn.disabled = true;
        this.prevBtn.disabled = true; // 初始狀態下禁用上一步
        this.stepBtn.disabled = false;
        this.autoBtn.disabled = false;
        this.status.textContent = '開始枚舉過程...';
        this.updateDisplay();
        this.updateButtonStates();
    }

    nextStep() {
        if (this.stepIndex >= this.recursionSteps.length) {
            this.status.textContent = '枚舉完成！';
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            this.updateButtonStates();
            return;
        }

        // 執行當前步驟
        const step = this.recursionSteps[this.stepIndex];
        this.executeStep(step);
        
        // 移動到下一步
        this.stepIndex++;
        
        this.updateDisplay();
        this.updateButtonStates();
    }

    previousStep() {
        if (this.stepIndex <= 0) {
            return;
        }

        this.stepIndex--;
        
        // 重建狀態到上一步
        this.recreateStateAtStepForPrevious();
        this.updateDisplay();
        this.updateButtonStates();
    }

    recreateStateAtStepForPrevious() {
        // 重置狀態
        this.solution = [0, 0, 0];
        this.solutionsList.innerHTML = '';
        this.hideAllLevel3Nodes();
        this.resetTreeHighlights();
        
        // 重新執行所有步驟到當前位置（不包括當前步驟）
        for (let i = 0; i < this.stepIndex; i++) {
            const step = this.recursionSteps[i];
            this.executeStepForRecreation(step, i);
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
            this.status.textContent = '枚舉完成！';
        }
    }

    updateVisualizationForStep(step) {
        // 只更新視覺化，不更新狀態
        this.resetTreeHighlights();
        
        // 根據步驟類型更新視覺化
        switch (step.type) {
            case 'enter':
            case 'try':
            case 'set':
            case 'return':
                this.highlightCurrentPath(step.path);
                break;
            case 'solution':
                this.highlightSolutionPath(step.path);
                break;
        }
        
        // 管理第三層節點的顯示
        if (step.path && step.path.length >= 2) {
            const parentPath = step.path.slice(0, 2);
            this.showLevel3Children([...parentPath, 0]);
        }
    }

    executeStepForRecreation(step, stepIndex) {
        // 簡化版本的步驟執行，只更新狀態不更新視覺化
        switch (step.type) {
            case 'set':
                this.solution = [...step.solution];
                break;
            case 'solution':
                this.addSolutionToDisplay(step.solution, step.solutionIndex);
                break;
        }
        
        // 管理第三層節點的顯示狀態
        if (step.path && step.path.length >= 2) {
            const parentPath = step.path.slice(0, 2);
            this.showLevel3Children([...parentPath, 0]);
        }
        
        if (step.type === 'try' && step.position === 0 && step.number > 1) {
            this.hideAllLevel3Nodes();
        }
        
        if (step.type === 'try' && step.position === 1 && step.number > 1) {
            const prevPath = [step.solution[0], step.number - 1];
            this.hideSpecificLevel3Children(prevPath);
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

    executeStep(step) {
        this.currentStep = step;
        
        // 重置所有節點和邊的狀態
        this.resetTreeHighlights();
        
        // 根據步驟類型處理第三層節點的顯示
        if (step.path && step.path.length >= 2) {
            // 當到達第二層節點時，顯示其子節點
            const parentPath = step.path.slice(0, 2);
            this.showLevel3Children([...parentPath, 0]); // 用0作為佔位符
        }
        
        switch (step.type) {
            case 'enter':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
            case 'try':
                this.status.textContent = step.description;
                this.currentPosition = step.position;
                this.currentNumber = step.number;
                
                // 在嘗試新的第一層節點之前，隱藏所有第三層節點
                if (step.position === 0 && step.number > 1) {
                    this.hideAllLevel3Nodes();
                }
                
                // 在嘗試新的第二層節點之前，隱藏之前的第三層節點
                if (step.position === 1 && step.number > 1) {
                    const prevPath = [step.solution[0], step.number - 1];
                    this.hideSpecificLevel3Children(prevPath);
                }
                
                this.highlightCurrentPath(step.path);
                break;
            case 'set':
                this.status.textContent = step.description;
                this.solution = [...step.solution];
                this.highlightCurrentPath(step.path);
                break;
            case 'solution':
                this.status.textContent = step.description;
                this.addSolutionToDisplay(step.solution, step.solutionIndex);
                this.highlightSolutionPath(step.path);
                break;
            case 'return':
                this.status.textContent = step.description;
                this.highlightCurrentPath(step.path);
                break;
        }
    }

    // 隱藏特定的第三層子節點
    hideSpecificLevel3Children(parentPath) {
        // 當從位置1返回時，隱藏當前第二層節點下的所有第三層節點
        if (parentPath.length >= 2) {
            const parentId = parentPath.slice(0, 2).join(',');
            
            // 隱藏該第二層節點下的所有第三層子節點
            for (let k = 1; k <= 3; k++) {
                const childId = `${parentId},${k}`;
                const childNode = this.treeNodes[childId];
                const childEdge = document.getElementById(`edge-${parentId}-${childId}`);
                
                if (childNode && this.visibleLevel3Nodes.has(childId)) {
                    childNode.style.display = 'none';
                    this.visibleLevel3Nodes.delete(childId);
                }
                if (childEdge) {
                    childEdge.style.display = 'none';
                }
            }
        }
    }

    resetTreeHighlights() {
        // 重置所有節點的樣式
        Object.values(this.treeNodes).forEach(node => {
            node.className = node.className.replace(/\s*(current|exploring|completed|solution)/g, '');
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
                } else {
                    node.classList.add('completed');
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

        this.updatePathDisplay(`[${path.join(', ')}]`);
    }

    highlightSolutionPath(path) {
        // 重置所有高亮
        this.resetTreeHighlights();
        
        // 高亮根節點
        if (this.treeNodes['root']) {
            this.treeNodes['root'].classList.add('completed');
        }

        // 高亮整個解路徑，但不加動畫效果
        let currentPath = '';
        for (let i = 0; i < path.length; i++) {
            if (i > 0) currentPath += ',';
            currentPath += path[i];
            
            const node = this.treeNodes[currentPath];
            if (node) {
                // 所有節點都使用 completed 狀態，不再使用 solution 類別
                node.classList.add('completed');
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

        this.updatePathDisplay(`解: [${path.join(', ')}]`);
    }

    updatePathDisplay(pathText) {
        const pathDisplay = document.getElementById('current-path-display');
        if (pathDisplay) {
            pathDisplay.textContent = pathText;
        }
    }

    addSolutionToDisplay(solution, index) {
        if (index <= this.maxSolutions) {
            const solutionElement = document.createElement('div');
            solutionElement.className = 'solution-item';
            solutionElement.innerHTML = `
                <span class="solution-number">${index}</span>
                <span>[${solution.join(', ')}]</span>
            `;
            this.solutionsList.appendChild(solutionElement);
        }
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
        this.solution = [0, 0, 0];
        this.currentStep = null;
        this.stepIndex = 0;
        this.isRunning = false;
        this.currentPosition = 0;
        this.currentNumber = 1;
        
        this.startBtn.disabled = false;
        this.prevBtn.disabled = true;
        this.stepBtn.disabled = true;
        this.autoBtn.disabled = true;
        this.autoBtn.textContent = '自動執行';
        
        this.status.textContent = '準備開始枚舉';
        this.solutionsList.innerHTML = '';
        
        // 重新創建樹狀結構
        this.createTreeStructure();
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateSolutionArray();
        this.updateStackDisplay();
        this.updateSolutionCount();
    }

    updateSolutionArray() {
        const cells = this.solutionArray.children;
        for (let i = 0; i < 3; i++) {
            const cell = cells[i];
            if (this.solution[i] === 0) {
                cell.textContent = '?';
                cell.className = 'array-cell';
            } else {
                cell.textContent = this.solution[i];
                cell.className = 'array-cell filled';
            }
            
            // 高亮當前正在處理的位置
            if (this.currentStep && this.currentStep.position === i) {
                cell.classList.add('active');
            }
        }
    }

    updateStackDisplay() {
        if (!this.currentStep) {
            this.stackDisplay.innerHTML = '<div class="stack-level">尚未開始</div>';
            return;
        }

        this.stackDisplay.innerHTML = '';
        this.currentStep.stack.forEach((call, index) => {
            const stackElement = document.createElement('div');
            stackElement.className = 'stack-level';
            if (index === this.currentStep.stack.length - 1) {
                stackElement.classList.add('current');
            }
            stackElement.textContent = call;
            this.stackDisplay.appendChild(stackElement);
        });
    }

    updateSolutionCount() {
        let count = 0;
        if (this.currentStep && this.currentStep.type === 'solution') {
            count = this.currentStep.solutionIndex;
        } else {
            // 計算到目前為止找到的解的數量
            for (let i = 0; i <= this.stepIndex; i++) {
                if (this.recursionSteps[i] && this.recursionSteps[i].type === 'solution') {
                    count = this.recursionSteps[i].solutionIndex;
                }
            }
        }
        this.solutionCount.textContent = count;
    }
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    new NumbersEnumeration();
});