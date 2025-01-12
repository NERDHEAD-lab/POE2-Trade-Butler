const toggleStates = {};

function initSidebar() {
  const content = document.querySelector('.content');
  if (!content) {
    console.error('Target element with class \'content\' not found');
    return;
  }

  if (document.getElementById('poe-sidebar')) {
    console.log('Sidebar already exists.');
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'poe-sidebar';
  sidebar.innerHTML = `
    <div id="sidebar-header">
      <h2>Trade Butler</h2>
      <button id="clear-history">Clear History</button>
    </div>
    <div id="history">
      <h3>Search History</h3>
      <ul id="history-list"></ul>
    </div>
    <div id="favorites">
      <h3>Favorites</h3>
      <ul id="favorites-list"></ul>
    </div>
  `;

  sidebar.style.width = '330px';
  sidebar.style.height = '100vh';
  sidebar.style.backgroundColor = '#f4f4f4';
  sidebar.style.borderLeft = '1px solid #ccc';
  sidebar.style.zIndex = '9999';
  sidebar.style.overflowY = 'auto';
  sidebar.style.position = 'relative';
  sidebar.style.resize = 'horizontal';
  sidebar.style.overflow = 'hidden';

  const resizer = document.createElement('div');
  resizer.style.width = '10px';
  resizer.style.cursor = 'ew-resize';
  resizer.style.position = 'absolute';
  resizer.style.top = '0';
  resizer.style.right = '0';
  resizer.style.height = '100%';
  resizer.style.zIndex = '10000';
  resizer.style.backgroundColor = 'transparent';
  resizer.id = 'sidebar-resizer';

  sidebar.appendChild(resizer);

  content.style.display = 'flex';
  content.appendChild(sidebar);

  const wrapper = content.querySelector('.wrapper');
  if (wrapper) wrapper.style.flex = '1';

  bindClearHistoryButton();
  loadSearchHistory();
  loadFavorites();

  enableResizeSidebar(sidebar, resizer);

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.searchHistory) loadSearchHistory();
      if (changes.favorites) loadFavorites();
    }
  });
}

function enableResizeSidebar(sidebar, resizer) {
  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isResizing = true;
    document.body.style.cursor = 'ew-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 200 && newWidth <= 600) {
      sidebar.style.width = `${newWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = 'default';
    }
  });
}

function loadSearchHistory() {
  chrome.storage.local.get(['searchHistory'], (storage) => {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    historyList.innerHTML = '';
    const history = storage.searchHistory || [];

    history.forEach((entry) => {
      const li = document.createElement('li');
      const lastSearched = new Date(entry.lastSearched).toLocaleString();

      li.innerHTML = `
        <div>
          <strong>ID:</strong> ${entry.id} <br />
          <strong>Last Searched:</strong> ${lastSearched}
        </div>
        <button class="toggle-history">Toggle Previous</button>
        <ul class="previous-searches" style="display: ${
        toggleStates[entry.id] ? 'block' : 'none'
      };"></ul>
      `;

      appendPreviousSearches(entry, li);
      historyList.appendChild(li);
    });
  });
}

// 이전 검색 기록 추가
function appendPreviousSearches(entry, li) {
  const previousSearchesList = li.querySelector('.previous-searches');
  entry.previousSearches = entry.previousSearches || [];
  entry.previousSearches.forEach((timestamp) => {
    const prevLi = document.createElement('li');
    prevLi.textContent = new Date(timestamp).toLocaleString();
    previousSearchesList.appendChild(prevLi);
  });

  const toggleButton = li.querySelector('.toggle-history');
  toggleButton.addEventListener('click', () => {
    const isExpanded = previousSearchesList.style.display === 'none';
    previousSearchesList.style.display = isExpanded ? 'block' : 'none';
    toggleStates[entry.id] = isExpanded;
  });
}

// 즐겨찾기 로드 함수
function loadFavorites() {
  chrome.storage.local.get(['favorites'], (storage) => {
    const favoritesList = document.getElementById('favorites-list');
    if (!favoritesList) return;

    favoritesList.innerHTML = '';
    const favorites = storage.favorites || [];

    favorites.forEach((fav) => {
      const li = document.createElement('li');
      li.textContent = `ID: ${fav.id}`;
      favoritesList.appendChild(li);
    });
  });
}

// 검색 이력 초기화 버튼 바인딩
function bindClearHistoryButton() {
  const clearButton = document.getElementById('clear-history');
  if (!clearButton) return;

  clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ searchHistory: [] }, () => {
      console.log('Search history cleared.');
    });

    for (const key in toggleStates) {
      delete toggleStates[key];
    }
  });
}

(function() {
  const currentData = window.localStorage;
  if (currentData) {
    chrome.runtime.sendMessage({
      type: 'LOCAL_STORAGE',
      data: currentData
    }).then((response) => {
      console.log('Response from background script:', response);
    }).catch((error) => {
      console.error('Error sending message to background script:', error);
    });
  } else {
    console.error('current 객체를 찾을 수 없습니다.');
  }
})();



// 초기화 호출
initSidebar();
