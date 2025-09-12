| [한국어](../ko/notice.md) | [English](../en/notice.md) | [日本語](../ja/notice.md) | **简体中文** | [繁體中文](../zh_TW/notice.md) |
|---|---|---|---|---|

## Roadmap (Next Update)

- 当前用于存储收藏的 Google 账号存储空间限制为 100kb。
计划迁移到 Google Drive Appdata。
- 正在开发收藏共享功能。

---

# Changelog

## [2.11.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.10.0...2.11.0) (2025-09-08)

### Features

- 数据库性能优化

### Bug Fixes

- 修复当收藏数据超过 8kb 时无法新增的问题（临时）

## [2.10.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.9.0...2.10.0) (2025-09-02)

> 周末我也在努力玩 POE2，所以补丁迟了，很抱歉。
> 正好去交易所页面准备配装备，结果发现因为 S3 背景变亮，插件的可视性变差了...


### Features

- 新增侧边栏不透明度调整功能（可在设置中查看）

### Bug Fixes

- 改善因 POE2 交易所背景更换导致的侧边栏可视性问题（不透明度 20% -> 80%）

## [2.9.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.8.0...2.9.0) (2025-07-29)

### Features

- **settings:** 改进设置窗口 UI

## [2.8.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.7.0...2.8.0) (2025-07-28)

### Features

- 清理不再使用的存储数据并进行整体优化
- 改善部分 UI/UX 结构
- 提升部分 UI 加载速度
- 新增设置按钮 - 可切换语言、查看使用指南和存储使用情况
- 新增日语支持

### Bug Fixes

- 修复登录页面偶尔会显示侧边栏的问题
- **popup:** 改善偶尔弹窗无法加载的问题
- 修复插件重启或更新时侧边栏无法运行的问题
- 修复在其他国家页面点击 **搜索记录** 和 **收藏** 时无法正确跳转的问题