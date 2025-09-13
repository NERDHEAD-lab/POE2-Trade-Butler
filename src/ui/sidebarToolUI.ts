import * as settingStorage from '../storage/settingStorage';
import { POE2_CONTENT_WRAPPER_ID, POE2_SIDEBAR_ID } from '../components/sidebar';
import { getMessage } from '../utils/_locale';
import { showModal } from '../utils/api';

import '../styles/sidebarTools.scss';
import 'github-markdown-css/github-markdown-dark.css';
import '../styles/customMarkdown.scss';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';

const SIDEBAR_TOOL_CLASS = 'poe2-sidebar-tool-button';
const SIDEBAR_TOOL_ICON_CLASS = 'poe2-sidebar-tool-icon';



const icon_toggle_left = chrome.runtime.getURL('assets/expand_circle_left_24dp_E9E5DE.svg');
const icon_toggle_right = chrome.runtime.getURL('assets/expand_circle_right_24dp_E9E5DE.svg');
const icon_notice = chrome.runtime.getURL('assets/mail_24dp_E9E5DE.svg');
const icon_notice_unread = chrome.runtime.getURL('assets/mail_asterisk_24dp_E9E5DE.svg');

let isCollapsed = false;
let isNoticeUnread = await settingStorage.isNoticeUnread();

const sidebarTools: SidebarTool[] = [
  {
    id: 'poe2-tool-sidebar-toggle-button',
    iconUrl: icon_toggle_left,
    description: getMessage('sidebar_tool_sidebar_toggle_button_description'),
    onClick: async (buttonContext) => {
      const sidebar = buttonContext.sidebar;
      const wrapper = buttonContext.wrapper;
      const icon = buttonContext.icon;

      isCollapsed = !isCollapsed;
      void settingStorage.setSidebarCollapsed(isCollapsed);

      sidebar.classList.toggle('collapsed', isCollapsed);
      wrapper.classList.toggle('collapsed', isCollapsed);
      icon.src = isCollapsed ? icon_toggle_right : icon_toggle_left;

      if (isCollapsed) {
        wrapper.style.paddingRight = '0';
      } else {
        wrapper.style.paddingRight = sidebar.offsetWidth + 'px';
      }
    },
    onRender: async (buttonContext) => {
      if (await settingStorage.isSidebarCollapsed()) {
        buttonContext.button.click();
      }
    }
  },
  {
    id: 'poe2-tool-notice-button',
    iconUrl: icon_notice,
    description: getMessage('sidebar_tool_notice_button_description'),
    onClick: async (buttonContext) => {
      const icon = buttonContext.icon;

      if (isNoticeUnread) {
        isNoticeUnread = false;
        icon.src = icon_notice;

        icon.classList.remove('start-flash-and-hold');
        await settingStorage.setNoticeUnread(false);
      }

      showModal({
        title: getMessage('sidebar_tool_notice_button_modal_title'),
        div: await noticeDiv(),
        confirm: getMessage('sidebar_tool_notice_button_modal_close'),
        hideCancel: true
      });
    },
    onRender: async (buttonContext) => {
      buttonContext.icon.style.height = '80%';
      buttonContext.icon.style.width = '80%';

      const lang = await settingStorage.getLanguage();
      const url = await noticeUrl(lang);
      const noticeContext = await settingStorage.getNoticeContext(url);

      await chrome.runtime.sendMessage({ type: 'FETCH_MARKDOWN', url: await noticeUrl() });
      const updatedNoticeContext = await settingStorage.getNoticeContext(url);

      const isModified = noticeContext.lastModified !== updatedNoticeContext.lastModified && updatedNoticeContext.lastModified !== '';
      if (isModified) {
        console.info(`Notice context updated. Current Last-Modified: ${noticeContext.lastModified}, Updated Last-Modified: ${updatedNoticeContext.lastModified}`);
        await settingStorage.setNoticeUnread(true);
        isNoticeUnread = true;
      }

      buttonContext.icon.src = isNoticeUnread ? icon_notice_unread : icon_notice;

      if (isNoticeUnread) {
        buttonContext.icon.classList.add('start-flash-and-hold');
      }
    }
  }
];


interface SidebarTool {
  id: string;
  iconUrl: string;
  description: string;
  onClick: (buttonContext: ButtonContext) => void | Promise<void>;
  onRender?: (buttonContext: ButtonContext) => void | Promise<void>;
}

