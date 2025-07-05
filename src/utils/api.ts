import { getMessage } from './_locale';
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
  } catch {
    return null; // serverName 디코딩 실패 시 null
  }
}

export function getSearchHistoryFromUrl(url: string): {
  id: string; url: string;
} {
  const parsed = parseSearchUrl(url);
  if (!parsed) {
    throw new Error(getMessage('error_invalid_url_format', url));
  }

  return { id: parsed.id, url: url };
}

//TODO: 추후 설정에 따라 지정된 페이지 및 서버로 조합 할 수 있도록 변경
// 현재는 단순히 현재 url을 반환
export function getUrlFromSearchHistory(
  history: {
    id: string;
    url: string;
  },
  currentUrl: string = window.location.href
): string {
  const regex = /^https?:\/\/(www\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)(?:\/[^/]+)?\/?$/;

  const match = currentUrl.match(regex);
  if (!match) {
    console.error(getMessage('error_invalid_url_format', currentUrl), '#f00');
    return history.url;
  }

  const base = `https://${match[1]}/trade2/search/poe2/${match[2]}`;
  return `${base}/${history.id}`;
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
  existingToasts.forEach((el) => {
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
export type ButtonListener = (modal: HTMLDivElement) => Promise<boolean>;

interface ModalOptions {
  title?: string;
  div: HTMLDivElement;
  confirm?: string;
  cancel?: string;
  onConfirmListener?: ButtonListener;
  onCancelListener?: ButtonListener;
  onOverlayClickListener?: (overlay: HTMLDivElement) => Promise<boolean>;
  etcButtons?: {
    name: string;
    listener: ButtonListener;
  }[];
  hideCancel?: boolean;
}

export function showModal(options: ModalOptions): void {
  const {
    title = null,
    div,
    confirm = getMessage('button_save'),
    cancel = getMessage('button_cancel'),
    onConfirmListener,
    onCancelListener,
    onOverlayClickListener,
    etcButtons = [],
    hideCancel = false
  } = options;

  const overlay = document.createElement('div');
  overlay.className = 'poe2-modal-overlay';

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      if (onOverlayClickListener) {
        onOverlayClickListener(overlay).then(close => {
          if (close) overlay.remove();
        });
      } else {
        overlay.remove();
      }
    }
  };

  const modal = document.createElement('div');
  modal.className = 'poe2-modal';

  if (title !== null && title !== '') {
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.className = 'poe2-modal-title';

    modal.appendChild(titleElement);
  }
  modal.appendChild(div);

  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'poe2-modal-buttons';

  // 왼쪽 버튼 컨테이너 (보조 버튼용)
  const leftBtnGroup = document.createElement('div');
  leftBtnGroup.style.display = 'flex';
  leftBtnGroup.style.gap = '8px';

  // 오른쪽 버튼 컨테이너 (확인/취소용)
  const rightBtnGroup = document.createElement('div');
  rightBtnGroup.style.display = 'flex';
  rightBtnGroup.style.gap = '8px';

  function makeButton(
    label: string,
    listener?: ButtonListener,
    styleType: 'normal' | 'confirm' | 'cancel' = 'normal'
  ) {
    const btn = document.createElement('button');
    btn.textContent = label;

    const baseStyle = {
      padding: '6px 12px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid transparent',
      backgroundColor: 'transparent',
      color: '#ccc',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      lineHeight: '1.4',
      fontFamily: 'inherit'
    };

    const styleMap = {
      normal: {
        backgroundColor: '#1a1a1a',
        color: '#ddd',
        border: '1px solid #3a3a3a'
      },
      confirm: {
        backgroundColor: '#b1862c',
        color: '#fff',
        border: '1px solid #d4b060'
      },
      cancel: {
        backgroundColor: '#2a2a2a',
        color: '#ccc',
        border: '1px solid #555'
      }
    };

    Object.assign(btn.style, baseStyle, styleMap[styleType]);

    btn.onclick = () => {
      if (!listener) {
        overlay.remove();
      } else {
        const result = listener(modal);
        if (result instanceof Promise) {
          result.then(close => {
            if (close) overlay.remove();
          });
        } else if (result) {
          overlay.remove();
        }
      }
    };

    return btn;
  }

  for (const btn of etcButtons) {
    leftBtnGroup.appendChild(
      makeButton(btn.name, btn.listener, 'normal') // 예: 폴더 삭제 같은 위험 행동
    );
  }

// 오른쪽 버튼들
  rightBtnGroup.appendChild(makeButton(confirm, onConfirmListener, 'confirm'));
  if (!hideCancel) {
    rightBtnGroup.appendChild(makeButton(cancel, onCancelListener, 'cancel'));
  }

  btnWrapper.appendChild(leftBtnGroup);
  btnWrapper.appendChild(rightBtnGroup);

  modal.appendChild(btnWrapper);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
