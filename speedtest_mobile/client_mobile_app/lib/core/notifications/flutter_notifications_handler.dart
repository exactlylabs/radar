import 'dart:math';

import 'package:client/core/local_storage/local_storage.dart';
import 'package:client/core/rest_client/rest_client.dart';
import 'package:client/firebase_options.dart';
import 'package:client_mobile_app/core/notifications/flutter_notifications.dart';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FlutterNotificationsHanlder {
  FlutterNotificationsHanlder({
    required LocalStorage localStorage,
    required RestClient restClient,
  })  : _localStorage = localStorage,
        _restClient = restClient,
        _dio = Dio();

  final Dio _dio;
  final RestClient _restClient;
  final LocalStorage _localStorage;

  Future<void> setup() async {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    await setupFlutterNotifications();
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
    FirebaseMessaging.onMessage.listen(showRemoteFlutterNotification);

    if (!_localStorage.isLocalStorageOpen()) {
      await _localStorage.openLocalStorage();
    }

    final hasToken = await _localStorage.isFirebaseTokenPersisted();
    if (!hasToken) {
      final token = await FirebaseMessaging.instance.getToken();
      await _onNewToken(token);
    }
    FirebaseMessaging.instance.onTokenRefresh.listen(_onNewToken);
  }

  Future<void> _onNewToken(String? token) async {
    // final phoneId = await _getPhoneId();
    // await _dio.post(
    //   _restClient.sendFCMTokenUrl,
    //   data: {
    //     'phone_id': phoneId,
    //     'token': token,
    //   },
    // );
  }

  // Future<String> _getPhoneId() async {
  //   final phoneId = await _localStorage.getPhoneId();
  //   if (phoneId != null) {
  //     return phoneId;
  //   }
  //   // Random phoneId String
  //   final newPhoneId = _generatePhoneId();
  //   await _localStorage.setPhoneId(newPhoneId);
  //   return newPhoneId;
  // }

  String _generatePhoneId() {
    return String.fromCharCodes(
        Iterable.generate(10, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
  }

  static final Random _rnd = Random();
  static const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
}
