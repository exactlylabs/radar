package com.exactlylabs.network_connection_info.models

import android.net.TelephonyNetworkSpecifier
import android.os.Build
import android.telephony.*
import androidx.annotation.RequiresApi

class CellularConnectionInfo(
    private val signalStrength: CellSignalStrength?,
    private val cellIdentity: CellIdentity?,
    private val networkSpecifier: String?,
    private val dataNetworkType: Int?,
    private val phoneType: Int,
    private val networkCountryIso: String,
    private val networkOperatorName: String,
    private val networkOperator: String
) {

    fun toJson(): Map<String, Any?> {
        val json: MutableMap<String, Any?> = HashMap()
        json["networkSpecifier"] = networkSpecifier
        json["dataNetworkType"] = networkTypeClass(dataNetworkType)
        json["phoneType"] = phoneTypeClass(phoneType)
        json["networkCountryIso"] = networkCountryIso
        json["networkOperatorName"] = networkOperatorName
        json["networkOperator"] = networkOperator
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            json["signalStrength"] = getCellSignalStrengthJson(signalStrength)
            json["cellIdentity"] = getCellIdentityJson(cellIdentity)
        }

        return json
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun getCellIdentityJson(cellIdentity: CellIdentity?): Map<String, Any?>? {
        if (cellIdentity == null) return cellIdentity
        val json: MutableMap<String, Any?> = HashMap()

        when (cellIdentity) {
            is CellIdentityGsm -> {
                json["arfcn"] = cellIdentity.arfcn
                json["bsic"] = cellIdentity.bsic
                json["cid"] = cellIdentity.cid
                json["lac"] = cellIdentity.lac
                json["mcc"] = cellIdentity.mccString
                json["mnc"] = cellIdentity.mncString
                json["mobileNetworkOperator"] = cellIdentity.mobileNetworkOperator
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
            }
            is CellIdentityLte -> {
                json["bandwidth"] = cellIdentity.bandwidth
                json["earfcn"] = cellIdentity.earfcn
                json["cid"] = cellIdentity.ci
                json["pci"] = cellIdentity.pci
                json["tac"] = cellIdentity.tac
                json["mcc"] = cellIdentity.mccString
                json["mnc"] = cellIdentity.mncString
                json["mobileNetworkOperator"] = cellIdentity.mobileNetworkOperator
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    json["bands"] = cellIdentity.bands
                }
            }
            is CellIdentityWcdma -> {
                json["cid"] = cellIdentity.cid
                json["lac"] = cellIdentity.lac
                json["psc"] = cellIdentity.psc
                json["uarfcn"] = cellIdentity.uarfcn
                json["mcc"] = cellIdentity.mccString
                json["mnc"] = cellIdentity.mncString
                json["mobileNetworkOperator"] = cellIdentity.mobileNetworkOperator
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
            }
            is CellIdentityTdscdma -> {
                json["cid"] = cellIdentity.cid
                json["lac"] = cellIdentity.lac
                json["cpid"] = cellIdentity.cpid
                json["uarfcn"] = cellIdentity.uarfcn
                json["mcc"] = cellIdentity.mccString
                json["mcn"] = cellIdentity.mncString
                json["mobileNetworkOperator"] = cellIdentity.mobileNetworkOperator
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
            }
            is CellIdentityCdma -> {
                json["bsic"] = cellIdentity.basestationId
                json["latitude"] = cellIdentity.latitude
                json["longitude"] = cellIdentity.longitude
                json["networkId"] = cellIdentity.networkId
                json["systemId"] = cellIdentity.systemId
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
            }
            else -> {
                json["nci"] = (cellIdentity as CellIdentityNr).nci
                json["nrarfcn"] = cellIdentity.nrarfcn
                json["pci"] = cellIdentity.pci
                json["tac"] = cellIdentity.tac
                json["mcc"] = cellIdentity.mccString
                json["mnc"] = cellIdentity.mncString
                json["operatorAlphaLong"] = cellIdentity.operatorAlphaLong
                json["operatorAlphaShort"] = cellIdentity.operatorAlphaShort
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    json["bands"] = cellIdentity.bands
                }
            }
        }
        return json
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun getCellSignalStrengthJson(cellSignalStrength: CellSignalStrength?): Map<String, Any?>? {
        if (cellSignalStrength == null) return cellSignalStrength
        val json: MutableMap<String, Any?> = HashMap()

        when (cellSignalStrength) {
            is CellSignalStrengthGsm -> {
                json["bitErrorRate"] = cellSignalStrength.bitErrorRate
                json["timingAdvance"] = cellSignalStrength.timingAdvance
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    json["rssi"] = cellSignalStrength.rssi
                }
            }
            is CellSignalStrengthLte -> {
                json["cqi"] = cellSignalStrength.cqi
                json["rsrp"] = cellSignalStrength.rsrp
                json["rsrq"] = cellSignalStrength.rsrq
                json["rssi"] = cellSignalStrength.rssi
                json["rssnr"] = cellSignalStrength.rssnr
                json["timingAdvance"] = cellSignalStrength.timingAdvance
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    json["cqiTableIndex"] = cellSignalStrength.cqiTableIndex
                }
            }
            is CellSignalStrengthWcdma -> {
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    json["ecNo"] = cellSignalStrength.ecNo
                }
            }
            is CellSignalStrengthCdma -> {
                json["cdmaDbm"] = cellSignalStrength.cdmaDbm
                json["cdmaEcio"] = cellSignalStrength.cdmaEcio
                json["cdmaLevel"] = cellSignalStrength.cdmaLevel
                json["evdoDbm"] = cellSignalStrength.evdoDbm
                json["evdoEcio"] = cellSignalStrength.evdoEcio
                json["evdoLevel"] = cellSignalStrength.evdoLevel
                json["evdoSnr"] = cellSignalStrength.evdoSnr
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level

            }
            is CellSignalStrengthTdscdma -> {
                json["cdmaDbm"] = cellSignalStrength.rscp
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level
            }
            else -> {
                json["csiRsrp"] = (cellSignalStrength as CellSignalStrengthNr).csiRsrp
                json["csiRsrq"] = cellSignalStrength.csiRsrq
                json["csiSinr"] = cellSignalStrength.csiSinr
                json["ssRsrp"] = cellSignalStrength.ssRsrp
                json["ssRsrq"] = cellSignalStrength.ssRsrq
                json["ssSinr"] = cellSignalStrength.ssSinr
                json["asuLevel"] = cellSignalStrength.asuLevel
                json["dbm"] = cellSignalStrength.dbm
                json["level"] = cellSignalStrength.level
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    json["csiCqiReport"] = cellSignalStrength.csiCqiReport
                    json["csiCqiTableIndex"] = cellSignalStrength.csiCqiTableIndex
                }
            }
        }
        return json
    }

    fun networkTypeClass(networkType: Int?): String? {
        if (networkType == null) return networkType
        return when (networkType) {
            TelephonyManager.NETWORK_TYPE_GPRS -> "GPRS"
            TelephonyManager.NETWORK_TYPE_EDGE -> "EDGE"
            TelephonyManager.NETWORK_TYPE_CDMA -> "CDMA"
            TelephonyManager.NETWORK_TYPE_1xRTT -> "1xRTT"
            TelephonyManager.NETWORK_TYPE_IDEN -> "IDEN"
            TelephonyManager.NETWORK_TYPE_GSM -> "GSM"
            TelephonyManager.NETWORK_TYPE_UMTS -> "UMTS"
            TelephonyManager.NETWORK_TYPE_EVDO_0 -> "EVDO_0"
            TelephonyManager.NETWORK_TYPE_EVDO_A -> "EVDO_A"
            TelephonyManager.NETWORK_TYPE_HSDPA -> "HSDPA"
            TelephonyManager.NETWORK_TYPE_HSUPA -> "HSUPA"
            TelephonyManager.NETWORK_TYPE_HSPA -> "HSPA"
            TelephonyManager.NETWORK_TYPE_EVDO_B -> "EVDO_B"
            TelephonyManager.NETWORK_TYPE_EHRPD -> "EHRPD"
            TelephonyManager.NETWORK_TYPE_HSPAP -> "HSPAP"
            TelephonyManager.NETWORK_TYPE_TD_SCDMA -> "SCDMA"
            TelephonyManager.NETWORK_TYPE_LTE -> "LTE"
            TelephonyManager.NETWORK_TYPE_NR -> "NR"
            else -> "Unknown"
        }
    }

    fun phoneTypeClass(phoneType: Int?): String? {
        if (phoneType == null) return phoneType
        return when (phoneType) {
            TelephonyManager.PHONE_TYPE_GSM -> "GSM"
            TelephonyManager.PHONE_TYPE_CDMA -> "CDMA"
            TelephonyManager.PHONE_TYPE_SIP -> "SIP"
            else -> "NONE"
        }
    }
}