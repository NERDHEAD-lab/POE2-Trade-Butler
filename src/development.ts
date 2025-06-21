import * as test from './utils/testTemplate';
import * as sidebar from './components/sidebar';
import * as storage from './utils/storage';
import * as api from './utils/api';
import { showToast } from './utils/api';

/*
  * This script is used for development.
  * For testing and debugging the extension.
 */

console.log('🔥 Development script loaded');
document.body.style.background = '#e3d3d3';
/********************* Clear Storage *********************/
// storage.clearHistory().then(r =>
//   console.log('History cleared:', r)
// );

/********************* Sidebar Initialization *********************/
sidebar.renderSidebar(document.body);

/********************* Storage Functions *********************/
test.createButton(
  'Clear History',
  () => {
    storage.clearHistory().then(
      () => showToast('History cleared successfully!'),
      (error) => showToast(`Error clearing history: ${error.message}`)
    );
  }
);

test.createButton(
  'Add Search History(Fixed)',
  () => {
    const searchHistory = api.getSearchHistoryFromUrl(
      'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX'
    );

    storage.addOrUpdateHistory(searchHistory).then(
      () => showToast('Search history added successfully!'),
      (error) => showToast(`Error adding search history: ${error.message}`)
    );
  }
);

test.createButton(
  'Add Search History(Random)',
  () => {
    // 대소문자 포함 9자리 랜덤 ID 생성
    const randomId = Math.random().toString(36).substring(2, 11);

    const searchHistory = api.getSearchHistoryFromUrl(
      `https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/${randomId}`
    );

    storage.addOrUpdateHistory(searchHistory).then(
      () => showToast('Search history added successfully!'),
      (error) => showToast(`Error adding search history: ${error.message}`)
    );
  }
);

/******************************************************/
/********************* Test Cases *********************/
/******************************************************/
test.createTest('testParseSearchUrl-1',
  'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const result = api.parseSearchUrl(value);

    if (result) {
      return `Server: ${result.serverName}, ID: ${result.id}`;
    } else {
      return 'Invalid URL format';
    }
  }
);

test.createTest('testParseSearchUrl-2',
  'https://www.pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const result = api.parseSearchUrl(value);

    if (result) {
      return `Server: ${result.serverName}, ID: ${result.id}`;
    } else {
      return 'Invalid URL format';
    }
  }
);

test.createTest('testGetUrlFromSearchHistory-success-1 (current URL : https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/AAAAAAAAA)',
  'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const expectedUrl = 'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX';

    const history: storage.SearchHistoryEntity = {
      id: 'jDDwQ4XSX',
      url: value,
      lastSearched: new Date().toISOString(),
      previousSearches: []
    };
    const result = api.getUrlFromSearchHistory(history, 'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/AAAAAAAAA');
    if (result !== expectedUrl) {
      showToast(`Expected ${expectedUrl}, but got ${result}`, '#f00');
    }
    return `expected: ${expectedUrl}\nactual: ${result}`;
  }
);

test.createTest('testGetUrlFromSearchHistory-success-2 (current URL : https://www.pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt/AAAAAAAAA)',
  'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const expectedUrl = 'https://www.pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX';

    const history: storage.SearchHistoryEntity = {
      id: 'jDDwQ4XSX',
      url: value,
      lastSearched: new Date().toISOString(),
      previousSearches: []
    };
    const result = api.getUrlFromSearchHistory(history, 'https://www.pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt/AAAAAAAAA');
    if (result !== expectedUrl) {
      showToast(`Expected "${expectedUrl}",\n but got "${result}"`, '#f00');
    }
    return `expected: ${expectedUrl}\nactual: ${result}`;
  }
);

test.createTest('testGetUrlFromSearchHistory-success-3 (current URL : https://poe.game.daum.net/trade2/search/poe2/Standard/AAAAAAAAA)',
  'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const expectedUrl = 'https://poe.game.daum.net/trade2/search/poe2/Standard/jDDwQ4XSX';

    const history: storage.SearchHistoryEntity = {
      id: 'jDDwQ4XSX',
      url: value,
      lastSearched: new Date().toISOString(),
      previousSearches: []
    };
    const result = api.getUrlFromSearchHistory(history, 'https://poe.game.daum.net/trade2/search/poe2/Standard/AAAAAAAAA');
    if (result !== expectedUrl) {
      showToast(`Expected ${expectedUrl}, but got ${result}`, '#f00');
    }
    return `expected: ${expectedUrl}\nactual: ${result}`;
  }
);


