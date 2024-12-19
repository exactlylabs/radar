package com.exactlylabs.endlessapsscanner.utils

class Tags {
    companion object {
        val kServiceTag = "EAS" // EndlessApsScanner
        val kWakeLockTag = "${kServiceTag}::WakeLock" // EAS::WakeLock
        val kWifiLockTag = "${kServiceTag}::WifiLock" // EAS::WifiLock
    }
}