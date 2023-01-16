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
        val networkCapabilities = connectivityManager.activeNetwork
        val actNw = connectivityManager.getNetworkCapabilities(networkCapabilities) ?: return null
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null;
        val connectionInfoJson: MutableMap<String, Any?> = HashMap()
        connectionInfoJson["platform"] = "Android"
        return when {
            actNw.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                val wifiConnectionInfo = WifiConnectionInfo(
                    actNw.linkDownstreamBandwidthKbps,
                    actNw.linkUpstreamBandwidthKbps,
                    actNw.signalStrength,
                    (actNw.transportInfo as WifiInfo).frequency,
                    (actNw.transportInfo as WifiInfo).linkSpeed,
                    (actNw.transportInfo as WifiInfo).rssi,
                    (actNw.transportInfo as WifiInfo).rxLinkSpeedMbps,
                    (actNw.transportInfo as WifiInfo).txLinkSpeedMbps,
                )
                connectionInfoJson["connectionType"] = "WIFI"
                connectionInfoJson["connectionInfo"] = wifiConnectionInfo.toJson()
                return connectionInfoJson
            }
            actNw.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                connectionInfoJson["connectionType"] = "CELLULAR"
                connectionInfoJson["connectionInfo"] = getCellularConnectionInfo()?.toJson()
                return connectionInfoJson
            }
            else -> null
        }

    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun getCellularConnectionInfo(): CellularConnectionInfo? {
        telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val cellInfoList = telephonyManager.allCellInfo
        val cellInfo = cellInfoList.firstOrNull { it.isRegistered } ?: return null
        return CellularConnectionInfo(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) cellInfo.cellSignalStrength else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) cellInfo.cellIdentity else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) telephonyManager.networkSpecifier else null,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) telephonyManager.dataNetworkType else null,
            telephonyManager.phoneType,
            telephonyManager.networkCountryIso,
            telephonyManager.networkOperatorName,
            telephonyManager.networkOperator
        )
    }
}
