import '../styles/sidebar.scss';
import * as api from '../utils/api';
import { getCurrentServerRegion, getServerRegion } from '../utils/api';
import { showToast} from '../utils/toast';
import { getCurrentLocale, getMessage } from '../utils/_locale';
import * as favoriteStorage from '../storage/favoriteStorage';
import * as searchHistoryStorage from '../storage/searchHistoryStorage';
import * as settingStorage from '../storage/settingStorage';
import { TradePreviewer } from '../utils/tradePreviewInjector';
import * as previewStorage from '../storage/previewStorage';
import * as favoriteUI from '../ui/favoriteFileSystemUI';
import * as fs from '../ui/fileSystemEntry';
import * as settings from '../ui/settingsModal';
import { openFavoriteFolderModal } from '../ui/newFavoriteModal';
import { PreviewPanelSnapshot } from '../storage/previewStorage';
import { FileSystemEntry } from '../ui/fileSystemEntry';
import { renderSidebarTools } from '../ui/sidebarToolUI';
import * as storageUsage from '../storage/storageUsage';
// import { buildSimplifiedTree } from '../utils/shareFavorites';

export const POE2_SIDEBAR_ID = 'poe2-sidebar';
export const POE2_CONTENT_WRAPPER_ID = 'poe2-content-wrapper';

const sidebarHtml = `
<div id="sidebar-header">
  <h2 class="sidebar-header-title">${getMessage('sidebar_title')}</h2>
  <button id="setting"/>
</div>
<div id="poe2-sidebar-resizer"></div>
<div id="sidebar-menu">
  <button class="menu-tab active" data-tab="history">${getMessage('history_tab')}</button>
  <button class="menu-tab" data-tab="favorites">${getMessage('favorites_tab')}</button>
</div>

<div id="sidebar-content">
  <div id="history" class="tab-content active">
    <h3>
      <span class="history-title-group">
        <span>${getMessage('search_history')}</span>
        <label class="switch">
          <input type="checkbox" id="history-switch" checked>
          <span class="slider"   title="${getMessage('history_switch_title')}"/>
        </label>
      </span>
      <button id="clear-history">${getMessage('clear_history')}</button>
    </h3>
    <ul id="history-list"></ul>
  </div>
  <div id="favorites" class="tab-content">
    <h3>
      <span>
        ${getMessage('favorites')}
        <img src="${chrome.runtime.getURL('assets/warning_24dp_F19E39.svg')}" class="favorite-warning-icon" alt="!" style="display:none;"/>
      </span>
      <button id="add-favorite">${getMessage('manage_favorites')}</button>
    </h3>
    <div id="favorites-list-wrapper"></div>
<!--    <div id="favorite-import-export" class="favorite-import-export-bottom">-->
<!--      <button id="favorite-import-btn" class="favorite-import-btn">${getMessage('button_import')}</button>-->
<!--      <button id="favorite-export-btn" class="favorite-export-btn">${getMessage('button_export')}</button>-->
<!--    </div>-->
  </div>
</div>
`;

