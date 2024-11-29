import { useRef } from "react";

export const TIMER_DURATIONS = {
    SEND_NEW_CODE: 59,
    RESEND_CODE: 59,
}

export const timerRef = useRef<NodeJS.Timeout>();