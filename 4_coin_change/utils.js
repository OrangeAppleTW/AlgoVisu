// ----- 共用函数 -----

/**
 * 禁用或启用指定算法的按钮
 * @param {string} algorithm - 算法类型（'greedy'或'dp'）
 * @param {boolean} disable - 是否禁用按钮
 * @param {boolean} exceptGenerate - 是否保留生成问题按钮的启用状态
 */
function disableButtons(algorithm, disable, exceptGenerate = false) {
    const buttons = document.querySelectorAll(`button[id^="${algorithm}-"]`);
    
    buttons.forEach(button => {
        // 如果exceptGenerate为true且是生成按钮，则保持其启用状态
        if (exceptGenerate && button.id === `${algorithm}-generate`) {
            return;
        }
        
        // 启动按钮在禁用时保持启用状态，在启用时禁用
        if (button.id === `${algorithm}-start`) {
            button.disabled = (disable) ? true : false;
        }
        
        // 暂停按钮在禁用时禁用，在启用时启用
        else if (button.id === `${algorithm}-pause`) {
            button.disabled = (disable) ? false : true;
        }
        
        // 其他按钮（如重置）根据disable参数设置
        else {
            button.disabled = disable;
        }
    });
}

/**
 * 睡眠函数，用于动画延迟
 * @param {number} ms - 睡眠毫秒数
 * @returns {Promise} - 延迟Promise
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 标签切换函数
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的活跃状态
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加当前标签的活跃状态
            tab.classList.add('active');
            
            // 显示对应的内容
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// 页面加载时初始化标签切换
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
});