import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {}

  getItemElements(itemId) {
    const icon = document.getElementById(`${itemId}-icon`);
    const activeIcon = document.getElementById(`${itemId}-icon-active`);
    const text = document.getElementById(`${itemId}-text`);
    return {icon, activeIcon, text};
  }

  handleItemHover(e) {
    const element = e.target;
    if(element.href === location.href) return;

    element.classList.add('sidebar--item-active');
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    icon.classList.add('invisible');
    activeIcon.classList.remove('invisible');
    text.classList.add('sidebar-item--text-active');
  }

  handleItemHoverOff(e) {
    const element = e.target;
    if (element.href === location.href) return;
    
    element.classList.remove('sidebar--item-active');
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    icon.classList.remove('invisible');
    activeIcon.classList.add('invisible');
    text.classList.remove('sidebar-item--text-active');
    
  }
}