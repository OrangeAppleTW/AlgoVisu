#!/usr/bin/env node

/**
 * 批次轉換腳本 - 將所有頁面轉換為使用組件化導覽列
 * 
 * 使用方法：
 * 1. 安裝 Node.js
 * 2. 在專案根目錄執行：node components/convert-pages.js
 */

const fs = require('fs');
const path = require('path');

class PageConverter {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.convertedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
    }

    /**
     * 主要轉換函數
     */
    async convertAllPages() {
        console.log('🚀 開始批次轉換頁面...\n');
        
        try {
            await this.scanAndConvert(this.projectRoot);
            
            console.log('\n📊 轉換完成統計：');
            console.log(`✅ 成功轉換：${this.convertedCount} 個檔案`);
            console.log(`⏭️  已跳過：${this.skippedCount} 個檔案`);
            console.log(`❌ 轉換失敗：${this.errorCount} 個檔案`);
            
        } catch (error) {
            console.error('❌ 批次轉換失敗：', error);
        }
    }

    /**
     * 掃描目錄並轉換HTML檔案
     */
    async scanAndConvert(dirPath, currentDepth = 0) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                // 跳過某些目錄
                if (this.shouldSkipDirectory(item)) {
                    continue;
                }
                
                // 遞迴處理子目錄
                await this.scanAndConvert(itemPath, currentDepth + 1);
                
            } else if (stat.isFile() && item.endsWith('.html')) {
                // 處理HTML檔案
                await this.convertPage(itemPath, currentDepth);
            }
        }
    }

    /**
     * 檢查是否應該跳過目錄
     */
    shouldSkipDirectory(dirName) {
        const skipDirs = ['.git', 'node_modules', '.vscode', 'components'];
        return skipDirs.includes(dirName);
    }

    /**
     * 轉換單個頁面
     */
    async convertPage(filePath, depth) {
        try {
            const relativePath = path.relative(this.projectRoot, filePath);
            
            let content = fs.readFileSync(filePath, 'utf-8');
            
            // 檢查是否已經轉換過
            if (content.includes('navbar-loader.js')) {
                console.log(`⏭️  已跳過（已轉換）：${relativePath}`);
                this.skippedCount++;
                return;
            }

            // 檢查是否包含導覽列
            if (!content.includes('<nav class="navbar">')) {
                console.log(`⏭️  已跳過（無導覽列）：${relativePath}`);
                this.skippedCount++;
                return;
            }
            
            // 執行轉換
            const newContent = this.performConversion(content, depth);
            
            if (newContent !== content) {
                // 備份原檔案
                const backupPath = filePath + '.backup';
                fs.writeFileSync(backupPath, content);
                
                // 寫入新內容
                fs.writeFileSync(filePath, newContent);
                
                console.log(`✅ 轉換成功：${relativePath}`);
                this.convertedCount++;
            } else {
                console.log(`⏭️  已跳過（無需轉換）：${relativePath}`);
                this.skippedCount++;
            }
            
        } catch (error) {
            console.error(`❌ 轉換失敗：${path.relative(this.projectRoot, filePath)}`, error.message);
            this.errorCount++;
        }
    }

    /**
     * 執行實際的內容轉換
     */
    performConversion(content, depth) {
        // 移除導覽列HTML
        const navbarRegex = /<nav class="navbar">[\s\S]*?<\/nav>/;
        let newContent = content.replace(navbarRegex, '<!-- 導覽列將由 JavaScript 動態載入 -->');
        
        // 計算navbar-loader.js的相對路徑
        const pathPrefix = depth === 0 ? './' : '../'.repeat(depth);
        const loaderPath = `${pathPrefix}components/navbar-loader.js`;
        
        // 添加navbar-loader.js引用
        if (newContent.includes('<script src="navbar.js"></script>')) {
            newContent = newContent.replace(
                '<script src="navbar.js"></script>',
                `<script src="${loaderPath}"></script>\n    <script src="navbar.js"></script>`
            );
        } else if (newContent.includes('<script src="../navbar.js"></script>')) {
            newContent = newContent.replace(
                '<script src="../navbar.js"></script>',
                `<script src="${loaderPath}"></script>\n    <script src="../navbar.js"></script>`
            );
        } else if (newContent.includes('<script src="../../navbar.js"></script>')) {
            newContent = newContent.replace(
                '<script src="../../navbar.js"></script>',
                `<script src="${loaderPath}"></script>\n    <script src="../../navbar.js"></script>`
            );
        } else {
            // 如果找不到navbar.js，在body結束前添加
            newContent = newContent.replace(
                '</body>',
                `    <script src="${loaderPath}"></script>\n</body>`
            );
        }
        
        return newContent;
    }

    /**
     * 恢復所有備份檔案
     */
    restoreBackups() {
        console.log('🔄 開始恢復備份檔案...\n');
        this.restoreBackupsInDir(this.projectRoot);
        console.log('\n✅ 備份恢復完成');
    }

    /**
     * 在目錄中恢復備份
     */
    restoreBackupsInDir(dirPath) {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
                this.restoreBackupsInDir(itemPath);
            } else if (item.endsWith('.html.backup')) {
                const originalPath = itemPath.replace('.backup', '');
                fs.copyFileSync(itemPath, originalPath);
                fs.unlinkSync(itemPath);
                
                const relativePath = path.relative(this.projectRoot, originalPath);
                console.log(`🔄 已恢復：${relativePath}`);
            }
        }
    }
}

// 主程式
async function main() {
    const args = process.argv.slice(2);
    const converter = new PageConverter();
    
    if (args.includes('--restore')) {
        converter.restoreBackups();
    } else if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📖 批次轉換腳本使用說明

使用方法：
  node components/convert-pages.js        # 轉換所有頁面
  node components/convert-pages.js --restore  # 恢復備份檔案
  node components/convert-pages.js --help     # 顯示此說明

功能：
  ✅ 自動移除舊的導覽列HTML
  ✅ 添加navbar-loader.js引用
  ✅ 自動計算正確的相對路徑
  ✅ 建立備份檔案（.backup）
  ✅ 支援恢復備份

注意事項：
  - 轉換前會自動建立備份檔案
  - 如果頁面已轉換過會自動跳過
  - 支援多層目錄結構
`);
    } else {
        await converter.convertAllPages();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = PageConverter;