import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';
import 'package:flutter/material.dart';

class AppConfig extends InheritedWidget {
  const AppConfig({
    Key? key,
    required Widget child,
    required this.appName,
    required this.stringResource,
  }) : super(key: key, child: child);

  final String appName;
  final IStringResource stringResource;

  static AppConfig? of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<AppConfig>();

  @override
  bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
}
