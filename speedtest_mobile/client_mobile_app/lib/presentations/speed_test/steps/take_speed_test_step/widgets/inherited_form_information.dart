import 'package:flutter/material.dart';

class InheritedFormInformation extends InheritedWidget {
  const InheritedFormInformation({
    Key? key,
    required Widget child,
    this.networkType,
    this.networkPlace,
    this.address,
  }) : super(key: key, child: child);

  final String? networkType;
  final String? networkPlace;
  final String? address;

  static InheritedFormInformation of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<InheritedFormInformation>()!;
  }

  @override
  bool updateShouldNotify(covariant InheritedFormInformation oldWidget) {
    return networkPlace != oldWidget.networkPlace ||
        networkType != oldWidget.networkType ||
        address != oldWidget.address;
  }
}
