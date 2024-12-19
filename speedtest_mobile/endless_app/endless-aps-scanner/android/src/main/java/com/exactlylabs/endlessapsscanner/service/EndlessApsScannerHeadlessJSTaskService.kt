package com.exactlylabs.endlessapsscanner.service

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig


class EndlessApsScannerHeadlessJSTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        if (extras != null) {
            return HeadlessJsTaskConfig(
                "EndlessApsScanner",  // Task name registered in JavaScript
                Arguments.fromBundle(extras),
                5000,  // Timeout for the task
                true // Allowed to run in foreground
            )
        }
        return null
    }

}