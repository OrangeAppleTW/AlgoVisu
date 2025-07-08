# 導覽列系統使用說明

## 🎯 概述

AlgoVisu 項目現在使用新的智能導覽列系統，能夠自動處理 GitHub Pages 部署時的路徑問題，確保在不同環境下都能正常運作。

## 🚀 快速開始

### 新頁面開發
在任何新的 HTML 頁面中，只需要加入一行 JavaScript 引用：

```html
<script src="相對路徑/components/navbar-loader.js"></script>
```

**根據頁面位置調整相對路徑：**
- 根目錄頁面：`components/navbar-loader.js`
- 一層子目錄：`../components/navbar-loader.js`
- 兩層子目錄：`../../components/navbar-loader.js`
- 三層子目錄：`../../../components/navbar-loader.js`

### 不需要的操作
❌ **不需要手動設置路徑**  
❌ **不需要修改導覽列 HTML**  
❌ **不需要考慮部署環境差異**  

## 📁 項目結構與路徑

```
AlgoVisu/
├── index.html                          (根目錄)
├── components/
│   ├── navbar.html                     (導覽列模板)
│   ├── navbar-loader.js                (智能載入器)
│   └── navbar.js                       (兼容性檔案)
├── lessons/
│   ├── apcs_advanced/                  (一層深度)
│   │   ├── index.html
│   │   └── 1_maze_recursion/           (二層深度)
│   │       ├── index.html
│   │       └── interactive-maze.html   (三層深度)
│   └── learning_resources/             (一層深度)
│       ├── index.html
│       └── 1_sorting/                  (二層深度)
│           ├── index.html
│           └── bubble-sort/            (三層深度)
│               └── bubble.html
└── styles/
    └── styles.css
```

## 🔧 系統特性

### 自動環境檢測
- **本地開發**：`http://localhost/AlgoVisu/`
- **GitHub Pages**：`https://username.github.io/AlgoVisu/`
- **其他部署環境**：自動適應

### 智能路徑計算
系統會自動：
1. 檢測當前頁面位置
2. 計算到根目錄的相對路徑
3. 調整導覽列中所有連結
4. 載入正確的圖片資源

### 活動狀態管理
- 自動高亮當前頁面的導覽連結
- 支援下拉選單的父級狀態
- 精確的路徑匹配邏輯

## 🧪 測試與除錯

### 測試頁面
1. **根目錄測試**：開啟 `path-test.html`
2. **深層路徑測試**：開啟 `lessons/apcs_advanced/1_maze_recursion/deep-path-test.html`

### Console 調試
開啟瀏覽器開發者工具，查看 Console 輸出：

```
🔧 基礎路徑: /AlgoVisu/
🏠 根目錄路徑: ../../../
🔄 正在載入導覽列: ../../../components/navbar.html
✅ 導覽列載入成功
```

### 常見問題診斷

#### 問題：導覽列沒有顯示
**檢查步驟：**
1. 確認 `navbar-loader.js` 路徑正確
2. 查看 Console 是否有錯誤訊息
3. 檢查 `navbar.html` 檔案是否存在

#### 問題：圖片載入失敗
**檢查步驟：**
1. 開啟測試頁面檢查路徑計算
2. 確認 `picture/OA_logo2.png` 檔案存在
3. 查看 Console 中的路徑輸出

#### 問題：連結跳轉錯誤
**檢查步驟：**
1. 檢查目標頁面是否存在
2. 確認 `navbar.html` 中的路徑設定
3. 測試不同層級的頁面跳轉

## 📝 頁面範例

### 基本頁面結構
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>頁面標題</title>
    <link rel="stylesheet" href="正確路徑/styles/styles.css">
</head>
<body>
    <!-- 導覽列會自動載入到這裡 -->
    
    <div class="container">
        <!-- 頁面內容 -->
    </div>
    
    <!-- 只需要這一行！ -->
    <script src="正確路徑/components/navbar-loader.js"></script>
</body>
</html>
```

### 不同層級的引用範例
```html
<!-- 根目錄 (index.html) -->
<script src="components/navbar-loader.js"></script>

<!-- 一層子目錄 (lessons/apcs_advanced/index.html) -->
<script src="../../components/navbar-loader.js"></script>

<!-- 二層子目錄 (lessons/apcs_advanced/1_maze_recursion/index.html) -->
<script src="../../../components/navbar-loader.js"></script>
```

## 🔄 遷移指南

### 從舊版本遷移
如果你的頁面目前使用：
```html
<script src="navbar.js"></script>
```

請改為：
```html
<script src="navbar-loader.js"></script>
```

並移除重複的 `navbar.js` 引用。

### CSS 樣式兼容
新系統與現有的 CSS 樣式完全兼容，不需要修改任何樣式檔案。

## 📞 技術支援

如果遇到問題：
1. 首先查看測試頁面的輸出
2. 檢查 Console 中的錯誤訊息
3. 參考本文檔的故障排除部分
4. 查看 `GITHUB_PAGES_FIX.md` 了解技術細節

---

**更新日期**: 2025年7月8日  
**版本**: v2.0