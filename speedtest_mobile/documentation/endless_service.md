## Endless Service (Android only)
Endless Service is an android foreground service that allows you to run a service in the background indefinitely. This service is useful when you need to run a service that should not be interrupted by the system, even when the app is closed or killed. <br>
This service uses the `PowerManager` and `WifiManager` to keep the device awake and connected to the internet. This service may drain the battery faster than usual, so use it wisely. <br>

### How this service works
In this first version of the service, the service will run indefinitely, and it will not be stopped by the system. The service will run in the foreground, and it will show a notification to the user explaining that the service is running. The `callback` will be called to set up all the dependencies needed by the dart side. <br>
The Endless Service works with a dart side client that the service will communicate with everytime the `frequency` is reached. There are four methods the service will use to communicate with the dart side:
- `onStart`: This method will be called when the service is started.
- `onDestroy`: This method will be called when the service is stopped.
- `onError`: This method will be called when an error occurs.
- `onAction`: This method will be called when the service reaches the `frequency` and the dart side should do something.

On the dart side, you will need to override the `Listener` class and implement the methods described above.

### Permissions required
- `android.permission.WAKE_LOCK`.
- `android.permission.USE_EXACT_ALARM`.
- `android.permission.FOREGROUND_SERVICE`.
- `android.permission.POST_NOTIFICATIONS`.
- `android.permission.SCHEDULE_EXACT_ALARM`.
- `android.permission.RECEIVE_BOOT_COMPLETED`.

### Setting up the service
When the service is started, it expects a `Map<String, Any?>` with the following fields:
``` kotlin
{
    "frequency": Long,
    "force_handler": Boolean,
    "wifi_lock": Boolean,
    "callback_handle": Long,

    "notification_id": Int,
    "notification_channel_id": String,
    "notification_channel_name": String,
    "notification_channel_description": String,
    "notification_channel_importance": Int,
    "notification_priority": Int,
    "notification_title": String,
    "notification_content": String,
    "notification_enable_vibration": Boolean,
    "notification_play_sound": Boolean,
    "notification_show_when": Boolean,
    "notification_is_sticky": Boolean,
    "notification_visibility": Int,
    "notification_icon_data": Map<String, Any?>,
    "notification_buttons": List<Map<String, Any?>>?,
}
```
Here are some clarifications about the fields:
- **notification_icon_data**: This field is a `Map<String, Any?>` that contains the data of the notification icon. The fields contained in this Map are:
    ``` kotlin
    {
        "notification_icon_res_type": String,
        "notification_icon_res_prefix": String,
        "notification_icon_name": String,
        "notification_icon_background_color": Int,
    }
    ```
- **notification_buttons**: This field is a `List<Map<String, Any?>>` that contains the data of the notification buttons. The fields contained in this Map are:
    ``` kotlin
    [
        {
            "notification_button_id": Int,
            "notification_button_text": String,
            "notification_button_text_color": Int,
        }
    ]
    ```

### Methods available

- `start(config)`: This method starts the service with the given configuration.
    * Parameters:
        - **config**: `Map<String, Any?>` - The configuration of the service as described above.
    * Returns: `Boolean` - Returns `true` if the service was started successfully, `false` otherwise.

- `stop()`: This method stops the service.
    * Returns: `Boolean` - Returns `true` if the service was stopped successfully, `false` otherwise.

- `isRunning()`: This method checks if the service is running.
