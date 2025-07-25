import { renderSidebar } from './components/sidebar';
import './styles/sidebar.css';
import { getMessage } from './utils/_locale';
import * as butlerGuide from './support/butlerGuide';
import { registerExtensionContextAutoReload } from './utils/extensionContextWatcher';

registerExtensionContextAutoReload();

const content = document.querySelector('.content') as HTMLElement;
if (!content) {
  console.error(getMessage('error_content_element_not_found'));
}
if (content.querySelector('.backdrop')) {
  // backdrop이 있을 경우 로그인 토큰이 만료되어 로그인 페이지로 리다이렉트된 상태
  console.info(getMessage('info_backdrop_detected'));
} else {
  Promise.resolve()
    .then(() => renderSidebar(content))
    .then(async () => {
      // Butler Guide: 처음 실행 시 가이드 실행
      await butlerGuide.runButlerGuides();
    });
}

