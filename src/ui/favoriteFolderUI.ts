import * as storage from '../utils/storage';
import { FavoriteFolder, FavoriteFolderRoot } from '../utils/storage';
import { showToast } from '../utils/api';

export function generate(showItems: boolean, root: Promise<storage.FavoriteFolderRoot> = storage.getFavoriteFolderRoot()): HTMLUListElement {
  const ul = document.createElement('ul');
  ul.className = 'favorite-folder-list';

  function createFolderItem(folder: storage.FavoriteFolder, path: string): HTMLLIElement[] {
    const elements: HTMLLIElement[] = [];

    const li = document.createElement('li');
    li.className = 'folder-item';
    li.dataset.path = path;
    Object.assign(li.style, {
      marginLeft: `${path.split('/').length * 10}px`,
      listStyleType: 'none',
      textAlign: 'left',
      cursor: 'pointer',
    });

    const span = document.createElement('span');
    span.textContent = `📁 ${folder.name}`;
    span.dataset.path = path;
    li.appendChild(span);
    elements.push(li);

    // 선택 처리
    li.addEventListener('click', () => {
      const selected = ul.querySelector('li > span.selected');
      if (selected) selected.classList.remove('selected');
      span.classList.add('selected');
      if (process.env.NODE_ENV === 'development') {
        showToast(`폴더 선택됨: ${path}`, '#0f0');
      }
    });

    // 하위 폴더 먼저 재귀적으로 렌더링
    if (folder.folders) {
      for (const sub of folder.folders) {
        const subItems = createFolderItem(sub, `${path}/${sub.name}`);
        for (const el of subItems) {
          elements.push(el);
        }
      }
    }

    // 하위 아이템 렌더링
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
        elements.push(itemLi);
      }
    }

    return elements;
  }

  root.then((data) => {
    // 루트 '/' 표시
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
        const folderElements = createFolderItem(folder, `/${folder.name}`);
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
