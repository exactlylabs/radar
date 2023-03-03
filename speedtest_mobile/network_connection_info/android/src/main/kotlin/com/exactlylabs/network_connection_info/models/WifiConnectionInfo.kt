package com.exactlylabs.network_connection_info.models

class WifiConnectionInfo(
    private val mLinkDownBandwidthKbps: Int,
    private val mLinkUpBandwidthKbps: Int,
    private val mSignalStrength: Int,
    private val mFrequency: Int,
    private val mLinkSpeed: Int,
    private val mRssi: Int,
    private val mRxLinkSpeed: Int,
    private val mTxLinkSpeed: Int,
) {

    fun toJson(): Map<String, Any?> {
        val json: MutableMap<String, Any?> = HashMap()
        json["linkDownBandwidthKbps"] = mLinkDownBandwidthKbps
        json["linkUpBandwidthKbps"] = mLinkUpBandwidthKbps
        json["signalStrength"] = mSignalStrength
        json["frequency"] = mFrequency
        json["linkSpeed"] = mLinkSpeed
        json["rssi"] = mRssi
        json["rxLinkSpeed"] = mRxLinkSpeed
        json["txLinkSpeed"] = mTxLinkSpeed
        return json
    }


}