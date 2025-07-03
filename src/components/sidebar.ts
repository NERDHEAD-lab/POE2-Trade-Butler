import '../styles/sidebar.css';
import * as api from '../utils/api';
import { showToast } from '../utils/api';
import * as favoriteStorage from '../storage/favoriteStorage';
import * as searchHistoryStorage from '../storage/searchHistoryStorage';
import * as settingStorage from '../storage/settingStorage';
import { TradePreviewer } from '../utils/tradePreviewInjector';
import * as previewStorage from '../storage/previewStorage';
import { PreviewPanelSnapshot } from '../storage/previewStorage';
import * as favoriteUI from '../ui/favoriteFileSystemUI';
import * as fs from '../ui/fileSystemEntry';
import { openFavoriteFolderModal } from '../ui/newFavoriteModal';

const POE2_SIDEBAR_ID = 'poe2-sidebar';
const POE2_CONTENT_WRAPPER_ID = 'poe2-content-wrapper';

const sidebarHtml = `
<div id="sidebar-header">
  <h2 class="sidebar-header-title">Trade Butler</h2>
  <button id="clear-history">Clear History</button>
</div>

<div id="sidebar-menu">
  <button class="menu-tab active" data-tab="history">History</button>
  <button class="menu-tab" data-tab="favorites">Favorites</button>
</div>

<div id="sidebar-content">
  <div id="history" class="tab-content active">
    <h3>
      <span>Search History</span>
      <label class="switch">
        <input type="checkbox" id="history-switch" checked />
        <span class="slider"></span>
      </label>
    </h3>

    <ul id="history-list"></ul>
  </div>
  <div id="favorites" class="tab-content">
    <h3>
      <span>Favorites</span>
      <button id="add-favorite">Add Current page</button>
    </h3>
    <div id="favorites-list-wrapper"></div>
  </div>
</div>

<button id="poe2-sidebar-toggle-button">⮜</button>
`;

const historyItem = `
<span class="favorite-star">★</span>
<div class="history-info">
  <div class="name-edit-container">
    <label>
      <span class="history-name"></span>
    </label>
  </div>
  <div>
    <span class="last-searched"></span>
  </div>
  <div><span class="total-searches"></span>
  </div>
</div>
<button class="remove-history">🗑️</button>
  `;

