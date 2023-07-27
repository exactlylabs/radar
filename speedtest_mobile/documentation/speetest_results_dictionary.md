## Speed Test Dictionary

### Mobile App fields
```json
    {
      "result": {"raw": LIST},
      "speed_test": {           
        "tested_at": STRING,
        "latitude": DOUBLE,
        "longitude": DOUBLE,
        "accuracy": DOUBLE,
        "altitude": DOUBLE,
        "floor": INT,
        "heading": DOUBLE,
        "speed": DOUBLE,
        "speed_accuracy": DOUBLE,
        "address": STRING,
        "city": STRING,
        "street": STRING,
        "state": STRING,
        "postal_code": STRING,
        "house_number": STRING,
        "network_type": STRING,
        "network_location": STRING,
        "network_cost": STRING,
        "latitude_before": DOUBLE,
        "longitude_before": DOUBLE,
        "accuracy_before": DOUBLE,
        "altitude_before": DOUBLE,
        "floor_before": INT,
        "heading_before": DOUBLE,
        "speed_before": DOUBLE,
        "speed_accuracy_before": DOUBLE,
        "longitude_after": DOUBLE,
        "latitude_after": DOUBLE,
        "accuracy_after": DOUBLE,
        "altitude_after": DOUBLE,
        "floor_after": INT,
        "heading_after": DOUBLE,
        "speed_after": DOUBLE,
        "speed_accuracy_after": DOUBLE,
        "version_number": STRING,
        "build_number": STRING,
        "session_id": STRING,
        "background_mode": BOOL,
      },
      "connection_data": {
        "platform": STRING,
        "connectionType": STRING,
        "connectionInfo": MAP,
        "rssi": INT,
        },
      "timestamp": STRING,
    };
```

## Fields description
### result
| Field | Description |
| --- | --- |
| `result` | All raw data exchanged during the speed test between the client and server |

### speed_test
| Field | Description |
| --- | --- |
| `tested_at` | The time at which the speed test was performed.|
| `latitude` | The latitude of the position where the speed test was performed.<br>Same as latitude_before in **BMT**.|
| `longitude` | The longitude of the position where the speed test was performed.<br>Same as longitude_before in **BMT**.|
| `altitude` | The altitude of the device (used to perform the speed test).<br>Same as longitude_before in **BMT**.|
| `accuracy` | The estimated horizontal accuracy of the position where the speed test was performed.<br>Same as longitude_before in **BMT** |
| `floor` | Floor of the building on which the device was when the speed test was performed.<br>Same as longitude_before in **BMT**.|
| `heading` | The heading in which the device was traveling when the speed test was performed.<br>Same as longitude_before in **BMT**.|
| `speed` | The speed at which the device was traveling when the speed test was performed.<br>Same as longitude_before in **BMT**.<br>Value in m/s.|
| `speed_accuracy` | The estimated speed accuracy of the device when the speed test was performed.<br>Same as speed_accuracy_before in **BMT**.<br>Value in m/s.|
| `address` | Address associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `city` | City associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `street` | Street associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `state` | State associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `postal_code` | Postal code associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `house_number` | House number associated to the position where the speed test was performed.<br>From latitude & longitude.<br>*Null* in **BMT**.|
| `network_type` | Type of the network used to run the speed test.<br>Alternatives: **Wired, Wifi or Cellular**.<br>Same as *connectionType* from *connection_data* in **BMT**.<br>*Null* in **BMT**.|
| `network_location` | Location of the network used to run the speed test.<br>Alternatives: **Home, Work, Other or I don’t have.**<br>*Null* in **BMT**.|
| `network_cost` | Monthly cost of the network used to perform the speed test.<br>*Null* in **BMT**.|
| `latitude_before` | The latitude of the position right before the speed test was performed.<br>Same as latitude in **BMT**.|
| `longitude_before` | The longitude of the position right before the speed test was performed.<br>Same as longitude in **BMT**.|
| `altitude_before` | The altitude of the device right before the speed test was performed.<br>Same as altitude in **BMT**.|
| `accuracy_before` | The estimated horizontal accuracy of the position right before the speed test was performed.<br>Same as accuracy in **BMT**.|
| `floor_before` | Floor of the building on which the device was right before the speed test was performed.<br>Same as floor_before in **BMT**.|
| `heading_before` | The heading in which the device was traveling right before the speed test was performed.<br>Same as heading in **BMT**.|
| `speed_before` | The speed at which the device was traveling right before the speed test was performed.<br>Same as speed in **BMT**.|
| `speed_accuracy_before` | The estimated speed accuracy of the device before the speed test was performed.<br>Same as speed_accuracy in **BMT**.|
| `latitude_after` | The latitude of the position right after the speed test was performed.|
| `longitude_after` | The longitude of the position right after the speed test was performed.|
| `altitude_after` | The altitude of the device right after the speed test was performed.|
| `accuracy_after` | The estimated horizontal accuracy of the position right after the speed test was performed.|
| `floor_after` | Floor of the building on which the device was right after the speed test was performed.|
| `heading_after` | The heading in which the device was traveling right after the speed test was performed.<br>Same as heading in **BMT**.|
| `speed_after` | The speed at which the device was traveling right after the speed test was performed.<br>Same as speed in **BMT**.|
| `speed_accuracy_after` | The estimated speed accuracy of the device after the speed test was performed.<br>Same as speed_accuracy in **BMT**.|
| `version_number` |  Version number of the app used to run the speed test.|
| `build_number` | Build number of the app used to run the speed test.|
| `session_id` | Unique identifier of the session during which the speed test was performed.|
| `background_mode` | Indicates if the speed test was performed in background mode.|

### connection_data (Android only)
| Field | Description |
| --- | --- |
| `platform` | Platform of the device used to run the speed test.<br>Alternatives: **Android or iOS**.|
| `connectionType` | Type of the network used to run the speed test.<br>Alternatives: **WIFI or CELLULAR**.<br>Same as *network_type* from *speed_test* in **BMT**.|
| `connectionInfo` | Information about the network used to run the speed test.|
| `rssi` | Received Signal Strength Indicator of the network used to run the speed test.<br>Same as *rssi* from *connection_data* in **BMT**.|

### timestamp
| Field | Description |
| --- | --- |
| `timestamp` | The time at which the speed test was performed.|