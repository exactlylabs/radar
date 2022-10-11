import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class PlatformPage extends Page {
  final Widget child;
  final String path;
  final String? title;
  final bool? animateTransition;
  final bool fullScreenDialog;

  PlatformPage(
    this.child,
    this.path, {
    this.title,
    this.animateTransition,
    this.fullScreenDialog = false,
  }) : super(key: ValueKey(path));

  @override
  Route createRoute(BuildContext context) {
    if (animateTransition == false) {
      return PageRouteBuilder(settings: this, pageBuilder: (context, animation, animation2) => child);
    }
    if (kIsWeb || Platform.isAndroid) {
      return MaterialPageRoute(
        builder: (_) => child,
        settings: this,
        fullscreenDialog: fullScreenDialog,
      );
    }
    return CupertinoPageRoute(
      builder: (_) => child,
      settings: this,
      fullscreenDialog: fullScreenDialog,
      title: title,
    );
  }
}