export function renderSidebar(container: HTMLElement): void {
  if (document.getElementById(POE2_SIDEBAR_ID)) return;

  // 기존 콘텐츠를 감싸는 wrapper 생성
  const wrapper = document.createElement('div');
  wrapper.id = POE2_CONTENT_WRAPPER_ID;
  while (container.firstChild) wrapper.appendChild(container.firstChild);
  container.appendChild(wrapper);

  // 사이드바 생성
  const sidebar = document.createElement('div');
  sidebar.id = POE2_SIDEBAR_ID;
  sidebar.innerHTML = sidebarHtml;
  container.appendChild(sidebar);
  if (api.isKoreanServer()) {
    //poe2-sidebar top 80px 설정
    sidebar.style.top = '80px';
  }

  // sidebar history 삭제
  const clearHistoryButton = sidebar.querySelector<HTMLButtonElement>('#clear-history');
  clearHistoryButton?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all search history?')) {
      searchHistoryStorage.removeAll().then(() => {
        showToast('Search history cleared successfully.');
      }).catch(error => {
        console.error('Error clearing search history:', error);
        showToast('Failed to clear search history.', '#f00');
      });
    }
  });

  //history-switch history 자동 추가 활성/비활성화
  (async () => {
    const historySwitch = sidebar.querySelector<HTMLInputElement>('#history-switch');
    if (!historySwitch) throw new Error('history-switch not found');

    historySwitch.checked = await settingStorage.isHistoryAutoAddEnabled();

    historySwitch.addEventListener('change', () => {
      const isChecked = historySwitch.checked;
      settingStorage.setHistoryAutoAddEnabled(isChecked);
      showToast(`History auto-add ${isChecked ? 'enabled' : 'disabled'}.`);
    });
  })();


  const addFavoriteButton = sidebar.querySelector<HTMLButtonElement>('#add-favorite') as HTMLButtonElement;
  attachCreateFavoriteEvent(addFavoriteButton, () => {
      const searchHistoryFromUrl = api.getSearchHistoryFromUrl(window.location.href);

      return {
        id: searchHistoryFromUrl.id,
        url: searchHistoryFromUrl.url
      };
    }
  );

  // sidebar 여닫기
  (async () => {
    const toggleButton = sidebar.querySelector<HTMLButtonElement>('#poe2-sidebar-toggle-button');
    if (!toggleButton) throw new Error('toggle button not found');

    let isOpen = true;

    toggleButton.addEventListener('click', () => {
      isOpen = !isOpen;
      sidebar.classList.toggle('collapsed', !isOpen);
      wrapper.classList.toggle('collapsed', !isOpen);
      toggleButton.textContent = isOpen ? '⮜' : '⮞';
      settingStorage.setSidebarCollapsed(!isOpen);
    });

    const isCollapsed = await settingStorage.isSidebarCollapsed();
    if (isCollapsed) {
      toggleButton.click(); // 초기 상태 동기화
    }
  })();


  const favoriteWrapper = document.getElementById('favorites-list-wrapper') as HTMLDivElement;

  Promise.resolve()
    .then(() => loadHistoryList(searchHistoryStorage.getAll()))
    .then(() => favoriteUI.loadFavoriteFileSystemUI(favoriteWrapper))
    .then(() => {
      searchHistoryStorage.addOnChangeListener((newValue) => loadHistoryList(Promise.resolve(newValue)));
      favoriteStorage.addOnChangeListener(() => loadHistoryList(searchHistoryStorage.getAll()));
    });


  // 탭 전환 이벤트
  (async () => {
    const tabs = sidebar.querySelectorAll<HTMLButtonElement>('.menu-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        const contents = sidebar.querySelectorAll('.tab-content');
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const activeTab = tab.getAttribute('data-tab') as settingStorage.LatestTab;
        if (activeTab) {
          sidebar.querySelector(`.tab-content#${activeTab}`)?.classList.add('active');
          settingStorage.setLatestTab(activeTab);
        }
      });
    });

    const latestTab = await settingStorage.getLatestTab(); // 비동기에서 탭 이름 불러오기
    const tab = sidebar.querySelector<HTMLButtonElement>(`.menu-tab[data-tab="${latestTab}"]`);
    tab?.click(); // 초기 탭 활성화
  })();

  observeUrlChange();
}

//history-name-input -> placeHolder=${entry.id}
function createHistoryItem(entry: searchHistoryStorage.SearchHistoryEntity): HTMLElement {
  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = historyItem;

  const nameSpan = li.querySelector('.history-name') as HTMLSpanElement;
  const lastSearchedSpan = li.querySelector('.last-searched') as HTMLSpanElement;
  const totalSearchesSpan = li.querySelector('.total-searches') as HTMLSpanElement;
  const removeButton = li.querySelector('.remove-history') as HTMLButtonElement;
  const favoriteStar = li.querySelector('.favorite-star') as HTMLSpanElement;

  previewStorage.getById(entry.id)
    .then(previewInfo => {
      if (previewInfo && previewInfo.searchKeyword) {
        nameSpan.textContent = previewInfo.searchKeyword;
      } else {
        nameSpan.textContent = entry.id;
      }
    });

  //    existing.lastSearched = new Date().toISOString();
  // YYYY.MM.DD HH:mm 형식으로 표시
  lastSearchedSpan.textContent = `Last searched: ${new Date(entry.lastSearched).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`;

  totalSearchesSpan.textContent = `Total searches: ${entry.previousSearches.length + 1}`;
  if (entry.previousSearches.length > 0) {
    totalSearchesSpan.title = `Previous searches: ${entry.previousSearches
      .map(search => new Date(search).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }))
      .join('\n')}`;
  }

  favoriteStorage.existsByMetadataId(entry.id)
    .then(isFavorite => {
      if (isFavorite) {
        favoriteStar.classList.add('active');
      }
    })
    .catch(error => {
      console.error('Error checking favorite status:', error);
    });

  // hover 시 미리보기 패널 표시
  attachPreviewHoverEvents(li, entry);

  // history-item 클릭 시
  li.addEventListener('click', () => {
    window.location.href = api.getUrlFromSearchHistory(entry);
  });


  attachCreateFavoriteEvent(favoriteStar, () => ({
    id: entry.id,
    url: entry.url
  }));

  removeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    searchHistoryStorage.deleteById(entry.id).catch((error) => {
      console.error('Error deleting history:', error);
    });
    li.remove();
  });

  return li;
}

