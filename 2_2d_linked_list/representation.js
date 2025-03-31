// ----- 座標表示 -----
let representationMatrix = [];
let representationNodes = [];

function initRepresentation() {
    const container = document.getElementById('grid-representation');
    const generateBtn = document.getElementById('representation-generate');
    const sizeSelect = document.getElementById('representation-size');
    const nodeStructureView = document.getElementById('node-structure');
    const statusText = document.getElementById('representation-status');
    
    generateBtn.addEventListener('click', generateGrid);
    sizeSelect.addEventListener('change', () => {
        if (representationMatrix.length > 0) {
            generateGrid();
        }
    });
    
    function generateGrid() {
        const size = parseInt(sizeSelect.value);
        representationMatrix = getRandomMatrix(size);
        representationNodes = create2DLinkedList(representationMatrix);
        renderGrid();
        
        statusText.textContent = '網格已生成，點擊任意節點查看其連接關係';
    }
    
    function renderGrid() {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${representationMatrix.length}, 40px)`;
        
        for (let i = 0; i < representationMatrix.length; i++) {
            for (let j = 0; j < representationMatrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = representationMatrix[i][j];
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => {
                    highlightNode(i, j);
                    displayNodeStructure(i, j);
                });
                
                container.appendChild(cell);
            }
        }
    }
    
    function highlightNode(row, col) {
        // 清除之前的所有高亮
        const cells = container.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            cell.classList.remove('highlight');
            cell.classList.remove('path');
        });
        
        // 高亮當前節點
        const currentCell = container.querySelector(`.matrix-cell[data-row="${row}"][data-col="${col}"]`);
        currentCell.classList.add('highlight');
        
        // 高亮相連的節點
        const node = representationNodes[row][col];
        
        if (node.up) {
            const upCell = container.querySelector(`.matrix-cell[data-row="${node.up.row}"][data-col="${node.up.col}"]`);
            upCell.classList.add('path');
        }
        
        if (node.down) {
            const downCell = container.querySelector(`.matrix-cell[data-row="${node.down.row}"][data-col="${node.down.col}"]`);
            downCell.classList.add('path');
        }
        
        if (node.left) {
            const leftCell = container.querySelector(`.matrix-cell[data-row="${node.left.row}"][data-col="${node.left.col}"]`);
            leftCell.classList.add('path');
        }
        
        if (node.right) {
            const rightCell = container.querySelector(`.matrix-cell[data-row="${node.right.row}"][data-col="${node.right.col}"]`);
            rightCell.classList.add('path');
        }
    }
    
    function displayNodeStructure(row, col) {
        const node = representationNodes[row][col];
        
        let structureText = `節點(${row}, ${col})的連接關係:\n`;
        structureText += `值: ${node.value}\n`;
        structureText += `上: ${node.up ? `節點(${node.up.row}, ${node.up.col}), 值=${node.up.value}` : '無'}\n`;
        structureText += `下: ${node.down ? `節點(${node.down.row}, ${node.down.col}), 值=${node.down.value}` : '無'}\n`;
        structureText += `左: ${node.left ? `節點(${node.left.row}, ${node.left.col}), 值=${node.left.value}` : '無'}\n`;
        structureText += `右: ${node.right ? `節點(${node.right.row}, ${node.right.col}), 值=${node.right.value}` : '無'}\n`;
        
        nodeStructureView.textContent = structureText;
    }
}