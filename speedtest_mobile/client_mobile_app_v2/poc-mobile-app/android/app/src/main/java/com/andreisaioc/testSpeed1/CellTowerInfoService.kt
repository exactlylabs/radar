package com.andreisaioc.testSpeed1

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.Handler
import android.telephony.CellInfo
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import android.Manifest
import android.content.pm.PackageManager

class CellTowerInfoService : Service() {

    private lateinit var telephonyManager: TelephonyManager
    private val handler = Handler()
    private val interval: Long = 60000 // 1 minute in milliseconds

    override fun onCreate() {
        super.onCreate()
        telephonyManager = applicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.post(fetchCellInfoRunnable)
        return START_STICKY
    }

    private val fetchCellInfoRunnable = object : Runnable {
        override fun run() {
            fetchCellTowerInfo()
            handler.postDelayed(this, interval)
        }
    }

    private fun fetchCellTowerInfo() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d("CellTowerInfoService", "Location permission not granted.")
            return
        }

        val cellInfoList: List<CellInfo> = telephonyManager.allCellInfo
        for (cellInfo in cellInfoList) {
            Log.d("CellTowerInfoService", "Cell Info: $cellInfo")
            // Additional parsing can be added here depending on cell info types
        }
    }

    override fun onDestroy() {
        handler.removeCallbacks(fetchCellInfoRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}