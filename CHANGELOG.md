# CHANGE LOG

## [2.11.2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.11.1...2.11.2) (2025-09-09)


### Bug Fixes

* **CI/CD:** fix workflow for gh-pages keep_files ([fb994de](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fb994ded724543ea883f601fcfbb0019b2cc8545))

## [2.11.1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.11.0...2.11.1) (2025-09-09)


### Bug Fixes

* **CI/CD:** fix workflow ([8b95203](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8b952033a4c047d6fb966bfd2e9f7ed3cdd52ffb))
* **CI/CD:** fix workflow ([5c6921e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5c6921e81f970dcb41e39c73ee8133a13a1907ef))

## [2.11.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.10.0...2.11.0) (2025-09-08)


### Features

* showModal에서 생성된 context에 대한 이벤트 처리 기능 개선 및 즐겨 찾기 추가에 반영 ([5b4f690](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5b4f690fe66568baafa58a897a426780c5ded564))
* sidebar render 실패 처리 강화 ([9dea8dc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9dea8dc554df45cfe765bcbd60647de18e84d3e4))
* 디버깅 환경 개선 ([a1f7925](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a1f7925c3b6aac5f5c5965f0e4ea57838de98b82))
* 잦은 storage 호출 최적화 ([8867693](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/88676934f3de2c720d03322823d396cd16a90a47))


### Bug Fixes

* ChunkedArrayStorageStrategy addOnChangeListener 정상화 ([6acb462](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6acb4623d72b1ef22d54dd50eb986c1f5fc2228c))
* ChunkedArrayStorageStrategy removeOnChangeListener 정상화 ([a64d674](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a64d674b6fcc5d4739031e23bf3447cb2be4896c))
* publish-schema-on-release.yml 수정 ([1efce9d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1efce9dec563d258f32f4f6533191320c8fd9ca7))
* storage 호출 최적화 후 일부 최신화 되지않는 로직 수정 ([b652fab](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b652fabee39e2ca114cc7b48870e9017ee279a12))
* storageUsage chunkedArray 분석 정상화 ([f2157e9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f2157e988b39c844d70ebeaf56f0778e1976b7bc))
* 즐겨 찾기 전체 데이터가 8kb를 초과 시 추가 하지 못하는 문제 수정 ([351fe45](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/351fe45d4f78e9c0829aa1799f8388e42fbb5e22))
* 즐겨 찾기 전체 데이터가 8kb를 초과 시 추가 하지 못하는 문제 수정 - 2 ([2e874ad](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2e874addea473b228e31189d75458f8eada165c2))
* 즐겨 찾기 전체 데이터가 8kb를 초과 시 추가 하지 못하는 문제 수정 - 3 ([90a2cbd](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/90a2cbd9492ceedfc6f18d90236ec2fd81881ebe))


### Code Refactoring

* showToast를 api.ts에서 분리 ([f9de6c3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f9de6c3488fe38ff27e578bc7240a8b8fbde2f50))

## [2.10.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.9.0...2.10.0) (2025-09-02)


### Features

* background 불투명도 조절 기능 추가 ([c13067c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/c13067c290f2234affd7353392827ffc23641675))
* **CI/CD:** gh-pages 관리를 위한 workflow 추가 ([168a233](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/168a23349f4a7d1e0b4f7bedc98d753771097b68))
* **favShare:** 즐겨찾기 공유 기능 개발 - 1 ([7685f9a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7685f9af75a661bcb481843cddb33092a5a91a11))
* 즐겨찾기 공유 구조에 대한 정의(json schema)에 대한 workflow 추가 ([eb3300f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/eb3300fdab7bd75ed8ff8b25d261364753971997))
* 즐겨찾기 공유 기능 일부 개발 및 테스트 추가 ([fb2b383](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fb2b38391a5af6ea1c8b4231ab5e45abd1b3b815))


### Bug Fixes

* background 불투명도 조절 ([0e5b8b9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0e5b8b99974ee323a33e2d9953961294387aa314))
* **tscofnig:** 사용하지 않는webpack-env types 제거 ([1360c30](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1360c3023fa4c605291bfe09eff3a51ba5c4786c))
* 폴더 생성 시, toast message가 비정상적인 문제 수정 ([c7b2c94](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/c7b2c9439dc2244271c135d82f71378bbbaac1d9))

## [2.9.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.8.0...2.9.0) (2025-07-29)


### Features

* **settings:** 설정 창 UI 개선 - 1 ([f8d69e8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f8d69e88597cec037cbbee366a5619da3a15ab5d))

## [2.8.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.7.0...2.8.0) (2025-07-28)


### Features

* **legacy:** legacyVersionManager에서 migration 뿐 만 아니라 사용하지 않는 entity를 제거 할 수 있는 기능 추가 ([4fbd7dc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4fbd7dc014ad48373f362bf847cbb73f970d0379))
* **legacy:** 미사용 데이터 제거 동작 추가 ([72b610a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/72b610ac78ccc77ad4e478163b75308d425d59ac))
* poe2 trade 페이지 지원 범위 추가 ([54fcffb](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/54fcffb70c7fc8431dc27ec3176b3a82fb9b47db))
* poe2-modal title이 좀더 자연스럽도록 스타일 개선 ([4e8d627](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4e8d627e44cce2e92f8961b1984d0f29d5ac162d))
* **settings:** DivTextDetailOption을 사용 할 때 접을 수 있는 기능 추가 ( isExpandable ) ([7e488a8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7e488a8a17f429999ec005245cd28544188e83cf))
* **settings:** optionHeader 구성요소의 스타일 최적화 ([b4e8e53](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b4e8e531bf72cbca5c926bb82c95fb4299870028))
* **settings:** 설정창에 저장소 사용량 확인 기능 추가 ([c87f336](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/c87f3366713b8dadb96506bfba9980f76363263b))
* 설정 버튼 및 UI 추가 ([fbfa03f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fbfa03fb07a7beeaf0bd79b103b64da89ba13e5d))
* 설정 버튼 및 UI 추가 - 2 ([170efaa](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/170efaafa2b112fd3e1d125c81e16014e5a6a60e))
* 설정 버튼 및 UI 추가 - 3 ([111b639](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/111b6393b711cf6e81b77d3ef1c5db4f4743ee17))
* 설정 버튼 및 UI 추가 - 4 ([49ea704](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/49ea704c4818adf971b8138d6e3ef9892dd2dd7b))
* 설정 버튼 및 UI 추가 - 5 ([54ba24f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/54ba24fa2b73e1d6957bda70da556d895201febc))
* 설정 버튼 및 UI 추가 - 6 ([e2662b2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e2662b2314542ea73dcdf2bb1b881fb6d0ee13bb))
* 설정 버튼 및 UI 추가 - 6 ([9619389](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9619389315f53dfafd5bce52b5097aab07f33884))
* 설정 버튼 및 UI 추가 - 7 ([fa12800](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fa12800d0f22c1f753b3c8fba4bbd4c4cb661f88))
* 설정 버튼 및 UI 추가 - 8 ([7f95a5d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7f95a5dd80558d24db58177fe6d0c828c168c499))
* 설정 버튼 및 UI 추가 - 9 ([d670cf5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d670cf59353d84d252424cc7fdd908394eb36378))
* 수동으로 언어를 설정 할 수 있는 기능 추가 - 1 ([03324d1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/03324d171689e0792c664235f2c27a9ce7bb4652))
* 일본어 추가 ([02f8e88](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/02f8e8867205c8a90b2250369ffb977cdd999511))
* 플러그인 아이콘 클릭시 나오는 popup 창 로드 속도 개선 ([e203d4b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e203d4b1aa217bac23767aff04e51508d89ebd0c))
* 항상 StorageManager를 사용하는 ts들을 로드하도록 개선 ([06b45be](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/06b45be4ad384995e7a3d836c3841f6ffaee6737))


