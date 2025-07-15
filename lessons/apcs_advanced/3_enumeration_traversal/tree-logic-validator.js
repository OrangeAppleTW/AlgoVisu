// 組合枚舉樹狀圖修復驗證腳本
// 用於驗證修復是否在所有頁面都正常工作

class TreeLogicValidator {
    constructor() {
        this.testResults = {};
        this.totalTests = 0;
        this.passedTests = 0;
    }

    // 運行所有驗證測試
    runAllTests() {
        console.log('🚀 開始組合枚舉樹狀圖邏輯驗證...');
        
        this.testNodeContentDisplay();
        this.testEdgeConnections();
        this.testTreeStructureLogic();
        this.testKeyPaths();
        
        this.generateReport();
        return this.testResults;
    }

    // 測試節點內容顯示
    testNodeContentDisplay() {
        console.log('\n📋 測試1: 節點內容顯示邏輯');
        
        const expectedNodes = [
            { id: 'node-1s_2s_3s', expected: '{1,2,3}', description: '三元素組合節點' },
            { id: 'node-1s_2s', expected: '{1,2}', description: '二元素組合節點' },
            { id: 'node-1s_2n_3s', expected: '{1,3}', description: '跳躍組合節點' },
            { id: 'node-1_s', expected: '{1}', description: '單元素節點' },
            { id: 'node-1n_2n_3n', expected: '∅', description: '空集節點' },
            { id: 'node-root', expected: '{}', description: '根節點' }
        ];

        let passed = 0;
        expectedNodes.forEach(test => {
            const node = document.getElementById(test.id);
            if (node) {
                const actualContent = node.textContent.trim();
                if (actualContent === test.expected) {
                    console.log(`  ✅ ${test.description}: ${actualContent}`);
                    passed++;
                } else {
                    console.log(`  ❌ ${test.description}: 期望 "${test.expected}", 實際 "${actualContent}"`);
                }
            } else {
                console.log(`  ❌ ${test.description}: 節點不存在`);
            }
            this.totalTests++;
        });

        this.testResults.nodeContent = { passed, total: expectedNodes.length };
        this.passedTests += passed;
        console.log(`  📊 節點內容測試: ${passed}/${expectedNodes.length} 通過`);
    }

    // 測試邊連接
    testEdgeConnections() {
        console.log('\n🔗 測試2: 邊連接邏輯');
        
        const expectedEdges = [
            { from: 'root', to: '1_s', description: '根節點 → 選擇1' },
            { from: 'root', to: '1_n', description: '根節點 → 跳過1' },
            { from: '1s_2s', to: '1s_2s_3s', description: '{1,2} → {1,2,3} (選擇3)' },
            { from: '1s_2s', to: '1s_2s_3n', description: '{1,2} → {1,2} (跳過3)' },
            { from: '1s_2n', to: '1s_2n_3s', description: '{1} → {1,3} (選擇3)' },
            { from: '1s_2n', to: '1s_2n_3n', description: '{1} → {1} (跳過3)' },
            { from: '1n_2s', to: '1n_2s_3s', description: '{2} → {2,3} (選擇3)' },
            { from: '1n_2s', to: '1n_2s_3n', description: '{2} → {2} (跳過3)' },
            { from: '1n_2n', to: '1n_2n_3s', description: '{} → {3} (選擇3)' },
            { from: '1n_2n', to: '1n_2n_3n', description: '{} → {} (跳過3)' }
        ];

        let passed = 0;
        expectedEdges.forEach(test => {
            const edgeId = `edge-${test.from}-${test.to}`;
            const edge = document.getElementById(edgeId);
            if (edge) {
                console.log(`  ✅ ${test.description}`);
                passed++;
            } else {
                console.log(`  ❌ 缺失: ${test.description}`);
            }
            this.totalTests++;
        });

        this.testResults.edgeConnections = { passed, total: expectedEdges.length };
        this.passedTests += passed;
        console.log(`  📊 邊連接測試: ${passed}/${expectedEdges.length} 通過`);
    }

