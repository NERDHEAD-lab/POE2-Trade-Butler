import "../styles/sidebar.css";

const POE2_SIDEBAR_ID = "poe2-sidebar";
const POE2_CONTENT_WRAPPER_ID = "poe2-content-wrapper";

const sidebarHtml = `
<div id="sidebar-header">
  <h2>Trade Butler</h2>
  <button id="clear-history">Clear History</button>
</div>

<div id="sidebar-menu">
  <button class="menu-tab active" data-tab="history">History</button>
  <button class="menu-tab" data-tab="favorites">Favorites</button>
</div>

<div id="sidebar-content">
  <div id="history" class="tab-content active">
    <h3>
      <span>Search History</span>
      <label class="switch">
        <input type="checkbox" id="history-switch" checked />
        <span class="slider"></span>
      </label>
    </h3>

    <ul id="history-list"></ul>
  </div>
  <div id="favorites" class="tab-content">
    <h3>
      <span>Favorites</span>
      <button id="add-favorite">Add Current page</button>
    </h3>
    <ul id="favorites-list"></ul>
  </div>
</div>

<button id="poe2-sidebar-toggle-button">⮜</button>
`;

export function renderSidebar(container: HTMLElement): void {
  if (document.getElementById(POE2_SIDEBAR_ID)) return;

  // 기존 콘텐츠를 감싸는 wrapper 생성
  const wrapper = document.createElement("div");
  wrapper.id = POE2_CONTENT_WRAPPER_ID;
  while (container.firstChild) wrapper.appendChild(container.firstChild);
  container.appendChild(wrapper);

  // 사이드바 생성
  const sidebar = document.createElement("div");
  sidebar.id = POE2_SIDEBAR_ID;
  sidebar.innerHTML = sidebarHtml;
  container.appendChild(sidebar);

  const toggleButton = sidebar.querySelector<HTMLButtonElement>(`#poe2-sidebar-toggle-button`);
  let isOpen = true;

  toggleButton?.addEventListener("click", () => {
    isOpen = !isOpen;
    sidebar.classList.toggle("collapsed", !isOpen);
    wrapper.classList.toggle("collapsed", !isOpen);
    toggleButton.textContent = isOpen ? "⮜" : "⮞";
  });
}