### Bug Fixes

* **background:** service worker에서 StorageManager를 로드 못하는 문제 수정 - 1 ([8edfadc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8edfadcc4a4b9d95ee13adab7cf19588f204cdba))
* **background:** service worker에서 StorageManager를 로드 못하는 문제 수정 - 2 ([77f35f5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/77f35f5687a584b59ccb7a81448c729c4f643b33))
* **background:** service worker에서 StorageManager를 로드 못하는 문제 수정 - 3 ([f79c89e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f79c89ea72c5b53fb8d3f6e0c7dd454c5cc6d8e0))
* magration 도구 (legacyVersionManager) 타입 오류 수정 ([e56e4b8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e56e4b83b4a95c0d54a08d0378e3b35c59312ae6))
* **popup:** 간헐적으로 popup이 로드되지 않는 문제 개선 ([fa91da5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fa91da57174f2b57c42e85be7fffb62e534157e5))
* **settings:** undefined data가 하나일때 표시되지 않는 문제 수정 ([0502d0f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0502d0f6f8d37cd940da9a989c1a42cd525f5c5c))
* **storage:** defaultLatestSearchUrl에서 사용하는 document가 background에서 오류를 발생시키는 문제 수정 ([abd2db2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/abd2db24b386609892a0bf23735892c9ebdb4140))
* 플러그인이 재시작되거나 업데이트 되었을 때 sidebar가 동작하지 않는 문제 개선 ([7125b5d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7125b5debb1ad7c915096b83d8161e7616c8ae1d))
* 현재 검색 id만으로 현재 region url에서 redirection되지 않아 검색당시 region의 url로 redirection 하도록 조치 ([923a725](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/923a72504349a28ec5cbf0a5aa08d1c9c1c7a128))
* 현재 검색 id만으로 현재 region url에서 redirection되지 않아 검색당시 region의 url로 redirection 하도록 조치 - 2 ([cdf9388](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/cdf938893ce547efed276a4c84ab471c60c238a8))
* 현재 검색 id만으로 현재 region url에서 redirection되지 않아 검색당시 region의 url로 redirection 하도록 조치 - 3 ([4e589ab](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4e589aba3b478ba69ea89f52a75b9683956a934c))


### Code Refactoring

* settingManager 코드 정리 ([0aeefa8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0aeefa84421e646d87deef0236af98357d65c59d))
* storage 자료구조 개선 ([12eabf9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/12eabf9d6d64a257e90ca1242cdbd86d0e2e97c1))
* **storageUsage:** 루프 최적화 및 STORAGE_TYPES 사용하여 storage의 자료구조가 변경 될 때 동적으로 대응하도록 개선 ([8010d08](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8010d0876868abd1a153b9ab4fc483b5e52a5fd3))

## [2.7.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.6.1...2.7.0) (2025-07-18)


### Features

* 중국, 대만 언어 추가 ([2a87011](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2a87011928be45ff74af9851c0636f2fe64f98fc))

## [2.6.1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.6.0...2.6.1) (2025-07-16)


### Bug Fixes

* remove redundant permission (alarms) ([a86c29f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a86c29f902ea5d45a63c5c4044a5587fde20201e))

## [2.6.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.5.0...2.6.0) (2025-07-15)


### Features

