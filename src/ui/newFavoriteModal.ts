import { ButtonListener, showModal, showToast } from '../utils/api';
import * as favoriteStorage from '../storage/favoriteStorage';
import * as folderUI from './favoriteFileSystemUI';
import * as fs from './fileSystemEntry';
import { FileEntry } from './fileSystemEntry';

export async function openFavoriteFolderModal(
  id: string,
  url: string
): Promise<void> {
  return Promise.resolve(document.createElement('div'))
    .then(async wrapper => {
      const nameInput = document.createElement('input');
      nameInput.className = 'favorite-name';
      nameInput.type = 'text';
      nameInput.placeholder = `항목 이름 (기본값: ${id})`;
      nameInput.dataset.id = id;
      nameInput.dataset.url = url;

      wrapper.appendChild(nameInput);
      const favoriteUI = await folderUI
        .loadFavoriteFileSystemUI(wrapper)
        .then(folderUI => {
          folderUI.addOnLiElementAdded((li, entry) => {
            if (entry.type === 'file') li.style.display = 'none';
          });

          return folderUI;
        });

      return { favoriteUI, wrapper };
    })
    .then(({ favoriteUI, wrapper }) => {
      showModal({
        title: '즐겨찾기 폴더에 추가',
        div: wrapper,
        confirm: '저장',
        cancel: '취소',
        onConfirmListener: onConfirmCreateFavoriteModal(wrapper),
        onCancelListener: async (): Promise<boolean> => {
          favoriteUI.destroy();
          return true;
        },
        onOverlayClickListener: async (): Promise<boolean> => {
          favoriteUI.destroy();
          return true;
        },
        etcButtons: [
          {
            name: '📁 새 폴더',
            listener: async (): Promise<boolean> => {
              const selectedFolder = await folderUI.getSelectedFolder(wrapper);
              const parentId = selectedFolder?.id || null;
              const name = prompt('새 폴더 이름을 입력하세요:')?.trim();
              const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

              if (!name) {
                showToast('폴더 이름을 입력하지 않았습니다.', '#f66');
                return false;
              } else if (name.length > 20) {
                showToast('폴더 이름은 20자 이하여야 합니다.', '#f66');
                return false;
              } else if (exceptions.some(exception => name.includes(exception))) {
                showToast(`폴더 이름에 ${exceptions.join(', ')} 문자를 포함할 수 없습니다.`, '#f66');
                return false;
              }

              return favoriteStorage.getAll()
                .then(async favorites => fs.addEntry(favorites, { name: name, type: 'folder' }, parentId))
                .then(newEntry => favoriteStorage.saveAll(newEntry))
                .then(() => {
                  showToast(`"${name}" 폴더가 생성되었습니다.`);
                  return false;
                })
                .catch(error => {
                  console.error(error.message);
                  return false;
                });
            }
          },
          {
            name: '❌ 폴더 삭제',
            listener: async (): Promise<boolean> => {
              const favoriteEntries = await favoriteStorage.getAll();
              const selectedFolder = await folderUI.getSelectedFolder(wrapper);
              if (!selectedFolder) {
                showToast('삭제할 폴더를 선택해주세요.', '#f66');
                return false;
              } else if (selectedFolder.id === 'root') {
                showToast('루트 폴더는 삭제할 수 없습니다.', '#f66');
                return false;
              } else if (favoriteEntries.some(entry => entry.parentId === selectedFolder.id)) {
                if (!confirm('이 폴더에 포함된 항목이 있습니다. 정말로 삭제하시겠습니까?')) {
                  return false;
                }
              }

              return favoriteStorage.saveAll(
                favoriteEntries.filter(entry => entry.id !== selectedFolder.id)
              )
                .then(() => {
                  showToast(`"${selectedFolder.name}" 폴더가 삭제되었습니다.`);
                  return false;
                })
                .catch(error => {
                  console.error(error.message);
                  showToast(`폴더 삭제에 실패했습니다: ${error.message}`, '#f66');
                  return false;
                });
            }
          }
        ]
      });
    });
}

/*
 * 즐겨찾기 폴더 생성 모달의 확인 버튼 클릭 시 호출되는 함수
 * - 확인이 눌러지면 이름을 가져온다.
 */
export function onConfirmCreateFavoriteModal(wrapper: HTMLDivElement): ButtonListener {
  return async (modal): Promise<boolean> => {
    const nameInput = modal.querySelector('input.favorite-name') as HTMLInputElement;

    if (!nameInput || !nameInput.dataset.id) {
      // throw new Error('즐겨찾기 이름 입력란이 없거나 잘못된 형식입니다.');
      alert('즐겨찾기 이름 입력란이 없거나 잘못된 형식입니다.');
      return false;
    }

    const name = nameInput.value.trim() || nameInput.dataset.id;
    const id = nameInput.dataset.id;
    const url = nameInput.dataset.url;

    if (url) {
      // throw new Error('즐겨찾기 URL이 정의되지 않았습니다.');
      alert('즐겨찾기 URL이 정의되지 않았습니다.');
      return false;
    }

    // 폴더 선택 여부 확인 필요
    return favoriteStorage.getAll()
      .then(async favorites => {
        const selectedFolder = await folderUI.getSelectedFolder(wrapper);
        const newEntry: Omit<FileEntry, 'id' | 'createdAt' | 'modifiedAt' | 'parentId'> = {
          name: name,
          type: 'file',
          metadata: { id: id, url: url }
        };

        return fs.addEntry(
          favorites, newEntry, selectedFolder.parentId);
      })
      .then(newEntry => favoriteStorage.saveAll(newEntry))
      .then(() => {
        showToast(`"${name}"이(가) 즐겨찾기에 추가되었습니다.`);
        return true;
      })
      .catch(error => {
        console.error(error.message);
        return false;
      });
  };
}