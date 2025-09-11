| [한국어](../ko/notice.md) | **English** | [日本語](../ja/notice.md) | [简体中文](../zh-cn/notice.md) | [繁體中文](../zh-tw/notice.md) |
|---|---|---|---|---|

## Roadmap (Next Update)

- Currently, the available storage capacity for saving favorites using a Google account is limited to 100kb.
We plan to migrate the storage to Google Drive Appdata.
- We are developing a feature to share favorites.

---

# Changelog

## [2.11.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.10.0...2.11.0) (2025-09-08)

### Features

- Improved DB performance

### Bug Fixes

- Fixed an issue where favorites could not be added if the total data exceeded 8kb (temporary fix)

## [2.10.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.9.0...2.10.0) (2025-09-02)

> I was also busy playing POE2 during the weekend, so the patch was delayed. Sorry about that.
> 
> 
> When I went to the trade page to gear up, I noticed that in Season 3 the background image became brighter, making the extension’s sidebar less visible...
> 

### Features

- Added sidebar opacity adjustment (can be configured in Settings)

### Bug Fixes

- Improved sidebar visibility due to POE2 trade page background change (opacity 20% -> 80%)

## [2.9.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.8.0...2.9.0) (2025-07-29)

### Features

- **settings:** Improved settings window UI

## [2.8.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.7.0...2.8.0) (2025-07-28)

### Features

- Cleaned up unused storage data and overall optimization
- Improved some UI/UX structures
- Improved loading speed of some UI components
- Added Settings button – you can change language, view usage guide, check storage usage, etc.
- Added Japanese support

### Bug Fixes

- Fixed an issue where the sidebar was sometimes shown on the login page
- **popup:** Fixed an issue where the popup was sometimes not loading
- Fixed an issue where the sidebar did not work after the plugin restarted or was updated
- Fixed an issue where clicking **search history** and **favorites** registered on other country pages did not redirect properly