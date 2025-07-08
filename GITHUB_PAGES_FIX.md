# GitHub Pages 路徑修正報告

## 問題描述

在使用 GitHub Pages (`username.github.io/AlgoVisu/`) 部署時，除了首頁以外的其他頁面導覽列出現路徑問題：
- 導覽列圖片無法載入
- 導覽列連結無法正確跳轉
- 原因：缺少專案名稱前綴 `/AlgoVisu/`

## 解決方案

### 1. 修正 `components/navbar.html`
- **舊版本**：使用絕對路徑 `/AlgoVisu/`
- **新版本**：使用模板變數 `{{ROOT}}`，由 JavaScript 動態替換

```html
<!-- 舊版 -->
<a href="/AlgoVisu/index.html" class="navbar-logo">
    <img src="/AlgoVisu/picture/OA_logo2.png" alt="OA Logo">
</a>

<!-- 新版 -->
<a href="{{ROOT}}index.html" class="navbar-logo">
    <img src="{{ROOT}}picture/OA_logo2.png" alt="OA Logo">
</a>
```

### 2. 改進 `components/navbar-loader.js`
- **智能路徑檢測**：自動識別 GitHub Pages 環境
- **相對路徑計算**：根據當前頁面位置計算正確的相對路徑
- **模板替換**：將 `{{ROOT}}` 替換為實際路徑

#### 關鍵功能：

```javascript
/**
 * 獲取基礎路徑（GitHub Pages 環境檢測）
 */
getBasePath() {
    const pathname = window.location.pathname;
    
    // GitHub Pages 環境檢測
    if (pathname.includes('/AlgoVisu/')) {
        return '/AlgoVisu/';
    }
    
    // 本地開發環境
    return '/';
}

/**
 * 計算從當前頁面到根目錄的相對路徑
 */
getRootPath() {
    const pathname = window.location.pathname;
    const basePath = this.basePath;
    
    // 移除基礎路徑，獲取相對路徑
    const relativePath = pathname.replace(basePath, '');
    
    // 計算目錄深度並生成相對路徑
    const segments = relativePath.split('/').filter(segment => segment.length > 0);
    const depth = segments.length;
    
    return depth > 0 ? '../'.repeat(depth) : './';
}
```

### 3. 相容性處理
- **保留 `navbar.js`**：避免舊版頁面出現 404 錯誤
- **添加警告訊息**：提醒開發者使用新版載入器
- **移除重複引用**：清理不必要的 `navbar.js` 引用

## 測試檔案

### 1. `path-test.html` - 根目錄測試
- 測試根目錄的路徑解析
- 驗證導覽列載入狀態
- 檢查圖片和連結路徑

### 2. `lessons/apcs_advanced/1_maze_recursion/deep-path-test.html` - 深層路徑測試
- 測試 3 層深度的路徑解析
- 驗證 `../../../` 路徑計算
- 檢查資源載入狀態

## 修正的檔案列表

### 核心檔案
- ✅ `components/navbar.html` - 改用模板變數
- ✅ `components/navbar-loader.js` - 完全重寫，增加路徑智能檢測
- ✅ `components/navbar.js` - 改為兼容性檔案

### 清理的檔案
- ✅ `lessons/learning_resources/1_sorting/index.html` - 移除重複的 navbar.js 引用
- ✅ `lessons/learning_resources/2_2d_linked_list/index.html` - 移除重複的 navbar.js 引用

### 測試檔案
- ✅ `path-test.html` - 新增根目錄路徑測試
- ✅ `lessons/apcs_advanced/1_maze_recursion/deep-path-test.html` - 新增深層路徑測試

## 部署後驗證

### 本地測試
1. 開啟 `path-test.html` 檢查根目錄路徑
2. 開啟 `deep-path-test.html` 檢查深層路徑
3. 瀏覽各個子頁面，確認導覽列正常顯示

### GitHub Pages 測試
1. 推送到 GitHub 並啟用 Pages
2. 訪問 `https://username.github.io/AlgoVisu/`
3. 點擊導覽列各個連結，確認能正常跳轉
4. 檢查 Logo 圖片是否正常顯示

## 技術特點

### 🚀 環境自適應
- 自動檢測 GitHub Pages 環境
- 支援本地開發和線上部署
- 無需手動配置路徑

### 📁 智能路徑計算
- 動態計算相對路徑深度
- 支援任意層級的頁面結構
- 自動處理 `index.html` 檔案

### 🔧 錯誤處理
- 載入失敗時顯示備用導覽列
- 詳細的 Console 日志輸出
- 向後兼容舊版本引用

### 🎯 精確的活動狀態
- 改進的路徑匹配邏輯
- 支援下拉選單的父級狀態
- 正規化路徑比較

## 後續維護

1. **新增頁面**：只需引用 `navbar-loader.js`，無需手動設置路徑
2. **修改結構**：路徑會自動重新計算，無需修改導覽列
3. **除錯工具**：使用測試頁面快速檢查路徑問題

---

**修正完成時間**: 2025年7月8日  
**修正人員**: Claude Assistant  
**版本**: v2.0 - GitHub Pages 優化版