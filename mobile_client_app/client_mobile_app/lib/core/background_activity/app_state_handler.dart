import 'package:flutter/material.dart';

class AppStateHandler with WidgetsBindingObserver {
  AppLifecycleState? appState;

  void initState() {
    WidgetsBinding.instance.addObserver(this);
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    appState = state;
  }
}
