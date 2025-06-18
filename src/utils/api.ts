/*
  http(s)://www.pathofexile.com/trade2/search/poe2/{serverName}/{id}
  http(s)://poe.game.daum.net/trade2/search/poe2/{serverName}/{id}
 */
export function parseSearchUrl(url: string): { serverName: string, id: string } | null {
  const regex = /^https?:\/\/(www\.pathofexile\.com|poe\.game\.daum\.net)\/trade2\/search\/poe2\/([^/]+)\/([^/]+)$/;
  const match = url.match(regex);
  if (!match) return null;

  const [, , serverNameRaw, id] = match;
  try {
    const serverName = decodeURIComponent(serverNameRaw);
    return { serverName, id };
  } catch (e) {
    return null; // serverName 디코딩 실패 시 null
  }
}


