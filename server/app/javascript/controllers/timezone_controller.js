import {Controller} from "@hotwired/stimulus"

export default class extends Controller {
    connect() {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzCookie = document.cookie.split(';').find((item) => item.trim().startsWith('timezone='));
        if (tzCookie) {
            const currentTz = tzCookie.split('=')[1];
            if (currentTz !== tz) {
                document.cookie = `timezone=${tz}; path=/`;
            }
        } else {
            document.cookie = `timezone=${tz}; path=/`;
        }
    }
}
