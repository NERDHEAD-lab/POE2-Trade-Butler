import '../styles/popup.css';
import { getMessage } from '../utils/_locale';

const GITHUB_URL = 'https://github.com/NERDHEAD-lab/POE2-Trade-Butler';
const GITHUB_SPONSOR_URL = 'https://github.com/sponsors/NERDHEAD-lab';
const BUY_ME_A_COFFEE_URL = 'https://coff.ee/nerdhead_lab';
const CHROME_WEBSTORE_ID = 'ipnemofnhodcgcplnnfekbfpmngeeocm';

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

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

function createVersionSection(installed: string, latest: string | null) {
  const versionSection = document.createElement('div');
  versionSection.style.marginTop = '18px';
  versionSection.style.textAlign = 'center';
  let versionInfo = '';

  if (latest === null) {
    // 로딩 중 메시지
    versionInfo = `<b>${getMessage('popup_installed_version')}: ${installed}</b> <span style="color:#aaa;">(${createSpinner().outerHTML})</span>`;
  } else {
    const cmp = compareVersions(installed, latest);
    if (cmp > 0) {
      versionInfo = `<b>${getMessage('popup_installed_version')}: ${installed}</b> <span style="color:#007bff;">(${getMessage('popup_dev_version')})</span>`;
    } else if (cmp === 0) {
      versionInfo = `<b>${getMessage('popup_installed_version')}: ${installed}</b> <span style="color:green;">(${getMessage('popup_latest_version')})</span>`;
    } else {
      versionInfo = `<b>${getMessage('popup_installed_version')}: ${installed}</b> <span style="color:orange;">(<a href="https://chrome.google.com/webstore/detail/${CHROME_WEBSTORE_ID}" target="_blank" rel="noopener" style="color:orange;text-decoration:underline;font-weight:bold;">${getMessage('popup_new_version_available', latest)}</a>)</span>`;
    }
  }
  versionSection.innerHTML = versionInfo;
  return versionSection;
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

async function getInstalledVersion(): Promise<string> {
  return new Promise((resolve) => {
    if (chrome && chrome.runtime && chrome.runtime.getManifest) {
      resolve(chrome.runtime.getManifest().version);
    } else {
      resolve('0.0.0');
    }
  });
}

async function getLatestVersionFromBadge(): Promise<string> {
  try {
    const res = await fetch(`https://img.shields.io/chrome-web-store/v/${CHROME_WEBSTORE_ID}?label=Chrome%20Web%20Store`);
    if (!res.ok) throw new Error('Failed to fetch badge SVG');
    const svg = await res.text();
    // SVG 내에서 버전 텍스트 추출 (예: v2.4.2)
    const match = svg.match(/>v([0-9.]+)<\/?text>/i);
    if (match && match[1]) {
      return match[1];
    }
    // fallback: Chrome Web Store: v2.4.2
    const fallback = svg.match(/Chrome Web Store: v([0-9.]+)/);
    if (fallback && fallback[1]) {
      return fallback[1];
    }
    return '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function renderPopupMenu() {
  const root = document.body;
  root.innerHTML = '';
  root.style.minWidth = '260px';
  root.style.maxWidth = '340px';

  // 뱃지
  root.appendChild(createBadgeSection());

  // 1. 설치된 버전 먼저 가져오기
  const installed = await getInstalledVersion();

  // 2. (로딩 중) 표기 먼저 추가
  const versionSection = createVersionSection(installed, null); // latest=null
  root.appendChild(versionSection);

  // 3. 비동기로 최신 버전 받아오고 UI 갱신
  Promise.all([
    getLatestVersionFromBadge(),
    new Promise(resolve => setTimeout(resolve, 1000))
  ]).then(([latest]) => {
    versionSection.innerHTML = createVersionSection(installed, latest).innerHTML;
  }).catch(() => {
    versionSection.innerHTML = createVersionSection(installed, null).innerHTML;
  });
}

document.addEventListener('DOMContentLoaded', renderPopupMenu);
