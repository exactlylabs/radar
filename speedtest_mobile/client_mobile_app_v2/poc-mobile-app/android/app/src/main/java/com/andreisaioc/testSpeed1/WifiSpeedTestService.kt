package com.andreisaioc.testSpeed1

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.Handler
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import java.util.concurrent.TimeUnit

class WifiSpeedTestService : Service() {

    private val handler = Handler()
    private val interval: Long = 60000 // 1 minute in milliseconds
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.post(speedTestRunnable)
        return START_STICKY
    }

    private val speedTestRunnable = object : Runnable {
        override fun run() {
            testWifiSpeed()
            handler.postDelayed(this, interval)
        }
    }

    private fun testWifiSpeed() {
        val request = Request.Builder().url("https://example.com/large-file") // Replace with a valid URL
            .build()

        try {
            val startTime = System.currentTimeMillis()
            val response: Response = okHttpClient.newCall(request).execute()
            val endTime = System.currentTimeMillis()
            val fileSize = response.body?.contentLength() ?: 0L
            val timeTaken = (endTime - startTime) / 1000.0 // in seconds
            val speedMbps = (fileSize * 8 / timeTaken) / (1024 * 1024) // Mbps

            Log.d("WifiSpeedTestService", "WiFi Speed: $speedMbps Mbps")
            response.close()
        } catch (e: IOException) {
            Log.e("WifiSpeedTestService", "Error testing WiFi speed", e)
        }
    }

    override fun onDestroy() {
        handler.removeCallbacks(speedTestRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}