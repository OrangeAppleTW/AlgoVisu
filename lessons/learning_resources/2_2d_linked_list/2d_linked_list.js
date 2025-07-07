// 二維鏈表節點類
class Node {
    constructor(value, row, col) {
        this.value = value;
        this.row = row;
        this.col = col;
        this.up = null;
        this.down = null;
        this.left = null;
        this.right = null;
    }
}

// 共通的輔助函數
function getRandomMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.floor(Math.random() * 100);
        }
    }
    return matrix;
}

function create2DLinkedList(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const nodeMatrix = [];
    
    // 創建節點
    for (let i = 0; i < rows; i++) {
        nodeMatrix[i] = [];
        for (let j = 0; j < cols; j++) {
            nodeMatrix[i][j] = new Node(matrix[i][j], i, j);
        }
    }
    
    // 設置節點之間的連接
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // 上方連接
            if (i > 0) {
                nodeMatrix[i][j].up = nodeMatrix[i-1][j];
            }
            
            // 下方連接
            if (i < rows - 1) {
                nodeMatrix[i][j].down = nodeMatrix[i+1][j];
            }
            
            // 左方連接
            if (j > 0) {
                nodeMatrix[i][j].left = nodeMatrix[i][j-1];
            }
            
            // 右方連接
            if (j < cols - 1) {
                nodeMatrix[i][j].right = nodeMatrix[i][j+1];
            }
        }
    }
    
    return nodeMatrix;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function disableButtons(prefix, disabled, exceptReset = false) {
    document.getElementById(`${prefix}-generate`).disabled = disabled;
    document.getElementById(`${prefix}-start`).disabled = disabled;
    document.getElementById(`${prefix}-pause`).disabled = !disabled;
    if (!exceptReset) {
        document.getElementById(`${prefix}-reset`).disabled = disabled;
    }
}

// 頁簽切換功能
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // 移除所有活動狀態
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 設置活動狀態
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 頁面加載時初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initRepresentation();
    initSearch();
    initRecursive();
});
