import { readFileSync } from 'node:fs';

const manifest = JSON.parse(
  readFileSync(new URL('./manifest.json', import.meta.url), 'utf8')
);

describe('manifest trade page permissions', () => {
  const kakaoTradeMatch = 'https://poe.kakaogames.com/trade2/*';

  test('allows the Kakao Games trade page host', () => {
    expect(manifest.host_permissions).toContain(kakaoTradeMatch);
  });

  test('injects the content script on Kakao Games trade pages', () => {
    expect(manifest.content_scripts[0].matches).toContain(kakaoTradeMatch);
  });
});
