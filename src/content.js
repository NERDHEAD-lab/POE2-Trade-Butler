const toggleStates = {};
const poeServers = ["Standard", "Hardcore"];

function initSidebar() {
  const content = document.querySelector('.content');
  if (!content) {
    console.error('Target element with class "content" not found');
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
      <button id="restore-panel">Restore Panel</button>
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
  bindRestorePanelButton();
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
    if (!historyList) {
      console.error('history-list not found.');
      return;
    }

    historyList.innerHTML = ''; // 기존 목록 초기화
    const history = storage.searchHistory || [];

    history.forEach((entry) => {
      const li = document.createElement('li');
      const name = entry.name || entry.id; // 이름이 없으면 ID를 기본으로 표시
      const totalSearches = entry.previousSearches ? entry.previousSearches.length : 0;

      li.innerHTML = `
        <div class="history-item">
          <div class="history-info">
            <div class="name-edit-container">
              <span class="history-name">${name}</span>
              <input class="history-name-input" type="text" value="${name}" style="display: none;" />
              <button class="edit-name">✏️</button>
              <button class="save-name" style="display: none;">✔️</button>
              <button class="cancel-edit" style="display: none;">❌</button>
            </div>
            <span class="last-searched">Last Searched: ${new Date(entry.lastSearched).toLocaleString()}</span>
            <span class="total-searches" title="Previous Searches: ${entry.previousSearches
        .map((timestamp) => new Date(timestamp).toLocaleString())
        .join('\n')}">총 ${totalSearches}회</span>
          </div>
          <button class="remove-history">🗑️</button>
        </div>
      `;

      // 이벤트 바인딩
      const nameSpan = li.querySelector('.history-name');
      const nameInput = li.querySelector('.history-name-input');
      const editButton = li.querySelector('.edit-name');
      const saveButton = li.querySelector('.save-name');
      const cancelButton = li.querySelector('.cancel-edit');
      const removeButton = li.querySelector('.remove-history');
      const totalSearchesElement = li.querySelector('.total-searches');

      // 클릭 시 URL 이동
      li.addEventListener('click', (event) => {
        // 클릭 이벤트가 수정/삭제 버튼에서 발생한 경우 무시
        if (
          event.target.classList.contains('history-name-input') ||
          event.target.classList.contains('edit-name') ||
          event.target.classList.contains('save-name') ||
          event.target.classList.contains('cancel-edit') ||
          event.target.classList.contains('remove-history')
        ) {
          return;
        }

        if (entry.url) {
          window.location.href = entry.url;
        } else {
          console.warn('URL not found for this entry.');
        }
      });

      // previousSearches 마우스 호버 이벤트
      totalSearchesElement.addEventListener('mouseover', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = entry.previousSearches
          .map((timestamp) => new Date(timestamp).toLocaleString())
          .join('\n');
        document.body.appendChild(tooltip);

        // 위치 계산
        const rect = totalSearchesElement.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;
      });

      totalSearchesElement.addEventListener('mouseout', () => {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) tooltip.remove();
      });

      // 수정 버튼 클릭
      editButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        nameSpan.style.display = 'none'; // 이름 텍스트 숨기기
        nameInput.style.display = 'inline-block'; // 입력창 보이기
        editButton.style.display = 'none'; // 수정 버튼 숨기기
        saveButton.style.display = 'inline-block'; // 저장 버튼 보이기
        cancelButton.style.display = 'inline-block'; // 취소 버튼 보이기
      });

      // 저장 버튼 클릭
      saveButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        const newName = nameInput.value.trim() || entry.id; // 빈 값이면 ID로 대체
        updateHistoryName(entry.id, newName, () => {
          nameSpan.textContent = newName;
          nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
          nameInput.style.display = 'none'; // 입력창 숨기기
          editButton.style.display = 'inline-block'; // 수정 버튼 보이기
          saveButton.style.display = 'none'; // 저장 버튼 숨기기
          cancelButton.style.display = 'none'; // 취소 버튼 숨기기
        });
      });

      // 취소 버튼 클릭
      cancelButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        nameInput.value = nameSpan.textContent; // 입력창 초기화
        nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
        nameInput.style.display = 'none'; // 입력창 숨기기
        editButton.style.display = 'inline-block'; // 수정 버튼 보이기
        saveButton.style.display = 'none'; // 저장 버튼 숨기기
        cancelButton.style.display = 'none'; // 취소 버튼 숨기기
      });

      // 제거 버튼 클릭
      removeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        removeHistory(entry.id);
      });

      historyList.appendChild(li);
    });
  });
}




// History 이름 업데이트 함수
function updateHistoryName(id, newName, callback) {
  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    const updatedHistory = history.map((entry) =>
      entry.id === id ? { ...entry, name: newName } : entry
    );

    chrome.storage.local.set({ searchHistory: updatedHistory }, () => {
      console.log(`History with ID ${id} updated to Name: ${newName}`);
      if (callback) callback();
    });
  });
}

// History 항목 제거 함수
function removeHistory(id) {
  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    const updatedHistory = history.filter((entry) => entry.id !== id);

    chrome.storage.local.set({ searchHistory: updatedHistory }, () => {
      console.log(`History with ID ${id} removed.`);
      loadSearchHistory(); // UI 업데이트
    });
  });
}


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

function bindRestorePanelButton() {
  const restoreButton = document.getElementById('restore-panel');
  if (!restoreButton) return;

  restoreButton.addEventListener('click', () => {
    // Restore panel logic
    console.log('Restore Panel button clicked.');
  });
}