const historyItem = `
<span class="favorite-star">★</span>
<span class="history-name"></span>
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


  // 사이드바 배경 투명도 설정
  settingStorage.getSidebarOpacity().then(opacity => {
    sidebar.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
  });

  if (api.isKoreanServer()) {
    //poe2-sidebar top 80px 설정
    const bannerHeight = 80; // 배너 높이
    const minTop = 5; // 최소 top 값
    sidebar.style.top = bannerHeight + 'px';
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      // 스크롤이 배너 높이 이하일 땐 점점 올라가고, 초과시 0으로 고정
      const newTop = Math.max(minTop, bannerHeight - scrollTop);
      sidebar.style.top = newTop + 'px';
    });
  }

  const resizer = sidebar.querySelector<HTMLDivElement>('#poe2-sidebar-resizer');
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  if (resizer) {
    resizer.addEventListener('mousedown', e => {
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!isResizing) return;
      const dx = startX - e.clientX;
      let newWidth = startWidth + dx;
      newWidth = Math.max(200, Math.min(600, newWidth));
      sidebar.style.width = newWidth + 'px';
      // content wrapper 패딩도 동기화
      const wrapper = document.getElementById(POE2_CONTENT_WRAPPER_ID);
      if (wrapper) {
        wrapper.style.paddingRight = newWidth + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // sidebar history 삭제
  const clearHistoryButton = sidebar.querySelector<HTMLButtonElement>('#clear-history');
  clearHistoryButton?.addEventListener('click', () => {
    if (confirm(getMessage('confirm_clear_history'))) {
      searchHistoryStorage
        .removeAll()
        .then(() => {
          showToast(getMessage('toast_history_cleared'));
        })
        .catch(error => {
          console.error(getMessage('error_clear_history', error.toString()));
          showToast(getMessage('toast_history_clear_failed'), '#f00');
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
      showToast(getMessage('toast_history_auto_add', isChecked ? 'enabled' : 'disabled'));
    });
  })();

  (async () => {
    const settingButton = sidebar.querySelector<HTMLButtonElement>('#setting');
    if (!settingButton) throw new Error('setting button not found');
    void settings.attachSettingOnClick(settingButton);
  })();

  const addFavoriteButton = sidebar.querySelector<HTMLButtonElement>(
    '#add-favorite'
  ) as HTMLButtonElement;

  addFavoriteButton.addEventListener('click', e => {
    e.stopPropagation();
    void openFavoriteFolderModal();
  });

  void renderSidebarTools();

  const favoriteWrapper = document.getElementById('favorites-list-wrapper') as HTMLDivElement;

  // 저장소 사용량 경고 기능
  void attachSyncStorageUsageWarning(sidebar);

  // import/export 버튼 이벤트 연결 (탭 하단 고정)
  Promise.resolve()
    .then(() => loadHistoryList(searchHistoryStorage.getAll()))
    .then(() => favoriteUI.loadFavoriteFileSystemUI(favoriteWrapper))
    .then(() => {
      searchHistoryStorage.addOnChangeListener(newValue =>
        loadHistoryList(Promise.resolve(newValue))
      );
      previewStorage.addOnChangeListener(() => loadHistoryList(searchHistoryStorage.getAll()));
      void favoriteStorage.addOnChangeListener(() => loadHistoryList(searchHistoryStorage.getAll()));



      // const importBtn = document.getElementById('favorite-import-btn') as HTMLButtonElement | null;
      // const exportBtn = document.getElementById('favorite-export-btn') as HTMLButtonElement | null;
      // if (importBtn && exportBtn) {
      //   importBtn.onclick = async () => {
      //     try {
      //       const folder = await favoriteUI.getSelectedFolder(favoriteWrapper);
      //       const path = fs.getPath(await favoriteStorage.getAll(), folder);
      //       alert(getMessage('alert_import_to_folder', path));
      //       // 실제 import 로직은 여기에 구현
      //     } catch {
      //       alert(getMessage('alert_select_folder_first'));
      //     }
      //   };
      //   exportBtn.onclick = async () => {
      //     try {
      //       const folder = await favoriteUI.getSelectedFolder(favoriteWrapper);
      //       const path = fs.getPath(await favoriteStorage.getAll(), folder);
      //       alert(getMessage('alert_export_from_folder', path));
      //       const tree = buildSimplifiedTree(await favoriteStorage.getAll(), folder.id);
      //       console.info(tree);
      //       console.info(JSON.stringify(tree, null, 2));
      //     } catch {
      //       alert(getMessage('alert_select_folder_first'));
      //     }
      //   };
      // }
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
function createHistoryItem(
  entry: searchHistoryStorage.SearchHistoryEntity,
  previewStoragePromise: Promise<Record<string, PreviewPanelSnapshot>>,
  favoriteStoragePromise: Promise<FileSystemEntry[]>
): HTMLElement {
  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = historyItem;

  const nameSpan = li.querySelector('.history-name') as HTMLSpanElement;
  const removeButton = li.querySelector('.remove-history') as HTMLButtonElement;
  const favoriteStar = li.querySelector('.favorite-star') as HTMLSpanElement;

  previewStorage.getById(entry.id, previewStoragePromise).then(previewInfo => {
    if (previewInfo && previewInfo.searchKeyword) {
      nameSpan.textContent = previewInfo.searchKeyword;
    } else {
      nameSpan.textContent = entry.id;
    }
  });

  // title에 정보 표시
  const locale = getCurrentLocale();
  const lastSearchedStr = getMessage(
    'history_item_last_searched',
    new Date(entry.lastSearched).toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );
  const totalSearchesStr = getMessage(
    'history_item_total_searches',
    String(entry.previousSearches.length + 1)
  );
  let prevSearchesStr = '';
  if (entry.previousSearches.length > 0) {
    prevSearchesStr =
      '\n' +
      getMessage('history_item_previous_searches') +
      '\n' +
      entry.previousSearches
        .map(search =>
          new Date(search).toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })
        )
        .join('\n');
  }
  li.title = `${lastSearchedStr}\n${totalSearchesStr}${prevSearchesStr}`;

  favoriteStorage
    .existsByMetadataId(entry.id, favoriteStoragePromise)
    .then(isFavorite => {
      if (isFavorite) {
        favoriteStar.classList.add('active');
      }
    })
    .catch(error => {
      console.error(getMessage('error_check_favorite', error.toString()));
    });

  // hover 시 미리보기 패널 표시
  attachPreviewHoverEvents(li, entry.id, previewStoragePromise);

  // history-item 클릭 시
  li.addEventListener('click', () => {
    if (!(getServerRegion(new URL(entry.url)) === getCurrentServerRegion())) {
      if (
        !confirm(
          getMessage(
            'confirm_redirect_to_other_server',
            getServerRegion(new URL(entry.url)),
            getCurrentServerRegion()
          )
        )
      ) {
        return;
      }
    }

    window.location.href = entry.url;
  });

  attachCreateFavoriteEvent(favoriteStar, () => ({
    id: entry.id,
    url: entry.url
  }));

  removeButton.addEventListener('click', e => {
    e.stopPropagation();
    searchHistoryStorage.deleteById(entry.id).catch(error => {
      console.error(getMessage('error_delete_history', error.toString()));
    });
    li.remove();
  });

  return li;
}

export function loadHistoryList(
  historyList: Promise<searchHistoryStorage.SearchHistoryEntity[]>
): void {
  historyList.then(entries => {
    const historyListElement = document.getElementById('history-list');
    if (!historyListElement) {
      console.error(getMessage('error_history_list_not_found'));
      return;
    }
    const list = historyListElement as HTMLUListElement;
    list.innerHTML = '';

    // 최신 순 정렬
    entries.sort((a, b) => new Date(b.lastSearched).getTime() - new Date(a.lastSearched).getTime());

    // 날짜 그룹핑
    const now = new Date();
    const locale = getCurrentLocale();
    const todayStr = now.toLocaleDateString(locale);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString(locale);
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // 그룹별로 분류
    const groups: { [key: string]: searchHistoryStorage.SearchHistoryEntity[] } = {
      오늘: [],
      어제: [],
      일주일전: [],
      오래됨: []
    };
    const dateGroups: { [date: string]: searchHistoryStorage.SearchHistoryEntity[] } = {};

    entries.forEach(entry => {
      const entryDate = new Date(entry.lastSearched);
      const entryDateStr = entryDate.toLocaleDateString(locale);
      if (entryDateStr === todayStr) {
        groups['오늘'].push(entry);
      } else if (entryDateStr === yesterdayStr) {
        groups['어제'].push(entry);
      } else if (entryDate >= oneWeekAgo) {
        // 7일 이내는 날짜별로
        if (!dateGroups[entryDateStr]) dateGroups[entryDateStr] = [];
        dateGroups[entryDateStr].push(entry);
      } else if (entryDate >= twoWeeksAgo) {
        groups['일주일전'].push(entry);
      } else {
        groups['오래됨'].push(entry);
      }
    });

    const previewStoragePromise = previewStorage.getAll();
    const favoriteStoragePromise = favoriteStorage.getAll();

    // 그룹 렌더링 함수
    function renderGroup(
      header: string,
      items: searchHistoryStorage.SearchHistoryEntity[],
      dateLabel?: string
    ) {
      if (items.length === 0) return;
      const headerLi = document.createElement('li');
      headerLi.className = 'history-group-header';
      // i18n 적용
      const headerText = getMessage(header) || header;
      headerLi.innerHTML = dateLabel
        ? `<span>${headerText}</span><span style="float:right;opacity:0.7;font-size:13px;">${dateLabel}</span>`
        : headerText;
      list.appendChild(headerLi);

      items.forEach(entry => {
        const item = createHistoryItem(entry, previewStoragePromise, favoriteStoragePromise);
        list.appendChild(item);
      });
    }

    // 오늘, 어제
    if (groups['오늘'].length > 0) {
      const date = new Date(groups['오늘'][0].lastSearched);
      const dateStr = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      renderGroup('history_group_today', groups['오늘'], dateStr);
    }
    if (groups['어제'].length > 0) {
      const date = new Date(groups['어제'][0].lastSearched);
      const dateStr = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      renderGroup('history_group_yesterday', groups['어제'], dateStr);
    }

    // 날짜별(오늘/어제/일주일전/오래됨 제외)
    const dateGroupKeys = Object.keys(dateGroups).sort((a, b) => {
      // 최신순
      return new Date(b).getTime() - new Date(a).getTime();
    });
    dateGroupKeys.forEach(dateStr => {
      const date = new Date(dateStr);
      const fullDate = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
      renderGroup(`${fullDate}`, dateGroups[dateStr]);
    });

    // 일주일전
    if (groups['일주일전'].length > 0) {
      const min = groups['일주일전'].reduce(
        (min, e) => (new Date(e.lastSearched) < new Date(min.lastSearched) ? e : min),
        groups['일주일전'][0]
      );
      const max = groups['일주일전'].reduce(
        (max, e) => (new Date(e.lastSearched) > new Date(max.lastSearched) ? e : max),
        groups['일주일전'][0]
      );
      const minDate = new Date(min.lastSearched);
      const maxDate = new Date(max.lastSearched);
      const rangeStr = `${minDate.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} ~ ${maxDate.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}`;
      renderGroup('history_group_last_week', groups['일주일전'], rangeStr);
    }
    if (groups['오래됨'].length > 0) {
      const max = groups['오래됨'].reduce(
        (max, e) => (new Date(e.lastSearched) > new Date(max.lastSearched) ? e : max),
        groups['오래됨'][0]
      );
      const maxDate = new Date(max.lastSearched);
      const rangeStr = `~ ${maxDate.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}`;
      renderGroup('history_group_older', groups['오래됨'], rangeStr);
    }
  });
}

function observeUrlChange() {
  let lastUrl = window.location.href;

  const checkUrlChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      updateHistoryFromUrl(currentUrl).catch(console.debug);
    }
  };

  const observer = new MutationObserver(checkUrlChange);
  observer.observe(document.body, { childList: true, subtree: true });
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
      .catch(err => console.error(getMessage('error_extract_panel', err.toString())));
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

    await searchHistoryStorage
      .addOrUpdate(entity.id, entity.url)
      .then(() => settingStorage.setLatestSearchUrl(currentUrl))
      .then(() => console.log(getMessage('log_search_history_updated', currentUrl)));
  } catch (err) {
    console.info(getMessage('error_handle_url_change', currentUrl), err);
    if (process.env.NODE_ENV === 'development') {
      const errMsg = err instanceof Error ? err.toString() : String(err);
      console.error(getMessage('error_handle_url_change', errMsg));
    }
  } finally {
    currentHandleUrl = '';
  }
}

export function attachPreviewHoverEvents(
  element: HTMLElement,
  entryId: string,
  previewStoragePromise: Promise<Record<string, PreviewPanelSnapshot>>
): void {
  TradePreviewer.addHoverEventListener(
    element,
    entryId,
    previewStoragePromise,
    element.querySelector('.history-name') as HTMLElement
  );
}

export function attachCreateFavoriteEvent(
  element: HTMLElement,
  entrySupplier: () => {
    id: string;
    url: string;
  }
): void {
  element.addEventListener('click', e => {
    e.stopPropagation();
    try {
      const entry = entrySupplier();

      favoriteStorage
        .getAll()
        .then(favorites => {
          return favorites
            .filter(fav => fav.id === entry.id)
            .map(fav => fs.getPath(favorites, fav));
        })
        .then(favoritesPath => {
          if (favoritesPath.length > 0) {
            const message = getMessage(
              'already_in_favorites',
              favoritesPath.map(path => `- ${path}`).join('\n')
            );
            if (!confirm(message)) {
              return;
            }
          }
          return openFavoriteFolderModal({id: entry.id, url: entry.url});
        });
    } catch (error) {
      if (error instanceof Error) {
        showToast(getMessage('toast_favorite_add_error'), '#f00');
      } else {
        showToast(getMessage('toast_favorite_add_unknown_error'), '#f00');
      }
    }
  });
}


async function attachSyncStorageUsageWarning(sidebar: HTMLElement): Promise<void> {
  const favoriteWarningIcon = sidebar.querySelector<HTMLImageElement>('.favorite-warning-icon');
  if (!favoriteWarningIcon) {
    console.error(getMessage('error_favorite_warning_icon_not_found'));
    return;
  }
  const isFavoriteGDriveSyncEnabled = await settingStorage.isFavoriteGDriveSyncEnabled();
  if (isFavoriteGDriveSyncEnabled) {
    favoriteWarningIcon.style.display = 'none';
    return;
  }

  async function updateWarningIcon(): Promise<void> {
    if (!favoriteWarningIcon) return;

    const usage = await storageUsage.usageInfoAll();
    const syncUsage = usage['sync'];
    if (!syncUsage) {
      favoriteWarningIcon.style.display = 'none';
      return;
    }

    const maxChromeSyncStorage = 100 * 1024; // 100KB
    const currentUsage = syncUsage.totalSize;
    const warningThreshold = maxChromeSyncStorage * 0.9;

    console.info(`Favorite storage usage: ${(currentUsage / 1024).toFixed(2)}KB`);

    if (currentUsage >= warningThreshold) {
      const message = getMessage(
        'favorite_storage_warning',
        (currentUsage / 1024).toFixed(2) + 'KB',
        '100KB'
      );

      favoriteWarningIcon.style.display = 'inline';
      favoriteWarningIcon.title = message;
      favoriteWarningIcon.style.cursor = 'pointer';
      favoriteWarningIcon.onclick = () => alert(message);
    } else {
      favoriteWarningIcon.style.display = 'none';
      favoriteWarningIcon.title = '';
      favoriteWarningIcon.style.cursor = 'default';
      favoriteWarningIcon.onclick = null;
    }
  }

  await updateWarningIcon();
  await favoriteStorage.addOnChangeListener(() => {
    void updateWarningIcon();
  });
}

/*
storageUsage.usageInfoAll()
          .then(async usage => {
            const isFavoriteGDriveSyncEnabled = await settingStorage.isFavoriteGDriveSyncEnabled();

            const maxChromeSyncStorage = 100 * 1024; // 100KB
            const currentUsage = usage['sync']?.totalSize || 0;
            const warningThreshold = maxChromeSyncStorage * 0.9; // 90% 경고 임계값


            if (currentUsage >= warningThreshold) {
              favoriteWarningIcon.style.display = 'inline';
              const message = getMessage('favorite_storage_warning', (currentUsage / 1024).toFixed(2) + 'KB', '100KB');
              favoriteWarningIcon.title = message;
              // onclick 시 경고 메시지 표시
              favoriteWarningIcon.onclick = () => {
                alert(message);
              };
            } else {
              // for test
              console.info(`Favorite storage usage is within safe limits: ${(currentUsage / 1024).toFixed(2)}KB`);
              favoriteWarningIcon.style.display = 'none';
              favoriteWarningIcon.title = '';
              favoriteWarningIcon.onclick = null;
            }
          });
 */