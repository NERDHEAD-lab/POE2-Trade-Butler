import '../styles/sidebar.css';
import * as api from '../utils/api';
import { showToast } from '../utils/api';
import * as favoriteStorage from '../storage/favoriteStorage';
import * as searchHistoryStorage from '../storage/searchHistoryStorage';
import * as settingStorage from '../storage/settingStorage';
import { openFavoriteFolderModal } from '../ui/favoriteFolderModal';
import { TradePreviewer } from '../utils/tradePreviewInjector';
import * as previewStorage from '../storage/previewStorage';
import { PreviewPanelSnapshot } from '../storage/previewStorage';
import * as folderUI from '../ui/favoriteFolderUI';

const POE2_SIDEBAR_ID = 'poe2-sidebar';
const POE2_CONTENT_WRAPPER_ID = 'poe2-content-wrapper';
const ON_SEARCH_HISTORY_CHANGED = 'onSearchHistoryChanged';
const ON_FAVORITE_FOLDER_CHANGED = 'onFavoriteFolderChanged';

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
    <div id="favorites-list"></div>
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
        url: searchHistoryFromUrl.url,
        preview: TradePreviewer.extractCurrentPanel()
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


  loadHistoryList(searchHistoryStorage.getAll());
  loadFavoritesList(favoriteStorage.getFavoriteFolderRoot());
  searchHistoryStorage.addOnChangeListener((newValue) => loadHistoryList(Promise.resolve(newValue)));

  favoriteStorage.addFavoriteFolderChangedListener(ON_FAVORITE_FOLDER_CHANGED, (root) => {
    loadHistoryList(searchHistoryStorage.getAll());
    loadFavoritesList(Promise.resolve(root));
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

  favoriteStorage.isFavoriteContains(entry.id)
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
    url: entry.url,
    preview: previewStorage.getById(entry.id).then(preview => preview || TradePreviewer.extractCurrentPanel())
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

function loadFavoritesList(favorites: Promise<favoriteStorage.FavoriteFolderRoot>): void {
  const wrapper = document.getElementById('favorites-list') as HTMLDivElement;
  if (!wrapper) {
    console.error('Could not find #favorites-list element');
    return;
  }

  const onComplete = (ul: HTMLUListElement) => {
    ul.querySelectorAll('.folder-item')
      .forEach(item => {
        const li = item as HTMLLIElement;
        li.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          const path = folderUI.getSelectedFolderPath(folderElement);
          const currentName = li.querySelector('.folder-name')?.textContent || '';
          const newName = prompt('Enter new name for favorite folder:', currentName);
          const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

          if (newName && !exceptions.some(char => newName.includes(char))) {
            favoriteStorage.renameFavoriteElement('folder', path, newName)
              .then(() => {
                showToast(`Favorite folder renamed to "${newName}"`);
              })
              .catch(error => {
                console.error('Error renaming favorite folder:', error);
                showToast('Failed to rename favorite folder.', '#f00');
              });
          } else {
            alert(`Invalid name. Please avoid using these characters: ${exceptions.join(' ')}`);
          }
        });
      });

    ul.querySelectorAll('.favorite-item')
      .forEach(item => {
        const li = item as HTMLLIElement;
        const id = li.dataset.id;
        if (!id) {
          console.warn('Favorite item without ID:', li);
          return;
        }

        favorites.then(root => {
          //root 내부 folders도 재귀 검색 필요
          const entry = findFavoriteItemById(root, id);

          if (!entry) {
            console.warn(`Favorite item not found in root: ${id}`);
            return;
          }
          attachPreviewHoverEvents(li, entry);

          let clickTimer: ReturnType<typeof setTimeout> | null = null;
          // 클릭 이벤트 리스너 추가
          li.addEventListener('click', () => {
            // window.location.href = api.getUrlFromSearchHistory(entry);
            if (clickTimer) return;

            clickTimer = setTimeout(() => {
              clickTimer = null;
              window.location.href = api.getUrlFromSearchHistory(entry);
            }, 200);
          });

          // 더블 클릭 이벤트 리스너 추가
          li.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (clickTimer) {
              clearTimeout(clickTimer);
              clickTimer = null;
            }

            const newName = prompt('Enter new name for favorite item:', entry.name);
            const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

            if (newName === null) {
              showToast('Canceled renaming favorite item.', '#f66');
            } else if (newName === '') {
              showToast('Name cannot be empty.', '#f66');
            } else if (exceptions.some(char => newName.includes(char))) {
              alert(`Invalid name. Please avoid using these characters: ${exceptions.join(' ')}`);
            } else {
              const path = li.dataset.path || '/';
              favoriteStorage.renameFavoriteElement('item', path, newName)
                .then(() => {
                  showToast(`Favorite item renamed to "${newName}"`);
                })
                .catch(error => {
                  console.error('Error renaming favorite item:', error);
                  showToast('Failed to rename favorite item.', '#f00');
                });
            }
          });

          const fileIcon = li.querySelector('.file-icon') as HTMLSpanElement;
          if (!fileIcon) {
            console.warn('File icon not found in favorite item:', li);
            return;
          }

          // 즐겨찾기 아이콘 클릭 이벤트 리스너 추가 - 클릭 시 즐겨찾기에서 제거 확인창
          fileIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            const path = li.dataset.path || '/';
            if (confirm(`Are you sure you want to remove "${path}" from favorites?`)) {
              favoriteStorage.removeFavoriteItem(path)
                .then(() => {
                  showToast(`"${entry.name}" has been removed from favorites.`);
                })
                .catch(error => {
                  console.error('Error removing favorite item:', error);
                  showToast('Failed to remove favorite item.', '#f00');
                });
            }
          });
        });
      });
  };

  const folderElement = folderUI.generate(favorites, true, true, onComplete);
  wrapper.innerHTML = ''; // Clear existing content
  wrapper.appendChild(folderElement);
}

