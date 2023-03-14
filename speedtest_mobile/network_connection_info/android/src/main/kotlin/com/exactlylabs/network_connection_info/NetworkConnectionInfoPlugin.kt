package com.exactlylabs.network_connection_info

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiInfo
import android.os.Build
import android.telephony.*
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
        connectionInfoJson["platform"] = "Android"
        when {
            nwCap.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                connectionInfoJson["connectionType"] = "WIFI"
                connectionInfoJson["connectionInfo"] = getWifiConnectionInfo(nwCap).toJson()
            }
            nwCap.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                connectionInfoJson["connectionType"] = "CELLULAR"
                connectionInfoJson["connectionInfo"] = getCellularConnectionInfo()
                return connectionInfoJson
            }
        }
        return connectionInfoJson
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun getWifiConnectionInfo(nwCap: NetworkCapabilities): WifiConnectionInfo {
        return WifiConnectionInfo(
            nwCap.linkDownstreamBandwidthKbps,
            nwCap.linkUpstreamBandwidthKbps,
            nwCap.signalStrength,
            (nwCap.transportInfo as WifiInfo).frequency,
            (nwCap.transportInfo as WifiInfo).linkSpeed,
            (nwCap.transportInfo as WifiInfo).rssi,
            (nwCap.transportInfo as WifiInfo).rxLinkSpeedMbps,
            (nwCap.transportInfo as WifiInfo).txLinkSpeedMbps,
        )
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
        connectionInfoJson["platform"] = "Android"
        connectionInfoJson["connectionType"] = "CELLULAR"
        connectionInfoJson["connectionInfo"] = getCellularConnectionInfo()?.toJson()
        return connectionInfoJson
    }
}
