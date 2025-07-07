# 🔄 頁面轉換快速指南

## 目標
將現有的硬編碼導覽列轉換為動態載入的組件化導覽列。

## 📋 手動轉換步驟

### 步驟1：移除現有導覽列HTML

在你的HTML檔案中，找到並**刪除**這整個區塊：

```html
<nav class="navbar">
    <div class="navbar-container">
        <!-- ... 一大堆導覽列HTML ... -->
    </div>
</nav>
```

**替換為：**
```html
<!-- 導覽列將由 JavaScript 動態載入 -->
```

### 步驟2：添加腳本引用

在 `</body>` 標籤前，**原有的**：
```html
<script src="navbar.js"></script>
</body>
```

**改為**（根據你的檔案層級調整路徑）：

#### 根目錄檔案（如 index.html）
```html
<script src="components/navbar-loader.js"></script>
<script src="navbar.js"></script>
</body>
```

#### 一層子目錄檔案（如 1_sorting/index.html）
```html
<script src="../components/navbar-loader.js"></script>
<script src="../navbar.js"></script>
</body>
```

#### 二層子目錄檔案（如 1_sorting/bubble-sort/bubble.html）
```html
<script src="../../components/navbar-loader.js"></script>
<script src="../../navbar.js"></script>
</body>
```

## 📁 需要轉換的檔案清單

### ✅ 已完成示範
- `index.html` （根目錄）
- `1_sorting/index.html` （排序演算法主頁）

### 🔄 待轉換檔案

#### 主要頁面
- [ ] `2_2d_linked_list/index.html`
- [ ] `3_maze_recursion/index.html`

#### 排序演算法子頁面
- [ ] `1_sorting/bubble-sort/bubble.html`
- [ ] `1_sorting/selection-sort/selection.html`
- [ ] `1_sorting/insertion-sort/insertion.html`
- [ ] `1_sorting/quick-sort/quick.html`
- [ ] `1_sorting/merge-sort/merge.html`

#### 其他子頁面
- [ ] `2_2d_linked_list/matrix-visualizer/index.html`
- [ ] 其他有導覽列的HTML檔案

## 🔍 轉換驗證

轉換完成後，檢查：

1. **頁面能正常載入** - 導覽列應該出現
2. **連結路徑正確** - 點擊導覽列項目能正確跳轉
3. **活動狀態正確** - 當前頁面的導覽項目會高亮顯示
4. **下拉選單運作** - 滑鼠懸停時下拉選單正常顯示

## 🚀 使用自動化腳本（可選）

如果你有安裝 Node.js，可以使用自動化腳本：

```bash
# 在專案根目錄執行
node components/convert-pages.js

# 如果需要恢復
node components/convert-pages.js --restore

# 查看說明
node components/convert-pages.js --help
```

## 🎯 轉換完成後的好處

1. **統一維護** - 只需修改 `components/navbar.html` 一個檔案
2. **新增功能** - 在導覽列添加新項目時，所有頁面自動更新
3. **路徑自動調整** - 系統會自動處理不同層級的路徑問題
4. **更好的結構** - 代碼更乾淨，維護更容易

## ⚠️ 注意事項

- 轉換前建議先備份重要檔案
- 確保 `components/navbar.html` 和 `components/navbar-loader.js` 存在
- 路徑計算錯誤時，查看瀏覽器控制台的錯誤訊息
- 如有問題，檢查 `components/README.md` 的詳細說明