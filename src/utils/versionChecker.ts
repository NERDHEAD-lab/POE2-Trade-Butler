import * as cache from '../storage/cacheData';

/**
 * DEV: 개발 버전 (webstore 보다 높은 버전)
 * LATEST: 최신 버전 (webstore 버전과 동일)
 * NEW_VERSION_AVAILABLE: 새로운 버전이 있음 (webstore 버전보다 높은 버전)
 */
type versionType = 'DEV' | 'LATEST' | 'NEW_VERSION_AVAILABLE' | 'UNKNOWN';
export const CHROME_WEBSTORE_ID = 'ipnemofnhodcgcplnnfekbfpmngeeocm';

interface VersionCheckResult {
  installedVersion: string;
  latestVersion: string;
  versionType: versionType;
}

/**
 * 캐시된 버전 정보를 가져오거나, 강제로 새로 확인합니다.
 * @param forced 강제로 새로 확인할지 여부 (기본값: false) -> cache가 갱신됩니다.
 */
export async function getCachedCheckVersion(forced: boolean = false): Promise<VersionCheckResult> {
  return cache.getOrFetchCache<VersionCheckResult>(
    'version-check',
    1000 * 60 * 60,
    checkVersion,
    forced
  );
}

export async function checkVersion(): Promise<VersionCheckResult> {
  const installedVersion = await getInstalledVersion();
  const latestVersion = await getLatestVersionFromBadge();
  const versionType = compareVersions(installedVersion, latestVersion);

  if (versionType === 'NEW_VERSION_AVAILABLE') {
    console.info(`New version available: ${latestVersion}`);
  } else if (versionType === 'DEV') {
    console.info(`Development version detected: ${installedVersion}`);
  } else if (versionType === 'LATEST') {
    console.info(`You are using the latest version: ${installedVersion}`);
  } else {
    console.info(`Unable to determine version status. Installed: ${installedVersion}, Latest: ${latestVersion}`);
  }

  return { installedVersion, latestVersion, versionType };
}

export async function getInstalledVersion(): Promise<string> {
  return new Promise((resolve) => {
    if (chrome && chrome.runtime && chrome.runtime.getManifest) {
      resolve(chrome.runtime.getManifest().version);
    } else {
      resolve('0.0.0');
    }
  });
}

function compareVersions(installedVersion: string, latestVersion: string): versionType {
  if (process.env.NODE_ENV === 'development') return 'DEV';
  if (latestVersion === '0.0.0') return 'UNKNOWN';

  const currentParts = installedVersion.split('.').map(Number);
  const latestParts = latestVersion.split('.').map(Number);
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const current = currentParts[i] || 0;
    const latest = latestParts[i] || 0;
    if (current > latest) return 'DEV';
    if (current < latest) return 'NEW_VERSION_AVAILABLE';
  }
  return 'LATEST';
}

/**
 * Chrome Web Store에서 최신 버전을 가져옵니다.
 * @returns 최신 버전 문자열 (예: "2.4.2")
 * @throws 오류가 발생하면 '0.0.0'을 반환합니다.
 */
async function getLatestVersionFromBadge(): Promise<string> {
  try {
    const res = await fetch(`https://img.shields.io/chrome-web-store/v/${CHROME_WEBSTORE_ID}?label=Chrome%20Web%20Store`);
    if (!res.ok) {
      console.error('Failed to fetch latest version from badge:', res.status, res.statusText);
      return '0.0.0';
    }
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
    console.error('Failed to fetch latest version from badge');
    return '0.0.0';
  }
}