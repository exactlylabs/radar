package com.exactlylabs.endlessapsscanner

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = "EndlessApsScannerEvents")
class EndlessApsScannerEventsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "EndlessApsScannerEvents"
    }

    @ReactMethod
    fun addListener(type: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(type: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        println("This will emit: $eventName, ${params?.toString()}")
        println("ReactContext in module: $reactApplicationContext")
        val reactContext = reactApplicationContext
        val emitted = reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
        println("Emitted: ${emitted != null}")
    }

    fun onStar() {
        println("onStart")
        sendEvent("ON_START", null)
    }

    fun onStop() {
        println("onStop")
        sendEvent("ON_STOP", null)
    }

    fun onAction(data: String) {
        val params = Arguments.createMap().apply {
            putString("data", data)
        }
        println("onAction")
        sendEvent("ON_ACTION", params)
    }


}