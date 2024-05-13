import {Controller} from "@hotwired/stimulus"
import handleError from "./error_handler_controller";
import {emitCustomEvent} from "../eventsEmitter";

const NOTIFICATION_OPTIONS_ID = {
    EMAIL_NOTIFICATIONS_ENABLED: 'email_notifications_enabled',
}


export default class extends Controller {
    static targets = ["manageNotificationsOptions"];

    connect() {
        this.token = document.getElementsByName("csrf-token")[0].content;
        const emailNotifications = document.getElementById(NOTIFICATION_OPTIONS_ID.EMAIL_NOTIFICATIONS_ENABLED);
        if (emailNotifications) {
            this.notificationsEnabled = emailNotifications.getAttribute("checked") === "true";
            console.log(this.notificationsEnabled);
            this.updateNotificationsPreferences(this.notificationsEnabled);
        }
    }

    toggleNotificationOption(e) {
        const optionId = e.target.id;
        const isEnabled = !(e.target.getAttribute("checked") === "true");
        const formData = new FormData();
        formData.append("option_id", optionId.toString());
        formData.append("is_enabled", isEnabled.toString());
        fetch('/notification_settings/toggle_notification_option', {
            method: "PUT",
            headers: {"X-CSRF-Token": this.token},
            body: formData,
        })
            .then(response => response.text())
            .then(html => {
                Turbo.renderStreamMessage(html);
                if (optionId === NOTIFICATION_OPTIONS_ID.EMAIL_NOTIFICATIONS_ENABLED) {
                    this.updateNotificationsPreferences(isEnabled);
                }
                this.updateToggleState(e.target, isEnabled);
            })
            .catch((err) => {
                this.updateToggleState(e.target, !isEnabled);
                handleError(err, this.identifier);
            });
    }

    updateNotificationsPreferences(isEnabled) {
        this.notificationsEnabled = isEnabled;
        if (this.notificationsEnabled) {
            // Enable the manage notifications table
            this.manageNotificationsOptionsTarget.style.pointerEvents = "auto";
            this.manageNotificationsOptionsTarget.style.opacity = "1";
        } else {
            this.manageNotificationsOptionsTarget.style.pointerEvents = "none";
            this.manageNotificationsOptionsTarget.style.opacity = "0.5";
        }
    }

    updateToggleState(target, isEnabled) {
        if (isEnabled) {
            target.setAttribute("checked", "true");
        } else {
            target.removeAttribute("checked");
        }
    }
}