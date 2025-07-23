import * as informationSections from '../ui/information';

function renderPopupMenu() {
  console.log('Rendering popup menu...');
  const root = document.body;
  root.className = 'poe2-trade-butler-popup';
  root.innerHTML = '';
  root.style.minWidth = '260px';
  root.style.maxWidth = '340px';
  root.style.backgroundColor = '#f9f9f9';
  informationSections.attachInformationSections(root);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderPopupMenu);
} else {
  renderPopupMenu();
}