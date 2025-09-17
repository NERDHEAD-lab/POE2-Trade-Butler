import { getMessage } from './_locale';

/*
  http(s)://(www|jp|br|ru|th|de|fr|es).pathofexile.com/trade2/search/poe2/{serverName}/{id}
  http(s)://poe.game.daum.net/trade2/search/poe2/{serverName}/{id}
 */
export function parseSearchUrl(url: string): { serverName: string; id: string } | null {
  const regex =
    /^https?:\/\/((www|jp|br|ru|th|de|fr|es)\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)\/([^/]+)$/;
  const match = url.match(regex);
  if (!match) return null;

  const [, , , serverNameRaw, id] = match;
  try {
    const serverName = decodeURIComponent(serverNameRaw);
    return { serverName, id };
  } catch {
    return null; // serverName 디코딩 실패 시 null
  }
}

export function getSearchHistoryFromUrl(url: string): {
  id: string;
  url: string;
} {
  const parsed = parseSearchUrl(url);
  if (!parsed) {
    throw new Error(getMessage('error_invalid_url_format', url));
  }

  return { id: parsed.id, url: url };
}

export function getUrlFromSearchHistory(
  history: {
    id: string;
    url: string;
  },
  currentUrl: string = window.location.href
): string {
  const regex =
    /^https?:\/\/((www|jp|br|ru|th|de|fr|es)\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)(?:\/[^/]+)?\/?$/;

  const match = currentUrl.match(regex);
  if (!match) {
    console.error(getMessage('error_invalid_url_format', currentUrl), '#f00');
    return history.url;
  }

  const base = `https://${match[1]}/trade2/search/poe2/${match[3]}`;
  return `${base}/${history.id}`;
}

export function isKoreanServer(): boolean {
  const currentUrl = new URL(window.location.href);
  return currentUrl.hostname === 'poe.game.daum.net';
}

export function getCurrentServerRegion(): string {
  return getServerRegion(new URL(window.location.href));
}

export function getServerRegion(url: URL): string {
  const hostname = url.hostname;

  if (hostname === 'poe.game.daum.net') return 'kr';
  if (hostname === 'jp.pathofexile.com') return 'jp';
  if (hostname === 'br.pathofexile.com') return 'br';
  if (hostname === 'ru.pathofexile.com') return 'ru';
  if (hostname === 'th.pathofexile.com') return 'th';
  if (hostname === 'de.pathofexile.com') return 'de';
  if (hostname === 'fr.pathofexile.com') return 'fr';
  if (hostname === 'es.pathofexile.com') return 'es';
  if (hostname === 'www.pathofexile.com') return 'global';
  return 'global'; // Default for www.pathofexile.com
}

/**
 * 모달 버튼 클릭 시 호출되는 리스너 타입
 * @param modal - 모달 요소
 * @return true를 반환하면 모달이 닫히고, false를 반환하면 모달이 닫히지 않습니다.
 */
export type ButtonListener = (modal: HTMLDivElement) => Promise<boolean>;

export type ModalConsumer = (ctx: ModalButtonContext) => void;

export interface ModalButtonContext {
  root: HTMLDivElement;
  confirm: () => void;
  cancel: () => void;
  etc: (name: string) => void;
}

/**
 * 모달 옵션 인터페이스
 * @property title - 모달 제목 (선택 사항)
 * @property div - 모달에 표시할 HTMLDivElement
 * @property confirm - 확인 버튼 텍스트 (기본값: '저장')
 * @property cancel - 취소 버튼 텍스트 (기본값: '취소')
 *
 * listener는 모달의 확인/취소 버튼 클릭 시 호출되는 함수입니다.
 * return 값이 true이면 모달이 닫히고, false이면 닫히지 않습니다.
 * @property onConfirmListener - 확인 버튼 클릭 시 호출되는 리스너 (선택 사항)
 * @property onCancelListener - 취소 버튼 클릭 시 호출되는 리스너 (선택 사항)
 * @property onOverlayClickListener - 모달 외부 클릭 시 호출되는 리스너 (선택 사항)
 *
 * @property etcButtons - 추가 버튼들 (선택 사항)
 * - 각 버튼은 이름과 클릭 시 호출되는 리스너를 포함합니다.
 *   name: 버튼 이름
 *   listener: 버튼 클릭 시 호출되는 리스너
 *
 * @property hideCancel - 취소 버튼 숨기기 (기본값: false)
 */
export interface ModalOptions {
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
  consumer?: ModalConsumer;
}

export function showModal(options: ModalOptions): void {
  const {
    title = null,
    div,
    confirm = getMessage('button_save'),
    cancel = getMessage('button_cancel'),
    onConfirmListener,
    onCancelListener,
    onOverlayClickListener = () => Promise.resolve(true),
    etcButtons = [],
    hideCancel = false,
    consumer
  } = options;

  const overlay = document.createElement('div');
  overlay.className = 'poe2-modal-overlay';

  overlay.onclick = e => {
    if (e.target === overlay) {
      onOverlayClickListener(overlay).then(close => {
        if (close) overlay.remove();
      });
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
      padding: '6px 18px',
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
        padding: '6px 12px',
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

  const etcButtonElements: Record<string, HTMLButtonElement> = {};
  for (const btn of etcButtons) {
    const buttonElement = makeButton(btn.name, btn.listener, 'normal');
    leftBtnGroup.appendChild(buttonElement);
    etcButtonElements[btn.name] = buttonElement;
  }

  // 오른쪽 버튼들
  const confirmBtn = makeButton(confirm, onConfirmListener, 'confirm');
  rightBtnGroup.appendChild(confirmBtn);
  const cancelBtn = makeButton(cancel, onCancelListener, 'cancel');
  if (!hideCancel) {
    rightBtnGroup.appendChild(cancelBtn);
    // 확인 버튼은 적어도 취소 버튼보다는 같거나 큰 크기로 설정
    // confirmBtn.style.minWidth = cancelBtn.offsetWidth + 'px';
    requestAnimationFrame(() => {
      confirmBtn.style.minWidth = `${cancelBtn.offsetWidth}px`;
      const etcButtons = leftBtnGroup.querySelectorAll('button');
      etcButtons.forEach(btn => {
        btn.style.minWidth = `${cancelBtn.offsetWidth}px`;
      });
    });
  }

  consumer?.({
    root: overlay,
    confirm: () => confirmBtn.click(),
    cancel: () => cancelBtn.click(),
    etc: (name) => etcButtonElements[name]?.click()
  });

  btnWrapper.appendChild(leftBtnGroup);
  btnWrapper.appendChild(rightBtnGroup);

  modal.appendChild(btnWrapper);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function ping(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const port = chrome.runtime.connect({ name: 'ping' });

      port.onMessage.addListener((msg) => {
        if (msg.type === 'PONG') {
          port.disconnect();
          console.info("Connection successful");
          resolve();
        }
      });

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          reject(new Error("Ping failed: " + chrome.runtime.lastError.message));
        }
      });
    } catch (error) {
      console.error("Connection failed:", error);
      reject(error);
    }
  });
}