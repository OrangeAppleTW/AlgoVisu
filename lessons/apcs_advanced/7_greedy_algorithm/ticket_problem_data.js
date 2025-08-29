// Ticket Problem Data Management
class TicketProblemData {
    constructor() {
        this.cityCount = 3;
        this.cities = ['A', 'B', 'C'];
        this.costMatrix = [];
        this.originalMatrix = [];
        this.inputMatrix = []; // 保存原始輸入（包含-1）
        this.pathMatrix = [];
        
        // 特殊規則：轉機減少費用
        this.transferDiscount = 50; // 每次轉機減少的費用
        this.visitedPaths = new Set(); // 記錄已經訪問過的路徑
        
        // 演算法執行狀態
        this.currentK = -1;
        this.currentI = -1;
        this.currentJ = -1;
        this.isCompleted = false;
        
        // 初始化預設範例
        this.initializeExample();
    }

    initializeExample() {
        // 使用特別設計的範例，展示轉機折扣的效果
        this.cityCount = 3;
        this.cities = ['A', 'B', 'C'];
        
        // 原始輸入矩陣（包含-1）
        this.inputMatrix = [
            [ -1, 600, 150],  // A到B費用600，A到C費用150
            [200,  -1, 400],  // B到A費用200，B到C費用400
            [300, 350,  -1]   // C到A費用300，C到B費用350
        ];
        
        // 演算法用矩陣（對角線為0）
        this.costMatrix = [
            [  0, 600, 150],
            [200,   0, 400],
            [300, 350,   0]
        ];
        
        this.originalMatrix = this.copyMatrix(this.costMatrix);
        this.initializePathMatrix();
    }

    setCityCount(count) {
        this.cityCount = Math.max(3, Math.min(10, count));
        this.cities = [];
        for (let i = 0; i < this.cityCount; i++) {
            this.cities.push(String.fromCharCode(65 + i)); // A, B, C, ...
        }
        
        // 初始化費用矩陣
        this.costMatrix = Array(this.cityCount)
            .fill(null)
            .map(() => Array(this.cityCount).fill(Infinity));
            
        // 初始化輸入矩陣（保存原始輸入格式）
        this.inputMatrix = Array(this.cityCount)
            .fill(null)
            .map(() => Array(this.cityCount).fill(-1));
            
        // 設定對角線為0（演算法用）
        for (let i = 0; i < this.cityCount; i++) {
            this.costMatrix[i][i] = 0;
        }
        
        this.originalMatrix = this.copyMatrix(this.costMatrix);
        this.initializePathMatrix();
        this.reset();
    }

    initializePathMatrix() {
        // 初始化路徑矩陣，預設直接連接
        this.pathMatrix = Array(this.cityCount)
            .fill(null)
            .map((_, i) => Array(this.cityCount)
                .fill(null)
                .map((_, j) => {
                    if (i === j) return null; // 同一城市
                    if (this.costMatrix[i][j] !== Infinity) return j; // 直接連接
                    return null; // 無法連接
                })
            );
    }

    setCostMatrix(matrix) {
        // 轉換輸入的矩陣格式，-1表示無直達班機
        // 但演算法中同一城市距離必須為0，不能是-1
        this.costMatrix = matrix.map((row, i) => 
            row.map((cost, j) => {
                if (i === j) return 0; // 演算法中同一城市距離必須為0
                return (cost === -1 || cost === null || cost === undefined) ? Infinity : cost;
            })
        );
        
        // 保存原始輸入（包含-1）用於顯示
        this.inputMatrix = this.copyMatrix(matrix);
        this.originalMatrix = this.copyMatrix(this.costMatrix);
        this.initializePathMatrix();
        this.reset();
    }

    copyMatrix(matrix) {
        return matrix.map(row => [...row]);
    }

    reset() {
        this.costMatrix = this.copyMatrix(this.originalMatrix);
        this.initializePathMatrix();
        this.currentK = -1;
        this.currentI = -1;
        this.currentJ = -1;
        this.isCompleted = false;
    }

    formatCost(cost) {
        return cost === Infinity ? '∞' : cost.toString();
    }

    getCityName(index) {
        return this.cities[index] || '';
    }

    getCityIndex(name) {
        return this.cities.indexOf(name);
    }

    // 獲取從城市i到城市j的完整路徑（支援轉機折扣）
    getPath(fromIndex, toIndex) {
        if (this.costMatrix[fromIndex][toIndex] === Infinity) {
            return [];
        }
        
        if (fromIndex === toIndex) {
            return [fromIndex];
        }
        
        // 遞歸重建路徑
        const path = this.reconstructPath(fromIndex, toIndex);
        return path;
    }
    
    // 遞歸重建路徑的輔助方法
    reconstructPath(fromIndex, toIndex) {
        // 檢查是否有中轉點
        const intermediate = this.pathMatrix[fromIndex][toIndex];
        
        if (intermediate === null || intermediate === toIndex) {
            // 直接連接
            return [fromIndex, toIndex];
        } else {
            // 有中轉點，遞歸構建路徑
            const pathToIntermediate = this.reconstructPath(fromIndex, intermediate);
            const pathFromIntermediate = this.reconstructPath(intermediate, toIndex);
            
            // 移除重複的中轉點
            pathToIntermediate.pop(); // 移除路徑末尾的中轉點
            return pathToIntermediate.concat(pathFromIntermediate);
        }
    }

    formatPath(fromIndex, toIndex) {
        const path = this.getPath(fromIndex, toIndex);
        if (path.length === 0) {
            return '無法到達';
        }
        return path.map(index => this.getCityName(index)).join(' → ');
    }

    // 檢查是否有直接航班
    hasDirectFlight(fromIndex, toIndex) {
        return this.originalMatrix[fromIndex][toIndex] !== Infinity && fromIndex !== toIndex;
    }

    // 載入範例資料
    loadExample(exampleNumber = 1) {
        switch (exampleNumber) {
            case 1:
                // 展示轉機折扣效果的範例
                this.setCityCount(3);
                this.setCostMatrix([
                    [ -1, 600, 150],  // 直接A→B費用600，但A→C→B可能更便宜
                    [200,  -1, 400],  // 直接B→C費用400，但B→A→C可能更便宜
                    [300, 350,  -1]   // 將會看到轉機折扣的效果
                ]);
                break;
            case 2:
                this.setCityCount(4);
                this.setCostMatrix([
                    [ -1, 500, 200, 180],
                    [300,  -1, 250, 400],
                    [150, 280,  -1, 120],
                    [220, 380, 160,  -1]
                ]);
                break;
            case 3:
                this.setCityCount(5);
                this.setCostMatrix([
                    [ -1, 400, 300, 500, 600],
                    [350,  -1, 200, 450, 550],
                    [250, 180,  -1, 300, 400],
                    [450, 320, 150,  -1, 250],
                    [550, 480, 350, 200,  -1]
                ]);
                break;
            default:
                this.initializeExample();
        }
    }
}