function findFavoriteItemById(root: favoriteStorage.FavoriteFolderRoot, id: string): favoriteStorage.FavoriteItem | undefined {
  // 1. 루트의 items에서 먼저 찾음
  const directMatch = root.items.find(item => item.id === id);
  if (directMatch) return directMatch;

  // 2. 폴더를 재귀 탐색
  for (const folder of root.folders) {
    const match = findItemInFolderById(folder, id);
    if (match) return match;
  }

  return undefined;
}

function findItemInFolderById(folder: favoriteStorage.FavoriteFolder, id: string): favoriteStorage.FavoriteItem | undefined {
  const item = folder.items?.find(i => i.id === id);
  if (item) return item;

  for (const subFolder of folder.folders || []) {
    const match = findItemInFolderById(subFolder, id);
    if (match) return match;
  }

  return undefined;
}


function observeUrlChange() {
  if (process.env.NODE_ENV === 'development') {
    console.debug('disabled URL change observer in development mode');
    return;
  }

  new MutationObserver(() => {
    updateHistoryFromUrl(window.location.href).catch(console.debug);
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
}

let currentHandleUrl = '';

async function updateHistoryFromUrl(currentUrl: string): Promise<void> {
  const latestSearchUrl = await settingStorage.getLatestSearchUrl();

  const autoAddEnabled = await settingStorage.isHistoryAutoAddEnabled();
  if (!autoAddEnabled) {
    console.debug('History auto-add is disabled, skipping URL change handling');
    return;
  }

  if (currentHandleUrl === currentUrl) {
    console.debug('Already handling URL change, skipping:', currentUrl);
    return;
  }
  if (api.parseSearchUrl(currentUrl) === null) {
    console.debug(`Ignoring URL change, not a valid search URL: ${currentUrl}`);
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
      .then(() => TradePreviewer.extractCurrentPanel())
      .then(previewInfo => previewStorage.addOrUpdateById(entity.id, previewInfo))
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
  TradePreviewer.waitWhileCurrentPanelExists()
    .then(() => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('hovered');
        const previewInfo = entry.etc?.previewInfo as PreviewPanelSnapshot;
        if (!previewInfo) {
          console.warn('No preview info found for entry:', entry.id);
          return;
        }
        TradePreviewer.showAsPreviewPanel(previewInfo);
      });

      element.addEventListener('mouseleave', () => {
        element.classList.remove('hovered');
        TradePreviewer.hidePreviewPanel();
      });
    })
    .catch(error => {
      console.error('Failed to wait for TradePreviewInjector:', error);
    });
}

export function attachCreateFavoriteEvent(
  element: HTMLElement,
  entrySupplier: () => {
    id: string;
    url: string;
    preview: Promise<PreviewPanelSnapshot>;
  }
): void {
  element.addEventListener('click', (e) => {
    e.stopPropagation();
    const entry = entrySupplier();

    favoriteStorage.isFavoriteContains(entry.id)
      .then(isFavorite => {
        if (isFavorite) {
          // 이미 즐겨찾기인 경우 추가로 등록할 지 확인
          if (!confirm('이미 즐겨찾기에 추가된 항목입니다. 다시 추가하시겠습니까?')) {
            return;
          }
        }
      })
      .then(() => openFavoriteFolderModal('create', entry))
      .catch((error) => console.error('Error opening favorite modal:', error));
  });
}