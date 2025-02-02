# CHANGE LOG

---
> Each version is divided into one or more of the following categories:
> - **FEATURES**: New features that enhance the project’s functionality.
> - **IMPROVEMENTS**: Enhancements to existing features or performance improvements.
> - **BUG FIXES**: Resolved issues or bugs that were present in previous versions.
> - **INTERNAL**: Internal changes that do not affect the end-user.
---


## 1.2.6
### INTERNAL
- fix logic in PR close workflow when writing CHANGELOG_UPDATE.md


## 1.2.5
---
> Each version is divided into one or more of the following categories:
> - **FEATURES**: New features that enhance the project’s functionality.
> - **IMPROVEMENTS**: Enhancements to existing features or performance improvements.
> - **BUG FIXES**: Resolved issues or bugs that were present in previous versions.
> - **INTERNAL**: Internal changes that do not affect the end-user.
---

### INTERNAL
- fix workflow while generate commit message
- improved changelog automatically from PR body


## 1.2.2
### INTERNAL
- Added change version automatically with script in package.json.
- Improved GitHub release action.
  - Set as the latest release when changelog exists without INTERNAL category.

## 1.2.1
### INTERNAL
- Added RELEASE NOTE in GitHub action.

## 1.2.0
### FEATURES
- Added a new feature to manage search history.
  - can disable history tracking.
- Added a new feature to manage favorites.
  - can add directly from the search result.

### INTERNAL
- Added RELEASE NOTE in GitHub action.

### IMPROVEMENTS
- improved alert and confirm event handling.
- improved remove history action.
  - remove without favorites. 

## 1.1.3
### INTERNAL
- Fixed an GitHub release action issue.

## 1.1.2
### INTERNAL
- Added GitHub release action

## 1.1.1
### INTERNAL
- init GitHub actions

## 1.1.0
### FEATURES
- refactor code & GUI.
- Add a favorites list.

### BUG FIXES
- Fixed an intermittent issue where the specified history name was reset to its ID.

## 1.0.0
### FEATURES
- Initial release