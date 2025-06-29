import '../styles/favoriteUI.css';
import * as favorite from '../storage/favoriteStorage';
import * as fs from './fileSystemEntry';
import { FileEntry, FileSystemEntry, FolderEntry } from './fileSystemEntry';
import { FileSystemUI } from './fileSystemUI';

//TODO: 추후 추상화 고려하여 FileSystemUI로 일부 기능을 옮길 것
/**
 * 즐겨찾기 파일 시스템 UI를 로드하고 생성합니다.
 * favoriteStorage의 변경이 필요 할 경우 항상 favoriteStorage.getAll()을 호출하여 수행합니다.
 */

const favoriteFileSystemClass = 'favorite-folder-list';
const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

export async function loadFavoriteFileSystemUI(parent: HTMLDivElement): Promise<FileSystemUI> {
  return favorite.getAll()
    .then(entries => fs.sortEntries(entries))
    .then(sortedEntries => {
      return FileSystemUI.builder(sortedEntries)
        .htmlLiElement((entries, entry) => createLiElement(entries, entry))
        .attachTo(parent)
        .build();
    })
    .then(fileSystemUI => fileSystemUI.create())
    .then(fileSystemUI => {
      // storage가 변경될 때마다 UI를 업데이트합니다.
      favorite.addOnChangeListener(newValue => fileSystemUI.update(fs.sortEntries(newValue)));
      return fileSystemUI;
    });
}

function createLiElement(
  entries: FileSystemEntry[],
  entry: FileSystemEntry
): HTMLLIElement {
  var liElement: HTMLLIElement;
  if (fs.isFolderEntry(entry)) {
    liElement = createFolderHtmlElement(entries, entry);
  } else if (fs.isFileEntry(entry)) {
    liElement = createFavoriteItemHtmlElement(entries, entry);
  } else {
    throw new Error(`알 수 없는 파일 시스템 항목 유형: ${(entry as any).type}`);
  }

  addDragAndDropEvent(liElement, entries, entry);
  return liElement;
}

function createFolderHtmlElement(
  entries: FileSystemEntry[],
  entry: FolderEntry
): HTMLLIElement {
  const liElement = document.createElement('li');
  const iconElement = document.createElement('span');
  const nameElement = document.createElement('span');

  liElement.className = 'folder';
  liElement.dataset.id = entry.id;
  liElement.style.marginLeft = `${fs.getDepth(entries, entry) * 10}px`;
  liElement.draggable = true;

  iconElement.className = 'folder-icon';
  iconElement.textContent = '📂';
  iconElement.classList.add('expanded');


  nameElement.className = 'folder-name';
  nameElement.textContent = entry.name;


  let clickTimer: ReturnType<typeof setTimeout> | null = null;

  // 목록 클릭 시 selected 상태로 변경
  liElement.addEventListener('click', (e) => {
    e.stopPropagation();

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }

    clickTimer = setTimeout(() => {
      clickTimer = null;

      // 모든 li 요소에서 selected 클래스 제거 및 현재 요소에만 selected 클래스 추가
      Array.from(liElement.parentElement?.children || [])
        .forEach(child => {
          if (child instanceof HTMLLIElement) {
            child.classList.remove('selected');
          }
        });

      liElement.classList.add('selected');
    }, 250);
  });

  // 목록 더블클릭 시 아이콘 클릭 이벤트 실행
  liElement.addEventListener('dblclick', (e) => {
    e.stopPropagation();

    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }

    iconElement.click();
  });

  // 아이콘 클릭 시 하위 항목 표시/숨김
  iconElement.addEventListener('click', () => {
    const isExpanded = iconElement.classList.toggle('expanded');
    const childEntries = fs.getChildren(entries, entry.id);
    const childElements = Array.from(liElement.parentElement?.children || []).filter(
      child => child instanceof HTMLLIElement && child.dataset.id === entry.id
    );

    iconElement.textContent = isExpanded ? '📂' : '📁';
    nameElement.textContent = isExpanded ? entry.name : `${entry.name} (${childEntries.length})`;
    childElements.forEach(child => {
      if (child instanceof HTMLLIElement) {
        child.style.display = isExpanded ? 'block' : 'none';
      }
    });
  });

  // 이름 더블클릭 시 이름 변경
  addRenameEvent(nameElement, entry);

  liElement.appendChild(iconElement);
  liElement.appendChild(nameElement);
  return liElement;
}

