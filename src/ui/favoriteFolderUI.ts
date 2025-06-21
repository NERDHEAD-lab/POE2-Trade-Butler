import * as storage from '../utils/storage';
import { FavoriteFolder, FavoriteFolderRoot } from '../utils/storage';
import { showToast } from '../utils/api';

/**
 * Generate a favorite folder list UI element.
 * @param root - A promise that resolves to the root favorite folder data.
 * @param showItems - Whether to show items in the folder. (default: true)
 * @param defaultExpanded - Whether the folders should be expanded by default. (default: true)
 */
export function generate(
  root: Promise<storage.FavoriteFolderRoot> = storage.getFavoriteFolderRoot(),
  showItems: boolean = true,
  defaultExpanded: boolean = true
): HTMLUListElement {
  const ul = document.createElement('ul');
  ul.className = 'favorite-folder-list';

  function createFolderItem(folder: storage.FavoriteFolder, path: string, expanded: boolean): HTMLLIElement[] {
    const elements: HTMLLIElement[] = [];

    const li = document.createElement('li');
    li.className = 'folder-item';
    li.dataset.path = path;
    Object.assign(li.style, {
      marginLeft: `${path.split('/').length * 10}px`,
      listStyleType: 'none',
      textAlign: 'left'
    });

    const icon = document.createElement('span');
    icon.textContent = expanded ? '📁' : '📂';
    icon.style.cursor = 'pointer';
    icon.style.marginRight = '4px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = folder.name;
    nameSpan.dataset.path = path;
    nameSpan.classList.add('folder-name');

    li.appendChild(icon);
    li.appendChild(nameSpan);
    elements.push(li);

    const childElements: HTMLLIElement[] = [];

    if (folder.folders) {
      for (const sub of folder.folders) {
        const subItems = createFolderItem(sub, `${path}/${sub.name}`, expanded);
        for (const el of subItems) {
          childElements.push(el);
        }
      }
    }

    if (showItems && folder.items) {
      for (const item of folder.items) {
        const itemLi = document.createElement('li');
        itemLi.className = 'favorite-item';
        itemLi.dataset.path = `${path}/${item.id}`;
        Object.assign(itemLi.style, {
          marginLeft: `${(path.split('/').length + 1) * 10}px`,
          listStyleType: 'none',
          textAlign: 'left',
        });

        const itemSpan = document.createElement('span');
        itemSpan.textContent = `⭐ ${item.name || item.id}`;
        itemLi.appendChild(itemSpan);
        childElements.push(itemLi);
      }
    }

    const toggleChildrenVisibility = () => {
      expanded = !expanded;
      icon.textContent = expanded ? '📁' : '📂';
      for (const el of childElements) {
        el.style.display = expanded ? 'list-item' : 'none';
      }
    };

    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChildrenVisibility();
    });

    nameSpan.addEventListener('click', () => {
      const selected = ul.querySelector('li > span.folder-name.selected');
      if (selected) selected.classList.remove('selected');
      nameSpan.classList.add('selected');
      if (process.env.NODE_ENV === 'development') {
        showToast(`폴더 선택됨: ${path}`, '#0f0');
      }
    });

    for (const el of childElements) {
      el.style.display = expanded ? 'list-item' : 'none';
    }

    elements.push(...childElements);
    return elements;
  }

  root.then((data) => {
    const rootLi = document.createElement('li');
    rootLi.className = 'folder-item';
    rootLi.dataset.path = '/';
    rootLi.textContent = '📁 /';
    Object.assign(rootLi.style, {
      marginLeft: '0px',
      listStyleType: 'none',
      textAlign: 'left',
      fontWeight: 'bold'
    });
    ul.appendChild(rootLi);

    if (data.folders) {
      for (const folder of data.folders) {
        const folderElements = createFolderItem(folder, `/${folder.name}`, defaultExpanded);
        for (const el of folderElements) {
          ul.appendChild(el);
        }
      }
    }

    if (showItems && data.items) {
      for (const item of data.items) {
        const itemLi = document.createElement('li');
        itemLi.className = 'favorite-item';
        itemLi.dataset.path = `/${item.id}`;
        Object.assign(itemLi.style, {
          marginLeft: `10px`,
          listStyleType: 'none',
          textAlign: 'left',
        });

        const itemSpan = document.createElement('span');
        itemSpan.textContent = `⭐ ${item.name || item.id}`;
        itemLi.appendChild(itemSpan);
        ul.appendChild(itemLi);
      }
    }
  });

  return ul;
}

export function getSelectedFolderPath(generated: HTMLUListElement): string {
  const selected = generated.querySelector('li > span.selected');
  return selected ? (selected as HTMLSpanElement).dataset.path || '' : '';
}

export function selectFolderByPath(generated: HTMLUListElement, path: string): void {
  const selected = generated.querySelector('li > span.selected');
  if (selected) {
    selected.classList.remove('selected');
  }

  const target = generated.querySelector(`li > span[data-path="${path}"]`);
  if (target) {
    (target as HTMLSpanElement).classList.add('selected');
  } else {
    showToast(`폴더를 찾을 수 없습니다: ${path}`, '#f66');
  }
}
