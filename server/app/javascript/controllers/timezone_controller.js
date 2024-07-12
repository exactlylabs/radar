import {Controller} from "@hotwired/stimulus"

export default class extends Controller {

    /**
     * By using this controller, we can identify user's timezone with more precision than native Rails Time API
     * This is intended to be used specifically in tooltips for all of our tables which include time-related columns.
     */
    connect() {
        /**
         * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions#:~:text=as%20default%20values.-,timeZone,-The%20value%20provided
         * Intl.DateTimeFormat().resolvedOptions().timeZone returns users' browser timezone value.
         * An example of possible output: America/Buenos_Aires
         * An example of possible output: UTC
         */
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // check if the cookie already exists
        const tzCookie = document.cookie.split(';').find((item) => item.trim().startsWith('timezone='));
        if (tzCookie) {
            // if it exists, check if it's the same as the current timezone
            const currentTz = tzCookie.split('=')[1];
            if (currentTz !== tz) {
                // if it's not the same, update it
                document.cookie = `timezone=${tz}; path=/`;
            }
        } else {
            // if it doesn't exist, create it
            document.cookie = `timezone=${tz}; path=/`;
        }
    }
}
