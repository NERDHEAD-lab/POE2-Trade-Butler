import '../styles/settings.scss';

import { getMessage } from '../utils/_locale';
import { ModalOptions, showModal, showToast } from '../utils/api';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';
import { CheckboxDetailOption, DivTextDetailOption, SelectDetailOption, SettingManager, Settings } from '../utils/settingManager';
import * as settingStorage from '../storage/settingStorage';
import * as information from './information';

const settings: Settings = {
  tabs: [
    {
      name: getMessage('settings_tab_general'),
      iconUrl: chrome.runtime.getURL('assets/settings_24dp_E9E5DE.svg'),
      options: [
        {
          id: 'select-language',
          name: getMessage('settings_option_select_language'),
          iconUrl: chrome.runtime.getURL('assets/translate_24dp_E9E5DE.svg'),
          description: getMessage('settings_option_select_language_description'),
          optionDetail: {
            type: 'select',
            options: [
              chrome.i18n.getMessage('settings_option_select_language_default', defaultLanguage()),
              ...Object.values(LANGUAGE_NATIVE_NAMES)
            ],
            selectedIndex: await i18nIndex(),
            onChangeListener: (option) => {
              console.log('Language changed to:', option.options[option.selectedIndex]);
              if (option.selectedIndex === 0) {
                settingStorage.setLanguage('default').then(() => {
                  showToast(getMessage('settings_option_select_language_default_enabled', defaultLanguage()));
                });
              } else {
                const selectedLanguage = option.options[option.selectedIndex];
                // value -> key
                const languageKey = Object.keys(LANGUAGE_NATIVE_NAMES).find(
                  key => LANGUAGE_NATIVE_NAMES[key as keyof typeof LANGUAGE_NATIVE_NAMES] === selectedLanguage
                );

                if (languageKey) {
                  settingStorage.setLanguage(languageKey).then(() => {
                    showToast(getMessage('settings_option_select_language_enabled', selectedLanguage));
                  });
                } else {
                  showToast(getMessage('settings_option_select_language_invalid', selectedLanguage));
                }
              }
            }
          } as SelectDetailOption
        },
        {
          id: 'show-guide-again',
          name: getMessage('settings_option_show_guide_again'),
          iconUrl: chrome.runtime.getURL('assets/menu_book_24dp_E9E5DE.svg'),
          optionDetail: {
            type: 'checkbox',
            checked: false,
            onChangeListener: (checked: boolean) => {
              if (!checked) {
                return;
              }
              settingStorage.setButlerGuideShown(false).then(() => {
                showToast(getMessage('settings_option_show_guide_again_enabled'));
              });
            }
          } as CheckboxDetailOption
        }
      ]
    },
    {
      name: getMessage('settings_tab_info'),
      iconUrl: chrome.runtime.getURL('assets/info_24dp_E9E5DE.svg'),
      options: [
        {
          id: 'info-text',
          name: '',
          optionDetail: {
            type: 'text',
            value: createInformationDiv(),
          } as DivTextDetailOption
        }
      ]
    }
  ]
};


export async function attachSettingOnClick(parent: HTMLElement): Promise<void> {
  const img = document.createElement('img');
  const settingIconUrl = chrome.runtime.getURL('assets/settings_24dp_1F1F1F.svg');
  parent.appendChild(img);

  img.className = 'poe2-setting-icon';
  img.src = settingIconUrl;
  img.alt = getMessage('settings');
  Object.assign(img.style, {
    padding: '4px',
    width: '36px',
    height: '36px',
    cursor: 'pointer'
  });


  parent.addEventListener('click', () => {
    const settingManager = new SettingManager(settings);

    const modalOptions: ModalOptions = {
      title: getMessage('settings'),
      div: settingManager.generateSettingsDiv(),
      confirm: getMessage('button_save'),
      cancel: getMessage('button_cancel'),
      onConfirmListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          settingManager.applyChanges();
          showToast(getMessage('settings_changes_applied'));

          document.location.reload();
        }
        return true;
      },
      onCancelListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          const result = confirm(getMessage('settings_changes_discard_confirm'));
          if (!result) {
            return false;
          }
        }
        settingManager.clearApplyQueue();
        return true;
      },
      onOverlayClickListener: async (): Promise<boolean> => {
        if (settingManager.hasChanges()) {
          const result = confirm(getMessage('settings_changes_discard_confirm'));
          if (!result) {
            return false;
          }
        }
        settingManager.clearApplyQueue();
        return true;
      },
      etcButtons: [
        {
          name: getMessage('button_apply'),
          listener: async (): Promise<boolean> => {
            if (settingManager.hasChanges()) {
              settingManager.applyChanges();
              showToast(getMessage('settings_changes_applied'));

              document.location.reload();
            } else {
              showToast(getMessage('settings_no_changes'));
            }
            return false;
          }
        }
      ]
    };

    showModal(modalOptions);
  });
}

function defaultLanguage(): string {
  const language = navigator?.language.replace('-', '_');

  return LANGUAGE_NATIVE_NAMES[language as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES[language?.split('_')[0] as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES.en;
}


function createInformationDiv(): HTMLDivElement {
  const infoDiv = document.createElement('div');
  infoDiv.className = 'poe2-settings-option-information';
  information.attachInformationSections(infoDiv);
  return infoDiv;
}

async function i18nIndex(): Promise<number> {
  const language = await settingStorage.getLanguage();
  const index = Object.keys(LANGUAGE_NATIVE_NAMES).indexOf(language);
  return index === -1 ? 0 : index + 1; // +1 because the first option is "default"
}