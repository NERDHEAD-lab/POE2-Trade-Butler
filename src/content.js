const poeServers = ['Standard', 'Hardcore'];
const SIDEBAR_ID = 'poe2-trade-sidebar';

function loadTemplate(filePath) {
  const url = chrome.runtime.getURL(filePath);
  return fetch(url).then((response) => response.text());
}

function initSidebar() {
  const content = document.querySelector('.content');
  if (!content) {
    console.error('Could not find .content element');
    return;
  }

  if (document.getElementById(SIDEBAR_ID)) {
    console.log('Sidebar already exists');
    return;
  }

  loadTemplate('components/sidebar.html').then((template) => {
    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    sidebar.innerHTML = template;

    // 사이드바 클래스 추가
    sidebar.classList.add('poe2-sidebar');

    // 사이드바를 content의 형제 요소로 추가
    const container = document.createElement('div');
    container.classList.add('poe2-container');
    container.style.display = 'flex';
    container.style.width = '100%';

    content.parentElement.insertBefore(container, content);
    container.appendChild(content);
    container.appendChild(sidebar);

    // content를 가운데 정렬
    content.style.marginRight = '320px';
    content.style.marginLeft = 'auto';
    content.style.width = 'calc(100% - 320px)'; // 사이드바 공간을 뺀 너비

    document.getElementById('clear-history').addEventListener('click', () => {
      if (!confirm('검색 기록을 모두 삭제하시겠습니까? (즐겨찾기는 유지됩니다)')) {
        return;
      }

      chrome.storage.local.get(['searchHistory'], (storage) => {
        const history = storage.searchHistory || [];
        const updatedHistory = history.filter((entry) => entry.favorite === true);
        chrome.storage.local.set({ searchHistory: updatedHistory }, () => {
          console.log('History removed:', updatedHistory);
        });
      });
    });

    initTabNavigation();
    initToggleSidebar(sidebar);
    initHistorySwitch();
    initFavoritesButton();
    loadHistory();
    loadFavorites();

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        if (changes.searchHistory) {
          loadHistory();
          loadFavorites();
        }
      }
    });
  });
}


function initTabNavigation() {
  const tabs = document.querySelectorAll('.menu-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // 모든 탭 비활성화
      tabs.forEach((t) => t.classList.remove('active'));
      // 모든 콘텐츠 숨기기
      contents.forEach((content) => content.classList.remove('active'));

      // 클릭된 탭 활성화
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');

      loadHistory();
      loadFavorites();
    });
  });
}

function initToggleSidebar(sidebar) {
  const toggleButton = document.createElement('button');
  const content = document.querySelector('.content');

  toggleButton.id = 'poe2-trade-sidebar-toggle';
  toggleButton.classList.add('poe2-toggle-button');
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '8%'; // 사이드바와 동일한 상단 위치
  toggleButton.style.marginRight = '10px'; // 버튼을 화면 오른쪽에 고정


  toggleButton.textContent = '⮜';
  toggleButton.style.right = '300px'; // 사이드바 왼쪽 바로 바깥
  sidebar.style.right = '0';
  content.style.marginRight = '300px'; // 사이드바가 나타나면 마진 추가
  content.style.marginLeft = 'auto';

  document.body.appendChild(toggleButton);


  // 애니메이션 클래스 추가
  toggleButton.classList.add('transition-toggle-button');

  toggleButton.addEventListener('click', () => {
    if (sidebar.style.right === '-300px' || sidebar.style.right === '') {
      toggleButton.textContent = '⮜';
      toggleButton.style.right = '300px'; // 버튼 위치도 변경
      sidebar.style.right = '0';
      content.style.marginRight = '300px'; // 사이드바가 나타나면 마진 추가
      content.style.marginLeft = 'auto';
    } else {
      sidebar.style.right = '-300px';
      toggleButton.style.right = '20px'; // 버튼을 화면 오른쪽에 고정
      toggleButton.textContent = '⮞';
      content.style.marginRight = '0'; // 사이드바가 숨겨지면 마진 제거
      content.style.marginLeft = 'auto';
      content.style.width = '100%'; // 원래 너비로 복원
    }
  });
}


