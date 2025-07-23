import '../styles/settings.scss';

import { getMessage } from '../utils/_locale';
import { ModalOptions, showModal } from '../utils/api';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';
import { SelectOption, SettingManager, Settings } from '../utils/settingManager';

const settings: Settings = {
  tabs: [
    {
      name: getMessage('settings_tab_general'),
      iconUrl: chrome.runtime.getURL('assets/settings_24dp_E9E5DE.svg'),
      options: [
        {
          name: getMessage('settings_option_select_language'),
          option: {
            id: 'select-language',
            iconUrl: chrome.runtime.getURL('assets/translate_24dp_E9E5DE.svg'),
            type: 'select',
            options: [
              chrome.i18n.getMessage('settings_option_select_language_default', defaultLanguage()),
                ...Object.values(LANGUAGE_NATIVE_NAMES)
            ],
            selectedIndex: 0,
            onChangeListener: (option) => {
              // TODO
              console.log('Language changed to:', option.options[option.selectedIndex]);
            }
          } as SelectOption
        }
      ]
    },
    {
      name: "테스트",
      iconUrl: chrome.runtime.getURL('assets/settings_24dp_E9E5DE.svg'),
      options: []
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

  const settingManager = new SettingManager(settings);

  const modalOptions: ModalOptions = {
    title: getMessage('settings'),
    div: settingManager.generateSettingsDiv(),
    confirm: getMessage('button_save'),
    cancel: getMessage('button_cancel'),
    onConfirmListener: async (): Promise<boolean> => {
      settingManager.applyChanges();
      return true;
    },
    onCancelListener: async (): Promise<boolean> => {
      settingManager.clearApplyQueue();
      return true;
    },
    etcButtons: [
      {
        name: getMessage('button_apply'),
        listener: async (): Promise<boolean> => {
          settingManager.applyChanges();
          return false;
        }
      }
    ]
  };

  parent.addEventListener('click', () => {
    showModal(modalOptions);
  });
}

function defaultLanguage(): string {
  const language = navigator?.language.replace('-', '_');

  return LANGUAGE_NATIVE_NAMES[language as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES[language?.split('_')[0] as keyof typeof LANGUAGE_NATIVE_NAMES] ||
    LANGUAGE_NATIVE_NAMES.en;
}


