import { renderSidebar } from "./components/sidebar";
import "./styles/sidebar.css";
import { getMessage } from "./utils/_locale";


const content = document.querySelector('.content')as HTMLElement;
if (!content) {
  console.error(getMessage('error_content_element_not_found'));
}

renderSidebar(content);
