import '../styles/popup.css';
import * as settingStorage from '../storage/settingStorage';

interface popupMenuItem {
  id: string;
  label: string;
  checked: () => boolean;
  onChange: (checked: boolean) => void;
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
