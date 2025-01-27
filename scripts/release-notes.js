const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

// 인수로 전달된 버전 확인 (없으면 package.json에서 가져옴)
const args = process.argv.slice(2); // 명령행 인수 가져오기
const TAG = args[0] || packageJson.version; // 첫 번째 인수를 TAG로 사용

const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
const releaseNotesPath = path.resolve(__dirname, `../release_notes_${TAG}.md`);

// CHANGELOG.md에서 릴리스 노트를 추출하는 함수
function extractReleaseNotes(tag) {
  if (!fs.existsSync(changelogPath)) {
    console.error(`CHANGELOG.md not found at: ${changelogPath}`);
    process.exit(1);
  }

  const changelog = fs.readFileSync(changelogPath, 'utf-8');
  console.log(`--------------------------------------------------\n\n`);
  console.log(`--- Extracting release notes for version: ${tag} ---`);
  console.log(`DEBUG: CHANGELOG.md content:\n${changelog}`); // 디버깅: 파일 내용 확인
  console.log(`--------------------------------------------------\n\n`);

  // 정규식 수정: 태그부터 다음 태그까지 매칭, 줄 끝 처리 강화
  const regex = new RegExp(`^## ${tag}[\\s\\S]*?(?=^## \\d|\\Z)`, 'gm');
  const match = changelog.match(regex);

  if (!match) {
    console.error(`No release notes found for version: ${tag}`);
    process.exit(1);
  }

  let releaseNotes = match[0].trim(); // 결과를 반환하며, 앞뒤 공백 제거

  // INTERNAL 섹션 제거
  releaseNotes = releaseNotes
    .replace(/### INTERNAL[\s\S]*?(?=\n###|$)/g, '')
    .replace(/\n{2,}/g, '\n') // 빈 줄 2개 이상을 1개로 줄임
    .trim();

  console.log(`--------------------------------------------------\n\n`);
  console.log(`DEBUG: Filtered content (without INTERNAL):\n${releaseNotes}`); // 디버깅: INTERNAL 제거 결과 확인
  console.log(`--------------------------------------------------\n\n`);

  return releaseNotes;
}

// 릴리스 노트 추출 및 파일 생성
try {
  const releaseNotes = extractReleaseNotes(TAG);
  fs.writeFileSync(releaseNotesPath, releaseNotes);
  console.log(`Release notes for ${TAG} saved to: ${releaseNotesPath}`);
} catch (err) {
  console.error(`Failed to extract release notes: ${err.message}`);
  process.exit(1);
}
