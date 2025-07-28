// scripts/generate-storage-manager-initializer.ts
import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../src');
const TARGET_FILE = path.resolve(PROJECT_ROOT, 'storage/initStorage.ts');
const TARGET_IMPORT = 'StorageManager';

function findImportFiles(): string[] {
  const files = glob.sync('**/*.ts', {
    cwd: PROJECT_ROOT,
    absolute: true,
    ignore: ['storage/initStorage.ts', '**/*.d.ts', '**/*.test.ts'],
  });

  return files.filter(file => {
    const content = fs.readFileSync(file, 'utf-8');
    // 단순한 substring 말고 정규표현식으로 탐지 정확도 향상
    // return /import\s+\{[^}]*\bStorageManager\b[^}]*}/.test(content);
    return new RegExp(`import\\s+\\{[^}]*\\b${TARGET_IMPORT}\\b[^}]*}`).test(content);
  });
}

function generateInitStorageContent(files: string[]): string {
  const imports = files.map((file, idx) => {
    const relativePath = path.relative(path.dirname(TARGET_FILE), file)
      .replace(/\\/g, '/')
      .replace(/\.ts$/, '');

    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    console.log(`Importing: ${importPath} [${idx + 1}]`);

    return `import '${importPath}'; // auto-imported [${idx + 1}]`;
  });


  return [
    '/* ********************************************************************************************* */',
    '/* This file is auto-generated to ensure all StorageManager instances are included in the bundle */',
    '/* ********************************************************************************************* */',
    // '',
    // '/* eslint-disable @typescript-eslint/no-unused-vars */',
    // '',
    ...imports,
    '',
  ].join('\n');
}

function writeInitStorageFile(content: string): void {
  fs.writeFileSync(TARGET_FILE, content, 'utf-8');
  console.log(`✅  Successfully generated ${path.relative(PROJECT_ROOT, TARGET_FILE)}`);
}

const files = findImportFiles();
const content = generateInitStorageContent(files);
writeInitStorageFile(content);