    // 測試樹狀結構邏輯
    testTreeStructureLogic() {
        console.log('\n🌳 測試3: 樹狀結構邏輯');
        
        const structureTests = [
            {
                name: '每個第2層節點都有兩個子節點',
                check: () => {
                    const level2Nodes = ['1s_2s', '1s_2n', '1n_2s', '1n_2n'];
                    return level2Nodes.every(nodeId => {
                        const selectEdge = document.getElementById(`edge-${nodeId}-${nodeId}_3s`);
                        const skipEdge = document.getElementById(`edge-${nodeId}-${nodeId}_3n`);
                        return selectEdge && skipEdge;
                    });
                }
            },
            {
                name: '關鍵路徑存在: {} → {1} → {1,2} → {1,2,3}',
                check: () => {
                    const pathNodes = ['root', '1_s', '1s_2s', '1s_2s_3s'];
                    const pathEdges = ['edge-root-1_s', 'edge-1_s-1s_2s', 'edge-1s_2s-1s_2s_3s'];
                    
                    const nodesExist = pathNodes.every(nodeId => {
                        const elementId = nodeId === 'root' ? 'node-root' : `node-${nodeId}`;
                        return document.getElementById(elementId);
                    });
                    
                    const edgesExist = pathEdges.every(edgeId => document.getElementById(edgeId));
                    
                    return nodesExist && edgesExist;
                }
            },
            {
                name: '所有葉節點都在第3層',
                check: () => {
                    const leafNodes = [
                        '1s_2s_3s', '1s_2s_3n', '1s_2n_3s', '1s_2n_3n',
                        '1n_2s_3s', '1n_2s_3n', '1n_2n_3s', '1n_2n_3n'
                    ];
                    
                    return leafNodes.every(nodeId => {
                        const node = document.getElementById(`node-${nodeId}`);
                        return node !== null;
                    });
                }
            }
        ];

        let passed = 0;
        structureTests.forEach(test => {
            if (test.check()) {
                console.log(`  ✅ ${test.name}`);
                passed++;
            } else {
                console.log(`  ❌ ${test.name}`);
            }
            this.totalTests++;
        });

        this.testResults.treeStructure = { passed, total: structureTests.length };
        this.passedTests += passed;
        console.log(`  📊 樹狀結構測試: ${passed}/${structureTests.length} 通過`);
    }

    // 測試關鍵路徑
    testKeyPaths() {
        console.log('\n🎯 測試4: 關鍵路徑驗證');
        
        const keyPaths = [
            {
                name: '空集到滿組合路徑',
                nodes: ['root', '1_s', '1s_2s', '1s_2s_3s'],
                expectedContent: ['{}', '{1}', '{1,2}', '{1,2,3}']
            },
            {
                name: '選擇性跳過路徑',
                nodes: ['root', '1_s', '1s_2n', '1s_2n_3s'],
                expectedContent: ['{}', '{1}', '{1}', '{1,3}']
            },
            {
                name: '完全跳過路徑',
                nodes: ['root', '1_n', '1n_2n', '1n_2n_3n'],
                expectedContent: ['{}', '∅', '∅', '∅']
            }
        ];

        let passed = 0;
        keyPaths.forEach(pathTest => {
            let pathValid = true;
            
            for (let i = 0; i < pathTest.nodes.length; i++) {
                const nodeId = pathTest.nodes[i];
                const elementId = nodeId === 'root' ? 'node-root' : `node-${nodeId}`;
                const node = document.getElementById(elementId);
                
                if (!node) {
                    console.log(`  ❌ ${pathTest.name}: 節點 ${nodeId} 不存在`);
                    pathValid = false;
                    break;
                }
                
                const actualContent = node.textContent.trim();
                const expectedContent = pathTest.expectedContent[i];
                
                if (actualContent !== expectedContent) {
                    console.log(`  ❌ ${pathTest.name}: 節點 ${nodeId} 內容錯誤，期望 "${expectedContent}", 實際 "${actualContent}"`);
                    pathValid = false;
                    break;
                }
            }
            
            if (pathValid) {
                console.log(`  ✅ ${pathTest.name}`);
                passed++;
            }
            this.totalTests++;
        });

        this.testResults.keyPaths = { passed, total: keyPaths.length };
        this.passedTests += passed;
        console.log(`  📊 關鍵路徑測試: ${passed}/${keyPaths.length} 通過`);
    }

    // 生成驗證報告
    generateReport() {
        console.log('\n📊 === 驗證報告總結 ===');
        console.log(`總測試數量: ${this.totalTests}`);
        console.log(`通過測試數量: ${this.passedTests}`);
        console.log(`成功率: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
        
        if (this.passedTests === this.totalTests) {
            console.log('🎉 所有測試通過！組合枚舉樹狀圖邏輯修復成功！');
        } else {
            console.log('⚠️ 仍有部分測試失敗，需要進一步檢查。');
        }
        
        // 詳細分類報告
        console.log('\n📋 分類測試結果:');
        Object.entries(this.testResults).forEach(([category, result]) => {
            const percentage = ((result.passed / result.total) * 100).toFixed(1);
            console.log(`  ${category}: ${result.passed}/${result.total} (${percentage}%)`);
        });
        
        return {
            totalTests: this.totalTests,
            passedTests: this.passedTests,
            successRate: (this.passedTests / this.totalTests) * 100,
            details: this.testResults
        };
    }
}

// 全域函數供外部調用
window.validateTreeLogic = function() {
    const validator = new TreeLogicValidator();
    return validator.runAllTests();
};

// 自動運行驗證（如果DOM已準備好）
document.addEventListener('DOMContentLoaded', function() {
    // 延遲運行驗證，等待樹狀圖完全載入
    setTimeout(() => {
        if (document.getElementById('combination-tree')) {
            console.log('自動運行樹狀圖邏輯驗證...');
            window.validateTreeLogic();
        }
    }, 2000);
});

console.log('🔧 樹狀圖邏輯驗證器已載入。使用 validateTreeLogic() 手動運行驗證。');