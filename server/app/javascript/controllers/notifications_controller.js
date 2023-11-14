import { Controller } from "@hotwired/stimulus"

const NOTIFICATION_TYPES = {
  NEW_INVITE: 'new_invite'
}

export default class extends Controller {
  
  static targets = [
    "placeholderNotification",
    "modalPlaceholderNotification"
  ]
  
  connect() {
    this.isModal = this.element.dataset.isModal === 'true';
  }
  
  addNewNotification(e) {
    const { type } = e.detail;
    switch (type) {
      case NOTIFICATION_TYPES.NEW_INVITE:
        this.addNewInviteNotification(e.detail);
        break;
    }
  }
  
  addNewInviteNotification(inviteData) {
    this.addModalInviteNotification(inviteData);
    this.addNormalInviteNotification(inviteData);
    this.updateNotificationsIcon();
  }
  
  updateNotificationsIcon() {
    const narrowSidebarNotificationsIcon = document.getElementById('narrow-sidebar-notifications-icon');
    const narrowSidebarNotificationsAlertIcon = document.getElementById('narrow-sidebar-notifications-alert-icon');
    const headerSidebarNotificationsIcon = document.getElementById('header-sidebar-notifications-icon');
    const headerSidebarNotificationsAlertIcon = document.getElementById('header-sidebar-notifications-alert-icon');
    const sidebarNotificationsIcon = document.getElementById('sidebar-notifications-icon');
    const sidebarNotificationsAlertIcon = document.getElementById('sidebar-notifications-alert-icon');
    
    narrowSidebarNotificationsIcon.setAttribute('hidden', 'hidden');
    headerSidebarNotificationsIcon.setAttribute('hidden', 'hidden');
    sidebarNotificationsIcon.setAttribute('hidden', 'hidden');
    
    narrowSidebarNotificationsAlertIcon.removeAttribute('hidden');
    headerSidebarNotificationsAlertIcon.removeAttribute('hidden');
    sidebarNotificationsAlertIcon.removeAttribute('hidden');
  }
  
  addModalInviteNotification(inviteData) {
    if(!this.isModal) return;
    
    const notificationClone = this.modalPlaceholderNotificationTarget.cloneNode(true);
    this.populateNotificationClone(notificationClone, inviteData);
    const notificationsWrapper = this.element.querySelector('#modal-notifications-content');
    this.addNotificationToWrapper(notificationClone, notificationsWrapper);
  }
  
  addNormalInviteNotification(inviteData) {
    if(this.isModal) return;
    
    const notificationClone = this.placeholderNotificationTarget.cloneNode(true);
    this.populateNotificationClone(notificationClone, inviteData);
    const notificationsWrapper = this.element.querySelector('#notifications-content');
    this.addNotificationToWrapper(notificationClone, notificationsWrapper);
  }
  
  populateNotificationClone(notificationClone, inviteData) {
    notificationClone.id = `modal_notification_${inviteData.invite_id}`;
    notificationClone.removeAttribute('hidden');
    const inviteText = notificationClone.querySelector('.sidebar--notification-content-wrapper > .sidebar--notification-title-wrapper > p');
    inviteText.innerText = `You've been invited to join ${inviteData.account_name}.`;
    const timeAgoText = notificationClone.querySelector('.sidebar--notification-content-wrapper > .sidebar--notification-title-wrapper > span');
    timeAgoText.innerText = 'Just now';
    const baseUrl = new URL(window.location.href);
    baseUrl.pathname = `/invites/${inviteData.invite_id}`;
    const acceptButton = notificationClone.querySelector('.sidebar--notification-content-wrapper > .sidebar--notification-buttons-container > a[data-method="post"]');
    const acceptUrl = new URL(baseUrl);
    acceptUrl.pathname += '/accept';
    acceptButton.setAttribute('href', acceptUrl.href);
    const rejectButton = notificationClone.querySelector('.sidebar--notification-content-wrapper > .sidebar--notification-buttons-container > a[data-method="delete"]');
    const rejectUrl = new URL(baseUrl);
    rejectUrl.pathname += '/decline';
    rejectButton.setAttribute('href', rejectUrl.href);
  }
  
  addNotificationToWrapper(notificationClone, notificationsWrapper) {
    if(notificationsWrapper.dataset.hasNotifications === 'false') {
      notificationsWrapper.dataset.hasNotifications = 'true';
      notificationsWrapper.innerHTML = null;
      notificationsWrapper.appendChild(notificationClone);
    } else {
      notificationsWrapper.prepend(notificationClone);
    }
  }
}