import 'package:client_mobile_app/core/notifications/flutter_notifications.dart';

class FlutterNotificationsHanlder {
  FlutterNotificationsHanlder();

  Future<void> setup() async {
    await setupFlutterNotifications();
  }
}
