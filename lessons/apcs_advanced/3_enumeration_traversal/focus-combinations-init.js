// 專注模式專用的組合枚舉初始化 - focus-combinations-init.js

/**
 * 為專注模式特別設計的組合枚舉初始化
 * 解決DOM元素未準備好的問題
 */

// 延遲初始化的組合枚舉類
class FocusCombinationsEnumeration extends CombinationsEnumeration {
    constructor() {
        // 先呼叫 super() 但在一個沒有DOM依賴的環境中修改父類行為
        super();
        
        console.log('父類構造函數呼叫成功，檢查DOM是否準備好...');
        
        // 检查父類初始化是否成功（通過DOMe元素是否存在）
        this.parentInitialized = this.checkParentInitialization();
        
        if (!this.parentInitialized) {
            console.log('父類初始化不完整，將使用延遲初始化');
            // 重置一些可能失敗的屬性
            this.resetToSafeState();
        }
        
        // 延遲初始化DOM相關部分
        this.domReady = false;
        this.waitForDOM();
    }
    
    // 檢查父類初始化是否成功
    checkParentInitialization() {
        // 檢查關鍵DOM元素是否存在且正確綁定
        const requiredElements = [
            'combination-slots', 'status', 'start-btn', 
            'combination-tree', 'combination-count'
        ];
        
        const allElementsExist = requiredElements.every(id => document.getElementById(id));
        
        // 檢查重要屬性是否正確設置
        const hasValidProperties = this.combinationSlots && this.status && this.startBtn;
        
        return allElementsExist && hasValidProperties;
    }
    
    // 重置為安全狀態
    resetToSafeState() {
        // 清除可能失敗的DOM元素參考
        this.combinationSlots = null;
        this.startPosition = null;
        this.status = null;
        this.startBtn = null;
        this.resetBtn = null;
        this.stepBtn = null;
        this.autoBtn = null;
        this.combinationCount = null;
        this.combinationsList = null;
        this.combinationTree = null;
        this.pruningInfo = null;
        this.mSelector = null;
        this.combinationFormula = null;
        
        // 重置狀態
        this.isRunning = false;
        this.isAutoMode = false;
        this.stepIndex = 0;
        
        // 清除可能的事件監聽器
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
        
        console.log('已重置為安全狀態');
    }
    
    waitForDOM() {
        // 檢查關鍵DOM元素是否存在
        const checkDOM = () => {
            const requiredElements = [
                'combination-slots',
                'status', 
                'start-btn',
                'combination-tree',
                'combination-count'
            ];
            
            const allExists = requiredElements.every(id => document.getElementById(id));
            
            if (allExists) {
                console.log('專注模式DOM準備完成，開始初始化...');
                this.initializeFocus();
            } else {
                console.log('等待DOM元素準備...缺失:', 
                    requiredElements.filter(id => !document.getElementById(id)));
                setTimeout(checkDOM, 100);
            }
        };
        
        checkDOM();
    }
    
    // 重寫 initializeFocus 方法，避免使用不兼容的 UIUpdater
    initializeFocus() {
        try {
            console.log('開始初始化專注模式...');
            
            // 如果父類已經初始化成功，只需要做專注模式的調整
            if (this.parentInitialized) {
                console.log('父類已初始化，執行專注模式調整...');
                this.adjustForFocusMode();
            } else {
                console.log('父類未初始化，執行完整初始化...');
                
                // 1. 初始化DOM元素
                this.initializeElements();
                
                // 2. 綁定事件
                this.bindEvents();
                
                // 3. 初始化樹狀圖視覺化器
                if (typeof CombinationTreeVisualizer !== 'undefined') {
                    this.treeVisualizer = new CombinationTreeVisualizer(this);
                    console.log('樹狀圖視覺化器初始化完成');
                }
                
                // 4. 確保選擇器存在再更新公式
                if (this.combinationFormula && this.mSelector) {
                    this.updateCombinationFormula();
                }
                
                // 5. 生成步驟與樹狀結構
                this.generateAllSteps();
                this.createTreeStructure();
            }
            
            // 6. 使用專注模式專用的更新顯示方法
            this.safeUpdateDisplay();
            
            this.domReady = true;
            console.log('專注模式組合枚舉器初始化完成');
        } catch (error) {
            console.error('專注模式初始化失敗:', error);
            // 嘗試補救
            setTimeout(() => this.initializeFocus(), 500);
        }
    }
    
