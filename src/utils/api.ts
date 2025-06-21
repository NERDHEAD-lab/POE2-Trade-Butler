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

/**
 * 모달 버튼 클릭 시 호출되는 리스너 타입
 * @param modal - 모달 요소
 * @return true를 반환하면 모달이 닫히고, false를 반환하면 모달이 닫히지 않습니다.
 */
type ButtonListener = (modal: HTMLDivElement) => Promise<boolean>;

interface ModalOptions {
  div: HTMLDivElement;
  confirm?: string;
  cancel?: string;
  onConfirmListener?: ButtonListener;
  onCancelListener?: ButtonListener;
  etcButtons?: {
    name: string;
    listener: ButtonListener;
  }[];
  hideCancel?: boolean;
}

export function showModal(options: ModalOptions): void {
  const {
    div,
    confirm = '확인',
    cancel = '취소',
    onConfirmListener,
    onCancelListener,
    etcButtons = [],
    hideCancel = false
  } = options;

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10001'
  });

  const modal = document.createElement('div');
  modal.className = 'poe2-modal';
  Object.assign(modal.style, {
    backgroundColor: '#222',
    color: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    maxWidth: '90%',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
    textAlign: 'center'
  });

  modal.appendChild(div);

  const btnWrapper = document.createElement('div');
  Object.assign(btnWrapper.style, {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '20px'
  });

  function makeButton(label: string, listener?: ButtonListener) {
    const btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1',
      padding: '6px 12px',
      backgroundColor: '#444',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    });
    btn.onclick = () => {
      // listener가 없을 경우 or listener가 true를 반환할 경우 모달을 닫는다.
      if (!listener) {
        overlay.remove();
      } else {
        listener(modal).then((close) => {
          if (close) {
            overlay.remove();
          }
        });
      }
    };
    return btn;
  }

  btnWrapper.appendChild(makeButton(confirm, onConfirmListener));
  if (!hideCancel) {
    btnWrapper.appendChild(makeButton(cancel, onCancelListener));
  }

  for (const btn of etcButtons) {
    btnWrapper.appendChild(
      makeButton(btn.name, btn.listener) // 기본 false
    );
  }

  modal.appendChild(btnWrapper);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
