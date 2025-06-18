import { renderSidebar } from './components/sidebar';
import { parseSearchUrl } from './utils/api';
import { createTest } from './utils/testTemplate';

/*
  * This script is used for development.
  * For testing and debugging the extension.
 */

console.log('🔥 Development script loaded');
document.body.style.background = '#e3d3d3';

renderSidebar(document.body);

createTest('testParseSearchUrl-1',
  'https://poe.game.daum.net/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const result = parseSearchUrl(value);

    if (result) {
      return `Server: ${result.serverName}, ID: ${result.id}`;
    } else {
      return 'Invalid URL format';
    }
  }
);

createTest('testParseSearchUrl-2',
  'https://www.pathofexile.com/trade2/search/poe2/Dawn%20of%20the%20Hunt/jDDwQ4XSX',
  (value: string) => {
    const result = parseSearchUrl(value);

    if (result) {
      return `Server: ${result.serverName}, ID: ${result.id}`;
    } else {
      return 'Invalid URL format';
    }
  }
);
