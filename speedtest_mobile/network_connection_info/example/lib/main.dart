import 'package:flutter/material.dart';
import 'dart:async';

import 'package:network_connection_info/models/connection_info.dart';
import 'package:network_connection_info/network_connection_info.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ConnectionInfo? _platformVersion;
  final _networkConnectionInfoPlugin = NetworkConnectionInfo();

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initPlatformState() async {
    ConnectionInfo? platformVersion;
    // Platform messages may fail, so we use a try/catch PlatformException.
    // We also handle the message potentially returning null.
    try {
      platformVersion = await _networkConnectionInfoPlugin.getNetworkConnectionInfo();
    } catch (e) {
      platformVersion = null;
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {
      _platformVersion = platformVersion;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Center(
          child: Text('Running on: ${_platformVersion?.rssi}\n'),
        ),
      ),
    );
  }
}
