import { StorageManager } from './storage';

const testFileName = 'poe2-trade-butler-test-file';
const testData = { test: 'This is a test file.', number: 1 };

const testStorage = new StorageManager(
  'sync',
  testFileName,
  () => testData,
  'googleDrive'
);

export async function get(): Promise<typeof testData> {
  return testStorage.get();
}

export async function set(data: typeof testData): Promise<void> {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be a non-null object');
  }
  await testStorage.set(data);
}