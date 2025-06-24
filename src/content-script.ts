import { renderSidebar } from "./components/sidebar";
import "./styles/sidebar.css";


const content = document.querySelector('.content')as HTMLElement;
if (!content) {
  console.error('Could not find .content element');
}

renderSidebar(content);