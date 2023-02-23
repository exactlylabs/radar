import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:client_mobile_app/core/background_activity/background_fetch_handler.dart';
import 'package:client_mobile_app/core/dependency_injection/dependency_injection.dart' as DI;

void mainCommon(String baseUrl) {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  DI.registerDependencies(baseUrl);

  BackgroundFetchHandler.registerBackgroundSpeedTestTask();
  BackgroundFetchHandler.setBackgroundFetchPlugin();
}
