# 導覽列組件使用說明

## 📋 概述

為了方便維護，我們將導覽列抽取成獨立的組件。現在只需要修改一個檔案就能更新所有頁面的導覽列。

## 📁 檔案結構

```
AlgoVisu/
├── components/
│   ├── navbar.html          # 導覽列HTML模板
│   └── navbar-loader.js     # 動態載入邏輯
├── index.html               # 主頁面
├── 1_sorting/
│   └── index.html           # 子頁面
└── ...
```

## 🚀 如何使用

### 1. 在HTML頁面中引入

在你的HTML頁面的 `<body>` 標籤結束前加入：

```html
<script src="components/navbar-loader.js"></script>
<script src="navbar.js"></script> <!-- 如果需要額外的導覽列功能 -->
```

### 2. 路徑自動調整

系統會自動偵測頁面層級並調整路徑：
- 根目錄頁面：`components/navbar-loader.js`
- 一層子目錄：`../components/navbar-loader.js`
- 二層子目錄：`../../components/navbar-loader.js`

### 3. 移除原有的導覽列HTML

從你的HTML檔案中移除整個 `<nav class="navbar">...</nav>` 區塊，系統會自動載入。

## ✏️ 如何修改導覽列

### 修改導覽列內容

編輯 `components/navbar.html` 檔案：

```html
<nav class="navbar">
    <div class="navbar-container">
        <a href="../index.html" class="navbar-logo">
            <img src="../picture/OA_logo2.png" alt="OA Logo" class="logo-img">
        </a>
        <div class="navbar-links">
            <!-- 在這裡修改選單項目 -->
            <div class="nav-dropdown">
                <a href="#" class="nav-link dropdown-toggle">新分類</a>
                <div class="dropdown-menu">
                    <a href="../new_section/index.html" class="dropdown-link">新項目</a>
                </div>
            </div>
        </div>
    </div>
</nav>
```

### 添加新的選單項目

1. 在 `navbar.html` 中添加新的 `nav-dropdown` 或 `dropdown-link`
2. 儲存檔案
3. 所有頁面會自動更新！

## 🔧 進階功能

### 手動重新載入導覽列

```javascript
// 建立新的載入器實例
const navLoader = new NavbarLoader();
```

### 自訂路徑深度

如果自動偵測不準確，可以手動指定：

```javascript
class CustomNavbarLoader extends NavbarLoader {
    calculateDepth() {
        return 2; // 強制設定為2層深度
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new CustomNavbarLoader();
});
```

## 🎨 樣式自訂

導覽列的樣式仍然在 `styles.css` 中定義，包括：
- `.navbar` - 主導覽列容器
- `.nav-dropdown` - 下拉選單
- `.dropdown-menu` - 下拉選單內容
- `.dropdown-link` - 下拉選單連結

## 🐛 故障排除

### 導覽列沒有顯示
1. 檢查 `components/navbar-loader.js` 路徑是否正確
2. 打開瀏覽器開發者工具查看錯誤訊息
3. 確認 `components/navbar.html` 檔案存在

### 路徑不正確
系統會自動調整路徑，但如果有問題：
1. 檢查 console 輸出的路徑資訊
2. 手動調整 `calculateDepth()` 方法

### 備用方案
如果載入失敗，系統會自動顯示備用導覽列，確保基本功能可用。

## 📝 範例：轉換現有頁面

### 轉換前
```html
<body>
    <nav class="navbar">
        <!-- 大量HTML代碼 -->
    </nav>
    <div class="container">
        <!-- 頁面內容 -->
    </div>
    <script src="../navbar.js"></script>
</body>
```

### 轉換後
```html
<body>
    <!-- 導覽列將由 JavaScript 動態載入 -->
    <div class="container">
        <!-- 頁面內容 -->
    </div>
    <script src="../components/navbar-loader.js"></script>
    <script src="../navbar.js"></script>
</body>
```

這樣就完成了！以後添加新功能時，只需要修改 `components/navbar.html` 一個檔案就能更新所有頁面的導覽列。