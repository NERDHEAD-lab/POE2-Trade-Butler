import { isKoreanServer, showToast } from '../utils/api';
import * as cacheData from '../storage/cacheData';
import { getMessage } from '../utils/_locale';

const LSCACHE_TRADE2ITEMS = 'https://poe.game.daum.net/api/trade2/data/items';
const LSCACHE_TRADE2FILTERS = 'https://poe.game.daum.net/api/trade2/data/filters';
const LSCACHE_TRADE2STATS = 'https://poe.game.daum.net/api/trade2/data/stats';
const LSCACHE_TRADE2DATA = 'https://poe.game.daum.net/api/trade2/data/static';


export async function applyKoreanTranslate() {
  if (isKoreanServer()) {
    return;
  }

  try {
    await waitForDOM();
    await translateLscaches();

    showToast(getMessage('korean_translation_success'), '#0f0');
  } catch (error) {
    showToast(getMessage('korean_translation_error'), '#f00');
    console.error(getMessage('korean_translation_error_console'), error);
  }
}

// async function extractTranslationFromPage(): Promise<Record<string, string>> {
//   const url = 'https://web.poecdn.com/js/translate.ko_KR.js';
//   const res = await fetch(url);
//
//
//   if (!res.ok) {
//     throw new Error(`Failed to fetch translation script: ${res.status}`);
//   }
//
//   const text = await res.text();
//   const dict: Record<string, string> = {};
//
//   // 정규식: __['Key'] = 'Value';
//   const regex = /__\[\s*['"](.+?)['"]\s*]\s*=\s*['"](.+?)['"]\s*;/g;
//   let match;
//   while ((match = regex.exec(text)) !== null) {
//     const [, key, value] = match;
//     dict[key] = value;
//   }
//
//   return dict;
// }


async function translateLscaches() {
  await setItem('lscache-trade2items', LSCACHE_TRADE2ITEMS);
  await setItem('lscache-trade2filters', LSCACHE_TRADE2FILTERS);
  await setItem('lscache-trade2stats', LSCACHE_TRADE2STATS);
  await setItem('lscache-trade2data', LSCACHE_TRADE2DATA);
}

async function setItem(key: string, fetchUrl: string) {
  const response = await cacheData.getOrFetchCache(key, 1000 * 60 * 60, () => fetchFromBackground(fetchUrl));
  if (!response.data) {
    console.error(response.error);
    throw new Error(`Failed to fetch data from ${fetchUrl}`);
  }

  localStorage.setItem(key, JSON.stringify(response.data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchFromBackground(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'FETCH', url }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function waitForDOM(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve(), { once: true });
    }
  });
}