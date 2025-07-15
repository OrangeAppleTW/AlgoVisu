# 組合枚舉專注教學模式

## 功能概述

專注教學模式是為APCS進階班組合枚舉演示設計的教學輔助功能，提供16:9比例的彈出視窗，專門用於課堂投影和教學演示。

## 文件結構

```
3_enumeration_traversal/
├── combinations-enumeration.html          # 主頁面（已增加專注模式按鈕）
├── combinations-focus-mode.html           # 專注教學模式頁面
├── focus-mode-styles.css                  # 專注模式專用樣式
├── focus-mode-launcher.js                 # 專注模式啟動器
├── focus-mode-sync.js                     # 狀態同步功能
├── focus-mode-init.js                     # 專注模式初始化
└── README-focus-mode.md                   # 本說明文件
```

## 功能特點

### 🎯 專注教學設計
- **16:9 比例**：適合各種投影設備和螢幕分享
- **去除干擾**：移除導覽、側邊欄等不必要元素
- **大字體**：優化教學可視性
- **雙區佈局**：樹狀圖（70%）+ 控制面板（30%）

### 🔄 狀態同步
- **即時同步**：專注視窗與主頁面狀態保持一致
- **智能恢復**：開啟時自動恢復主頁面當前進度
- **獨立操作**：可在專注視窗中獨立控制演算法執行

### 📱 響應式適應
- **自動縮放**：根據螢幕大小自動調整視窗尺寸
- **保持比例**：始終維持16:9的最佳教學比例
- **彈性佈局**：小螢幕自動切換為垂直佈局

## 使用方法

### 開啟專注模式
1. 在組合枚舉主頁面點擊「🎯 專注教學模式」按鈕
2. 系統自動計算最佳視窗大小並開啟新視窗
3. 專注視窗自動同步主頁面的當前狀態

### 快速鍵操作
- **空白鍵**：開始/繼續執行
- **R鍵**：重新開始
- **ESC鍵**：關閉專注視窗

### 狀態同步
- 開啟時自動同步主頁面狀態
- 主頁面關閉時專注視窗自動關閉
- 可在兩個視窗間獨立操作

## 技術實現

### 視窗管理
```javascript
// 16:9比例計算
const windowWidth = Math.min(screenWidth * 0.8, 1280);
const windowHeight = Math.round(windowWidth * 9 / 16);

// 居中顯示
const left = (screenWidth - windowWidth) / 2;
const top = (screenHeight - windowHeight) / 2;
```

### 狀態同步機制
```javascript
// 主頁面提供狀態
window.getCurrentState = function() {
    return {
        n: combinationEnumerator.n,
        m: combinationEnumerator.m,
        currentStep: combinationEnumerator.currentStep,
        solutions: combinationEnumerator.solutions,
        // ... 其他狀態
    };
};

// 專注視窗同步狀態
function syncWithMainWindow() {
    const mainState = window.opener?.getCurrentState?.();
    if (mainState) {
        // 恢復狀態...
    }
}
```

## 教學場景

### 課堂教學
- 投影到大螢幕進行演示
- 專注於演算法核心概念
- 減少學生注意力分散

### 線上教學
- 螢幕分享時畫面清晰
- 16:9比例適合各種平台
- 專業的教學演示效果

### 錄製教學影片
- 固定比例便於後製
- 專注內容突出重點
- 高品質視覺效果

## 瀏覽器相容性

- **Chrome/Edge**: 完全支援
- **Firefox**: 完全支援
- **Safari**: 完全支援
- **注意**：需要允許彈出視窗權限

## 故障排除

### 無法開啟專注視窗
1. 檢查瀏覽器彈出視窗設定
2. 允許此網站開啟彈出視窗
3. 暫時關閉彈出視窗阻擋器

### 狀態同步失敗
1. 確保主頁面未關閉
2. 重新開啟專注視窗
3. 檢查瀏覽器控制台錯誤訊息

### 顯示異常
1. 嘗試調整視窗大小
2. 重新整理專注視窗
3. 檢查螢幕解析度設定

## 開發說明

### 新增其他演算法的專注模式
1. 複製 `focus-mode-*.js` 檔案
2. 修改同步狀態的資料結構
3. 調整視覺化元件的樣式
4. 更新 HTML 模板中的控制面板

### 自定義樣式
- 修改 `focus-mode-styles.css` 調整外觀
- 調整 `.focus-container` 的網格比例
- 自定義 `.tree-node` 等視覺化元素

### 擴展功能
- 添加更多鍵盤快速鍵
- 實現多視窗狀態同步
- 集成錄製功能

## 更新日誌

### v1.0.0 (2025-07-14)
- ✅ 初始版本發布
- ✅ 16:9 專注視窗功能
- ✅ 狀態同步機制
- ✅ 響應式佈局
- ✅ 鍵盤快速鍵支援
- ✅ 彈出視窗管理

## 貢獻指南

歡迎對專注教學模式功能提出改進建議：

1. **回報問題**：在 GitHub Issues 中描述遇到的問題
2. **功能建議**：提出新的教學輔助功能想法
3. **程式碼貢獻**：提交 Pull Request 改進現有功能

## 授權資訊

本專注教學模式功能遵循專案主要授權條款。