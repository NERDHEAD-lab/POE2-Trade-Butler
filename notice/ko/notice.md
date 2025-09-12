| **한국어** | [English](../en/notice.md) | [日本語](../ja/notice.md) | [简体中文](../zh_CN/notice.md) | [繁體中文](../zh_TW/notice.md) |
|---|---|---|---|---|

## Roadmap (Next Update)

- 현재 즐겨 찾기를 저장하기 위한 google 계정 저장소 이용 가능 용량이 100kb로 제한이 있습니다.
Google Drive Appdata로 저장소를 마이그레이션  예정입니다.
- 즐겨 찾기를 공유하는 기능을 개발 중에 있습니다.

---

# Changelog

## [2.11.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.10.0...2.11.0) (2025-09-08)

### Features

- DB 성능 개선

### Bug Fixes

- 즐겨 찾기 전체 데이터가 8kb를 초과 시 추가 하지 못하는 문제 개선 (임시)

## [2.10.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.9.0...2.10.0) (2025-09-02)

> 저도 주말에는 열심히 POE2를 한다고 패치가 늦어버렸습니다. 죄송합니다.
> 슬슬 탬좀 맞추려고 거래소 페이지 갔더니 시즌3이라고 배경 이미지가 밝게 바뀌면서 확장 플러그인의 가시성이 안좋게 됬더라구요...


### Features

- sidebar 불투명도 조절 기능 추가 (설정에서 확인 할 수 있습니다.)

### Bug Fixes

- POE2 거래소 페이지 배경화면 변경에 따른 sidebar 가시성 개선 ( 불투명도 20% -> 80% )

## [2.9.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.8.0...2.9.0) (2025-07-29)

### Features

- **settings:** 설정 창 UI 개선

## [2.8.0](https://github.com/NERDHEAD-lab/POE2-Trade-Butler/compare/2.7.0...2.8.0) (2025-07-28)

### Features

- 저장소에서 더 이상 사용되지 않는 데이터 정리 및 전체적인 최적화
- 일부 UI/UX 구조 개선
- 일부 UI 로딩 속도 개선
- 설정 버튼 추가 - 언어 변경, 사용 가이드, 저장소 사용 내역 등을 확인 할 수 있습니다.
- 일본어 지원 추가

### Bug Fixes

- 로그인 페이지에서 간헐적으로 sidebar가 표시되는 문제 수정
- **popup:** 간헐적으로 popup이 로드되지 않는 문제 개선
- 플러그인이 재시작되거나 업데이트 되었을 때 sidebar가 동작하지 않는 문제 개선
- 다른 국가의 페이지에서 등록된 **검색 이력**과 **즐겨찾기**를 클릭 시 정상적으로 redirection 되지 않는 문제 수정