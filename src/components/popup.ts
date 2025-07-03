import '../styles/popup.css';
import * as settingStorage from '../storage/settingStorage';

interface popupMenuItem {
  id: string;
  label: string;
  checked: () => Promise<boolean> | boolean;
  onChange: (checked: boolean) => Promise<void> | void;
  parentId?: string;
}

const popupMenuContainer = document.querySelector('#popup-menu') as HTMLDivElement;

const popupMenuListHtml = `
<span class="popup-menu-item"></span>
<label class="switch">
  <input type="checkbox" checked />
  <span class="slider"></span>
</label>
`

/**
 * todo: 1. show history menu
 * todo: 2. redirect poe.game.daum.net -> www.pathofexile.com
 * todo:    - translate eng -> kor
 * todo: 3. show ads
 */
const popupMenuList: popupMenuItem[] = [
  // {
  //   id: 'redirectPoe2Trade',
  //   label: 'Redirect to Poe2Trade as english',
  //
  //   async checked() {
  //     return await settingStorage.isRedirectPoe2TradeEnabled();
  //   },
  //
  //   async onChange(checked: boolean) {
  //     await settingStorage.setRedirectPoe2TradeEnabled(checked);
  //   }
  // }
];

function appendPopupMenuItem(target: HTMLElement, item: popupMenuItem) {
  const menuItem = document.createElement('div');
  menuItem.className = 'popup-menu-item';
  menuItem.id = item.id;

  menuItem.innerHTML = popupMenuListHtml;

  const label = menuItem.querySelector('span')!;
  label.textContent = item.label;

  const checkbox = menuItem.querySelector('input') as HTMLInputElement;

  Promise.resolve(item.checked())
    .then((isChecked) => {
      checkbox.checked = isChecked;
    })
    .catch(console.error);

  checkbox.addEventListener('change', () => {
    Promise.resolve(item.onChange(checkbox.checked))
      .catch(console.error);
  });

  target.appendChild(menuItem);
}


/* **************************************************************************************** */
/* ********************************** Render Popup Menu *********************************** */
/* **************************************************************************************** */
(async function renderPopup(container: HTMLDivElement) {
  container.innerHTML = '';

  for (const item of popupMenuList) {
    appendPopupMenuItem(container, item);
  }
})(popupMenuContainer);