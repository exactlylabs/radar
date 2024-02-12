package com.exactlylabs.network_connection_info

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.ScanResult
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.os.Handler
import android.telephony.TelephonyManager
import androidx.annotation.NonNull
import androidx.annotation.RequiresApi
import com.exactlylabs.network_connection_info.models.CellularConnectionInfo
import com.exactlylabs.network_connection_info.models.WifiConnectionInfo
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.Result
import java.util.ArrayList
import java.util.Collections
import java.util.LinkedList


/** NetworkConnectionInfoPlugin */
class NetworkConnectionInfoPlugin : FlutterPlugin, MethodChannel.MethodCallHandler {
    /// The MethodChannel that will the communication between Flutter and native Android
    ///
    /// This local reference serves to register the plugin with the Flutter Engine and unregister it
    /// when the Flutter Engine is detached from the Activity

    private lateinit var gson: Gson
    private lateinit var channel: MethodChannel
    private lateinit var telephonyManager: TelephonyManager
    private lateinit var context: Context

    private val WIFI = "Wifi"
    private val ANDROID = "Android"
    private val CELLULAR = "Cellular"
    private val PLATFORM = "platform"
    private val CONNECTION_TYPE = "connectionType"
    private val CONNECTION_INFO = "connectionInfo"


    override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
        channel = MethodChannel(flutterPluginBinding.binaryMessenger, "network_connection_info")
        channel.setMethodCallHandler(this)

        context = flutterPluginBinding.applicationContext
        gson = GsonBuilder().setPrettyPrinting().create()
    }


    @RequiresApi(Build.VERSION_CODES.M)
    override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
        when (call.method) {
            "getNetworkConnectionInfo" -> {
                val info = getConnectionInfo()
                result.success(gson.toJson(info))
            }

            "getCellularNetworkConnectionInfo" -> {
                val info = forceCellularConnection()
                result.success(gson.toJson(info))
            }

            "getWifiNetworkList" -> {
                val info = getWifiInfo()
                result.success(info)
            }

            else -> {
                result.notImplemented()
            }
        }
    }

    override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    @RequiresApi(Build.VERSION_CODES.M)
    private fun getConnectionInfo(): Map<String, Any?>? {
        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork
        val nwCap = connectivityManager.getNetworkCapabilities(network) ?: return null
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null;
        val connectionInfoJson: MutableMap<String, Any?> = HashMap()
        connectionInfoJson[PLATFORM] = ANDROID
        when {
            nwCap.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                connectionInfoJson[CONNECTION_TYPE] = WIFI
                connectionInfoJson[CONNECTION_INFO] = getWifiConnectionInfo(nwCap)
            }

            nwCap.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                connectionInfoJson[CONNECTION_TYPE] = CELLULAR
                connectionInfoJson[CONNECTION_INFO] = getCellularConnectionInfo()
            }
        }
        return connectionInfoJson
    }

    private fun getWifiInfo(): List<Map<String, Any?>> {
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val scanResults = wifiManager.scanResults
        val wifiLists = ArrayList<Map<String, Any?>>()
        for (result in scanResults) {
            wifiLists.add(scanResultToMap(result))
        }
        return wifiLists
    }

    private fun scanResultToMap(scanResult: ScanResult): Map<String, Any?> {
        val map = HashMap<String, Any?>()
        map["bssid"] = scanResult.BSSID
        map["ssid"] = scanResult.SSID
        map["capabilities"] = scanResult.capabilities
        map["level"] = scanResult.level
        map["frequency"] = scanResult.frequency
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            map["centerFreq0"] = scanResult.centerFreq0
            map["centerFreq1"] = scanResult.centerFreq1
            map["is80211mcResponder"] = scanResult.is80211mcResponder
            map["channelWidth"] = scanResult.channelWidth
            map["isPasspointNetwork"] = scanResult.isPasspointNetwork
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            map["informationElements"] = informationElementsParser(scanResult.informationElements)
            map["wifiStandard"] = scanResult.wifiStandard
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            map["timestamp"] = scanResult.timestamp
        }
        return map
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun getWifiConnectionInfo(nwCap: NetworkCapabilities): Map<String, Any?> {
        return WifiConnectionInfo(
            nwCap.linkDownstreamBandwidthKbps,
            nwCap.linkUpstreamBandwidthKbps,
            nwCap.signalStrength,
            (nwCap.transportInfo as? WifiInfo)?.frequency,
            (nwCap.transportInfo as? WifiInfo)?.linkSpeed,
            (nwCap.transportInfo as? WifiInfo)?.rssi,
            (nwCap.transportInfo as? WifiInfo)?.rxLinkSpeedMbps,
            (nwCap.transportInfo as? WifiInfo)?.txLinkSpeedMbps,
        ).toJson()
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun getCellularConnectionInfo(): Map<String, Any?> {
        telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val cellInfoList = telephonyManager.allCellInfo
        val cellInfo = cellInfoList.firstOrNull { it.isRegistered }
        return CellularConnectionInfo(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) cellInfo?.cellSignalStrength else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) cellInfo?.cellIdentity else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) telephonyManager.networkSpecifier else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) telephonyManager.dataNetworkType else null,
            telephonyManager.phoneType,
            telephonyManager.networkCountryIso,
            telephonyManager.networkOperatorName,
            telephonyManager.networkOperator
        ).toJson()
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    private fun forceCellularConnection(): Map<String, Any?> {
        val connectionInfoJson: MutableMap<String, Any?> = HashMap()
        connectionInfoJson[PLATFORM] = ANDROID
        connectionInfoJson[CONNECTION_TYPE] = CELLULAR
        connectionInfoJson[CONNECTION_INFO] = getCellularConnectionInfo()
        return connectionInfoJson
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
