// 合併排序主控制器
class MergeSortController {
    constructor() {
        this.array = [5, 3, 8, 6, 2, 7, 1, 4];
        this.originalArray = [...this.array];
        this.isRunning = false;
        this.isPaused = false;
        this.stepMode = false;
        this.speed = 5;
        this.currentStep = 0;
        this.steps = [];
        
        // 初始化組件
        this.algorithm = new MergeSortAlgorithm();
        this.renderer = new MergeSortRenderer();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateSteps();
        this.renderer.renderInitialState(this.originalArray);
        this.updateStatus('準備開始合併排序演示');
        this.updateStepInfo('準備開始', '點擊「開始排序」來觀看合併排序的完整過程');
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('step-btn').addEventListener('click', () => this.step());
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    generateSteps() {
        this.steps = this.algorithm.generateSteps(this.originalArray);
    }

    async start() {
        if (this.isPaused) {
            this.isPaused = false;
            this.updateButtons();
            await this.continueAnimation();
            return;
        }

        this.isRunning = true;
        this.stepMode = false;
        this.currentStep = 0;
        this.updateButtons();
        await this.runAnimation();
    }

    pause() {
        this.isPaused = true;
        this.updateButtons();
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.stepMode = false;
        this.currentStep = 0;
        this.array = [...this.originalArray];
        this.updateButtons();
        this.renderer.renderInitialState(this.originalArray);
        this.updateStatus('準備開始合併排序演示');
        this.updateStepInfo('準備開始', '點擊「開始排序」來觀看合併排序的完整過程');
    }

    async step() {
        if (!this.stepMode) {
            this.stepMode = true;
            this.isRunning = true;
            this.currentStep = 0;
        }

        if (this.currentStep < this.steps.length) {
            await this.executeStep(this.steps[this.currentStep]);
            this.currentStep++;
        }

        if (this.currentStep >= this.steps.length) {
            this.isRunning = false;
            this.stepMode = false;
            this.updateButtons();
            this.updateStatus('排序完成！');
        }
        
        this.updateButtons();
    }

    async runAnimation() {
        for (let i = this.currentStep; i < this.steps.length && this.isRunning && !this.isPaused; i++) {
            await this.executeStep(this.steps[i]);
            this.currentStep = i + 1;
            await this.delay();
        }

        if (this.currentStep >= this.steps.length) {
            this.isRunning = false;
            this.updateButtons();
            this.updateStatus('排序完成！所有元素已正確排序');
        }
    }

    async continueAnimation() {
        for (let i = this.currentStep; i < this.steps.length && this.isRunning && !this.isPaused; i++) {
            await this.executeStep(this.steps[i]);
            this.currentStep = i + 1;
            await this.delay();
        }

        if (this.currentStep >= this.steps.length) {
            this.isRunning = false;
            this.updateButtons();
            this.updateStatus('排序完成！所有元素已正確排序');
        }
    }

    async executeStep(step) {
        this.updateStepInfo(`步驟 ${this.currentStep + 1}`, step.description);
        this.updateStatus(this.getStatusMessage(step));
        this.renderer.renderStep(step);
    }

    getStatusMessage(step) {
        switch (step.type) {
            case 'divide':
                return `正在分割陣列，層級：${step.level}`;
            case 'merge_start':
                return `開始合併操作，層級：${step.level}`;
            case 'merge_compare':
                return `比較並選擇元素：${step.chosen}`;
            case 'merge_remaining':
                return `複製剩餘元素`;
            case 'merge_complete':
                return `合併完成，層級：${step.level}`;
            default:
                return '執行中...';
        }
    }

    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const resetBtn = document.getElementById('reset-btn');
        const stepBtn = document.getElementById('step-btn');

        if (this.isRunning && !this.isPaused && !this.stepMode) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            resetBtn.disabled = false;
            stepBtn.disabled = true;
        } else if (this.isPaused) {
            startBtn.disabled = false;
            startBtn.textContent = '繼續';
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            stepBtn.disabled = false;
        } else if (this.stepMode && this.currentStep < this.steps.length) {
            startBtn.disabled = false;
            startBtn.textContent = '自動播放';
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            stepBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            startBtn.textContent = '開始排序';
            pauseBtn.disabled = true;
            resetBtn.disabled = false;
            stepBtn.disabled = false;
        }
    }

    updateStatus(message) {
        document.getElementById('status-display').textContent = message;
    }

    updateStepInfo(counter, description) {
        document.getElementById('step-counter').textContent = counter;
        document.getElementById('step-description').textContent = description;
    }

    delay() {
        const delayTime = Math.max(100, 1100 - (this.speed * 100));
        return new Promise(resolve => setTimeout(resolve, delayTime));
    }
}

// 初始化視覺化器
document.addEventListener('DOMContentLoaded', function() {
    new MergeSortController();
});