package com.arnoldro
a.speedtest_v2

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ForegroundModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "ForegroundService"

    @ReactMethod
    fun startService() {
        val intent = Intent(reactApplicationContext, EndlessService::class.java)
        reactApplicationContext.startForegroundService(intent)
    }

    @ReactMethod
    fun stopService() {
        val intent = Intent(reactApplicationContext, EndlessService::class.java)
        reactApplicationContext.stopService(intent)
    }
}
