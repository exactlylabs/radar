package com.andreisaioc.testSpeed1

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.ScanResult
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.telephony.TelephonyManager
import androidx.annotation.RequiresApi
import com.google.gson.Gson
import com.google.gson.GsonBuilder

class NetworkInfoHelper(private val context: Context) {
    
    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()

    // Get WiFi network list
    fun getWifiNetworkList(): String {
        val scanResults = wifiManager.scanResults
        val wifiNetworks = scanResults.map { scanResultToMap(it) }
        return gson.toJson(wifiNetworks)
    }

    // Map WiFi scan results to a structured map
    private fun scanResultToMap(scanResult: ScanResult): Map<String, Any?> {
        return mapOf(
            "bssid" to scanResult.BSSID,
            "ssid" to scanResult.SSID,
            "capabilities" to scanResult.capabilities,
            "level" to scanResult.level,
            "frequency" to scanResult.frequency,
            "timestamp" to if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) scanResult.timestamp else null
        )
    }

    // Get current WiFi connection info
    @RequiresApi(Build.VERSION_CODES.M)
    fun getCurrentWifiInfo(): String {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return "{}"
        val nwCapabilities = connectivityManager.getNetworkCapabilities(network) ?: return "{}"
        
        val wifiInfoMap = if (nwCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
            val wifiInfo = wifiManager.connectionInfo
            mapOf(
                "linkSpeed" to wifiInfo.linkSpeed,
                "rssi" to wifiInfo.rssi,
                "frequency" to wifiInfo.frequency,
                "ssid" to wifiInfo.ssid,
                "bssid" to wifiInfo.bssid
            )
        } else {
            emptyMap()
        }
        return gson.toJson(wifiInfoMap)
    }

    // Get current cellular connection info
    fun getCurrentCellularInfo(): String {
        val networkInfoMap = mutableMapOf<String, Any?>(
            "networkOperator" to telephonyManager.networkOperator,
            "networkOperatorName" to telephonyManager.networkOperatorName,
            "networkCountryIso" to telephonyManager.networkCountryIso,
            "phoneType" to telephonyManager.phoneType,
            "dataNetworkType" to telephonyManager.dataNetworkType
        )
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val cellInfoList = telephonyManager.allCellInfo
            networkInfoMap["registeredCellInfo"] = cellInfoList.mapNotNull { it.cellIdentity }
        }
        
        return gson.toJson(networkInfoMap)
    }
    
    // Combined method to get both WiFi and cellular info
    @RequiresApi(Build.VERSION_CODES.M)
    fun getNetworkConnectionInfo(): String {
        val wifiInfo = getCurrentWifiInfo()
        val cellularInfo = getCurrentCellularInfo()
        
        val networkInfo = mapOf(
            "wifiInfo" to gson.fromJson(wifiInfo, Map::class.java),
            "cellularInfo" to gson.fromJson(cellularInfo, Map::class.java)
        )
        
        return gson.toJson(networkInfo)
    }
}
