import { ButtonListener, showModal, showToast } from '../utils/api';
import * as favoriteStorage from '../storage/favoriteStorage';
import * as folderUI from './favoriteFileSystemUI';
import * as fs from './fileSystemEntry';
import { FileEntry } from './fileSystemEntry';
import { getMessage } from '../utils/_locale';

export async function openFavoriteFolderModal(
  id: string,
  url: string
): Promise<void> {
  return Promise.resolve(document.createElement('div'))
    .then(async wrapper => {
      const nameInput = document.createElement('input');
      nameInput.className = 'favorite-name';
      nameInput.type = 'text';
      nameInput.placeholder = getMessage('placeholder_item_name', id);
      nameInput.dataset.id = id;
      nameInput.dataset.url = url;

      wrapper.appendChild(nameInput);
      const favoriteUI = await folderUI.loadFavoriteFileSystemUI(wrapper, false)
      return { favoriteUI, wrapper };
    })
    .then(({ favoriteUI, wrapper }) => {
      showModal({
        title: getMessage('modal_add_to_favorite_folder'),
        div: wrapper,
        confirm: getMessage('button_save'),
        cancel: getMessage('button_cancel'),
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
            name: getMessage('button_new_folder'),
            listener: async (): Promise<boolean> => {
              const selectedFolder = await folderUI.getSelectedFolder(wrapper);
              const parentId = selectedFolder?.id || null;
              const name = prompt(getMessage('prompt_enter_folder_name'))?.trim();
              const exceptions = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

              if (!name) {
                showToast(getMessage('toast_folder_name_empty'), '#f66');
                return false;
              } else if (name.length > 20) {
                showToast(getMessage('toast_folder_name_too_long'), '#f66');
                return false;
              } else if (exceptions.some(exception => name.includes(exception))) {
                showToast(getMessage('toast_folder_name_invalid_chars', exceptions.join(', ')), '#f66');
                return false;
              }

              return favoriteStorage.getAll()
                .then(async favorites => fs.addEntry(favorites, { name: name, type: 'folder' }, parentId))
                .then(newEntry => favoriteStorage.saveAll(newEntry))
                .then(() => {
                  showToast(getMessage('toast_folder_created'), name);
                  return false;
                })
                .catch(error => {
                  console.error(getMessage('error_create_folder', error.message));
                  return false;
                });
            }
          },
          {
            name: getMessage('button_delete_folder'),
            listener: async (): Promise<boolean> => {
              const favoriteEntries = await favoriteStorage.getAll();
              const selectedFolder = await folderUI.getSelectedFolder(wrapper);
              if (!selectedFolder) {
                showToast(getMessage('toast_no_folder_selected'), '#f66');
                return false;
              } else if (selectedFolder.id === 'root') {
                showToast(getMessage('toast_cannot_delete_root'), '#f66');
                return false;
              } else if (favoriteEntries.some(entry => entry.parentId === selectedFolder.id)) {
                if (!confirm(getMessage('confirm_delete_folder_with_items'))) {
                  return false;
                }
              }

              return favoriteStorage.saveAll(
                favoriteEntries.filter(entry => entry.id !== selectedFolder.id)
              )
                .then(() => {
                  showToast(getMessage('toast_folder_deleted', selectedFolder.name));
                  return false;
                })
                .catch(error => {
                  console.error(getMessage('error_delete_folder', error.message));
                  showToast(getMessage('toast_folder_delete_failed', error.message), '#f66');
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
      alert(getMessage('alert_favorite_name_invalid'));
      return false;
    }

    const name = nameInput.value.trim() || nameInput.dataset.id;
    const id = nameInput.dataset.id;
    const url = nameInput.dataset.url;

    if (!url) {
      // throw new Error('즐겨찾기 URL이 정의되지 않았습니다.');
      alert(getMessage('alert_favorite_url_undefined'));
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
          favorites, newEntry, selectedFolder.id);
      })
      .then(newEntry => favoriteStorage.saveAll(newEntry))
      .then(() => {
        showToast(getMessage('toast_favorite_added', name));
        return true;
      })
      .catch(error => {
        console.error(getMessage('error_add_favorite', error.message));
        return false;
      });
  };
}
