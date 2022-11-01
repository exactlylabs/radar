import 'package:flutter/material.dart';
import 'package:client_mobile_app/core/dependency_injection/dependency_injection.dart' as DI;

void mainCommon(String baseUrl) {
  WidgetsFlutterBinding.ensureInitialized();

  DI.registerDependencies(baseUrl);
}
