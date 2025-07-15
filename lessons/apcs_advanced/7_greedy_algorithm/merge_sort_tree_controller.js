// 合併排序樹狀結構主控制器
class MergeSortTreeController {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = MERGE_SORT_STEPS.length;
        this.isAutoPlaying = false;
        this.autoPlaySpeed = 2000; // 2秒間隔
        this.autoPlayTimer = null;
        
        // 初始化組件
        this.renderer = new MergeSortTreeRenderer();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateButtons();
    }

    setupEventListeners() {
        // 步驟導航按鈕
        document.getElementById('prev-btn').addEventListener('click', () => this.previousStep());
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        
        // 控制按鈕
        document.getElementById('auto-play-btn').addEventListener('click', () => this.toggleAutoPlay());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        document.getElementById('jump-to-end-btn').addEventListener('click', () => this.jumpToEnd());
    }

    // 上一步
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDisplay();
            this.updateButtons();
        }
    }

    // 下一步
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.updateDisplay();
            this.updateButtons();
        }
    }

    // 重置到開始
    reset() {
        this.stopAutoPlay();
        this.currentStep = 0;
        this.updateDisplay();
        this.updateButtons();
    }

    // 跳到結尾
    jumpToEnd() {
        this.stopAutoPlay();
        this.currentStep = this.totalSteps - 1;
        this.updateDisplay();
        this.updateButtons();
    }

    // 切換自動播放
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    // 開始自動播放
    startAutoPlay() {
        this.isAutoPlaying = true;
        const autoPlayBtn = document.getElementById('auto-play-btn');
        autoPlayBtn.textContent = '停止播放';
        autoPlayBtn.classList.add('btn-secondary');
        
        this.autoPlayTimer = setInterval(() => {
            if (this.currentStep < this.totalSteps - 1) {
                this.nextStep();
            } else {
                this.stopAutoPlay();
            }
        }, this.autoPlaySpeed);
        
        this.updateButtons();
    }

    // 停止自動播放
    stopAutoPlay() {
        this.isAutoPlaying = false;
        const autoPlayBtn = document.getElementById('auto-play-btn');
        autoPlayBtn.textContent = '自動播放';
        autoPlayBtn.classList.remove('btn-secondary');
        
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        
        this.updateButtons();
    }

    // 更新顯示
    updateDisplay() {
        const stepData = MERGE_SORT_STEPS[this.currentStep];
        
        // 更新步驟計數器
        document.getElementById('step-display').textContent = 
            `步驟 ${this.currentStep + 1} / ${this.totalSteps}`;
        
        // 更新描述
        document.getElementById('step-description').textContent = stepData.description;
        
        // 更新狀態
        document.getElementById('status-display').textContent = stepData.status;
        
        // 渲染樹狀結構
        this.renderer.animateStep(stepData);
    }

    // 更新按鈕狀態
    updateButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const autoPlayBtn = document.getElementById('auto-play-btn');
        
        // 上一步按鈕
        prevBtn.disabled = this.currentStep === 0 || this.isAutoPlaying;
        
        // 下一步按鈕
        nextBtn.disabled = this.currentStep === this.totalSteps - 1 || this.isAutoPlaying;
        
        // 自動播放按鈕
        if (this.currentStep === this.totalSteps - 1 && !this.isAutoPlaying) {
            autoPlayBtn.disabled = true;
        } else {
            autoPlayBtn.disabled = false;
        }
    }

    // 跳轉到指定步驟
    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.totalSteps) {
            this.stopAutoPlay();
            this.currentStep = stepIndex;
            this.updateDisplay();
            this.updateButtons();
        }
    }

    // 獲取當前步驟信息
    getCurrentStepInfo() {
        return MERGE_SORT_STEPS[this.currentStep];
    }

    // 設置自動播放速度
    setAutoPlaySpeed(speed) {
        this.autoPlaySpeed = speed;
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }
}

// 初始化控制器
document.addEventListener('DOMContentLoaded', function() {
    new MergeSortTreeController();
});