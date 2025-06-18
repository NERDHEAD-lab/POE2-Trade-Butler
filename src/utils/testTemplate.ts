/*********************** Test Functions ***********************/
const testHeaderElement = document.getElementById('test-header');
if (!testHeaderElement) {
  console.error('Could not find #test-header element');
}

const testsElement = document.getElementById('tests');
if (!testsElement) {
  console.error('Could not find #tests element');
}
document.getElementById('testAll')?.addEventListener('click', runAllTests);

const testTemplate = `
<div class="test-template" style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
  <h3 class="testName"></h3>
  <input type="text" class="testInput" style="width: 80%; padding: 5px; margin-bottom: 10px;" placeholder="Enter value here" />
  <button class="test-button">test!</button>
<!--  testResult는 항상 자리를 차지 하게-->
  <div class="testResult" style="margin-top: 10px; padding: 5px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 3px;">
</div>
`;

//textInput 기본 값이 필요할 경우 받는다.
export function createTest(testName: string, defaultValue: string = '', callback: (value: string) => string) {
  console.log(`Creating test: ${testName} with default value: ${defaultValue}`);
  const testElement = document.createElement('div');
  testElement.innerHTML = testTemplate;

  const testNameElement = testElement.querySelector('.testName') as HTMLElement;
  const testInputElement = testElement.querySelector('.testInput') as HTMLInputElement;
  const testButtonElement = testElement.querySelector('.test-button') as HTMLButtonElement;

  testNameElement.textContent = testName;
  testInputElement.value = defaultValue; // Set default value if provided

  testButtonElement.addEventListener('click', () => {
    const inputValue = testInputElement.value;
    const result = callback(inputValue);
    const resultElement = testElement.querySelector('.testResult') as HTMLElement;
    resultElement.textContent = `결과 : ${result}`; // Display the result
  });

  testsElement?.appendChild(testElement);
}

export function createTestWithoutInput(testName: string, defaultValue: string = '', callback: () => string) {
  console.log(`Creating test without input: ${testName} with default value: ${defaultValue}`);
  const testElement = document.createElement('div');
  testElement.innerHTML = testTemplate;

  const testNameElement = testElement.querySelector('.testName') as HTMLElement;
  const testButtonElement = testElement.querySelector('.test-button') as HTMLButtonElement;

  testNameElement.textContent = testName;

  testButtonElement.addEventListener('click', () => {
    const result = callback();
    const resultElement = testElement.querySelector('.testResult') as HTMLElement;
    resultElement.textContent = `결과 : ${result}'; // Display the result`
  });

  testsElement?.appendChild(testElement);
}

export function createButton(buttonText: string, callback: () => void) {
  const button = document.createElement('button');
  button.textContent = buttonText;
  button.addEventListener('click', callback);

  testHeaderElement?.appendChild(button);
}

function runAllTests() {
  console.log('Running all tests...');
  const testElements = document.querySelectorAll('.test-template');
  testElements.forEach((testElement) => {
    const button = testElement.querySelector('.test-button') as HTMLButtonElement;
    button.click();
  });
}
