import '../styles/information.scss';

import { getMessage } from '../utils/_locale';
import * as version from '../utils/versionChecker';

const GITHUB_URL = 'https://github.com/NERDHEAD-lab/POE2-Trade-Butler';
const GITHUB_SPONSOR_URL = 'https://github.com/sponsors/NERDHEAD-lab';
const BUY_ME_A_COFFEE_URL = 'https://coff.ee/nerdhead_lab';

export function attachInformationSections(parent: HTMLElement) {
  const informationElement = document.createElement('div');
  informationElement.className = 'poe2-information';
  parent.appendChild(informationElement);

  const badgeSection = document.createElement('div');
  informationElement.appendChild(badgeSection);
  const logoSection = document.createElement('div');
  informationElement.appendChild(logoSection);
  const versionSection = document.createElement('div');
  informationElement.appendChild(versionSection);

  void attachBadgeSection(badgeSection);
  void attachLogoSection(logoSection);
  void attachVersionSection(versionSection);
}

function attachBadgeSection(badgeSection: HTMLDivElement): Promise<HTMLDivElement> {
  return new Promise(() => {
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
      <img src="https://img.shields.io/github/sponsors/NERDHEAD-lab?label=Sponsor&logo=github&style=flat" alt="GitHub Sponsor"/>
    </a>
    <a href="${BUY_ME_A_COFFEE_URL}" target="_blank" rel="noopener" title="Buy Me a Coffee">
      <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-yellow?logo=buymeacoffee&logoColor=white" alt="Buy Me a Coffee"/>
    </a>
  `;

    // 피드백 섹션
    const feedbackSection = document.createElement('div');
    feedbackSection.className = 'badge-subsection';
    feedbackSection.innerHTML = `
    <a href="${GITHUB_URL}/issues" target="_blank" rel="noopener" title="${getMessage('popup_feedback')}">
      <img src="https://img.shields.io/github/issues/NERDHEAD-lab/POE2-Trade-Butler?label=${getMessage('popup_feedback')}&style=flat" alt="${getMessage('popup_feedback')}"/>
    </a>
    <a href="https://chrome.google.com/webstore/detail/${version.CHROME_WEBSTORE_ID}/reviews" target="_blank" rel="noopener" title="${getMessage('popup_review_this_extension')}">
      <img src="https://img.shields.io/chrome-web-store/stars/${version.CHROME_WEBSTORE_ID}?label=${getMessage('popup_review_this_extension')}" alt="${getMessage('popup_review_this_extension')}"/>
    </a>
  `;

    badgeSection.appendChild(githubSection);
    badgeSection.appendChild(sponsorSection);
    badgeSection.appendChild(feedbackSection);
    return badgeSection;
  });
}

async function attachLogoSection(logo: HTMLDivElement): Promise<HTMLDivElement> {
  return version
    .checkVersion()
    .then(version => version.versionType)
    .then(versionType => {
      const iconUrl = chrome.runtime.getURL('assets/icon.png');
      const iconDevUrl = chrome.runtime.getURL('assets/icon-dev.png');
      const img = document.createElement('img');
      img.src = versionType === 'DEV' ? iconDevUrl : iconUrl;
      logo.className = 'logo';
      img.alt = 'POE2 Trade Butler Logo';
      Object.assign(img.style, {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
        margin: '0 auto'
      });
      Object.assign(logo.style, {
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        cursor: 'pointer'
      });

      logo.appendChild(img);

      return logo;
    });
}

async function attachVersionSection(
  versionSection: HTMLDivElement,
  refreshForce: boolean = false
): Promise<HTMLDivElement> {
  return version.getInstalledVersion().then(installedVersion => {
    versionSection.className = 'version-section';
    versionSection.style.marginTop = '18px';
    versionSection.style.textAlign = 'center';

    const contentNode: HTMLElement = document.createElement('div');
    contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${installedVersion}</b> <span style="color:#aaa;">(${createSpinner().outerHTML})</span>`;
    versionSection.appendChild(contentNode);

    async function updateVersionSection() {
      const versionCheckResult = await version.getCachedCheckVersion(refreshForce);
      switch (versionCheckResult.versionType) {
        case 'LATEST':
          contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:green;">(${getMessage('popup_latest_version')})</span>`;
          break;
        case 'NEW_VERSION_AVAILABLE':
          // contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:orange;">(<a href="https://chrome.google.com/webstore/detail/${version.CHROME_WEBSTORE_ID}" target="_blank" rel="noopener" style="color:orange;text-decoration:underline;font-weight:bold;">${getMessage('popup_new_version_available', versionCheckResult.latestVersion)}</a>)</span>`;
          // use requestUpdateCheck
          contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:orange;">(${getMessage('popup_new_version_available', versionCheckResult.latestVersion)})</span>`;
          const update = document.createElement('span');
          update.innerHTML = `${getMessage('popup_new_version_available', versionCheckResult.latestVersion)}`;
          Object.assign(update.style, {
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          });

          update.addEventListener('click', () => chrome.runtime.requestUpdateCheck());
          break;
        case 'DEV':
          contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b> <span style="color:#007bff;">(${getMessage('popup_dev_version')})</span>`;
          break;
        default:
          const refresh = document.createElement('span');
          const spinner = createSpinner();
          refresh.innerHTML = `(${getMessage('popup_check_version_again')} ${spinner.outerHTML})`;
          Object.assign(refresh.style, {
            color: '#aaa',
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          });

          // 스피너를 클릭하면 강제로 최신 버전 확인
          refresh.addEventListener('click', () => {
            refresh.closest('.version-section')?.remove();
            attachVersionSection(versionSection, true);
          });

          contentNode.innerHTML = `<b>${getMessage('popup_installed_version')}: ${versionCheckResult.installedVersion}</b>`;
          contentNode.appendChild(refresh);
      }
    }

    //0.1 ~ 2초 후 실행 - 로딩 중 표시를 위해
    setTimeout(updateVersionSection, Math.random() * 1900 + 100);

    return versionSection;
  });
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
