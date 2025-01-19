console.log(document.getElementById("clear-history"));
console.log(document.getElementById("search-history-list"));


document.addEventListener("DOMContentLoaded", () => {
    const clearHistoryButton = document.getElementById("clear-history");
    const searchHistoryList = document.getElementById("search-history-list");

    if (!clearHistoryButton) {
        console.error("Clear History button not found in the DOM.");
        return;
    }
    if (!searchHistoryList) {
        console.error("Search History list not found in the DOM.");
        return;
    }

    clearHistoryButton.addEventListener("click", () => {
        chrome.storage.local.set({ searchHistory: [] }, () => {
            console.log("Search history cleared.");
            searchHistoryList.innerHTML = ""; // 리스트 초기화
        });
    });

    chrome.storage.local.get(["searchHistory"], (storage) => {
        const searchHistory = storage.searchHistory || [];
        searchHistory.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `ID: ${item.id} (${new Date(item.lastSearched).toLocaleString()})`;
            searchHistoryList.appendChild(li);
        });
    });
});
