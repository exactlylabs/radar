import consumer from "./consumer";

window.addEventListener('currentUserEmail', (e) => {
  const userEmail = e.detail.userEmail;
  if(!userEmail) return;
  consumer.subscriptions.create({
    channel: "NotificationsChannel",
    user_email: userEmail
  }, {
    received(data) {
      if('type' in data) {
        const notificationType = data['type'];
        switch (notificationType) {
          case 'new_invite':
            const newInviteEvent = new CustomEvent('newNotification', { detail: data });
            window.dispatchEvent(newInviteEvent);
            break;
          default:
            break;
        }
      }
    }
  });
})
