const fs = require('fs');
const path = require('path');

// 인수로 전달된 업데이트 유형 (major, minor, patch)
const args = process.argv.slice(2);
const updateType = args[0];

if (!['major', 'minor', 'patch'].includes(updateType)) {
  console.error('Invalid update type. Must be one of: major, minor, patch');
  console.error('Usage: npm run update_version -- <major|minor|patch> <path-to-pr-body-file>');
  process.exit(1);
}

const prBodyFilePath = args[1];
if (!fs.existsSync(prBodyFilePath)) {
  console.error(`File not found: ${prBodyFilePath}`);
  console.error('Usage: npm run update_version -- <major|minor|patch> <path-to-pr-body-file>');
  process.exit(1);
}

const prBody = fs.readFileSync(prBodyFilePath, 'utf-8');
if (!prBody) {
  console.error('Pull request body is empty.');
  process.exit(1);
}

// 경로 설정
const packageJsonPath = path.resolve(__dirname, '../package.json');
const manifestJsonPath = path.resolve(__dirname, '../src/manifest.json');
const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');

// 파일 읽기 및 파싱
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));
const changelog = fs.readFileSync(changelogPath, 'utf-8');

// 현재 버전 파싱
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('.').map(Number);

// 버전 업데이트
if (updateType === 'major') {
  versionParts[0] += 1;
  versionParts[1] = 0;
  versionParts[2] = 0;
} else if (updateType === 'minor') {
  versionParts[1] += 1;
  versionParts[2] = 0;
} else if (updateType === 'patch') {
  versionParts[2] += 1;
}

// 새로운 버전 생성
const newVersion = versionParts.join('.');

// package.json 및 manifest.json 업데이트
packageJson.version = newVersion;
manifestJson.version = newVersion;

// 파일 저장
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n');

// CHANGELOG.md 업데이트
const newChangelogSection = `## ${newVersion}\n` + prBody + '\n';


// 새 섹션을 마지막 버전 위에 추가
const changelogLines = changelog.split('\n');
const firstVersionIndex = changelogLines.findIndex((line) => line.startsWith('## ') && line !== '# CHANGE LOG');

if (firstVersionIndex !== -1) {
  changelogLines.splice(firstVersionIndex, 0, newChangelogSection);
} else {
  console.error('No existing versions found in CHANGELOG.md to insert above.');
  process.exit(1);
}

// 변경된 CHANGELOG 저장
fs.writeFileSync(changelogPath, changelogLines.join('\n'));

console.log(`Version updated to ${newVersion} (${updateType})`);
console.log(`CHANGELOG.md updated with section for version ${newVersion}`);
