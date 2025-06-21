import '../styles/sidebar.css';
import * as api from '../utils/api';
import * as storage from '../utils/storage';
import sources = chrome.devtools.panels.sources;

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
    <ul id="favorites-list"></ul>
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

  // sidebar 여닫기
  const toggleButton = sidebar.querySelector<HTMLButtonElement>(`#poe2-sidebar-toggle-button`);
  let isOpen = true;

  toggleButton?.addEventListener('click', () => {
    isOpen = !isOpen;
    sidebar.classList.toggle('collapsed', !isOpen);
    wrapper.classList.toggle('collapsed', !isOpen);
    toggleButton.textContent = isOpen ? '⮜' : '⮞';
  });

  loadHistoryList(storage.getAllHistory());
  storage.addSearchHistoryChangedListener((newEntries) => {
    loadHistoryList(Promise.resolve(newEntries));
  });
}

//history-name-input -> placeHolder=${entry.id}
function createHistoryItem(entry: storage.SearchHistoryEntity): HTMLElement {
  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = historyItem;

  const nameSpan = li.querySelector('.history-name') as HTMLSpanElement;
  const lastSearchedSpan = li.querySelector('.last-searched') as HTMLSpanElement;
  const totalSearchesSpan = li.querySelector('.total-searches') as HTMLSpanElement;
  const removeButton = li.querySelector('.remove-history') as HTMLButtonElement;
  const favoriteStar = li.querySelector('.favorite-star') as HTMLSpanElement;

  // TODO: 이력 저장 시 메타데이터를 저장할 수 있도록 수정
  // li.title = entry.metadata;
  nameSpan.textContent = entry.id;
  //    existing.lastSearched = new Date().toISOString();
  lastSearchedSpan.textContent = `Last searched: ${new Date(entry.lastSearched).toLocaleString()}`;
  totalSearchesSpan.textContent = `Total searches: ${entry.previousSearches.length + 1}`;
  if (entry.previousSearches.length > 0) {
    totalSearchesSpan.title = `Previous searches: ${entry.previousSearches.join('\n')}`;
  }

  // history-item 클릭 시
  li.addEventListener('click', () => {
    window.location.href = api.getUrlFromSearchHistory(entry);
  });

  favoriteStar.addEventListener('click', (e) => {
    e.stopPropagation();
    const isFavorite = favoriteStar.classList.contains('active');
    if (isFavorite) {
      return;
    }

    favoriteStar.classList.add('active');
    //TODO : 즐겨찾기 기능 구현
  });

  removeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    storage.deleteHistoryById(entry.id).catch((error) => {
      console.error('Error deleting history:', error);
    });
    li.remove();
  });

  return li;
}

function loadHistoryList(historyList: Promise<storage.SearchHistoryEntity[]>): void {
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
