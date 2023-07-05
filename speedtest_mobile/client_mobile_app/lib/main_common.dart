import 'package:get_it/get_it.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/notifications/flutter_notifications_handler.dart';
import 'package:client_mobile_app/core/dependency_injection/dependency_injection.dart' as DI;

Future<void> mainCommon(String baseUrl) async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  DI.registerDependencies(baseUrl);
  await GetIt.I<LocalStorage>().setLocalStorage();
  await GetIt.I<FlutterNotificationsHanlder>().setup();
}
