import { showModal, showToast } from '../utils/api';
import * as storage from '../utils/storage';
import * as folderUI from './favoriteFolderUI';
import { SearchHistoryEntity } from '../utils/storage';

const ON_OPEN_FAVORITE_MODAL = 'openCreateFavoriteFolderModal';

export async function openFavoriteFolderModal(
  type: 'create' | 'edit' = 'create',
  entry?: {
    id: string;
    url: string;
    etc?: SearchHistoryEntity['etc'];
  },
): Promise<void> {
  const wrapper = document.createElement('div');
  const title = (() => {
    switch (type) {
      case 'create': return '즐겨찾기 폴더에 추가';
      case 'edit': return '즐겨찾기 폴더 편집';
      default: throw new Error(`Unknown type: ${type}`);
    }
  })();
  let onConfirmListener = async () => true;

  if (type === 'create') {
    if (!entry) {
      console.error('즐겨찾기 추가를 위한 항목이 제공되지 않았습니다.');
      showToast('즐겨찾기 추가를 위한 항목이 제공되지 않았습니다.', '#f66');
      return;
    }
    const nameInput = document.createElement('input');
    nameInput.className = 'favorite-name';
    nameInput.type = 'text';
    nameInput.placeholder = `항목 이름 (기본값: ${entry.id})`;
    wrapper.appendChild(nameInput);

    onConfirmListener = async (): Promise<boolean> => {
      const name = nameInput.value.trim();
      const path = folderUI.getSelectedFolderPath(folderElement);

      if (await storage.isFavoriteExists(path, entry.id)) {
        showToast('이미 즐겨찾기에 추가된 항목입니다.', '#f66');
        return false;
      }

      await storage.addFavoriteItem(path, {
        id: entry.id,
        name: name || entry.id,
        url: entry.url,
        etc: entry.etc
      });

      showToast(`즐겨찾기에 추가되었습니다.`);
      storage.removeFavoriteFolderChangedListener(ON_OPEN_FAVORITE_MODAL);
      return true;
    };
  }

  const folderElement = folderUI.generate(storage.getFavoriteFolderRoot(), false);
  wrapper.appendChild(folderElement);

  storage.addFavoriteFolderChangedListener(ON_OPEN_FAVORITE_MODAL, (root) => {
    // 폴더 UI 업데이트
    const ul = folderUI.generate(Promise.resolve(root), false);
    folderElement.innerHTML = ''; // 기존 내용 제거
    folderElement.appendChild(ul);
  });

  // 2. 모달 실행
  showModal({
    title: title,
    div: wrapper,
    confirm: '저장',
    cancel: '취소',

    onConfirmListener: onConfirmListener,

    onCancelListener: async (): Promise<boolean> => {
      storage.removeFavoriteFolderChangedListener(ON_OPEN_FAVORITE_MODAL);
      return true;
    },

    onOverlayClickListener: async (overlay): Promise<boolean> => {
      storage.removeFavoriteFolderChangedListener(ON_OPEN_FAVORITE_MODAL);
      return true;
    },

    etcButtons: [
      {
        name: '📁 새 폴더',
        listener: async (modal): Promise<boolean> => {
          const path = folderUI.getSelectedFolderPath(folderElement);
          const name = prompt('새 폴더 이름을 입력하세요:')?.trim();
          const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

          if (!name) {
            showToast('폴더 이름을 입력하지 않았습니다.', '#f66');
            return false; // 모달을 닫지 않음
          } else if (name.length > 20) {
            showToast('폴더 이름은 20자 이하여야 합니다.', '#f66');
            return false; // 모달을 닫지 않음
          } else if (exceptions.some(exception => name.includes(exception))) {
            showToast(`폴더 이름에 ${exceptions.join(', ')} 문자를 포함할 수 없습니다.`, '#f66');
            return false; // 모달을 닫지 않음
          }

          if (await storage.createFavoriteFolder(path, name)) {
            showToast(`폴더 "${name}"이 생성되었습니다.`);
            folderUI.selectFolderByPath(folderElement, path ? `${path}/${name}` : name);
          } else {
            showToast(`폴더 "${name}" 생성 실패. 중복된 이름일 수 있습니다.`, '#f66');
          }

          return false;
        }
      },
      {
        name: '❌ 폴더 삭제',
        listener: async (modal): Promise<boolean> => {
          const path = folderUI.getSelectedFolderPath(folderElement);
          if (!path || path === '/') {
            showToast('루트 폴더는 삭제할 수 없습니다.', '#f66');
            return false;
          }

          if (await storage.hasAnyItemInPath(path)) {
            if (!confirm(`폴더 "${path}" 하위 경로에 항목이 있습니다. 정말로 삭제하시겠습니까? 이 폴더 내의 모든 항목이 삭제됩니다.`)) {
              return false;
            }
          }

          const success = await storage.deleteFavoriteFolder(path);
          if (success) {
            showToast(`폴더 "${path}"이(가) 삭제되었습니다.`);
          } else {
            showToast(`폴더 "${path}" 삭제 실패.`, '#f66');
          }

          return false;
        }
      },
      {
        name: '📝 폴더 이름 변경',
        listener: async (modal): Promise<boolean> => {
          const path = folderUI.getSelectedFolderPath(folderElement);
          if (!path || path === '/') {
            showToast('루트 폴더는 이름을 변경할 수 없습니다.', '#f66');
            return false;
          }

          const newName = prompt('새 폴더 이름을 입력하세요:')?.trim();
          const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

          if (!newName) {
            showToast('폴더 이름을 입력하지 않았습니다.', '#f66');
            return false; // 모달을 닫지 않음
          } else if (newName.length > 20) {
            showToast('폴더 이름은 20자 이하여야 합니다.', '#f66');
            return false; // 모달을 닫지 않음
          } else if (exceptions.some(exception => newName.includes(exception))) {
            showToast(`폴더 이름에 ${exceptions.join(', ')} 문자를 포함할 수 없습니다.`, '#f66');
            return false; // 모달을 닫지 않음
          }

          if (await storage.renameFavoriteElement('folder', path, newName)) {
            showToast(`폴더 이름이 "${newName}"(으)로 변경되었습니다.`);
            folderUI.selectFolderByPath(folderElement, path ? `${path}/${newName}` : newName);
          } else {
            showToast(`폴더 이름 "${newName}" 변경 실패. 중복된 이름일 수 있습니다.`, '#f66');
          }

          return false;
        }
      }
    ]
  });
}