    // 重寫初始化元素方法，添加錯誤處理
    initializeElements() {
        try {
            this.combinationSlots = document.getElementById('combination-slots');
            this.startPosition = document.getElementById('start-position');
            this.status = document.getElementById('status');
            this.startBtn = document.getElementById('start-btn');
            this.resetBtn = document.getElementById('reset-btn');
            this.stepBtn = document.getElementById('step-btn');
            this.autoBtn = document.getElementById('auto-btn');
            this.combinationCount = document.getElementById('combination-count');
            this.combinationsList = document.getElementById('combinations-list');
            this.combinationTree = document.getElementById('combination-tree');
            this.pruningInfo = document.getElementById('pruning-info');
            this.mSelector = document.getElementById('m-selector');
            this.combinationFormula = document.getElementById('combination-formula');
            
            // 檢查必要元素
            const required = ['combinationSlots', 'status', 'startBtn', 'combinationTree'];
            const missing = required.filter(prop => !this[prop]);
            
            if (missing.length > 0) {
                console.warn(`缺少部分DOM元素，但繼續初始化: ${missing.join(', ')}`);
            }
            
            console.log('專注模式DOM元素初始化成功');
        } catch (error) {
            console.error('DOM元素初始化失敗:', error);
            throw error;
        }
    }
    
