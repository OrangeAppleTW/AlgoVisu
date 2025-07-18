// 背包問題 UI 管理

class KnapsackUI {
    constructor() {
        this.animations = new Map();
        this.sounds = new Map();
        this.init();
    }
    
    init() {
        this.setupAnimations();
        this.setupResponsiveDesign();
        this.addAccessibilityFeatures();
    }
    
    // 設置動畫效果
    setupAnimations() {
        // 正確答案的動畫效果
        this.animations.set('correct', (element) => {
            element.style.animation = 'correct-pulse 0.6s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 600);
        });
        
        // 錯誤答案的動畫效果
        this.animations.set('wrong', (element) => {
            element.style.animation = 'wrong-shake 0.5s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        });
        
        // 添加 CSS 動畫
        this.addAnimationStyles();
    }
    
    // 添加 CSS 動畫樣式
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes correct-pulse {
                0% { transform: scale(1); background-color: #4caf50; }
                50% { transform: scale(1.1); background-color: #66bb6a; }
                100% { transform: scale(1); background-color: #c8e6c9; }
            }
            
            @keyframes wrong-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); background-color: #f44336; }
                75% { transform: translateX(5px); background-color: #f44336; }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.5); }
                50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
            }
            
            .glow-effect {
                animation: glow 2s infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 播放正確答案動畫
    playCorrectAnimation(element) {
        const animation = this.animations.get('correct');
        if (animation) {
            animation(element);
        }
    }
    
    // 播放錯誤答案動畫
    playWrongAnimation(element) {
        const animation = this.animations.get('wrong');
        if (animation) {
            animation(element);
        }
    }
    
    // 設置響應式設計
    setupResponsiveDesign() {
        this.handleResize();
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    // 處理畫面大小調整
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const gameContent = document.querySelector('.game-content');
        
        if (isMobile) {
            gameContent.style.gridTemplateColumns = '1fr';
        } else {
            gameContent.style.gridTemplateColumns = '1fr 400px';
        }
        
        // 調整表格顯示
        this.adjustTableDisplay();
    }
    
    // 調整表格顯示
    adjustTableDisplay() {
        const table = document.getElementById('dp-table');
        const container = document.querySelector('.dp-table-container');
        
        if (window.innerWidth <= 480) {
            // 極小螢幕上縮小表格
            table.style.fontSize = '12px';
            container.style.fontSize = '12px';
        } else {
            table.style.fontSize = '';
            container.style.fontSize = '';
        }
    }
    
    // 添加無障礙功能
    addAccessibilityFeatures() {
        // 為表格添加 ARIA 標籤
        const table = document.getElementById('dp-table');
        table.setAttribute('role', 'grid');
        table.setAttribute('aria-label', '動態規劃表格');
        
        // 為輸入框添加 ARIA 描述
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('dp-input')) {
                const cell = e.target.parentElement;
                const row = cell.getAttribute('data-row');
                const col = cell.getAttribute('data-col');
                
                e.target.setAttribute('aria-label', 
                    `第 ${row} 行第 ${col} 列的動態規劃值`);
            }
        });
    }
    
    // 顯示載入動畫
    showLoading(message = '載入中...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(loadingDiv);
    }
    
    // 隱藏載入動畫
    hideLoading() {
        const loadingDiv = document.getElementById('loading-overlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    // 顯示成功提示
    showSuccessToast(message) {
        this.showToast(message, 'success');
    }
    
    // 顯示錯誤提示
    showErrorToast(message) {
        this.showToast(message, 'error');
    }
    
    // 顯示資訊提示
    showInfoToast(message) {
        this.showToast(message, 'info');
    }
    
    // 通用提示方法
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        // 設置背景顏色
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // 動畫進入
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自動消失
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // 高亮元素
    highlightElement(element, duration = 2000) {
        element.classList.add('glow-effect');
        setTimeout(() => {
            element.classList.remove('glow-effect');
        }, duration);
    }
    
    // 平滑滾動到元素
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
    
    // 創建確認對話框
    showConfirmDialog(message, onConfirm, onCancel) {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <p>${message}</p>
                <div class="dialog-buttons">
                    <button class="btn-confirm">確認</button>
                    <button class="btn-cancel">取消</button>
                </div>
            </div>
        `;
        
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `;
        
        const dialogBox = dialog.querySelector('.confirm-dialog');
        dialogBox.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        const buttonsDiv = dialog.querySelector('.dialog-buttons');
        buttonsDiv.style.cssText = `
            margin-top: 20px;
            display: flex;
            gap: 10px;
            justify-content: center;
        `;
        
        // 按鈕樣式
        const buttons = dialog.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
            `;
        });
        
        dialog.querySelector('.btn-confirm').style.background = '#4caf50';
        dialog.querySelector('.btn-confirm').style.color = 'white';
        dialog.querySelector('.btn-cancel').style.background = '#f5f5f5';
        dialog.querySelector('.btn-cancel').style.color = '#333';
        
        // 事件綁定
        dialog.querySelector('.btn-confirm').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (onConfirm) onConfirm();
        });
        
        dialog.querySelector('.btn-cancel').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (onCancel) onCancel();
        });
        
        // 點擊背景關閉
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                if (onCancel) onCancel();
            }
        });
        
        document.body.appendChild(dialog);
    }
    
    // 更新按鈕狀態
    updateButtonState(buttonId, state) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        switch (state) {
            case 'disabled':
                button.disabled = true;
                button.style.opacity = '0.5';
                break;
            case 'enabled':
                button.disabled = false;
                button.style.opacity = '1';
                break;
            case 'loading':
                button.disabled = true;
                button.innerHTML = '<span class="loading-spinner"></span> 處理中...';
                break;
        }
    }
    
    // 格式化數字顯示
    formatNumber(number) {
        return new Intl.NumberFormat('zh-TW').format(number);
    }
    
    // 創建工具提示
    createTooltip(element, text) {
        element.setAttribute('title', text);
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, text);
        });
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }
    
    // 顯示工具提示
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.id = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1002;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    }
    
    // 隱藏工具提示
    hideTooltip() {
        const tooltip = document.getElementById('custom-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// 初始化 UI 管理器
document.addEventListener('DOMContentLoaded', () => {
    window.knapsackUI = new KnapsackUI();
});