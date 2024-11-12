package com.andreisaioc.testSpeed1

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
 
import com.facebook.react.modules.core.DeviceEventManagerModule


import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap

import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = SpeedTestModule.NAME)
class SpeedTestModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {


    companion object {
        const val NAME = "SpeedTestModule"
    }

    private val reactContext: ReactApplicationContext = reactContext

    override fun getName() = "SpeedTestModule"

    
    // Method to emit event to JavaScript
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun triggerSpeedTestFromNative() {
        // Emit an event to JavaScript-react native side, to trigger the speed test
        sendEvent("RunSpeedTestEvent", null)
    }
}
