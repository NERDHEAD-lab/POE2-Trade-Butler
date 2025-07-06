import { renderSidebar } from './components/sidebar';
import './styles/sidebar.css';
import { getMessage } from './utils/_locale';
import * as settingStorage from './storage/settingStorage';
import * as butlerGuide from './support/butlerGuide';


const content = document.querySelector('.content') as HTMLElement;
if (!content) {
  console.error(getMessage('error_content_element_not_found'));
}


Promise.resolve()
  .then(() => renderSidebar(content))
  .then(async () => {
    // Butler Guide: 처음 실행 시 가이드 실행
    await butlerGuide.runButlerGuides();
  });

