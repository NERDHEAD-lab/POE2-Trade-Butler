import * as storage from '../utils/storage';
import { FavoriteFolder } from '../utils/storage';
import { showToast } from '../utils/api';

export function generate(showItems: boolean, root: Promise<storage.FavoriteFolderRoot> = storage.getFavoriteFolderRoot()): HTMLUListElement {
  const ul = document.createElement('ul');
  ul.className = 'favorite-folder-list';

  function createFolderItem(folder: FavoriteFolder, path: string): HTMLLIElement {
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

    // 폴더 클릭 시 선택 상태 토글
    li.addEventListener('click', () => {
      const selected = ul.querySelector('li > span.selected');
      if (selected) {
        selected.classList.remove('selected');
      }
      span.classList.add('selected');
      //dev일 때만 출력
      if (process.env.NODE_ENV === 'development') {
        showToast(`폴더 선택됨: ${path}`, '#0f0');
      }
    });

    return li;
  }

  // 루트 '/' 표시
  const rootLi = createFolderItem({ name: '/', folders: [], items: [] }, '');
  rootLi.style.marginLeft = '0'; // 루트는 들여쓰기 없음
  ul.appendChild(rootLi);

  root.then(favoriteRoot => {
    function renderFolders(folders: FavoriteFolder[], currentPath: string) {
      folders.forEach(folder => {
        const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
        const li = createFolderItem(folder, folderPath);
        ul.appendChild(li);

        // 하위 폴더가 있다면 재귀적으로 렌더링
        if (folder.folders && folder.folders.length > 0) {
          const subUl = document.createElement('ul');
          renderFolders(folder.folders, folderPath);
          li.appendChild(subUl);
        }
      });
    }

    renderFolders(favoriteRoot.folders, '');
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