function initHistorySwitch() {
  const historySwitch = document.getElementById('history-switch');

  chrome.storage.local.get(['isHistoryEnabled'], (storage) => {
    if (storage.isHistoryEnabled === undefined) {
      chrome.storage.local.set({ isHistoryEnabled: true }, () => {
        console.log('Search history is enabled by default');
      });
    }
    historySwitch.checked = storage.isHistoryEnabled ?? true;
  });

  // 스위치 상태 변경 이벤트
  historySwitch.addEventListener('change', (event) => {
    const isEnabled = event.target.checked;
    chrome.storage.local.set({ isHistoryEnabled: isEnabled }, () => {
      console.log(`Search history is now ${isEnabled ? 'enabled' : 'disabled'}`);
    });
  });
}

function initFavoritesButton() {
  const favoritesButton = document.getElementById('add-favorite');
  favoritesButton.addEventListener('click', () => {
    try {
      addSearchHistory(location.href, true, true);
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  });
}

function loadHistory() {
  const historyList = document.getElementById('history-list');
  if (!historyList) return;
  historyList.innerHTML = '';

  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    history.forEach((entry) => {
      const listItem = createHistoryItem(entry);
      historyList.appendChild(listItem);
    });
  });
}

function loadFavorites() {
  const favoritesList = document.getElementById('favorites-list');
  if (!favoritesList) return;
  favoritesList.innerHTML = '';

  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    const favorites = history.filter((entry) => entry.favorite);
    favorites.forEach((entry) => {
      const listItem = createHistoryItem(entry);
      favoritesList.appendChild(listItem);
    });
  });
}

function createHistoryItem(entry) {
  const li = document.createElement('div');
  li.classList.add('history-item');

  li.innerHTML = `
    <span class="favorite-star ${entry.favorite ? 'active' : ''}">★</span>
    <div class="history-info">
      <div class="name-edit-container">
        <label>
          <span class="history-name">${entry.name}</span>
          <input class="history-name-input" type="text" value="${entry.name}" style="display: none;" />
        </label>
        <button class="edit-name">✏️</button>
        <button class="save-name" style="display: none;">✔️</button>
        <button class="cancel-edit" style="display: none;">❌</button>
      </div>
      <div>
        <span class="last-searched">최근: ${formatDate(entry.lastSearched)}</span>
      </div>
      <div><span class="total-searches"></span>
      </div>
    </div>
    <button class="remove-history">🗑️</button>
  `;

  const favoriteStar = li.querySelector('.favorite-star');
  const nameSpan = li.querySelector('.history-name');
  const nameInput = li.querySelector('.history-name-input');
  const editButton = li.querySelector('.edit-name');
  const saveButton = li.querySelector('.save-name');
  const cancelButton = li.querySelector('.cancel-edit');
  const removeButton = li.querySelector('.remove-history');
  const totalSearches = li.querySelector('.total-searches');

  li.addEventListener('click', (event) => {
    // 클릭 이벤트가 수정/삭제 버튼에서 발생한 경우 무시
    if (
      event.target.classList.contains('favorite-star') ||
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

  favoriteStar.addEventListener('click', () => {
    if (entry.favorite && !confirm('즐겨찾기를 해제하시겠습니까?')) {
      return;
    }
    entry.favorite = !entry.favorite;

    favoriteStar.classList.toggle('active', entry.favorite);
    updateHistoryEntry(entry);
  });

  nameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      saveButton.click();
    } else if (event.key === 'Escape') {
      cancelButton.click();
    }
  });

  editButton.addEventListener('click', () => {
    nameSpan.style.display = 'none'; // 이름 텍스트 숨기기
    nameInput.style.display = 'inline-block'; // 입력창 보이기
    editButton.style.display = 'none'; // 수정 버튼 숨기기
    saveButton.style.display = 'inline-block'; // 저장 버튼 보이기
    cancelButton.style.display = 'inline-block'; // 취소 버튼 보이기
  });

  saveButton.addEventListener('click', () => {
    const newName = nameInput.value.trim() || entry.id; // 빈 값이면 ID로 대체
    if (newName === entry.name) {
      return;
    }
    entry.name = newName;
    updateHistoryEntry(entry);
    nameSpan.textContent = newName;

    nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
    nameInput.style.display = 'none'; // 입력창 숨기기
    editButton.style.display = 'inline-block'; // 수정 버튼 보이기
    saveButton.style.display = 'none'; // 저장 버튼 숨기기
    cancelButton.style.display = 'none'; // 취소 버튼 숨기기

    alert('이름이 변경되었습니다.');
  });

  cancelButton.addEventListener('click', () => {
    const isNameChanged = nameInput.value !== nameSpan.textContent;
    if (isNameChanged && !confirm('변경사항을 저장하지 않고 취소하시겠습니까?')) {
      return;
    }

    nameInput.value = nameSpan.textContent; // 입력창 초기화
    nameSpan.style.display = 'inline'; // 이름 텍스트 보이기
    nameInput.style.display = 'none'; // 입력창 숨기기
    editButton.style.display = 'inline-block'; // 수정 버튼 보이기
    saveButton.style.display = 'none'; // 저장 버튼 숨기기
    cancelButton.style.display = 'none'; // 취소 버튼 숨기기
  });

  removeButton.addEventListener('click', () => {
    if (!confirm('이 항목을 검색 기록에서 삭제하시겠습니까?')) {
      return;
    }
    removeHistoryEntry(entry);
  });

  try {
    totalSearches.title = `Previous Searches: ${entry.previousSearches.map((timestamp) => formatDate(timestamp)).join('\n')}`;
    totalSearches.textContent = `총 ${entry.previousSearches.length}회`;
  } catch (error) {
    console.error('Failed to set total searches:', error);
  }


  return li;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function updateHistoryEntry(updatedEntry) {
  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    const updatedHistory = history.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    chrome.storage.local.set({ searchHistory: updatedHistory }, () => {
      console.log('History updated:', updatedEntry);
    });
  });

  loadHistory();
  loadFavorites();
}

