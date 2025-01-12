
```
poe2-trade-butler/
├── src/
│   ├── manifest.json         # 크롬 확장 프로그램 메타데이터
│   ├── background.js         # 서비스 워커 (API 감지 및 데이터 처리)
│   ├── content.js            # POE2 페이지 DOM 수정 및 사이드바 삽입
│   ├── popup.html            # 팝업 UI
│   ├── popup.js              # 팝업 기능 스크립트
│   ├── styles.css            # 사이드바 및 팝업 스타일
│   ├── sidebar.html          # 사이드바 HTML 템플릿 (동적 로드 가능)
│   └── utils/
│       ├── api.js            # API 요청 및 응답 처리 유틸리티
│       └── storage.js        # 로컬 스토리지 관리 유틸리티
```