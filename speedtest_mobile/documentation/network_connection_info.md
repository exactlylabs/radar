## Network Connection Info
This module provides information about the network connection of the device.

### Permissions required
These permissions are required to use the **TelephonyManager** and **WifiManager** classes.
- `android.permission.READ_PHONE_STATE`.
- `android.permission.ACCESS_WIFI_STATE`.
- `android.permission.CHANGE_WIFI_STATE`.
- `android.permission.ACCESS_NETWORK_STATE`.
- `android.permission.ACCESS_FINE_LOCATION`.
- `android.permission.ACCESS_COARSE_LOCATION`.

### Methods available
- `getNetworkConnectionInfo()`: This method returns all available information related to the device's network connection. This means that the information returned may vary depending on whether the connection is WiFi or Cellular. Note: If both connections (WiFi and Cellular) are active, the information returned will correspond to WiFi.
    * Returns: `Map<String, Any?>?`:<br>
    ```kotlin
    {
        "platform": String,
        "connectionType": String,
        "connectionInfo": Map<String, Any?>,
    }
    ```
    As I said before, the information returned may vary depending on whether the connection is WiFi or Cellular. The **connectionInfo** field will contain the information of the connection, which may vary depending on the connection type.<br>
    If the connection is `WiFi` the Map will contain the following fields:
    ```kotlin
    {
        "linkDownBandwidthKbps": Int,
        "linkUpBandwidthKbps": Int,
        "signalStrength": Int,
        "frequency": Int?,
        "linkSpeed": Int?,
        "rssi": Int?,
        "rxLinkSpeed": Int?,
        "txLinkSpeed": Int?,
    }
    ```
    If the connection is `Cellular` the Map will contain the following fields:
    ```kotlin
    {
        "networkSpecifier": String?,
        "dataNetworkType": String,
        "phoneType": String,
        "networkCountryIso": String,
        "networkOperatorName": String,
        "networkOperator": String,
        "signalStrength": Map<String, Any?>,
        "cellIdentity": Map<String, Any?>,
    }
    ```
    Here are some clarifications about the fields:
    - **dataNetworkType**: The possible values are `GPRS`, `EDGE`, `CDMA`, `1xRTT`, `IDEN`, `GSM`, `UMTS`, `EVDO_0`, `EVDO_A`, `HSDPA`, `HSUPA`, `HSPA`, `EVDO_B`, `EHRPD`, `HSPAP`, `SCDMA`, `LTE`, `NR`, `UNKNOWN`.
    - **phoneType**: The possible values are `NONE`, `GSM`, `CDMA`, `SIP`.
    - **signalStrength**: The information about the signal strength. The fields contained in this Map may vary depending on the *data network type*.
        <details>
        <summary>GSM Signal Strength</summary>

        ```kotlin
        {
            "bitErrorRate": Int?,
            "timingAdvance": Int?,
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
            "rssi": Int?,
        }
        ```
        </details>
        <details>
        <summary>LTE Signal Strength</summary>

        ```kotlin
        {
            "cqi": Int?,
            "rsrp": Int?,
            "rsrq": Int?,
            "rssi": Int?,
            "rssnr": Int?,
            "timingAdvance": Int?,
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
            "cqiTableIndex": Int?,
        }
        ```
        </details>
        <details>
        <summary>WCDMA Signal Strength</summary>

        ```kotlin
        {
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
            "ecNo": Int?,
        }
        ```
        </details>
        <details>
        <summary>CDMA Signal Strength</summary>

        ```kotlin
        {
            "cdmaDbm": Int?,
            "cdmaEcio": Int?,
            "cdmaLevel": Int?,
            "evdoDbm": Int?,
            "evdoEcio": Int?,
            "evdoLevel": Int?,
            "evdoSnr": Int?,
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
        }
        ```
        </details>
        <details>
        <summary>TD-SCDMA Signal Strength</summary>

        ```kotlin
        {
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
            "ecNo": Int?,
        }
        ```
        </details>
        <details>
        <summary>All the other types of signal strength</summary>

        ```kotlin
        {
            "csiRsrp": Int?,
            "csiRsrq": Int?,
            "csiSinr": Int?,
            "ssRsrp": Int?,
            "ssRsrq": Int?,
            "ssSinr": Int?,
            "asuLevel": Int?,
            "dbm": Int?,
            "level": Int?,
            "csiCqiReport": Int?,
            "csiCqiTableIndex": Int?,
        }
        ```
        </details>
    - **cellIdentity**: The information about the cell identity. The fields contained in this Map may vary depending on the *data network type*.
        <details>
        <summary>GSM Cell Identity</summary>

        ```kotlin
        {
            "arfcn": Int?,
            "bsic": Int?,
            "cid": Int?,
            "lac": Int?,
            "mcc": Int?,
            "mnc": Int?,
            "mobileNetworkOperator": String?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
        }
        ```
        </details>
        <details>
        <summary>LTE Cell Identity</summary>

        ```kotlin
        {
            "bandwidth": Int?,
            "earfcn": Int?,
            "cid": Int?,
            "pci": Int?,
            "tac": Int?,
            "mcc": Int?,
            "mnc": Int?,
            "mobileNetworkOperator": String?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
            "bands": List<Int>?,
        }
        ```
        </details>
        <details>
        <summary>WCDMA Cell Identity</summary>

        ```kotlin
        {
            "cid": Int?,
            "lac": Int?,
            "psc": Int?,
            "uarfcn": Int?,
            "mcc": Int?,
            "mnc": Int?,
            "mobileNetworkOperator": String?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
        }
        ```
        </details>
        <details>
        <summary>CDMA Cell Identity</summary>

        ```kotlin
        {
            "bsic": Int?,
            "latitude": Double?,
            "longitude": Double?,
            "networkId": Int?,
            "systemId": Int?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
        }
        ```
        </details>
        <details>
        <summary>TD-SCDMA Cell Identity</summary>

        ```kotlin
        {
            "cid": Int?,
            "lac": Int?,
            "cpid": Int?,
            "uarfcn": Int?,
            "mcc": Int?,
            "mnc": Int?,
            "mobileNetworkOperator": String?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
        }
        ```
        </details>
        <details>
        <summary>All the other types of cell identity</summary>

        ```kotlin
        {
            "nci": Int?,
            "nrarfcn": Int?,
            "pci": Int?,
            "tac": Int?,
            "mcc": Int?,
            "mnc": Int?,
            "operatorAlphaLong": String?,
            "operatorAlphaShort": String?,
            "bands": List<Int>?,
        }
        ```
        </details>
- `getCellularNetworkConnectionInfo()`: This method returns all available information related to the device's cellular network connection, even if the device is connected to a WiFi network.
    * Returns: `Map<String, Any?>?`:<br>
    **Note:** The fields contained in the Map are the same as the fields contained in the `connectionInfo` field of the `getNetworkConnectionInfo()` method.
- `getWifiNetworkList()`: This method returns a list of all available WiFi networks.
    * Returns: `List<Map<String, Any?>>?`:<br>
    ```kotlin
    [
        {
            "bssid": String,
            "ssid": String,
            "capabilities": String,
            "level": Int,
            "frequency": Int,
            "centerFreq0": Int,
            "centerFreq1": Int,
            "is80211mcResponder": Boolean,
            "channelWidth": Int,
            "isPasspointNetwork": Boolean,
            "informationElements": List<ByteArray>
            "wifiStandard": Int,
            "timestamp": Long,
        }
    ]
    ```