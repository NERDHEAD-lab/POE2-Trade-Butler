const poeServers = ["Standard", "Hardcore"];

// webNavigation 이벤트에서 URL 감지
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    const url = new URL(details.url);

    // URL 경로에서 서버 이름과 ID 확인
    const pathSegments = url.pathname.split("/");
    const serverName = pathSegments[pathSegments.length - 2];
    const id = pathSegments[pathSegments.length - 1];

    // 서버 이름 및 ID 유효성 검사
    if (!(poeServers.includes(serverName) && id.length > 0 && id !== serverName)) {
      return;
    }

    console.log('Captured ID via webNavigation:', id);
    chrome.storage.local.get(['searchHistory'], (storage) => {
      const history = storage.searchHistory || [];

      // 기존 ID 검색
      const existingEntry = history.find((entry) => entry.id === id);
      const currentDate = Date.now();
      if (existingEntry) {
        if (!existingEntry.previousSearches) {
          existingEntry.previousSearches = [];
        }
        existingEntry.lastSearched = currentDate;
        existingEntry.previousSearches.push(currentDate);
      } else {
        history.push({
          id,
          url: details.url,
          lastSearched: currentDate,
          previousSearches: [currentDate]
        });
      }

      chrome.storage.local.set({ searchHistory: history }, () => {
        console.log('Search history updated:', history);
      });
    });
  },
  {
    url: [
      { urlMatches: ".*trade2/search.*" }
    ]
  }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "LOCAL_STORAGE") {
    console.log("Received data from content script:", message.data);
  }
});

console.log("Background script initialized with webNavigation.");
