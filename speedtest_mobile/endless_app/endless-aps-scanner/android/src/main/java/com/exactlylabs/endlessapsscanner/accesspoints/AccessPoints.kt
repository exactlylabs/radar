package com.exactlylabs.endlessapsscanner.accesspoints

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.net.wifi.ScanResult
import android.net.wifi.WifiManager
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.exactlylabs.endlessapsscanner.kRequestCode

class AccessPoints(private val context: Context, private val activity: Activity) {

    fun checkPermissions(): Boolean {
        val permissionCheck = ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        )

        if (permissionCheck != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION),
                kRequestCode
            )
        }
        return ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    @SuppressLint("MissingPermission")
    fun scan(): String {
        val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val scanResults = wifiManager.scanResults
        val wifiLists = ArrayList<Map<String, Any?>>()
        for (result in scanResults) {
            wifiLists.add(scanResultToMap(result))
        }
        return wifiLists.toList().toString()
    }

    private fun scanResultToMap(scanResult: ScanResult): Map<String, Any?> {
        val map = HashMap<String, Any?>()
        map["bssid"] = scanResult.BSSID
        map["ssid"] = scanResult.SSID
        map["capabilities"] = scanResult.capabilities
        map["level"] = scanResult.level
        map["frequency"] = scanResult.frequency
        map["centerFreq0"] = scanResult.centerFreq0
        map["centerFreq1"] = scanResult.centerFreq1
        map["is80211mcResponder"] = scanResult.is80211mcResponder
        map["channelWidth"] = scanResult.channelWidth
        map["isPasspointNetwork"] = scanResult.isPasspointNetwork
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            map["informationElements"] = informationElementsParser(scanResult.informationElements)
            map["wifiStandard"] = scanResult.wifiStandard
        }
        map["timestamp"] = scanResult.timestamp
        return map
    }

    @RequiresApi(Build.VERSION_CODES.R)
    private fun informationElementsParser(informationElements: List<ScanResult.InformationElement>?): List<ByteArray> {
        val informationElementsParsed = ArrayList<ByteArray>()
        if (informationElements != null) {
            for (informationElement in informationElements) {
                val informationElementArray = ByteArray(informationElement.bytes.remaining())
                for (i in 0 until informationElement.bytes.remaining()) {
                    informationElementArray[i] = informationElement.bytes.get(i)
                }
                informationElementsParsed.add(informationElementArray)
            }
        }
        return informationElementsParsed
    }

}