import * as test from './utils/testTemplate';
import * as sidebar from './components/sidebar';
import * as storage from './utils/storage';
import * as api from './utils/api';
import { showToast } from './utils/api';
import { clearHistory } from './utils/storage';

/*
  * This script is used for development.
  * For testing and debugging the extension.
 */

console.log('🔥 Development script loaded');
document.body.style.background = '#e3d3d3';

/********************* Sidebar Initialization *********************/
sidebar.renderSidebar(document.body);

/********************* Storage Functions *********************/
test.createButton(
  "Clear History",
  () => {
    storage.clearHistory().then(
      () => showToast('History cleared successfully!'),
      (error) => showToast(`Error clearing history: ${error.message}`)
    )
  }
)

/********************* Test Cases *********************/
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
