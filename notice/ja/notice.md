| [한국어](../ko/notice.md) | [English](../en/notice.md) | **日本語** | [简体中文](../zh_CN/notice.md) | [繁體中文](../zh_TW/notice.md) |
|---|---|---|---|---|

## Notice

### 3.0.1 アップデート - Kakao Games 取引所ドメイン変更対応

POE2 Trade Butler は 3.0.0 リリース後、安定版として運用され、最近まで大きな機能変更は行っていませんでした。

今回の 3.0.1 は、韓国 POE2 取引所の URL が Kakao Games ドメインへ変更されたことに対応するためのメンテナンスアップデートです。
```
旧 Daum 取引所 URL:
https://poe.game.daum.net/trade2/...

新 Kakao Games 取引所 URL:
https://poe.kakaogames.com/trade2/...
```

今回のアップデートには次の内容が含まれます。

```
Kakao Games 取引所ドメインで拡張機能が動作するように変更しました。
旧 Daum 取引所 URL で保存されていた検索履歴を新しい URL へ移行します。
旧 Daum 取引所 URL で保存されていたお気に入り URL を新しい URL へ移行します。
Google Drive のお気に入り同期を使用している場合も、保存済みのお気に入り URL が移行されます。
```

## 今後の改修予定

これまで Roadmap に含めていた個別の機能計画は、現在のコードベースを基準にあらためて見直しています。

長期間の安定運用後にコード全体を再確認しており、2026年7月中に POE2 Trade Butler の使いやすさ、安定性、お気に入り/履歴管理、取引所ページ対応を中心とした大きな改善を予定しています。

今回のドメイン変更対応後も不具合や動作しない機能がある場合は、[GitHub Issues](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/issues) または `nerdlab.kr@gmail.com` までお知らせください。