function addRenameEvent(nameElement: HTMLSpanElement, entry: FileSystemEntry) {
  nameElement.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    const newName = prompt('새로운 이름을 입력하세요:', entry.name);
    if (!newName || newName.trim() === entry.name) {
      alert('이름 변경이 취소되었습니다.');
    } else if (exceptionCheck(newName)) {
      alert('이름에 사용할 수 없는 문자가 포함되어 있습니다. (/, \\, :, *, ?, ", <, >, |)');
    } else {
      favorite.getAll().then(favorites => {
        const updatedFavorites = favorites.map(fav => {
          if (fav.id === entry.id) {
            return { ...fav, name: newName, modifiedAt: new Date().toISOString()};
          }
          return fav;
        });
        return favorite.saveAll(updatedFavorites);
      }).then(() => {
        alert(`"${entry.name}"의 이름이 "${newName}"(으)로 변경되었습니다.`);
      }).catch(err => {
        console.error('즐겨찾기 이름 변경 중 오류 발생:', err);
        alert('즐겨찾기 이름 변경 중 오류가 발생했습니다.');
      });
    }
  });
}

function createFavoriteItemHtmlElement(
  entries: FileSystemEntry[],
  entry: FileEntry
): HTMLLIElement {
  const liElement = document.createElement('li');
  const iconElement = document.createElement('span');
  const nameElement = document.createElement('span');

  liElement.className = 'favorite';
  liElement.dataset.id = entry.id;
  liElement.style.marginLeft = `${fs.getDepth(entries, entry) * 10}px`;
  liElement.draggable = true;

  iconElement.className = 'favorite-icon';
  iconElement.textContent = '⭐';

  nameElement.className = 'favorite-name';
  nameElement.textContent = entry.name;

  // 목록 클릭 시 해당 URL로 이동
  liElement.addEventListener('click', () => {
    if (!entry.metadata || !entry.metadata.url) {
      throw new Error(`비정상적인 즐겨찾기 항목: ${entry.name}. URL이 없습니다.`);
    }
    window.location.href = entry.metadata.url;
  });

  // 아이콘 클릭 시 즐겨찾기 삭제
  iconElement.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!confirm(`정말로 "${entry.name}" 즐겨찾기를 삭제하시겠습니까?`)) return;

    favorite.getAll().then(favorites => {
      const updatedFavorites = favorites.filter(fav => fav.id !== entry.id);
      return favorite.saveAll(updatedFavorites);
    }).then(() => {
      alert(`"${entry.name}" 즐겨찾기가 삭제되었습니다.`);
    }).catch(err => {
      console.error('즐겨찾기 삭제 중 오류 발생:', err);
      alert('즐겨찾기 삭제 중 오류가 발생했습니다.');
    });
  });

  // 이름 더블클릭 시 이름 변경
  addRenameEvent(nameElement, entry);

  liElement.appendChild(iconElement);
  liElement.appendChild(nameElement);
  return liElement;
}

function addDragAndDropEvent(
  liElement: HTMLLIElement,
  entries: FileSystemEntry[],
  entry: FileSystemEntry
): void {
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  liElement.addEventListener('dragstart', (e) => {
    e.dataTransfer?.setData('text/plain', entry.id);
    liElement.classList.add('dragging');
  });

  liElement.addEventListener('dragend', () => {
    liElement.classList.remove('dragging');
  });

  liElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    liElement.classList.add('drag-over');

    if (entry.type === 'folder') {
      // 1초 이상 오버 시 폴더 아이콘 클릭 시 하위 항목 표시
      // (liElement.querySelector('.folder-icon') as HTMLSpanElement)
      const iconElement = liElement.querySelector('.folder-icon') as HTMLSpanElement;
      if (iconElement.classList.contains('expanded')) {
        return;
      }

      if (delayTimer) {
        clearTimeout(delayTimer);
      }

      delayTimer = setTimeout(() => {
        iconElement.click();
        delayTimer = null;
      }, 1000);
    }
  });

  liElement.addEventListener('dragleave', () => {
    liElement.classList.remove('drag-over');

    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
  });

  liElement.addEventListener('drop', (e) => {
    e.preventDefault();
    liElement.classList.remove('drag-over');

    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }

    const draggedId = e.dataTransfer?.getData('text/plain');
    if (!draggedId) return;

    const draggedEntry = entries.find(entry => entry.id === draggedId);
    if (!draggedEntry) return;

    // 드래그 앤 드롭 로직 처리
    // 예: draggedEntry를 현재 entry의 하위로 이동
  });
}

function exceptionCheck(name: string): boolean {
  return exceptions.some(exception => name.includes(exception));
}