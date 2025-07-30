# POE2-Trade-Butler

A Chrome extension that adds a sidebar to the POE2 Trade page and provides a history management feature for enhanced
trading experience.

<img src="src/assets/icon.png" alt="icon" align="left" style="margin-right: 12px;"/>

> **Disclaimer**  
> _Not affiliated with Grinding Gear Games; no access to client or API.  
> It simply enhances information shown on the PoE2 trade web page in your browser._

---

<!-- prettier-ignore-start -->

| Chrome Extension                                                             | Downloads                                                                        | GitHub Release                                                 |
|------------------------------------------------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------|
| [![Chrome Web Store][chrome-web-store-version-badge]][chrome-web-store-link] | [![Chrome Web Store Users][chrome-web-store-users-badge]][chrome-web-store-link] | [![GitHub release][github-release-badge]][github-release-link] |

| Build Status                                             | License                                                        | Privacy Policy                                                        |
|----------------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------|
| [![Build Status][build-status-badge]][build-status-link] | [![GitHub license][github-license-badge]][github-license-link] | [![GitHub privacy-policy][privacy-policy-badge]][privacy-policy-link] |

| Sponsors                                                          | Buy Me a Coffee                                                   |
|-------------------------------------------------------------------|-------------------------------------------------------------------|
| [![GitHub sponsors][github-sponsors-badge]][github-sponsors-link] | [![Buy Me a Coffee][buy-me-a-coffee-badge]][buy-me-a-coffee-link] |

<!-- prettier-ignore-end -->

<!-- Badges -->

[chrome-web-store-version-badge]: https://img.shields.io/chrome-web-store/v/ipnemofnhodcgcplnnfekbfpmngeeocm?label=Chrome%20Web%20Store&logo=chromewebstore
[chrome-web-store-users-badge]: https://img.shields.io/chrome-web-store/users/ipnemofnhodcgcplnnfekbfpmngeeocm?logo=chromewebstore
[github-release-badge]: https://img.shields.io/github/v/release/NERDHEAD-lab/POE2-Trade-Butler?logo=github
[build-status-badge]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/actions/workflows/release-please.yml/badge.svg
[github-license-badge]: https://img.shields.io/github/license/NERDHEAD-lab/POE2-Trade-Butler
[privacy-policy-badge]: https://img.shields.io/badge/Privacy%20Policy-Read%20Here-blue
[github-sponsors-badge]: https://img.shields.io/github/sponsors/NERDHEAD-lab?logo=github&logoColor=white
[buy-me-a-coffee-badge]: https://img.shields.io/badge/Buy%20Me%20a%20Coffee-yellow?logo=buymeacoffee&logoColor=white

<!-- Links -->

[chrome-web-store-link]: https://chrome.google.com/webstore/detail/poe2-trade-butler/ipnemofnhodcgcplnnfekbfpmngeeocm
[github-release-link]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/releases
[build-status-link]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/actions
[github-license-link]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/blob/master/LICENSE
[privacy-policy-link]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/blob/master/privacy-policy.md
[github-sponsors-link]: https://github.com/sponsors/NERDHEAD-lab
[buy-me-a-coffee-link]: https://coff.ee/nerdhead_lab

---

## Index

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Privacy Policy](#privacy-policy)
6. [License](#license)
7. [Contact](#contact)

---

## Introduction

**POE2-Trade-Butler** is a Chrome extension tailored for Path of Exile 2 players. It provides an intuitive sidebar on
the trade page, helping users track their trading history and manage searches efficiently. The extension stores all data
locally, ensuring user privacy.

---

## Features

- **Sidebar Integration**: Quickly access tools and information directly on the POE2 Trade page.
- **Search History Management**: View your search history in the sidebar, see how many times you searched for the same
  content, and manage it conveniently.
- **Favorites Management**: Set favorites for easier access, assign unique names to items, and organize them separately.
- **Lightweight and Secure**: Data is stored locally on your device, ensuring privacy and performance.

---

## Installation

Follow these steps to install the extension:

1. Clone the repository:
   ```bash
   git clone https://github.com/NERDHEAD-lab/POE2-Trade-Butler.git
   ```
2. Navigate to the project directory:
   ```bash
   cd POE2-Trade-Butler
   ```
3. Build the project:
   ```bash
   npm run build
   ```
   - Build the project with no minification (for development):
     ```bash
     npm run build:dev
     ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`.
   - Enable **Developer Mode**.
   - Click **Load Unpacked** and select the `dist` folder.

---

## Usage

1. Open the Path of Exile 2 Trade page.
2. Use the sidebar to search, track, and manage your trades.
3. View your search history, manage favorites, and update preferences from the extension settings.

---

## Privacy Policy

This extension values your privacy. All data is processed and stored locally on your browser. No data is transmitted to
external servers. For full details, refer to our [Privacy Policy][privacy-policy].

[privacy-policy]: ./privacy-policy.md

---

## License

This project is licensed under the [MIT License][MIT License].

[MIT License]: ./LICENSE

---

## Contact

For feedback or support, please contact:

- **Email**: nerdlab.kr@gmail.com
- **GitHub Issues**: [Issue Page][github-issues-link]

[github-issues-link]: https://github.com/NERDHEAD-lab/POE2-Trade-Butler/issues

---

Enjoy seamless trading with **POE2-Trade-Butler**!<br>
`I'm not Frontend Developer. Just a Backend. 🥕🥕`
