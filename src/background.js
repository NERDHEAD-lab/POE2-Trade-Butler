const poeServers = ["Standard", "Hardcore"];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'URL_CHANGE') {
    const { id, name, url, lastSearched, favorite } = message.data;

    if (id === "Standard" || id === "Hardcore") {
      console.warn(`Invalid ID detected: ${id}`);
      return;
    }

    chrome.storage.local.get(['searchHistory'], (storage) => {
      const history = storage.searchHistory || [];

      const existingEntry = history.find((entry) => entry.id === id);
      if (existingEntry) {
        existingEntry.lastSearched = lastSearched;
        existingEntry.previousSearches.push(lastSearched);
        existingEntry.favorite = favorite || existingEntry.favorite;
      } else {
        history.push({
          id,
          name: name || id,
          url,
          lastSearched,
          previousSearches: [lastSearched],
          favorite: favorite || false,
        });
      }

      chrome.storage.local.set({ searchHistory: history }, () => {
        console.log('Search history updated:', history);
      });
    });
  }
});
