package com.exactlylabs.ndt7_client.utils

import android.os.Handler
import android.os.Looper
import io.flutter.plugin.common.EventChannel.EventSink

internal class MainThreadEventSink(private val eventSink: EventSink?) : EventSink {
    private val handler: Handler = Handler(Looper.getMainLooper())
    override fun success(o: Any) {
        handler.post { eventSink?.success(o) }
    }

    override fun error(s: String, s1: String, o: Any) {
        handler.post { eventSink?.error(s, s1, o) }
    }

    override fun endOfStream() {}

}