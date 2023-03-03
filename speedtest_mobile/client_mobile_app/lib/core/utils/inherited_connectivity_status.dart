import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class InheritedConnectivityStatus extends InheritedWidget {
  InheritedConnectivityStatus({
    Key? key,
    required Widget child,
  }) : super(child: child, key: key) {
    _listenChangesOnConnectivityStatus();
  }

  @override
  bool updateShouldNotify(InheritedWidget oldWidget) => true;

  static InheritedConnectivityStatus of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<InheritedConnectivityStatus>()!;
  }

  void _listenChangesOnConnectivityStatus() {
    Connectivity().onConnectivityChanged.listen(
      (connectivity) {
        if (connectivity == ConnectivityResult.wifi ||
            connectivity == ConnectivityResult.mobile ||
            connectivity == ConnectivityResult.ethernet) {
          _isConnected = true;
        } else {
          _isConnected = false;
        }
      },
    );
  }

  bool _isConnected = false;

  bool get isConnected => _isConnected;
}
