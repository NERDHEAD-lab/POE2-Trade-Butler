import * as settingStorage from '../storage/settingStorage';
import { POE2_CONTENT_WRAPPER_ID, POE2_SIDEBAR_ID } from '../components/sidebar';
import { getMessage } from '../utils/_locale';

const SIDEBAR_TOOL_CLASS = 'poe2-sidebar-tool-button';
const SIDEBAR_TOOL_ICON_CLASS = 'poe2-sidebar-tool-icon';


const icon_toggle_left = chrome.runtime.getURL('assets/expand_circle_left_24dp_E9E5DE.svg');
const icon_toggle_right = chrome.runtime.getURL('assets/expand_circle_right_24dp_E9E5DE.svg');

let isCollapsed = false;

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

    const icon = document.createElement('img');
    icon.className = SIDEBAR_TOOL_ICON_CLASS;
    icon.src = sidebarTool.iconUrl;
    icon.alt = sidebarTool.description;
    icon.title = sidebarTool.description;

    button.appendChild(icon);
    button.onclick = () => sidebarTool.onClick({ button, icon, sidebar, wrapper });

    sidebar.appendChild(button)
    topPosition += spacing;

    await sidebarTool.onRender({ button, icon, sidebar, wrapper });
  }
}