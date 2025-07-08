import '../styles/popup.css';
import { getMessage } from '../utils/_locale';
import * as version from '../utils/versionChecker';

const GITHUB_URL = 'https://github.com/NERDHEAD-lab/POE2-Trade-Butler';
const GITHUB_SPONSOR_URL = 'https://github.com/sponsors/NERDHEAD-lab';
const BUY_ME_A_COFFEE_URL = 'https://coff.ee/nerdhead_lab';


function createBadgeSection() {
  const badgeSection = document.createElement('div');
  badgeSection.className = 'badge-section';

  // GitHub 섹션
  const githubSection = document.createElement('div');
  githubSection.className = 'badge-subsection';
  githubSection.innerHTML = `
    <div class="badge-section-title" style="display:flex;align-items:center;gap:6px;">
      ${getMessage('popup_powered_by', 'NERDHEAD-lab')}
      <a href="${GITHUB_URL}" target="_blank" rel="noopener" title="GitHub Repository" style="display:inline-flex;align-items:center;">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" style="height:18px;width:18px;vertical-align:middle;opacity:0.7;margin-left:2px;" />
      </a>
    </div>
  `;

  // 기부/스폰서 섹션
  const sponsorSection = document.createElement('div');
  sponsorSection.className = 'badge-subsection';
  sponsorSection.innerHTML = `
    <div class="badge-section-title">${getMessage('popup_support_please')}</div>
    <a href="${GITHUB_SPONSOR_URL}" target="_blank" rel="noopener" title="GitHub Sponsor">
      <img src="https://img.shields.io/github/sponsors/NERDHEAD-lab?label=Sponsor&logo=github&style=flat" alt="GitHub Sponsor" style="height:32px; margin-bottom:2px;" />
    </a>
    <a href="${BUY_ME_A_COFFEE_URL}" target="_blank" rel="noopener" title="Buy Me a Coffee">
      <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-yellow?logo=buymeacoffee&logoColor=white" alt="Buy Me a Coffee" style="height:32px;" />
    </a>
  `;

  badgeSection.appendChild(githubSection);
  badgeSection.appendChild(sponsorSection);
  return badgeSection;
}

async function createVersionSection(parent: HTMLElement, refreshForce: boolean = false) {
  const versionSection = document.createElement('div');
  versionSection.className = 'version-section';
  versionSection.style.marginTop = '18px';
  versionSection.style.textAlign = 'center';
  const installedVersion = await version.getInstalledVersion();

  const contentNode: HTMLElement = document.createElement('div');
  contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${installedVersion}</b> <span style="color:#aaa;">(${createSpinner().outerHTML})</span>`;
  versionSection.appendChild(contentNode);
  parent.appendChild(versionSection);

  async function updateVersionSection() {
    const versionCheckResult = await version.getCachedCheckVersion(refreshForce);
    switch (versionCheckResult.versionType) {
      case 'LATEST':
        contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:green;">(${getMessage('popup_latest_version')})</span>`;
        break;
      case 'NEW_VERSION_AVAILABLE':
        contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:orange;">(<a href="https://chrome.google.com/webstore/detail/${version.CHROME_WEBSTORE_ID}" target="_blank" rel="noopener" style="color:orange;text-decoration:underline;font-weight:bold;">${getMessage('popup_new_version_available', versionCheckResult.latestVersion)}</a>)</span>`;
        break;
      case 'DEV':
        contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:#007bff;">(${getMessage('popup_dev_version')})</span>`;
        break;
      default:
        const span = document.createElement('span');
        const spinner = createSpinner();
        span.innerHTML = `재확인 ${spinner.outerHTML}`;
        Object.assign(span.style, {
          color: '#aaa',
          cursor: 'pointer',
          textDecoration: 'underline',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        });

        // 스피너를 클릭하면 강제로 최신 버전 확인
        span.addEventListener('click', () => {
          span.closest('.version-section')?.remove();
          createVersionSection(parent, true);
        });

        contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b>`;
        contentNode.appendChild(span);
    }
  }

  //0.1 ~ 2초 후 실행 - 로딩 중 표시를 위해
  setTimeout(updateVersionSection, Math.random() * 1900 + 100);
}

function createSpinner(size: number = 14) {
  const spinner = document.createElement('span');
  spinner.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 50 50" style="vertical-align:middle;">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#aaa" stroke-width="5" opacity="0.2"/>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#007bff" stroke-width="5"
        stroke-linecap="round"
        stroke-dasharray="31.4 188.4"
        stroke-dashoffset="0">
        <animateTransform attributeName="transform" type="rotate"
          from="0 25 25" to="360 25 25"
          dur="0.9s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;
  spinner.style.display = 'inline-block';
  spinner.style.margin = '0 2px -2px 2px';
  return spinner;
}

async function renderPopupMenu() {
  const root = document.body;
  root.innerHTML = '';
  root.style.minWidth = '260px';
  root.style.maxWidth = '340px';

  // 뱃지
  root.appendChild(createBadgeSection());

  // 2. (로딩 중) 표기 먼저 추가
  void createVersionSection(root); // latest=null
}

document.addEventListener('DOMContentLoaded', renderPopupMenu);
