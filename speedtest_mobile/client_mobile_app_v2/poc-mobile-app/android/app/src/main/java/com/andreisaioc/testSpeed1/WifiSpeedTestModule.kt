package com.andreisaioc.testSpeed1

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class WifiSpeedTestModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WifiSpeedTest"
    }

    @ReactMethod
    fun startSpeedTest() {
        val context = reactApplicationContext
        val intent = Intent(context, WifiSpeedTestService::class.java)
        ContextCompat.startForegroundService(context, intent)
    }

    @ReactMethod
    fun stopSpeedTest() {
        val context = reactApplicationContext
        val intent = Intent(context, WifiSpeedTestService::class.java)
        context.stopService(intent)
    }
}