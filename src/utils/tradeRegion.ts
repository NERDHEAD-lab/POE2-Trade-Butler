const LEGACY_DAUM_TRADE_HOST = 'poe.game.daum.net';
const KAKAO_TRADE_HOST = 'poe.kakaogames.com';

export function getServerRegion(url: URL): string {
  const hostname = url.hostname;

  if (hostname === LEGACY_DAUM_TRADE_HOST) return 'kr';
  if (hostname === KAKAO_TRADE_HOST) return 'kr';
  if (hostname === 'jp.pathofexile.com') return 'jp';
  if (hostname === 'br.pathofexile.com') return 'br';
  if (hostname === 'ru.pathofexile.com') return 'ru';
  if (hostname === 'th.pathofexile.com') return 'th';
  if (hostname === 'de.pathofexile.com') return 'de';
  if (hostname === 'fr.pathofexile.com') return 'fr';
  if (hostname === 'es.pathofexile.com') return 'es';
  if (hostname === 'www.pathofexile.com') return 'global';
  return 'global';
}
