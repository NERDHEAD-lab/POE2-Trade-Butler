import '../styles/popup.scss';
import * as informationSections from '../ui/information';

function renderPopupMenu() {
  const root = document.body;
  root.className = 'poe2-trade-butler-popup';
  root.innerHTML = '';
  root.style.minWidth = '260px';
  root.style.maxWidth = '340px';
  informationSections.attachInformationSections(root);
}


document.addEventListener('DOMContentLoaded', renderPopupMenu);
