package com.andreisaioc.testSpeed1

import android.app.Service
import android.content.Intent
import android.net.wifi.WifiManager
import android.os.IBinder
import android.telephony.TelephonyManager
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext

class NetworkCheckService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Start network checks and speed tests in a separate thread
        Thread {
            performNetworkChecks()
            performSpeedTest()
        }.start()

        return START_STICKY
    }

    private fun performNetworkChecks() {
        val wifiManager = applicationContext.getSystemService(WIFI_SERVICE) as WifiManager
        val wifiInfo = wifiManager.connectionInfo
        val telephonyManager = applicationContext.getSystemService(TELEPHONY_SERVICE) as TelephonyManager

        // Example logs - access details like SSID, signal strength
        Log.d("NetworkCheckService", "Connected WiFi SSID: ${wifiInfo.ssid}")
        Log.d("NetworkCheckService", "Signal Strength: ${wifiInfo.rssi}")

        // Cell tower information can also be retrieved here
    }

    private fun performSpeedTest() {
        // Implement basic speed test logic (e.g., download a file, measure time taken)
        Log.d("NetworkCheckService", "Starting speed test...")

        // This would be a good place to use libraries like OkHttp to download/upload a file
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}