* next release([#60](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/issues/60)) ([d7a79dc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d7a79dc438f17441fcabf8b513343799f516b0d8))

## [2.5.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.4.2...2.5.0) (2025-07-06)


### Features

* i18n 영문 번역을 좀더 자연스럽게 변경 ([01c0e59](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/01c0e59532660e079a4e31dff2a3231436ac563e))
* i18n 적용 및 가이드 추가 ([5cc2724](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5cc2724d351c32e9e2a7444b577e8de11ad82052))
* i18n 적용 및 가이드 추가 - 2 ([d7ff69f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d7ff69f6acb07d21f0af6d4251910ac4197a12dc))
* 사용 가이드 기능 예외 처리 강화 ([378cc2c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/378cc2cd85312fad3b7ed0b7f86a91dd0d396d63))
* 사용 가이드 기능 추가 ([109d762](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/109d762b5a99a4d38bddb2291487b836b233027e))
* 사용 가이드 기능 추가 - 2 ([8160089](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8160089491bce9f91cfa0955d6d35f7f5ad001b4))
* 사용 가이드 기능 추가 - 3 ([dc444a0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/dc444a026f0220ad71f46cd0af52e31d37e05034))

## [2.4.2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.4.1...2.4.2) (2025-07-05)


### Bug Fixes

* 즐겨찾기 추가 시 이름 입력란이 비정상적으로 표시되는 문제 수정 ([cd0bac3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/cd0bac333953144b9e0fd6765872859992981954))
* 즐겨찾기 추가시 부모 폴더에 추가되는 문제 수정 ([af970da](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/af970da5292fbef1875fe1116a06cc97224f4b4c))

## [2.4.1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.4.0...2.4.1) (2025-07-05)


### Bug Fixes

* 미리보기에서 추출한 검색어가 검색 이력 목록에 즉시 반영되지않는 문제 수정 ([32381d4](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/32381d4af20013ce5f59552d3c3e89ebc5d4979c))
* 미리보기에서 추출한 검색어가 검색 이력 목록에 즉시 반영되지않는 문제 수정 ([ba2ed50](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ba2ed50fed253e59bea455eb6049eef3e706aec4))

## [2.4.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.3.3...2.4.0) (2025-07-05)


### Features

* i18n 적용 - favoriteFileSystemUI.ts 일주 적용 ([f5526cc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f5526cc1f4594c7c617c08b236a288d9a0b131b3))
* i18n 적용 - history switch 툴팁 추가 ([6eac409](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6eac40949464c9e227a83f7623a07b6ac97c2821))
* i18n 적용 - 전체 프로젝트에서 문자열 추출 및 정리 ([ef3dd7b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ef3dd7b5e127b8e0801aadc19aeb37a0a51b957e))
* i18n 적용 - 플러그인 이름 및 설명 ([2a4a342](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2a4a34268bf2e4e458b33485aab4c67198aecb46))
* preview panel 경량화 ([b9aba17](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b9aba1703a765cd7a6ee9c8fb43e9a240a314098))
* sidebar 너비 조절 기능 추가 ([d7953cb](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d7953cb81a77db6b973a323c56fc3f868c7a3a60))
* 검색 기록 UI 간소화 ([e747627](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e747627420c33830b352459657a755020b019611))
* 검색 기록 삭제 버튼 위치 변경 ([4d516d1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4d516d15dc9a8e3ee9562a0fbdba1aaee9861cb1))
* 페이지 변경을 감지하는 기능 개선 ([e8cf742](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e8cf7428a3c041827ecaa23e0f060f460b4ec4e3))
* 플러그인에서 POE2 도메인을 https 만 허용하도록 변경 ([2c8b7c7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2c8b7c74deec3593dc2634f216bd690e085d28ba))


### Bug Fixes

* 즐겨찾기 폴더가 좀더 자연스럽게 접히지 않는 문제 수정 ([e499c83](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e499c832088d4de69761e8196628afd3242d035e))

## [2.3.3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.3.2...2.3.3) (2025-07-03)


### Bug Fixes

* remove not implemented popup ([fc49e64](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fc49e641d4a48fecc3678fb4ca2f454e5896f749))
* remove not implemented popup ([85aac0f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/85aac0fcd758cbf2cbf9d640bff7c62aabc8868f))
* remove not implemented popup - 2 ([473e07e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/473e07e3f19c2ecd002e8924cacc98ec7b20d2f7))

## [2.3.2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.3.1...2.3.2) (2025-07-03)


### Bug Fixes

* 즐겨찾기 추가 클릭 시 예외상황(검색결과 페이지가 아닌경우)에 무반응인 문제 수정 ([d78af08](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d78af086ad310940c62c7c33585db0b8d0c3280b))

## [2.3.1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.3.0...2.3.1) (2025-07-03)


### Bug Fixes

* ES module 마이그레이션 간 누락되어 빌드에 실패하는 문제 수정 ([2d0e8dc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2d0e8dc3d4a170dd6b40de5212628caf28dc537c))
* eslint 제약 조건 조치 ([3699efa](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3699efa712d4e3a7f56c574761acbb1254fd0356))
* 참조가 없는 미리보기 데이터를 삭제하지 않는 문제 수정 ([6ca4f1d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6ca4f1d16c03cc7fbbe177dc7b7afc5c39b1c2ee))

## [2.3.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.2.0...2.3.0) (2025-07-03)


### Features

* favoriteStorage 및 즐겨찾기 UI 재구성 - 1 ([7125c6d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7125c6da81916c9c05d556af1853900faff62823))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 2 ([3547d39](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3547d39b487c99f3e9511c2b76f55575620178cc))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 3 ([884de2c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/884de2cd5a25d63724a8e9065e4a0551c09310ca))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 4 ([24ef6e9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/24ef6e9545c2a5aa760a66aeb438775274382d73))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 5 ([751b1a6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/751b1a68b305edd506cdf8384461b7942e3c43ff))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 6 ([aec1602](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/aec1602610bf07fb372ab727003b0e04c08144e8))
* favoriteStorage 및 즐겨찾기 UI 재구성 - 7 ([8fba9ea](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8fba9eaf8c790f919c3cee1d26508fb58bc5a0f6))
* orphaned + expired(24h)된 preview를 제거하도록 개선 ([053537a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/053537a08b84d03bc378be31fdac1bca925dddb6))
* popup UI 구성 - 1 ([2c7b26e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2c7b26e0d6858af4e5e62b1d465f0c003281aaed))
* popup UI 구성 - 2 ([ba35c3b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ba35c3bcff2edd36e74d75288e53703b5ea12b0e))
* settingStorage의 getLatestSearchUrl가 실제로 검색결과 중 마지막결과를 기록할 수 있도록 개선 ([f030e41](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f030e410b6d7bdd18e25294dbe72eb4ea7109809))
* 누락된 favorite 마우스 호버 시 미리보기 기능 재추가 ([e8afdea](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e8afdea6bf85e4fc187ce00da0ed383a1e9256b8))
* 변경된 storage 구조에 맞게 migration을 지원하는 onInstalled 이벤트 추가 - 1 ([1c5899c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1c5899ccedc392955fa8f58f000d275a57c96324))
* 즐겨찾기 폴더가 좀더 자연스럽게 접히도록 개선 ([8f521c5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8f521c52ab4c366b1d1d73dd32ecd0c90681a9af))
* 한국어 번역 기능 일부 개발 - 1 ([60fb694](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/60fb694daebc326461bc45eb455b6e856dd3b385))
* 항상 preview를 현재 열린 페이지에서 추출하도록 개선 ([14b5d45](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/14b5d4547aca9d63160c6fb7307758bf3f7b1423))


### Bug Fixes

* favorite UI refactoring 간 고장난 동작 정상화 ([3c22540](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3c22540ff1bbebfe9067d43cd64a53b002c491ad))
* fileSystemUI가 destroy 될 때, onDestroyed를 호출하지 않는 문제 수정 ([8fc4c8a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8fc4c8ae3043014ff551220a9d0f6aefd0c8fdd4))
* fileSystemUI가 생성되지 않는 문제 수정 ([d988d64](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d988d645859685b937839b534810ba7056ce3083))
* panel이 로드되기 전에 현재 패널을 가져오려고 하는 문제 수정 ([3c4eea9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3c4eea90b72d8f002e0b10a12c78d9517d57cd5c))
* storage 마이그레이션 동작 중에 storage 이벤트가 등록되지 않도록 수정 ([e40fd5f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e40fd5fa5acfa7c8a4ea011bbc10756f738c4a09))
* 개발 빌드에서 정상적으로 동작하지 않는 문제 조치 ([f9f0c30](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f9f0c30e661f5f0fa3cfaf817614624b9840e4d0))
* 비정상적인 CSS 수정 ([81150f0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/81150f054e095e450b1dabac2fbe00716f822b90))
* 즐겨찾기 UI의 더블클릭 이벤트 propagation 처리 보완 ([f893e3a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f893e3a32554daca3b6c5e97b33285f6af320e2d))
* 즐겨찾기 UI의 더블클릭 이벤트 propagation 처리 보완 - 2 ([3ccc28a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3ccc28a2f199bee151543995d062dc4b1d647d7f))
* 즐겨찾기 버튼 클릭 시 url을 찾을 수 없는 문제 수정 ([f9435eb](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f9435eb564658114ca2c77b81d900fca1cce4a5a))
* 즐겨찾기 선택된 요소를 가져오지 못하는 문제 수정 및 root를 미리 선택해두도록 개선 ([7e65484](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7e65484a8157bd2619753d90cd794778f8d28750))
* 즐겨찾기 추가 modal에서 파일을 숨기지 못하는 문제 수정 ([7f386f6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7f386f66bf17cf3592c32d96112055cacb9b1853))
* 즐겨찾기에 열린 페이지와 동일한 item을 표시 하지 못하는 문제 수정 ([b02df8d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b02df8de0d7e9f6bc68770589c3d8c68fa64992a))
* 즐겨찾기에서 잘못된 id로 preview 정보를 가져오는 문제 수정 ([f2a2819](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f2a28195ea5779d63dfed1b2c7c8176f3c8424dd))


### Code Refactoring

* develop 환경 제거 ([90fcdc1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/90fcdc114436d0a289d704eadad5c529c6970a4d))
* develop 환경 제거 - 2 ([73cc93b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/73cc93bf606e80ca22ea6558d4ef96d01c69376a))
* favorite 관련 기능을 storage에서 분리 ([9a0ea52](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9a0ea524a4c15a5b395d16a7e7764477ed23ccb5))
* favorite-folder-list를 sidebar.css에서 분리 ([8d32e49](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8d32e4940ab2ba4011cac6ed214ad71d2367b945))
* PreviewPanelSnapshot 정보를 history, favorite storage로부터 분리 및 불필요한/잘못된 구조 개선 ([8f47806](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8f47806e57d99d8dce371c0bf6acbff8e691a1ec))
* searchHistory 관련 기능을 storage에서 분리 ([5da5863](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5da586347adc1d9f25b0726084550ef1c80b30f8))
* settingStorage가 local과 sync를 선택 할 수 있도록 개선 ([c6acf11](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/c6acf113a9e66cac2725c52d76dcc2c947292e91))
* settingStorage의 getter/setter를 storageLoader로 통합 ([979a1cd](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/979a1cd2ae896d64007da648bac59c03b893428c))
* storage.ts에서 storage를 safe하게 가져오는 로직을 storageLoader.ts로 분리 ([da645e6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/da645e624394ec56e044f5dc9488eaa9492d4a2d))
* storageLoader 코드 패턴 통일 ([e5923c6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e5923c617e0a5605fee115c210cb93dc16c91ece))
* storageLoader를 OCP 원칙에 맞게 Exhaustiveness checking 구조로 변경 ([fe0c6fc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fe0c6fc9c67e24049e840c5ebe4e5fdbc9e63897))
* storageLoader를 적절하게 이름과 함수 명을 변경 ([556ebf6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/556ebf6caaf078a7be90b1ba88930e185c37aec1))
* storage에서 cacheData 관련 기능 분리 ([721d9bd](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/721d9bd93e9a696c64db240cbe644fcc143b03b4))
* storage에서 setting 관련 기능 분리 및 각 동작이 async하게 동작 할 수 있도록 개선 ([f2a30ca](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f2a30ca14cb862f79eecc95ac2f96c8afca64800))
* 불필요한 개발설정 간소화 및 README 반영 ([28dd91f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/28dd91f14c2e1efdae9590768c861a48815a9a89))
* 코드 정리 (누락된 storageLoader -&gt; storage, storage: StorageType -&gt; storageType: StorageType 수정) ([64b4a80](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/64b4a80e18093154a43840131b3b420170a6c90e))

## [2.2.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/poe2-trade-butler-2.1.1...poe2-trade-butler-2.2.0) (2025-06-25)


### Features

* @types/node 의존성 추가 ([4d4885f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4d4885ffd9027708fddd8f9f3dfd32544ca4fed0))
* Added a new feature to manage favorites (can add directly from the search result) ([e807953](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e807953e74334afcc010a62372dc1c07853e866a))
* Added a new feature to manage search history (can disable history tracking) ([8c2f905](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8c2f9054ee77b5c95a841ff66b6eb57d66b1da56))
* attachPreviewHoverEvents 이벤트 분리 ([258f740](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/258f74080344cea2e4f97aff5ddfb4dd7fd1f1ef))
* bump version, reset scripts ([b2455fc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b2455fc9f3e215fc326288c4640e5b815e9c4684))
* create-zip.js 롤백 ([23c1f30](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/23c1f30bd6c67c0ebadbf22129d36f8823384c09))
* favoriteFolder 확장성 개선 ([d9cbf96](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d9cbf96fd2bf701dd5df297e7f22f1409e5e7a18))
* favoriteFolderUI의 확장성 개선 ([129adfd](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/129adfd5d6411830cc879466657f706642d5a58c))
* github workflows deploy 고도화 및 CHANGLOG.md 추가 ([d8c5157](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d8c515701b60b3dc93a8ab39f46acb8075c5a1ec))
* github workflows deploy 설정 추가 ([a1c0188](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a1c018870344d2a3fba5105787b98a2c2018cf3d))
* history + favorites 통합 ([714336a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/714336ae68a563ef306588c7dc00af90e55e3dc6))
* history 자동 기록 활성화/비활성화 기능 추가 ([810288b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/810288b932e2b3f7eefef7e7ecd03d0ad7c225ba))
* hitroyItme에 hover 시 미리보기 기능 추가 ([604df42](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/604df421195f4ecfa8874d37206371944ac489a5))
* improved alert and confirm event handling ([3cad0b2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3cad0b2d8469184ab8fff917a7d5ac5390346f7d))
* improved remove history action (remove without favorites) ([8568367](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8568367655bdd5d018bfe294118662e80c7d2465))
* Modal style을 css로 분리 및 UX 개선 ([3e783f3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3e783f31d493cdd5d69923c4b867fedf2e0ff8bf))
* npm build 시 배포를 위한 zip 기능 추가 ([bedc562](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/bedc562b082973abe656105e0e405a60307b883a))
* refactor 할 프로젝트 구조 정의 ([5b4a310](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5b4a3109e96ce3378627792ffc5d033fa408827f))
* refactor 할 프로젝트 구조 정의 - 2 ([7fd813a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7fd813a34a3dd09e78a4cc45207189129b8caacd))
* remove all ([027bd79](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/027bd79cf7dd749686f0fd6c5c59a5891214b80f))
* remove unused permissions ([2324cc7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2324cc7433f0fd6ffa8ca60bc2f7325e67598904))
* searchHistory changed listener 구현 ([b104eaf](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b104eaf3d5ecc100aa37a2a814eb40f2ea1d0d27))
* searchHistory 저장소 관련 함수 정의 ([abc5df5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/abc5df53f03978034e574f97a7079a9bd9deb2a7))
* showModal UX 고도화 ([f3895ed](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f3895ed582295fede380c78b448096581712bc41))
* showModal 기능 추가 ([abc78c1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/abc78c1aedf055e0a0b62deb041fafc9ccd1d150))
* showModal의 overlay를 클릭 시 modal이 닫길 수 있도록 개선 ([2a4fc0e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2a4fc0e0530bc1a1ad8da2f1fd77a3d754b3e10b))
* sidebar 기능 개발 - 1 ([29511d9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/29511d9bebdae9d8365f2a65e6a8dc556f27ef19))
* sidebar 기능 개발 - 2 ([63f9fa0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/63f9fa0b268e100952accd9b09f7996c9149feb7))
* sidebar 기능 개발 - 3 ([2aa74a5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2aa74a5a4b92526e8fbde51ba08766b6112d7926))
* sidebar 기능 개발 - 4 (search history list, item 구성) ([4ce4572](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4ce4572bf177449b1ca6fd1a502f7eb59049eb46))
* sidebar 기능 개발 - 5 (검색 시 url 변경 observing 및 searchHistory 추가) ([f68c4c0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f68c4c02e6103c29f2e857208b0bb39cbd455984))
* sidebar 상단의 History &lt;-&gt; Favorite 간 전환 가능하도록 기능 추가 ([6d2136f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6d2136f60090c2095bdd4e834efe2182e71e906e))
* sidebar 접힘 상태 기억 추가 ([aa30175](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/aa30175b9a8b58f9b55b7207b946e2fb500d6c1f))
* storage 기능 개선 ([2734356](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2734356b5d3276ff49b6e9738d9e8e9b63b9ab2d))
* toast 기능 추가 ([87cd21a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/87cd21aa1cc78e863459b4e33080c9df29d31e13))
* total-searches script로 기능 분리 ([d576feb](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d576febf04de57c1f935846f4f1e6625a3432bac))
* UI 조정 및 sidebar 기능 추가 ([d62347c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d62347ce99a0c59580a49a7e505e866a35a3ce89))
* webpack.config.js 정렬 ([91ba8c2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/91ba8c2b8998fa5bd5ec18c9f68321d1e55312bc))
* 개발 시 사용 할 script build:test 추가 ([89b037d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/89b037d9d5fa03e20ad2fca6ad5856f3fa69d230))
* 개발/테스트 환경 구성 ([ee40361](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ee4036168306012805d0a5caecb62ca9ab1c3baf))
* 개발/테스트 환경 구성 - 2 ([b6b9b24](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b6b9b2405d36706151779c90eda230f7a8050fdf))
* 개발/테스트 환경 구성 - 3 ([57ad319](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/57ad31900aa2596c3dbada4f4ff8406dbb44009c))
* 거래소 URL에서 정보 추출을 위한 parseSearchUrl 기능 추가 ([53cc57b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/53cc57bd4a7a60f210d4f284b35797a0736e66ea))
* 검색 이력 추출 함수 추가 및 lint 정리 ([0fa4743](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0fa4743c6368ba7d9abe48dce315154145e2ec78))
* 검색시 검색창을 사용 했을 경우 검색 hash값 대신 사용하도록 개선 ([f7a1075](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f7a10759081f78159a54e0255448da6314f3c629))
* 미리보기 정보를 추출하기 위한 tradePreviewInjector 기능 추가 - 1 ([eb9e6ea](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/eb9e6ea9b0f2f852255677fa044aae437819cb76))
* 불필요한 권한 조정 ([4e3f56e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4e3f56eaafc218c53425ad0512495bca14f7dc05))
* 이력 삭제 버튼 기능 추가 ([4f3dd5d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4f3dd5dc0c600706c382d9b96c5c0678b7bca176))
* 자료구조 개선 ([474a5f5](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/474a5f5d5beb990a812d4314ccdabe250a16a935))
* 저장소 mock-safe하게 개선 ([0ee48fc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0ee48fc169d2c3d7b945a68692ac1980145778ea))
* 저장소 mock-safe하게 개선 - 2 ([ba7d4ee](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ba7d4eeae6ddee1ca70cd3b902b76cf82d6f0a0e))
* 저장소 mock-safe하게 개선 - 2 ([23cf465](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/23cf465c866d69d48a1948b78e65ad2103bbb40b))
* 저장소 searchHistory eventListener 자료구조 개선 ([a9b1b5d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a9b1b5df5c284dfa352fb4affac5f670424992a7))
* 저장소 SearchHistoryEntity에 기타 정보를 저장하기 위한 etc Record 자료구조 추가 ([b9a458c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b9a458c1408b9463d7ca1ae963c6adb025cf432d))
* 저장소 기능 고도화 및 불필요한 SearchHistoryEntity 요소 정리 ([4bc2d88](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4bc2d888aa8bc7faf6596f5707cd8379f618b961))
* 저장소 즐겨찾기 자료구조 추가 및 이벤트 추가 ([2085434](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2085434a7defe8bf069f7caf994f09438d8d68ba))
* 저장소 즐겨찾기 코드 품질 개선 ([635be4d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/635be4d89f75f0c298691db2321f485a900d69d5))
* 주요 confirm 및 alert 추가 ([133db1a](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/133db1aa4943d9668a37150bcce4fb1eed127f5c))
* 즐겨찾기 UI 및 Modal 추가 ([3eb02a3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3eb02a3918758a85308f2444d52b82f5d76c148f))
* 즐겨찾기 UI 일관성을 위해 item도 icon 분리 ([e66e7fb](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e66e7fb8579832722cc2c2e5e210abca858996bc))
* 즐겨찾기 UI 코드 품질 개선 ([0102ca6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0102ca6bcef1aba872e0d6d8fbe6dab3938e815f))
* 즐겨찾기 기능을 add-favorite에도 적용 ([139c23b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/139c23b18c3eed7670b71e39ff2f050c9dccb9ad))
* 즐겨찾기 더블클릭 이벤트로 파일명 변경 기능 추가 ([5b28915](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5b28915e4da57760e958fccab63b61928035e292))
* 즐겨찾기 및 history-item UX 개선 및 시간 표시형식 변경 ([63bb3a6](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/63bb3a6614371e6728d283f411e738134d7d8e0d))
* 즐겨찾기 버튼 기능 추가 ([4c557f7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4c557f7f0d35feed61cb235704dbf7a210b4e4bc))
* 즐겨찾기 제거 기능 추가 ([1e9ea57](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1e9ea57a574547b012c0c83993fa8ea163c35f74))
* 즐겨찾기 탭 화면 구현 ([051aa42](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/051aa4289a17b6e28cdbd1d085e2172e22449a7f))
* 즐겨찾기 폴더 접기 기능 추가 ([8e3010b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8e3010b38644a45dc73515aa194e699fc1cd53e9))
* 테스트 목적인 development 화면 구성 ([086e2c8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/086e2c887b0915fdbed6659c031d7843ea7a55c1))
* 테스트 코드 추가 ([63dc78f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/63dc78f667716877fd3b0e32bbc946d775b51bd3))
* 파일명 변경 시 검증 강화 ([f915d8b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f915d8bffc2656e64e61be59cc01fa7198582706))


### Bug Fixes

* build 시 경고 조치 ([76f25f8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/76f25f8ab88ac35f462e5499c8b154987e9e63a9))
* deploy.yml Extract release notes ([844413c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/844413cd7709af95e3253a81dcc05b8345e8604c))
* deploy.yml Extract release notes - 10 ([35ea00b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/35ea00bd17e7e24d4a055ba7a125d676946a9f87))
* deploy.yml Extract release notes - 2 ([fb2b992](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fb2b9929f830914042feae33746ae0e739ae5520))
* deploy.yml Extract release notes - 3 ([3c1525f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3c1525fb57a4e97b0d45b2c682f6c336ecf04f86))
* deploy.yml Extract release notes - 4 ([cd50255](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/cd50255642543b66172502e4f5d950d9a5a06567))
* deploy.yml Extract release notes - 5 ([d854380](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d85438018d0108728a772140a7a399daa6b8b768))
* deploy.yml Extract release notes - 6 ([bd19405](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/bd19405417d1692cc1a9d9277e225ad1b6c451f1))
* deploy.yml Extract release notes - 7 ([691ebea](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/691ebeaf93590ad71962bde280d5ad15f14a9fdd))
* deploy.yml Extract release notes - 8 ([d1a4ea7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d1a4ea739db0f1e81baaa020192396be08df6427))
* deploy.yml Extract release notes - 9 ([57d578f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/57d578faaf6ab04686bbdb4f7f4cb9b40db01f8e))
* fix release-please config to correctly apply extra-files ([f08469f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f08469fb5f9f3ee44e11fbdcb39d879d0ba87afb))
* fix release-please config to correctly apply extra-files - 2 ([25b9e91](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/25b9e913b858f6f7e3276acce11678526a9257e8))
* fix release-please config to correctly apply extra-files and tag formatting ([4782f11](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4782f1139297c632a57913455b5f878a1b1aca6a))
* github workflows changelog가 출력되지 않는 문제 수정 ([921eeed](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/921eeedc0c6a61159861f80590dbe31248a68d0b))
* github workflows release 정상화 ([2649f85](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2649f8552d58561b8fc6319fc23daabce2dc7b33))
* npm run dev 시, develop 모드로 빌드되지 않는 문제 수정 ([19938ed](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/19938ed5e97c04c41e7ec50fddaec102da2ead79))
* package.json 잘못 기재되어 있는 license 수정 (ISC -&gt; MIC) ([ec61e47](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ec61e47b6ee06e745f1b2b0dd87c9724675049c5))
* previewInfo가 존재함에도 currentPanel을 추출하는 문제 수정 ([1645c1b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1645c1b79912fc12671777a1416e38a4f6ffa97d))
* root 경로에 폴더 생성 시 잘못된 경로로 폴더명 중복 검증 하는 문제 수정 ([4498b8c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4498b8cc29757fcd3b1873ed7f850bd4111fb705))
* sidebar lint 정리 ([a5c7f25](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a5c7f259dd0ba0fcc44f4da15c1bf922474274fb))
* sidebar가 한국 서버 일 때만 상단 공백을 추가하도록 수정 ([9236365](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/923636569733652238bbad1f8f8f45f806edadca))
* typescript가 정상적으로 빌드 되지않는 문제 수정 ([ef2eac7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ef2eac7d7f180dd8c6a85899b97e903f00ef8961))
* 검색이력 관리가 정상적으로 동작하지 않는 문제 수정 ([0f81ba0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0f81ba094a32654f900aaa3b1c94e37e41a2d59b))
* 누락된 css-loader 추가 ([03fca37](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/03fca37c1d7993ec745c6851aeb8ea15e1bda5a3))
* 누락된 import 정리 ([b64a11e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b64a11e812de1353c22ef2911b81c8f5d6f1d6d4))
* 동적으로 url에서 region과 id를 조합하는 getUrlFromSearchHistory가 의도대로 동작하지 않는 문제 개선 ([e651c71](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e651c71eb16d629a1289da52ad8909451e63f9ad))
* 미리보기 기능이 의도대로 동작하지 않아 전체 재설계 ([19fec75](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/19fec753d92ae75a73391ca24a3b5dbb34b15dae))
* 미리보기 기능이 의도대로 동작하지 않아 전체 재설계 - 2 ([a3daee7](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a3daee726c0da8104e38d099e21f3ad585d6ce9f))
* 자동 검색이력 추가 버튼이 항상 활성화 되어있는 문제 수정 ([8fd182e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8fd182e268478cca9bd8d22eb0363a9ed6ece134))
* 잘못된 asset 경로 참조 수정 ([b3735fc](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b3735fc868bb16f461b8ee07cb498a198c54e32b))
* 즐겨찾기 목록에서 의도대로 접기등의 기능이 동작하지 않는 문제 수정 ([a2a1407](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a2a14076f299bc32a8ae30f73a60a09b52027702))
* 총검색 횟수가 1~2회씩 카운터되는 문제 수정 ([9f4ea20](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9f4ea2079574ef2bbb6bd35f6d47da8a7d1e35bf))
* 하위 폴더에 항목이 있을경우 찾지 못하는 문제 개선 및 테스트 코드 추가 ([1c054c9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1c054c93456270f8e43e2bff094c5762fc5650c2))


### Internal Changes

* add github action (release-please ) for CI/CD ([26ec1d4](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/26ec1d40844247b24fcde1ddda5e15300f76d91f))
* add permissions at PR ruleset closed ([9e1ac4b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9e1ac4b6a021b33262b440b2c2079f25a9211e68))
* Add PR ruleset ([e7f446f](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/e7f446f354afa25007482a09c90eb56e23f1ce13))
* Add PR ruleset - 2 ([030b236](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/030b2365a42c31efc83f316355810e69d83ae57d))
* Add PR ruleset - 3 ([5f0305d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/5f0305d4c0edc3f386ebc8492ea1fa50b0cbc410))
* add PR template ([7265a32](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/7265a32141eed76b649f1252f5006013d628fed1))
* CHANGELOG 작성 규칙 추가/수정 ([4c98cec](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4c98cec07f1a433be818a236d17fae402c3d0e3e))
* enable manual workflow trigger via workflow_dispatch ([1ff7b66](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1ff7b66eed2700bfd7c52eebbdfa4f4ca306efd9))
* fix deploy action while PR merge completed ([4d65936](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4d65936d102f2f757b57025ef6dbe4cdb612ebe1))
* fix github action (release-please ) for CI/CD ([2606526](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2606526b855b30211070ca19bcac304ea7e099ab))
* fix incorrect release-please action source ([fcfef0b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fcfef0b521178a3880c5d073ce883d6f30fa359a))
* fix PR close action while PR commit caused by permission ([f88cb02](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f88cb02708dd617504ef2ab12a380999d7f776d7))
* fix PR ruleset ([6af82ab](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6af82ab14c0ba2f40e173a103bad11ca1ae547e0))
* fix PR ruleset ([a5238f4](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a5238f443126634e42fba23695e9eeedb30dbaa1))
* fix PR ruleset - 2 ([b90bc79](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b90bc799b84ed86920c0b9a3d2979963a7415408))
* fix PR ruleset - 3 ([b5ace91](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b5ace91a4830d252ac0991bbd5028a68a361128b))
* fix PR ruleset - 4 ([4f8f021](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4f8f021d77ee562e8d5b6d81d6c63468bc0d84ae))
* fix PR ruleset - 5 ([45ac2df](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/45ac2df3e6d521b683f51328bdd4492c2ac9b491))
* fix PR ruleset - 6 ([d41a148](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d41a148dabcb0c8eba45d34cba02511188ac4a83))
* fix PR ruleset - 7 ([ee40348](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ee40348e1a044ab22847915ac86fac8dac5b4630))
* fix PR ruleset - 8 ([dc54608](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/dc54608c6a548c916e770d11169b5a3573fa9c85))
* fix PR ruleset - 9 ([2c38573](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2c3857365091726aaeb2c626979165a1df878694))
* fix while reading relase_notes md file (deploy.yml) ([fc8c16b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fc8c16b1a158cf69f3cd843a8ff0d76dc5e7688a))
* grant issues permission for release-please ([d6e0f59](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d6e0f595b6783c0bef77e65f622c752a24940acb))
* improved changelog automatically from PR body ([a872e39](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/a872e392c0749273e090c921a57b894f4712af89))
* package.json에 update_version 추가 ([ce51522](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ce515225de8e2de2aa9c1ac8c56073f15e9faf34))
* release-note script에서 internal을 제외하고 내용이 없을 경우 파일을 작성하지 않도록 변경 ([4cfd2d3](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4cfd2d3500a0fe4f912c573a5cedeec66aee482b))
* release-note 스크립트 로그 개선 및 CHANGELOG의 INTERNAL 색션을 제거하도록 개션 ([fa4c630](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/fa4c63022f7f2f532411cae47ec8fd4452c5a5ac))
* 변경사항이 internal을 제외하고 없을 경우 대표 버전으로 변경되지 않게 수정 ([d5e79ae](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d5e79ae6125d5e4bbe997c2517ac300e4e3b248c))


### Chores

* change version ([81bc5b0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/81bc5b04cf2a3148b89d97f4a8ceca6d93e8df6a))
* change version (1.0.0 -&gt; 1.0.1) ([78b8479](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/78b84795289a29e8e26d6befb1972fe64c643517))
* change version (1.0.0 -&gt; 1.1.0) ([92ee497](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/92ee497df74128570162cfe4dd17e82354f5097f))
* change version (1.0.1 -&gt; 1.0.2) ([9131a0e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9131a0e09f1979d446f8bcf1891bdaf8bee4d7cb))
* change version (1.1.0 -&gt; 1.1.1) ([18ff109](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/18ff1098440062043d3b400636972b40c5e5896a))
* change version (1.1.0 -&gt; 1.2.0) ([d807522](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/d80752256f73c2670e857da764f665c1bd3ff8c4))
* change version (1.1.1 -&gt; 1.1.2) ([f3b963d](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/f3b963d43223588cae0cfca1ed2db60b93541901))
* change version (1.1.2 -&gt; 1.1.3) ([0ca6b01](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0ca6b014f7f69fb5a965e0299f741bdd000ab561))
* change version (1.2.0 -&gt; 1.3.0) ([321724e](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/321724e181d2a9a7bfda572c33a43fef95086c78))
* change version (1.2.1 -&gt; 1.2.2) ([ff324d2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/ff324d2ab654e84719c61ea75d590e59df6e0e37))
* change version (1.3.0 -&gt; 1.2.1) for change git flow to github flow ([63eb07b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/63eb07bd4ab1729d3f6a7f460713a38225511b67))
* CHANGELOG 오타 수정 ([1af6d68](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1af6d6896b778be2fd0c2c849a0a3e217a8e7ca1))
* CHANGELOG.md 작성 ([1521ce9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1521ce9a3f4d1350a36d5562d19f258cf4bf245c))
* componets와 resources 경로 분리 및 이동 ([8f9eaaf](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/8f9eaaff1cf0fb7ab4511a7c4d96ce966def7678))
* **master:** release 2.1.0 ([2237d7b](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2237d7b947dd7aabaec667e4f5dacf03e5cdf5df))
* **master:** release 2.1.0 ([2157ea9](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/2157ea9da1c2920d959dc44e65c2e604039b44a8))
* **master:** release 2.1.1 ([cd521a0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/cd521a073ea0f2313facd9abe0879cb3f6d50d51))
* **master:** release 2.1.1 ([9d9fa81](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/9d9fa815535a36337da4c1c185a677c42af91e2f))
* README.md 개편 ([6459c66](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6459c66cb10486f4c5e94ff09cd864af24253df7))
* README.md 수정 ([bb3a381](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/bb3a3812eed6e88850872ee496f8542a749e8870))
* test ([6de3354](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/6de335402a9f793e0463bc92cfc416320c66d382))
* update patch version (1.2.2 -&gt; 1.2.3) ([79f841c](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/79f841ca4f3251fa0c6e7e414c809391c01cb018))
* update patch version (1.2.3 -&gt; 1.2.4) ([3fbbc86](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/3fbbc8662b44fb43679754e1e43ed6e9904fbf54))
* update patch version (1.2.4 -&gt; 1.2.5) ([bf76d29](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/bf76d298bb7012b9238226508d93553a2091a6c9))
* update patch version (1.2.5 -&gt; 1.2.6) ([b77cf11](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/b77cf1146f598c3ba12686f6f47ee02be58b76a2))
* 불필요한 파일 제거 ([0818848](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/0818848cd05bf7caa45e9a8b160be6f63749b656))
* 제거된 PULL_REQUEST_TEMPLATE.md 롤백 ([322ee73](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/322ee730010ac20de55e0d20d99395623effb27f))
* 프로젝트 sample, icon image 추가 ([1b979e4](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/1b979e4a6fbeb01a52a2173ea0e81fa230950147))

## [2.1.1](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/v2.1.0...v2.1.1) (2025-06-25)


### Bug Fixes

* fix release-please config to correctly apply extra-files and tag formatting ([4782f11](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/4782f1139297c632a57913455b5f878a1b1aca6a))

## [2.1.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.0.0...v2.1.0) (2025-06-25)


### Features

* webpack.config.js 정렬 ([91ba8c2](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/91ba8c2b8998fa5bd5ec18c9f68321d1e55312bc))


### Bug Fixes

* build 시 경고 조치 ([76f25f8](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/commit/76f25f8ab88ac35f462e5499c8b154987e9e63a9))

## 2.0.0
### FEATURES
- Breaking changes
  - Refactored the codebase to use TypeScript.
  - Updated the project structure to follow best practices.
  - Removed deprecated features and APIs.
  - Updated dependencies to their latest versions.
  - Improved error handling and logging.
  - Improved functionality to manage search history and favorites.
  - Improved UI/UX.
    - Now favorites tab can manage with folder UI.
    - All most of the UI components status are saved in local storage.
  - Will provide a new feature soon.
    - favorites can be export and import.

## 1.2.6
### INTERNAL
- fix logic in PR close workflow when writing CHANGELOG_UPDATE.md


## 1.2.5
---
> Each version is divided into one or more of the following categories:
> - **FEATURES**: New features that enhance the project’s functionality.
> - **IMPROVEMENTS**: Enhancements to existing features or performance improvements.
> - **BUG FIXES**: Resolved issues or bugs that were present in previous versions.
> - **INTERNAL**: Internal changes that do not affect the end-user.
---

### INTERNAL
- fix workflow while generate commit message
- improved changelog automatically from PR body


## 1.2.2
### INTERNAL
- Added change version automatically with script in package.json.
- Improved GitHub release action.
  - Set as the latest release when changelog exists without INTERNAL category.

## 1.2.1
### INTERNAL
- Added RELEASE NOTE in GitHub action.

## 1.2.0
### FEATURES
- Added a new feature to manage search history.
  - can disable history tracking.
- Added a new feature to manage favorites.
  - can add directly from the search result.

### INTERNAL
- Added RELEASE NOTE in GitHub action.

### IMPROVEMENTS
- improved alert and confirm event handling.
- improved remove history action.
  - remove without favorites.

## 1.1.3
### INTERNAL
- Fixed an GitHub release action issue.

## 1.1.2
### INTERNAL
- Added GitHub release action

## 1.1.1
### INTERNAL
- init GitHub actions

## 1.1.0
### FEATURES
- refactor code & GUI.
- Add a favorites list.

### BUG FIXES
- Fixed an intermittent issue where the specified history name was reset to its ID.

## 1.0.0
### FEATURES
- Initial release
