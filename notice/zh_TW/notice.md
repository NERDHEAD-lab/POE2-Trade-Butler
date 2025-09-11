| [한국어](../ko/notice.md) | [English](../en/notice.md) | [日本語](../ja/notice.md) | [简体中文](../zh_CN/notice.md) | **繁體中文** |
|---|---|---|---|---|

## Roadmap (Next Update)

- 目前用於儲存收藏的 Google 帳號空間限制為 100kb。
計劃遷移至 Google Drive Appdata。
- 正在開發收藏分享功能。

---

# Changelog

## [2.11.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.10.0...2.11.0) (2025-09-08)

### Features

- 資料庫效能改善

### Bug Fixes

- 修復當收藏資料超過 8kb 時無法新增的問題（暫時）

## [2.10.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.9.0...2.10.0) (2025-09-02)

> 週末我也在努力玩 POE2，所以補丁遲了，不好意思。
正要去交易所頁面準備配裝，結果發現因為 S3 背景變亮，插件的可視性變差了...
> 

### Features

- 新增側邊欄不透明度調整功能（可在設定中查看）

### Bug Fixes

- 改善因 POE2 交易所背景更換導致的側邊欄可視性問題（不透明度 20% -> 80%）

## [2.9.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.8.0...2.9.0) (2025-07-29)

### Features

- **settings:** 改善設定視窗 UI

## [2.8.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.7.0...2.8.0) (2025-07-28)

### Features

- 清理不再使用的儲存資料並進行整體最佳化
- 改善部分 UI/UX 結構
- 提升部分 UI 載入速度
- 新增設定按鈕 - 可切換語言、查看使用指南和儲存使用情況
- 新增日語支援

### Bug Fixes

- 修復登入頁面偶爾會顯示側邊欄的問題
- **popup:** 改善偶爾彈窗無法載入的問題
- 修復插件重新啟動或更新時側邊欄無法運作的問題
- 修復在其他國家頁面點擊 **搜尋記錄** 和 **收藏** 時無法正確跳轉的問題