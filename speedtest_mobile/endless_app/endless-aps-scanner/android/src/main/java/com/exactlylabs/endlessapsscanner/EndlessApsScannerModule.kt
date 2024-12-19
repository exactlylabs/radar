package com.exactlylabs.endlessapsscanner

import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.core.os.bundleOf
import com.exactlylabs.endlessapsscanner.accesspoints.AccessPoints
import com.exactlylabs.endlessapsscanner.service.EndlessApsScannerService
import com.facebook.react.ReactApplication
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.sql.Timestamp

const val kRequestCode = 10

class EndlessApsScannerModule : Module() {

    private val context
        get() = requireNotNull(appContext.reactContext)

    private val activity
        get() = requireNotNull(appContext.currentActivity)


    @RequiresApi(Build.VERSION_CODES.TIRAMISU)
    override fun definition() = ModuleDefinition {
        Name("EndlessApsScanner")

        Function("listenOnScanResults") {
            val accessPoints = AccessPoints(context, activity)
            val scanResults = accessPoints.scan()
            this@EndlessApsScannerModule.sendEvent("onScanResults", bundleOf("scanResult" to scanResults))
        }

        Function("startService") {
            val intent = Intent(context, EndlessApsScannerService::class.java)
            context.startForegroundService(intent)
        }

        Function("stopService") {
            val intent = Intent(context, EndlessApsScannerService::class.java)
            context.stopService(intent)
        }

        Function("listenEvents") {
            val reactInstanceManager = (activity.application as ReactApplication).reactNativeHost.reactInstanceManager
            val eventsModule: EndlessApsScannerEventsModule? = reactInstanceManager.currentReactContext?.getNativeModule(EndlessApsScannerEventsModule::class.java)
            println("EventsModule is null: ${eventsModule == null}")
            eventsModule?.onAction("Timestamp: ${Timestamp(System.currentTimeMillis())}")
        }
    }
}
