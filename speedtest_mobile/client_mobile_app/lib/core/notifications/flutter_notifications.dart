import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Create a [AndroidNotificationChannel] for heads up notifications
late AndroidNotificationChannel channel;

/// Initialize the [FlutterLocalNotificationsPlugin] package.
late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;

bool isFlutterLocalNotificationsInitialized = false;

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler() async {
  await setupFlutterNotifications();
}

Future<void> setupFlutterNotifications() async {
  if (isFlutterLocalNotificationsInitialized) {
    return;
  }
  channel = const AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'This channel is used for important notifications.',
    importance: Importance.max,
  );

  flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);
}

void showLocalFlutterNotification(int id, String? title, String? body) {
  flutterLocalNotificationsPlugin.show(
    id,
    title,
    body,
    NotificationDetails(
      android: AndroidNotificationDetails(
        channel.id,
        channel.name,
        channelDescription: channel.description,
        icon: '@drawable/ic_notification',
        ongoing: true,
        enableVibration: false,
        priority: Priority.high,
        autoCancel: false,
      ),
    ),
  );
}

Future<void> cancelLocalFlutterNotification(int id) async {
  await flutterLocalNotificationsPlugin.cancel(id);
}
