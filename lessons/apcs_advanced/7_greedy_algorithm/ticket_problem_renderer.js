// Ticket Problem Renderer - 專注於表格視覺化
class TicketProblemRenderer {
    constructor(svgElement, data) {
        this.data = data;
        // 不需要SVG相關功能，專注於表格
    }

    // 渲染費用矩陣表格
    renderCostMatrix(data) {
        const table = document.getElementById('cost-matrix');
        const header = document.getElementById('matrix-header');
        const body = document.getElementById('matrix-body');
        
        // 清空現有內容
        header.innerHTML = '';
        body.innerHTML = '';
        
        // 建立表頭
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // 左上角空格
        
        for (let j = 0; j < data.cityCount; j++) {
            const th = document.createElement('th');
            th.textContent = data.cities[j];
            headerRow.appendChild(th);
        }
        header.appendChild(headerRow);
        
        // 建立表格內容
        for (let i = 0; i < data.cityCount; i++) {
            const row = document.createElement('tr');
            
            // 行標籤
            const th = document.createElement('th');
            th.textContent = data.cities[i];
            row.appendChild(th);
            
            // 費用資料
            for (let j = 0; j < data.cityCount; j++) {
                const td = document.createElement('td');
                td.setAttribute('data-i', i);
                td.setAttribute('data-j', j);
                
                if (i === j) {
                    td.textContent = '0'; // 演算法中同一城市距離為0
                    td.className = 'diagonal-cell';
                } else {
                    td.textContent = data.formatCost(data.costMatrix[i][j]);
                    
                    // 應用樣式類別
                    if (i === data.currentK || j === data.currentK) {
                        td.classList.add('cell-transfer');
                    }
                    
                    if (i === data.currentI && j === data.currentJ) {
                        td.classList.add('cell-considering');
                    }
                    
                    if (i === data.currentI) {
                        td.classList.add('cell-source');
                    }
                    
                    if (j === data.currentJ) {
                        td.classList.add('cell-destination');
                    }
                    
                    // 無限大的特殊樣式
                    if (data.costMatrix[i][j] === Infinity) {
                        td.classList.add('infinity-cell');
                    }
                }
                
                row.appendChild(td);
            }
            
            body.appendChild(row);
        }
    }

    // 渲染輸入矩陣
    renderInputMatrix(data) {
        const container = document.getElementById('cost-matrix-input');
        container.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'cost-input-table';
        
        // 表頭
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // 左上角空格
        
        for (let j = 0; j < data.cityCount; j++) {
            const th = document.createElement('th');
            th.textContent = data.cities[j];
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 表格內容
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < data.cityCount; i++) {
            const row = document.createElement('tr');
            
            // 行標籤
            const th = document.createElement('th');
            th.textContent = data.cities[i];
            row.appendChild(th);
            
            // 輸入欄位
            for (let j = 0; j < data.cityCount; j++) {
                const td = document.createElement('td');
                
                if (i === j) {
                    // 對角線顯示-1
                    td.className = 'diagonal-cell';
                    td.textContent = '-1';
                } else {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '-1';
                    input.max = '9999';
                    input.id = `cost-${i}-${j}`;
                    
                    // 設定預設值（使用原始輸入格式）
                    if (data.inputMatrix && data.inputMatrix[i] && data.inputMatrix[i][j] !== undefined) {
                        input.value = data.inputMatrix[i][j];
                    } else {
                        const currentCost = data.originalMatrix[i][j];
                        input.value = currentCost === Infinity ? -1 : currentCost;
                    }
                    
                    td.appendChild(input);
                }
                
                row.appendChild(td);
            }
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
    }

    // 渲染結果表格
    renderResultTable(data) {
        const container = document.getElementById('result-table-container');
        container.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'algorithm-table';
        
        // 表頭
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // 左上角
        
        for (let j = 0; j < data.cityCount; j++) {
            const th = document.createElement('th');
            th.textContent = data.cities[j];
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 表格內容
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < data.cityCount; i++) {
            const row = document.createElement('tr');
            
            // 行標籤
            const th = document.createElement('th');
            th.textContent = data.cities[i];
            row.appendChild(th);
            
            // 費用和路徑
            for (let j = 0; j < data.cityCount; j++) {
                const td = document.createElement('td');
                
                if (i === j) {
                    td.textContent = '0'; // 演算法結果中同一城市距離為0
                    td.className = 'diagonal-cell';
                } else {
                    const cost = data.costMatrix[i][j];
                    const path = data.formatPath(i, j);
                    
                    if (cost === Infinity) {
                        td.innerHTML = '<div>∞</div><small>無法到達</small>';
                        td.className = 'infinity-cell';
                    } else {
                        td.innerHTML = `<div><strong>${cost}</strong></div><small>${path}</small>`;
                    }
                }
                
                row.appendChild(td);
            }
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
    }

    // 更新城市選擇下拉選單
    updateCitySelectors(data) {
        const fromSelect = document.getElementById('from-city');
        const toSelect = document.getElementById('to-city');
        
        if (!fromSelect || !toSelect) return;
        
        // 清空現有選項
        fromSelect.innerHTML = '<option value="">選擇出發城市</option>';
        toSelect.innerHTML = '<option value="">選擇目的城市</option>';
        
        // 添加城市選項
        data.cities.forEach(city => {
            const fromOption = document.createElement('option');
            fromOption.value = city;
            fromOption.textContent = city;
            fromSelect.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = city;
            toOption.textContent = city;
            toSelect.appendChild(toOption);
        });
    }

    // 顯示路線查詢結果
    showRouteResult(routeInfo) {
        const resultDiv = document.getElementById('path-result');
        if (!resultDiv) return;
        
        if (!routeInfo || !routeInfo.hasPath) {
            resultDiv.innerHTML = '無法找到路線';
            resultDiv.className = 'path-result';
            return;
        }
        
        const isDirectFlight = routeInfo.path.split(' → ').length === 2;
        const flightType = isDirectFlight ? '直達班機' : '轉機航班';
        
        resultDiv.innerHTML = `
            <div><strong>${routeInfo.from} → ${routeInfo.to}</strong></div>
            <div>最低費用：<span style="color: #e74c3c; font-weight: bold;">${routeInfo.cost}</span></div>
            <div>路線：${routeInfo.path}</div>
            <div>類型：${flightType}</div>
        `;
        resultDiv.className = 'path-result has-result';
    }
}