function bindClearHistoryButton() {
  const clearButton = document.getElementById('clear-history');
  if (!clearButton) return;

  clearButton.addEventListener('click', () => {
    // 확인 창 추가
    if (!confirm('Are you sure you want to clear the search history?')) return;

    // 스토리지에서 검색 기록 삭제
    chrome.storage.local.set({ searchHistory: [] }, () => {
      console.log('Search history cleared.');

      // UI에서 검색 기록 초기화
      const historyList = document.getElementById('history-list');
      if (historyList) {
        historyList.innerHTML = ''; // UI 초기화
      }

      // 토글 상태 초기화
      for (const key in toggleStates) {
        delete toggleStates[key];
      }

      console.log('Search history UI cleared.');
    });
  });
}

function loadFavorites() {
  chrome.storage.local.get(['favorites'], (storage) => {
    const favoritesList = document.getElementById('favorites-list');
    if (!favoritesList) {
      console.error('favorites-list not found.');
      return;
    }

    favoritesList.innerHTML = ''; // 기존 즐겨찾기 목록 초기화
    const favorites = storage.favorites || [];

    favorites.forEach((fav) => {
      const li = document.createElement('li');
      const name = fav.name || fav.id; // 이름이 없으면 ID를 기본으로 표시

      li.innerHTML = `
        <div class="favorite-item">
          <span class="favorite-name">${name}</span>
          <input class="favorite-name-input" type="text" value="${name}" style="display: none;" />
          <button class="edit-name">
            ✏️
          </button>
          <button class="save-name" style="display: none;">✔️</button>
          <button class="cancel-edit" style="display: none;">❌</button>
          <button class="remove-favorite">Remove</button>
        </div>
      `;

      // 이벤트 바인딩
      const nameSpan = li.querySelector('.favorite-name');
      const nameInput = li.querySelector('.favorite-name-input');
      const editButton = li.querySelector('.edit-name');
      const saveButton = li.querySelector('.save-name');
      const cancelButton = li.querySelector('.cancel-edit');
      const removeButton = li.querySelector('.remove-favorite');

      // 수정 버튼 클릭
      editButton.addEventListener('click', () => {
        nameSpan.style.display = 'none'; // 이름 텍스트 숨기기
        nameInput.style.display = 'inline-block'; // 입력창 보이기
        editButton.style.display = 'none'; // 수정 버튼 숨기기
        saveButton.style.display = 'inline-block'; // 저장 버튼 보이기
        cancelButton.style.display = 'inline-block'; // 취소 버튼 보이기
      });

      // 저장 버튼 클릭
      saveButton.addEventListener('click', () => {
        const newName = nameInput.value.trim() || fav.id; // 빈 값이면 ID로 대체
        updateFavoriteName(fav.id, newName, () => {
          nameSpan.textContent = newName;
          nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
          nameInput.style.display = 'none'; // 입력창 숨기기
          editButton.style.display = 'inline-block'; // 수정 버튼 보이기
          saveButton.style.display = 'none'; // 저장 버튼 숨기기
          cancelButton.style.display = 'none'; // 취소 버튼 숨기기
        });
      });

      // 취소 버튼 클릭
      cancelButton.addEventListener('click', () => {
        nameInput.value = nameSpan.textContent; // 입력창 초기화
        nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
        nameInput.style.display = 'none'; // 입력창 숨기기
        editButton.style.display = 'inline-block'; // 수정 버튼 보이기
        saveButton.style.display = 'none'; // 저장 버튼 숨기기
        cancelButton.style.display = 'none'; // 취소 버튼 숨기기
      });

      // 제거 버튼 클릭
      removeButton.addEventListener('click', () => {
        removeFavorite(fav.id);
      });

      favoritesList.appendChild(li);
    });
  });
}

// 즐겨찾기 이름 업데이트 함수
function updateFavoriteName(id, newName, callback) {
  chrome.storage.local.get(['favorites'], (storage) => {
    const favorites = storage.favorites || [];
    const updatedFavorites = favorites.map((fav) =>
      fav.id === id ? { ...fav, name: newName } : fav
    );

    chrome.storage.local.set({ favorites: updatedFavorites }, () => {
      console.log(`Favorite with ID ${id} updated to Name: ${newName}`);
      if (callback) callback();
    });
  });
}

// 즐겨찾기 항목 제거 함수
function removeFavorite(id) {
  chrome.storage.local.get(['favorites'], (storage) => {
    const favorites = storage.favorites || [];
    const updatedFavorites = favorites.filter((fav) => fav.id !== id);

    chrome.storage.local.set({ favorites: updatedFavorites }, () => {
      console.log(`Favorite with ID ${id} removed.`);
      loadFavorites(); // UI 업데이트
    });
  });
}




function observeUrlChanges() {
  let previousUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== previousUrl) {
      previousUrl = currentUrl;

      const url = new URL(currentUrl);
      const parsedData = parseUrl(url);

      if (parsedData) {
        const { id, serverName } = parsedData;
        const currentDate = Date.now();

        chrome.runtime.sendMessage({
          type: 'URL_CHANGE',
          data: {
            id,
            name: id, // Default name is ID
            url: currentUrl,
            serverName,
            lastSearched: currentDate,
            previousSearches: [currentDate],
          },
        });
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

function parseUrl(url) {
  const pathSegments = url.pathname.split('/');

  const serverName = pathSegments[pathSegments.length - 2];
  const id = pathSegments[pathSegments.length - 1];

  if (poeServers.includes(serverName) && id && id !== serverName) {
    return { id, serverName };
  }

  return null;
}

// Initialize sidebar and observe URL changes
initSidebar();
observeUrlChanges();
