// content.js
const SIDEBAR_ID = 'poe2-trade-sidebar';

function loadTemplate(filePath) {
  const url = chrome.runtime.getURL(filePath);
  return fetch(url).then((response) => response.text());
}

function initSidebar() {
  const content = document.querySelector('.content');
  if (!content) {
    console.error('Could not find .content element');
    return;
  }

  if (document.getElementById(SIDEBAR_ID)) {
    console.log('Sidebar already exists');
    return;
  }

  loadTemplate('components/sidebar.html').then((template) => {
    const sidebar = document.createElement('div');
    sidebar.id = SIDEBAR_ID;
    sidebar.innerHTML = template;

    // 사이드바 클래스 추가
    sidebar.classList.add('poe2-sidebar');

    // 사이드바를 content의 형제 요소로 추가
    const container = document.createElement('div');
    container.classList.add('poe2-container');
    container.style.display = 'flex';
    container.style.width = '100%';

    content.parentElement.insertBefore(container, content);
    container.appendChild(content);
    container.appendChild(sidebar);

    // content를 가운데 정렬
    content.style.marginRight = '320px';
    content.style.marginLeft = 'auto';
    content.style.width = 'calc(100% - 320px)'; // 사이드바 공간을 뺀 너비

    initTabNavigation();
    initToggleSidebar(sidebar);
  });
}


function initTabNavigation() {
  const tabs = document.querySelectorAll('.menu-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // 모든 탭 비활성화
      tabs.forEach((t) => t.classList.remove('active'));
      // 모든 콘텐츠 숨기기
      contents.forEach((content) => content.classList.remove('active'));

      // 클릭된 탭 활성화
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

function initToggleSidebar(sidebar) {
  const toggleButton = document.createElement('button');
  toggleButton.id = 'poe2-trade-sidebar-toggle';
  toggleButton.textContent = '⮜';
  toggleButton.classList.add('poe2-toggle-button');

  // 버튼을 body에 추가 (사이드바와 독립적으로 위치)
  document.body.appendChild(toggleButton);

  // 버튼 위치 조정
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '7%'; // 사이드바와 동일한 상단 위치
  toggleButton.style.right = '300px'; // 사이드바 왼쪽 바로 바깥

  // 애니메이션 클래스 추가
  toggleButton.classList.add('transition-toggle-button');

  toggleButton.addEventListener('click', () => {
    const content = document.querySelector('.content');
    if (sidebar.style.right === '-300px' || sidebar.style.right === '') {
      sidebar.style.right = '0';
      toggleButton.style.right = '300px'; // 버튼 위치도 변경
      toggleButton.textContent = '⮜';
      content.style.marginRight = '320px'; // 사이드바가 나타나면 마진 추가
      content.style.marginLeft = 'auto';
    } else {
      sidebar.style.right = '-300px';
      toggleButton.style.right = '20px'; // 버튼을 화면 오른쪽에 고정
      toggleButton.textContent = '⮞';
      content.style.marginRight = '0'; // 사이드바가 숨겨지면 마진 제거
      content.style.marginLeft = 'auto';
      content.style.width = '100%'; // 원래 너비로 복원
    }
  });
}




initSidebar();