// TODO: refactoring 필요
function loadHistoryList(historyList: Promise<searchHistoryStorage.SearchHistoryEntity[]>): void {
  historyList.then(entries => {
    const historyListElement = document.getElementById('history-list');
    if (!historyListElement) {
      console.error('Could not find #history-list element');
      return;
    }
    historyListElement.innerHTML = ''; // Clear existing items

    //최신 순으로 정렬
    entries.sort((a, b) => new Date(b.lastSearched).getTime() - new Date(a.lastSearched).getTime());

    entries.forEach(entry => {
      const item = createHistoryItem(entry);
      historyListElement.appendChild(item);
    });
  });
}


function observeUrlChange() {
  new MutationObserver(() => {
    updateHistoryFromUrl(window.location.href).catch(console.debug);
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
}

let currentHandleUrl = '';

async function updateHistoryFromUrl(currentUrl: string): Promise<void> {
  console.debug(`Handling URL change: ${currentUrl}`);
  const latestSearchUrl = await settingStorage.getLatestSearchUrl();

  if (currentHandleUrl === currentUrl) {
    console.debug('Already handling URL change, skipping:', currentUrl);
    return;
  }


  const parseSearchUrl = api.parseSearchUrl(currentUrl);
  if (parseSearchUrl === null) {
    console.debug(`Ignoring URL change, not a valid search URL: ${currentUrl}`);
    return;
  } else {
    TradePreviewer.extractCurrentPanel()
      .then(previewInfo => previewStorage.addOrUpdateById(parseSearchUrl.id, previewInfo))
      .catch(err => console.error('Error extracting current panel:', err));
  }

  const autoAddEnabled = await settingStorage.isHistoryAutoAddEnabled();
  if (!autoAddEnabled) {
    console.debug('History auto-add is disabled, skipping URL change handling');
    await settingStorage.setLatestSearchUrl(currentUrl);
    return;
  }

  currentHandleUrl = currentUrl;

  try {
    const entity = api.getSearchHistoryFromUrl(currentUrl);
    const exists = await searchHistoryStorage.exists(entity.id);

    if (exists && latestSearchUrl === currentUrl) {
      console.info(`Ignoring URL change, it's just refreshing: ${currentUrl}`);
      return;
    }

    await searchHistoryStorage.addOrUpdate(entity.id, entity.url)
      .then(() => settingStorage.setLatestSearchUrl(currentUrl))
      .then(() => console.log(`Search history updated for URL: ${currentUrl}`));

  } catch (err) {
    console.info(`Unexpected error while handling URL change: ${currentUrl}`, err);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handling URL change:', err);
    }
  } finally {
    currentHandleUrl = '';
  }
}


export function attachPreviewHoverEvents(
  element: HTMLElement,
  entry: {
    id: string;
    etc?: Record<string, any>
  }): void {
  TradePreviewer.addHoverEventListener(
    element,
    entry.id,
    element.querySelector('.history-name') as HTMLElement
  )
}

export function attachCreateFavoriteEvent(
  element: HTMLElement,
  entrySupplier: () => {
    id: string;
    url: string;
  }
): void {
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    const entry = entrySupplier();

    favoriteStorage.getAll()
      .then(favorites => {
        return favorites
          .filter(fav => fav.id === entry.id)
          .map(fav => fs.getPath(favorites, fav));
      })
      .then(favoritesPath => {
        if (favoritesPath.length > 0) {
          const message = `이미 즐겨찾기에 추가된 항목입니다:\n${favoritesPath.map(path => `- ${path}`).join('\n')}\n\n다시 추가하시겠습니까?`;
          if (!confirm(message)) {
            return;
          }
        }
        return openFavoriteFolderModal(entry.id, entry.url);
      });
  });
}