interface ButtonContext {
  button: HTMLButtonElement;
  icon: HTMLImageElement;
  sidebar: HTMLDivElement;
  wrapper: HTMLDivElement;
}

export async function renderSidebarTools(): Promise<void> {
  const sidebar = document.getElementById(POE2_SIDEBAR_ID) as HTMLDivElement;
  const wrapper = document.getElementById(POE2_CONTENT_WRAPPER_ID) as HTMLDivElement;

  if (!sidebar) {
    return;
  }

  let topPosition = 10;
  const spacing = 50;

  for (const sidebarTool of sidebarTools) {
    if (document.getElementById(sidebarTool.id)) {
      console.warn(`Sidebar tool with id ${sidebarTool.id} already exists. Skipping.`);
      continue;
    }

    const button = document.createElement('button');
    button.id = sidebarTool.id;
    button.className = SIDEBAR_TOOL_CLASS;
    button.style.top = `${topPosition}px`;

    settingStorage.getSidebarOpacity().then(opacity => {
      button.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    });

    const icon = document.createElement('img');
    icon.className = SIDEBAR_TOOL_ICON_CLASS;
    icon.src = sidebarTool.iconUrl;
    icon.alt = sidebarTool.description;
    icon.title = sidebarTool.description;

    icon.style.height = '100%';
    icon.style.width = '100%';

    button.appendChild(icon);
    button.onclick = () => sidebarTool.onClick({ button, icon, sidebar, wrapper });

    sidebar.appendChild(button);
    topPosition += spacing;

    if (sidebarTool.onRender) {
      await sidebarTool.onRender({ button, icon, sidebar, wrapper });
    }
  }
}

async function noticeDiv(): Promise<HTMLDivElement> {
  const div = document.createElement('div');
  div.id = 'markdown-container';
  div.className = 'markdown-body';
  div.style.width = '60vw';
  div.style.height = '80vh';
  div.style.overflow = 'auto';

  async function bindNotice(url: string, forceFetch = false): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'FETCH_MARKDOWN', url, forceFetch });
      if (response.error) {
        throw new Error(response.error);
      }
      const html = response.data as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      if (doc) {
        const links = doc.querySelectorAll('a');
        for (const linksKey in links) {
          if (isNaN(Number(linksKey))) continue;

          const link = links[linksKey];
          if(!link.getAttribute('href')?.startsWith('../')) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            continue;
          }
          const href = await noticeUrl(
            link.getAttribute('href')
              ?.replace('../', '')
              .replace('/notice.md', '')
          );

          link.title = href;
          link.href = link.href.replace(link.href, '');

          console.info(`Binding notice link: ${href}`);
          link.onclick = (e) => {
            e.preventDefault();
            if (href) bindNotice(href, true);
          };
        }

        div.innerHTML = '';

        // console.info('Fetched and parsed notice content:', doc.body.innerHTML);
        const nodes = Array.from(doc.body.childNodes);
        nodes.forEach(node => {
          div.appendChild(node);
        });
      } else {
        console.error('No content found in fetched notice page.', html);
        div.innerText = getMessage('sidebar_tool_notice_button_modal_error_no_content');
      }
    } catch (error) {
      console.error('Error fetching notice content:', error);
      div.innerText = getMessage('sidebar_tool_notice_button_modal_error_fetch_failed');
    }
  }

  const fetchUrl = await noticeUrl();
  void bindNotice(fetchUrl);

  return div;
}

async function noticeUrl(lang?: string): Promise<string> {
  if (!lang) {
    lang = await settingStorage.getLanguage();
  }

  if (lang === 'default') {
    const systemLang = navigator.language.replace('-', '_');

    if (LANGUAGE_NATIVE_NAMES[systemLang as keyof typeof LANGUAGE_NATIVE_NAMES]) {
      lang = systemLang;
    } else if (LANGUAGE_NATIVE_NAMES[systemLang.split('_')[0] as keyof typeof LANGUAGE_NATIVE_NAMES]) {
      lang = systemLang.split('_')[0];
    } else {
      lang = 'en';
    }
  }

  return `https://nerdhead-lab.github.io/POE2-Trade-Butler/notice/${lang}/notice.md`;
}