function removeHistoryEntry(entryToRemove) {
  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];
    const updatedHistory = history.filter((entry) => entry.id !== entryToRemove.id);
    chrome.storage.local.set({ searchHistory: updatedHistory }, () => {
      console.log('History removed:', entryToRemove);
    });
  });

  loadHistory();
  loadFavorites();
}

function observeUrlChanges() {
  let previousUrl = location.href;

  new MutationObserver(() => {
    // 값이 없을 경우 true로 설정
    chrome.storage.local.get(['isHistoryEnabled'], (storage) => {
      const isHistoryEnabled = storage.isHistoryEnabled ?? true; // 기본값은 true

      if (!isHistoryEnabled) {
        return; // 히스토리가 비활성화된 경우 종료
      }

      const currentUrl = location.href;
      if (currentUrl === previousUrl) {
        return; // URL이 변경되지 않은 경우 종료
      }

      previousUrl = currentUrl;

      addSearchHistory(currentUrl);
    });
  }).observe(document.body, { childList: true, subtree: true });
}


function addSearchHistory(currentUrl, showAlert = false, isFavorite = false) {
  const url = new URL(currentUrl);
  const parsedData = parseUrl(url);

  if (!parsedData) {
    if (showAlert) {
      alert('This page is not a valid trade page.');
    }
    return;
  }

  // parsedData에서 id와 serverName 추출
  const { id, serverName } = parsedData;

  chrome.storage.local.get(['searchHistory'], (storage) => {
    const history = storage.searchHistory || [];

    // 중복 체크
    const isDuplicate = history.some((entry) => entry.id === id);
    if (isDuplicate) {
      if (isFavorite) {
        const entry = history.find((entry) => entry.id === id);
        entry.favorite = true;
        updateHistoryEntry(entry);
      } else if (showAlert) {
        alert('This search is already in your history.');
      }
      return;
    }

    // 새 검색 기록 추가
    const currentDate = Date.now();
    chrome.runtime.sendMessage({
      type: 'URL_CHANGE',
      data: {
        id,
        name: id,
        url: currentUrl,
        serverName,
        lastSearched: currentDate,
        favorite: isFavorite,
      },
    }).then(() => {
      if (showAlert) {
        alert('Search successfully added to your history.');
      }
    });
  });
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


initSidebar();
observeUrlChanges();
