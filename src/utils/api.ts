import { SearchHistoryEntity } from './storage';

/*
  http(s)://www.pathofexile.com/trade2/search/poe2/{serverName}/{id}
  http(s)://poe.game.daum.net/trade2/search/poe2/{serverName}/{id}
 */
export function parseSearchUrl(url: string): { serverName: string, id: string } | null {
  const regex = /^https?:\/\/(www\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)\/([^/]+)$/;
  const match = url.match(regex);
  if (!match) return null;

  const [, , serverNameRaw, id] = match;
  try {
    const serverName = decodeURIComponent(serverNameRaw);
    return { serverName, id };
  } catch (e) {
    return null; // serverName 디코딩 실패 시 null
  }
}

export function getSearchHistoryFromUrl(url: string): {
  id: string; url: string;
} {
  const parsed = parseSearchUrl(url);
  if (!parsed) {
    throw new Error(`Invalid search URL format: ${url}`);
  }

  return { id: parsed.id, url: url };
}

//TODO: 추후 설정에 따라 지정된 페이지 및 서버로 조합 할 수 있도록 변경
// 현재는 단순히 현재 url을 반환
export function getUrlFromSearchHistory(
  history: SearchHistoryEntity,
  currentUrl: string = window.location.href
): string {
  // const regex = /^https?:\/\/(www\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)(?:\/[^/]+)?\/?$/;
  const regex = /^https?:\/\/(www\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)\/([^/]+)$/;

  const match = currentUrl.match(regex);
  if (!match) {
    showToast(`Invalid current URL format(${currentUrl}), will use history URL instead.`, '#f00');
    return history.url;
  }
  return `${match[0].replace(/\/[^/]+$/, '')}/${history.id}`;
}

export function isKoreanServer(): boolean {
  const currentUrl = window.location.href;
  return currentUrl.includes('poe.game.daum.net');
}

export function showToast(message: string, color = '#fff', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'poe2-toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#333',
    color: color,
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out'
  });

  // 기존 toast가 있으면 위로 올리기
  const existingToasts = document.querySelectorAll('.poe2-toast') as NodeListOf<HTMLDivElement>;
  existingToasts.forEach((el, index) => {
    el.style.bottom = el.style.bottom ? `${parseInt(el.style.bottom) + 50}px` : '80px';
  });

  document.body.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}