    // 安全的事件綁定
    bindEvents() {
        try {
            if (this.startBtn) {
                this.startBtn.addEventListener('click', () => {
                    console.log('開始按鈕被點擊');
                    this.start();
                });
            }
            
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', () => {
                    console.log('重置按鈕被點擊');
                    this.reset();
                });
            }
            
            if (this.stepBtn) {
                this.stepBtn.addEventListener('click', () => {
                    console.log('下一步按鈕被點擊，當前步驟索引:', this.stepIndex, '總步驟數:', this.recursionSteps.length);
                    this.nextStep();
                });
            }
            
            if (this.autoBtn) {
                this.autoBtn.addEventListener('click', () => {
                    console.log('自動執行按鈕被點擊');
                    this.toggleAuto();
                });
            }
            
            if (this.mSelector) {
                this.mSelector.addEventListener('change', () => {
                    console.log('m選擇器改變');
                    this.onMChanged();
                });
            }
            
            console.log('專注模式事件綁定完成');
        } catch (error) {
            console.error('事件綁定失敗:', error);
        }
    }
    
    // 重寫 nextStep 方法，添加詳細日誌
    nextStep() {
        console.log('nextStep 被調用，當前狀態:', {
            stepIndex: this.stepIndex,
            totalSteps: this.recursionSteps.length,
            isRunning: this.isRunning
        });
        
        if (!this.isRunning) {
            console.log('演算法尚未開始，忽略 nextStep');
            return;
        }
        
        if (this.stepIndex >= this.recursionSteps.length) {
            const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
            this.status.textContent = `枚舉完成！找到所有 ${totalCombinations} 個組合`;
            this.stepBtn.disabled = true;
            this.autoBtn.disabled = true;
            console.log('演算法執行完成');
            return;
        }

        const step = this.recursionSteps[this.stepIndex];
        console.log('執行步驟:', step);
        this.executeStep(step);
        this.stepIndex++;
        this.safeUpdateDisplay();
    }
    
    // 重寫 start 方法，添加詳細日誌
    start() {
        console.log('start 方法被調用');
        
        this.isRunning = true;
        this.stepIndex = 0;
        this.currentStep = null;
        
        if (this.startBtn) this.startBtn.disabled = true;
        if (this.stepBtn) this.stepBtn.disabled = false;
        if (this.autoBtn) this.autoBtn.disabled = false;
        if (this.mSelector) this.mSelector.disabled = true;
        
        if (this.status) {
            this.status.textContent = `開始 C(${this.elements.length},${this.m}) 組合枚舉...`;
        }
        
        console.log('開始狀態設置完成，生成的步驟數:', this.recursionSteps.length);
        this.safeUpdateDisplay();
    }
    
    // 重寫 generateAllSteps 方法，確保生成步驟
    generateAllSteps() {
        console.log('生成所有步驟...');
        
        this.recursionSteps = [];
        this.allCombinations = [];
        this.generateStepsRecursive(0, [], []);
        
        console.log('步驟生成完成，總步驟數:', this.recursionSteps.length);
        console.log('總組合數:', this.allCombinations.length);
    }
    
    // 修正遞歸步驟生成方法 - 使用與原始版本一致的邏輯
    generateStepsRecursive(index, currentCombination, currentPath) {
        // 進入步驟
        const enterStep = {
            type: 'enter',
            index: index,
            combination: [...currentCombination],
            path: [...currentPath],
            description: `考慮元素 ${index < this.elements.length ? this.elements[index] : '（完成）'}`
        };
        this.recursionSteps.push(enterStep);

        // 終止條件：已選滿 m 個元素
        if (currentCombination.length === this.m) {
            const combination = [...currentCombination];
            this.allCombinations.push(combination);
            
            const solutionStep = {
                type: 'solution',
                index: index,
                combination: combination,
                path: [...currentPath],
                description: `找到組合: {${combination.join(', ')}}`,
                solutionIndex: this.allCombinations.length
            };
            this.recursionSteps.push(solutionStep);
            return;
        }

        // 檢查是否已經遍歷完所有元素
        if (index >= this.elements.length) {
            return;
        }

        // 剪枝檢查
        const remaining = this.elements.length - index;
        const needed = this.m - currentCombination.length;
        if (remaining < needed) {
            const pruneStep = {
                type: 'prune',
                index: index,
                combination: [...currentCombination],
                path: [...currentPath],
                description: `剪枝：剩餘元素不足`
            };
            this.recursionSteps.push(pruneStep);
            return;
        }

        const currentElement = this.elements[index];

        // 情況1：選取當前元素
        const selectStep = {
            type: 'select',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath, 'select'],
            description: `選擇元素 ${currentElement}`
        };
        this.recursionSteps.push(selectStep);

        // 加入組合
        currentCombination.push(currentElement);
        
        // 遞迴處理下一個元素（選擇分支）
        this.generateStepsRecursive(index + 1, currentCombination, [...currentPath, 'select']);

        // 回溯：移除剛加入的元素
        currentCombination.pop();
        
        const backtrackStep = {
            type: 'backtrack',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath],
            description: `回溯：移除 ${currentElement}`
        };
        this.recursionSteps.push(backtrackStep);

        // 情況2：不選取當前元素
        const skipStep = {
            type: 'skip',
            index: index,
            element: currentElement,
            combination: [...currentCombination],
            path: [...currentPath, 'skip'],
            description: `跳過元素 ${currentElement}`
        };
        this.recursionSteps.push(skipStep);

        // 遞迴處理下一個元素（跳過分支）
        this.generateStepsRecursive(index + 1, currentCombination, [...currentPath, 'skip']);
    }
    
    // 安全的樹狀結構創建方法
    createTreeStructure() {
        try {
            if (this.treeVisualizer && this.treeVisualizer.createTreeStructure) {
                this.treeVisualizer.createTreeStructure();
                console.log('樹狀結構創建成功');
            } else {
                console.log('樹狀圖視覺化器不可用，跳過樹狀結構創建');
            }
        } catch (error) {
            console.error('創建樹狀結構失敗:', error);
        }
    }
    
    // 專注模式的特別調整
    adjustForFocusMode() {
        try {
            console.log('執行專注模式調整...');
            
            // 初始化樹狀圖視覺化器（如果尚未初始化）
            if (!this.treeVisualizer && typeof CombinationTreeVisualizer !== 'undefined') {
                this.treeVisualizer = new CombinationTreeVisualizer(this);
                console.log('專注模式樹狀圖視覺化器初始化完成');
            }
            
            // 重新創建樹狀結構（專注模式可能需要不同的佈局）
            this.createTreeStructure();
            
            console.log('專注模式調整完成');
        } catch (error) {
            console.error('專注模式調整失敗:', error);
        }
    }
    
    // 安全的顯示更新方法 - 為專注模式特別設計
    updateDisplay() {
        try {
            // 專注模式使用安全的更新方法
            this.safeUpdateDisplay();
        } catch (error) {
            console.error('更新顯示失敗:', error);
            // 嘗試基本更新
            this.basicUpdateDisplay();
        }
    }
    
    // 專注模式安全的顯示更新
    safeUpdateDisplay() {
        console.log('專注模式安全更新顯示');
        
        // 1. 更新組合槽位
        this.updateCombinationSlots();
        
        // 2. 更新組合計數
        this.updateCombinationCount();
        
        // 3. 更新起始位置
        this.updateStartPosition();
        
        // 4. 更新元素陣列（安全版本）
        this.safeUpdateElementsArray();
        
        // 5. 更新剪枝資訊
        this.updatePruningInfo();
    }
    
    // 安全的組合槽位更新
    updateCombinationSlots() {
        if (!this.combinationSlots) return;
        
        try {
            // 更新槽位數量
            while (this.combinationSlots.children.length < this.m) {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.textContent = '?';
                this.combinationSlots.appendChild(slot);
            }
            while (this.combinationSlots.children.length > this.m) {
                this.combinationSlots.removeChild(this.combinationSlots.lastChild);
            }
            
            // 更新槽位內容
            for (let i = 0; i < this.m; i++) {
                const slot = this.combinationSlots.children[i];
                if (slot) {
                    slot.className = 'slot';
                    
                    if (i < this.currentCombination.length) {
                        slot.textContent = this.currentCombination[i];
                        slot.classList.add('filled');
                    } else {
                        slot.textContent = '?';
                    }
                }
            }
        } catch (error) {
            console.error('更新組合槽位失敗:', error);
        }
    }
    
    // 安全的元素陣列更新
    safeUpdateElementsArray() {
        const elementsDisplay = document.querySelector('.elements-display');
        if (!elementsDisplay) {
            console.log('找不到 elements-display，跳過元素陣列更新');
            return;
        }
        
        try {
            const cells = elementsDisplay.children;
            
            for (let i = 0; i < this.elements.length && i < cells.length; i++) {
                const cell = cells[i];
                if (!cell) continue;
                
                cell.className = 'element-item';
                
                // 移除舊的選擇指示器
                const oldIndicator = cell.querySelector('.choice-indicator');
                if (oldIndicator) {
                    oldIndicator.remove();
                }
                
                if (!this.currentStep) continue;
                
                // 根據當前步驟設置狀態
                if (this.currentStep.index === i) {
                    if (this.currentStep.type === 'select') {
                        cell.classList.add('current');
                        this.addChoiceIndicator(cell, '選擇', '#2ecc71');
                    } else if (this.currentStep.type === 'skip') {
                        cell.classList.add('current');
                        this.addChoiceIndicator(cell, '跳過', '#e74c3c');
                    }
                } else if (this.currentStep.index > i) {
                    // 已經決定的元素
                    if (this.currentCombination.includes(this.elements[i])) {
                        cell.classList.add('selected');
                    } else {
                        cell.classList.add('excluded');
                    }
                }
            }
        } catch (error) {
            console.error('安全更新元素陣列失敗:', error);
        }
    }
    
    // 添加選擇指示器
    addChoiceIndicator(cell, text, color) {
        try {
            const indicator = document.createElement('div');
            indicator.className = 'choice-indicator';
            indicator.textContent = text;
            indicator.style.cssText = `
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.8em;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                background: ${color};
                color: white;
            `;
            cell.style.position = 'relative';
            cell.appendChild(indicator);
        } catch (error) {
            console.error('添加選擇指示器失敗:', error);
        }
    }
    
    // 安全的起始位置更新
    updateStartPosition() {
        if (this.startPosition) {
            if (this.currentStep) {
                this.startPosition.textContent = this.currentStep.index || 0;
            } else {
                this.startPosition.textContent = '0';
            }
        }
    }
    
    // 安全的組合計數更新
    updateCombinationCount() {
        if (this.combinationCount) {
            let count = 0;
            for (let i = 0; i <= this.stepIndex; i++) {
                if (this.recursionSteps[i] && this.recursionSteps[i].type === 'solution') {
                    count = this.recursionSteps[i].solutionIndex;
                }
            }
            const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
            this.combinationCount.textContent = `${count} / ${totalCombinations}`;
        }
    }
    
    // 安全的剪枝資訊更新
    updatePruningInfo() {
        if (this.pruningInfo) {
            if (this.showPruning) {
                this.pruningInfo.classList.add('show');
            } else {
                this.pruningInfo.classList.remove('show');
            }
        }
    }
    
    // 基本的顯示更新方法
    basicUpdateDisplay() {
        try {
            // 更新組合計數
            if (this.combinationCount) {
                let count = 0;
                for (let i = 0; i <= this.stepIndex; i++) {
                    if (this.recursionSteps[i] && this.recursionSteps[i].type === 'solution') {
                        count = this.recursionSteps[i].solutionIndex;
                    }
                }
                const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
                this.combinationCount.textContent = `${count} / ${totalCombinations}`;
            }
            
            // 更新狀態顯示
            if (this.status && !this.currentStep) {
                this.status.textContent = `準備開始 C(${this.elements.length},${this.m}) 組合枚舉`;
            }
            
            console.log('基本顯示更新完成');
        } catch (error) {
            console.error('基本顯示更新失敗:', error);
        }
    }
    
    // 重寫 executeStep 方法，添加安全處理
    executeStep(step) {
        try {
            this.currentStep = step;
            
            // 重置樹狀圖高亮
            if (this.treeVisualizer && this.treeVisualizer.resetTreeHighlights) {
                this.treeVisualizer.resetTreeHighlights();
            }
            
            switch (step.type) {
                case 'enter':
                    this.status.textContent = step.description;
                    this.currentStart = step.index;
                    this.highlightCurrentPath(step.path);
                    break;
                case 'select':
                    this.status.textContent = step.description;
                    // 加入元素到當前組合
                    if (step.element !== undefined) {
                        this.currentCombination = [...step.combination];
                        this.currentCombination.push(step.element);
                    }
                    this.highlightCurrentPath(step.path);
                    break;
                case 'set_select':
                    this.status.textContent = step.description;
                    this.currentCombination = [...step.combination];
                    this.highlightCurrentPath(step.path);
                    break;
                case 'backtrack':
                    this.status.textContent = step.description;
                    this.currentCombination = [...step.combination];
                    this.highlightCurrentPath(step.path);
                    break;
                case 'skip':
                    this.status.textContent = step.description;
                    this.highlightCurrentPath(step.path);
                    break;
                case 'prune':
                    this.status.textContent = step.description;
                    this.showPruning = true;
                    this.highlightPrunedPath(step.path);
                    break;
                case 'solution':
                    this.status.textContent = step.description;
                    this.addCombinationToDisplay(step.combination, step.solutionIndex);
                    this.showPruning = false;
                    this.highlightSolutionPath(step.path);
                    break;
                default:
                    this.showPruning = false;
                    break;
            }
        } catch (error) {
            console.error('執行步驟失敗:', error, step);
        }
    }
    
    // 安全的路徑高亮方法
    highlightCurrentPath(path) {
        try {
            if (this.treeVisualizer && this.treeVisualizer.highlightCurrentPath) {
                this.treeVisualizer.highlightCurrentPath(path);
            }
        } catch (error) {
            console.error('高亮路徑失敗:', error);
        }
    }
    
    highlightSolutionPath(path) {
        try {
            if (this.treeVisualizer && this.treeVisualizer.highlightCurrentPath) {
                this.treeVisualizer.highlightCurrentPath(path);
            }
        } catch (error) {
            console.error('高亮解路徑失敗:', error);
        }
    }
    
    highlightPrunedPath(path) {
        try {
            if (this.treeVisualizer && this.treeVisualizer.highlightCurrentPath) {
                this.treeVisualizer.highlightCurrentPath(path);
            }
        } catch (error) {
            console.error('高亮剪枝路徑失敗:', error);
        }
    }
    
    // 安全的組合顯示添加方法 - 為專注模式特別設計
    addCombinationToDisplay(combination, index) {
        try {
            // 確保 combinationsList 存在
            if (!this.combinationsList) {
                console.log('找不到 combinations-list 元素，跳過組合顯示');
                return;
            }
            
            const combinationElement = document.createElement('div');
            combinationElement.className = 'solution-item';
            combinationElement.style.cssText = `
                background: white;
                padding: 5px 8px;
                margin: 2px 0;
                border-radius: 4px;
                border: 1px solid #ddd;
                font-family: monospace;
                font-size: 0.8em;
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            
            const numberSpan = document.createElement('span');
            numberSpan.textContent = index;
            numberSpan.style.cssText = `
                background: #3498db;
                color: white;
                padding: 1px 4px;
                border-radius: 8px;
                font-size: 0.7em;
                min-width: 15px;
                text-align: center;
            `;
            
            const combinationSpan = document.createElement('span');
            combinationSpan.textContent = `{${combination.join(', ')}}`;
            
            combinationElement.appendChild(numberSpan);
            combinationElement.appendChild(combinationSpan);
            
            this.combinationsList.appendChild(combinationElement);
            
            console.log(`添加組合顯示: ${index} - {${combination.join(', ')}}`);
        } catch (error) {
            console.error('添加組合顯示失敗:', error);
        }
    }
    
    // 檢查是否準備就緒
    isReady() {
        return this.domReady && this.combinationTree && this.status;
    }
    
    // 添加缺少的輔助方法
    calculateCombinations(n, r) {
        if (r > n || r < 0) return 0;
        if (r === 0 || r === n) return 1;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }
    
    updateCombinationFormula() {
        if (this.combinationFormula) {
            const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
            this.combinationFormula.textContent = `C(${this.elements.length},${this.m}) = ${totalCombinations}`;
        }
    }
    
    onMChanged() {
        if (this.mSelector) {
            this.m = parseInt(this.mSelector.value);
            this.updateCombinationFormula();
            this.reset();
            this.generateAllSteps();
            this.createTreeStructure();
            this.safeUpdateDisplay();
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
        if (this.autoBtn) this.autoBtn.textContent = '暫停自動';
        if (this.stepBtn) this.stepBtn.disabled = true;
        
        this.autoInterval = setInterval(() => {
            this.nextStep();
            if (this.stepIndex >= this.recursionSteps.length) {
                this.stopAuto();
            }
        }, 1000);
    }

    stopAuto() {
        this.isAutoMode = false;
        if (this.autoBtn) this.autoBtn.textContent = '自動執行';
        if (this.stepBtn) this.stepBtn.disabled = false;
        
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
    }

    reset() {
        console.log('重置方法被調用');
        
        this.stopAuto();
        this.currentCombination = [];
        this.currentStep = null;
        this.stepIndex = 0;
        this.isRunning = false;
        this.currentStart = 0;
        this.showPruning = false;
        
        if (this.startBtn) this.startBtn.disabled = false;
        if (this.stepBtn) this.stepBtn.disabled = true;
        if (this.autoBtn) {
            this.autoBtn.disabled = true;
            this.autoBtn.textContent = '自動執行';
        }
        if (this.mSelector) this.mSelector.disabled = false;
        
        const totalCombinations = this.calculateCombinations(this.elements.length, this.m);
        if (this.status) {
            this.status.textContent = `準備開始 C(${this.elements.length},${this.m}) 組合枚舉`;
        }
        if (this.combinationsList) {
            this.combinationsList.innerHTML = '';
        }
        
        // 重新創建樹狀結構
        this.createTreeStructure();
        this.safeUpdateDisplay();
    }
}

// 創建專注模式專用的初始化函數
function initFocusCombinationsEnumeration() {
    console.log('開始創建專注模式組合枚舉器...');
    
    // 確保不會重複創建
    if (window.combinationEnumerator && window.combinationEnumerator.isReady) {
        console.log('組合枚舉器已存在且準備就緒');
        return window.combinationEnumerator;
    }
    
    try {
        window.combinationEnumerator = new FocusCombinationsEnumeration();
        console.log('專注模式組合枚舉器創建成功');
        return window.combinationEnumerator;
    } catch (error) {
        console.error('創建組合枚舉器失敗:', error);
        return null;
    }
}

// 暴露給全域使用
window.initFocusCombinationsEnumeration = initFocusCombinationsEnumeration;
window.FocusCombinationsEnumeration = FocusCombinationsEnumeration;