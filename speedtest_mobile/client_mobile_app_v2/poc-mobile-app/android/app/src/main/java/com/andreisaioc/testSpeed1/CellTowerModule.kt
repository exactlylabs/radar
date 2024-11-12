package com.andreisaioc.testSpeed1


import com.facebook.react.modules.core.DeviceEventManagerModule
import android.content.Context
import android.os.Build
import android.telephony.*
import com.facebook.react.bridge.*
import kotlin.math.roundToInt
class CellTowerModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "CellTowerModule"
    }


    private fun sendLogToReactNative(message: String) {

        val jsMessage = Arguments.createMap()
        jsMessage.putString("log", message)
    

        val deviceEventManager = context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java) as DeviceEventManagerModule.RCTDeviceEventEmitter
    
        deviceEventManager.emit("logEvent", jsMessage)
    }


    @ReactMethod
    fun getCellTowerInfo(promise: Promise) {
        val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val cellInfoList = telephonyManager.allCellInfo

        val cellInfoArray: WritableArray = Arguments.createArray()

        cellInfoList?.forEach { cellInfo ->

            sendLogToReactNative("Cell Info: $cellInfo") 

            val cellData = Arguments.createMap()

            when (cellInfo) {
                is CellInfoGsm -> {
                    cellData.putString("type", "GSM")
                    cellData.putString("technology", "2G")
                    cellData.putInt("signalStrength", cellInfo.cellSignalStrength.dbm)
                    cellData.putInt("asuLevel", cellInfo.cellSignalStrength.asuLevel)
                    cellData.putString("mcc", cellInfo.cellIdentity.mcc?.toString() ?: "Unknown")
                    cellData.putString("mnc", cellInfo.cellIdentity.mnc?.toString() ?: "Unknown")
                    cellData.putInt("cellId", cellInfo.cellIdentity.cid)
                    cellData.putInt("lac", cellInfo.cellIdentity.lac) // Add LAC
                }
                is CellInfoLte -> {
                    cellData.putString("type", "LTE")
                    cellData.putString("technology", "4G")
                    cellData.putInt("signalStrength", cellInfo.cellSignalStrength.dbm)
                    cellData.putInt("rsrp", cellInfo.cellSignalStrength.rsrp)
                    cellData.putInt("rsrq", cellInfo.cellSignalStrength.rsrq)
                    cellData.putInt("rssnr", cellInfo.cellSignalStrength.rssnr)
                    cellData.putString("mcc", cellInfo.cellIdentity.mcc?.toString() ?: "Unknown")
                    cellData.putString("mnc", cellInfo.cellIdentity.mnc?.toString() ?: "Unknown")
                    cellData.putInt("cellId", cellInfo.cellIdentity.ci)
                    cellData.putString("name", cellInfo.cellIdentity.getOperatorAlphaShort().toString())
                }
                is CellInfoNr -> {

                    cellData.putString("type", "5G")
                    cellData.putString("technology", "5G")
                    cellData.putInt("signalStrength", cellInfo.cellSignalStrength.dbm)
                    cellData.putInt("asuLevel", cellInfo.cellSignalStrength.asuLevel)
       
                    //cellData.putInt("lac", cellInfo.cellIdentity.lac) // Add LAC
                }
                is CellInfoWcdma -> {
                    cellData.putString("type", "WCDMA")
                    cellData.putString("technology", "3G")
                    cellData.putInt("signalStrength", cellInfo.cellSignalStrength.dbm)
                    cellData.putInt("asuLevel", cellInfo.cellSignalStrength.asuLevel)
                    cellData.putString("mcc", cellInfo.cellIdentity.mcc?.toString() ?: "Unknown")
                    cellData.putString("mnc", cellInfo.cellIdentity.mnc?.toString() ?: "Unknown")
                    cellData.putInt("cellId", cellInfo.cellIdentity.cid)
                    cellData.putInt("lac", cellInfo.cellIdentity.lac) // Add LAC
                }
                is CellInfoCdma -> {
                    cellData.putString("type", "CDMA")
                    cellData.putString("technology", "3g")
                    cellData.putInt("signalStrength", cellInfo.cellSignalStrength.dbm)
                    cellData.putInt("cdmaDbm", cellInfo.cellSignalStrength.cdmaDbm)
                    cellData.putInt("cdmaEcio", cellInfo.cellSignalStrength.cdmaEcio)
                    cellData.putInt("networkId", cellInfo.cellIdentity.networkId)
                    cellData.putInt("systemId", cellInfo.cellIdentity.systemId)
                    // LAC is not directly available in CDMA, so this may remain empty
                    cellData.putInt("lac", -1) // Placeholder for LAC as it's not applicable
                }
                else -> {
                    cellData.putString("type", "Unknown")
                }
            }

            // Add general info available for all cell types
            cellData.putBoolean("isRegistered", cellInfo.isRegistered)
            cellInfoArray.pushMap(cellData)
        }

        promise.resolve(cellInfoArray)
    }
}