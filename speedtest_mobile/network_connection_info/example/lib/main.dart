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
  List<Map<String, dynamic>>? _info;
  final _networkConnectionInfoPlugin = NetworkConnectionInfo();

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initPlatformState() async {
    List<Map<String, dynamic>>? info;
    // Platform messages may fail, so we use a try/catch PlatformException.
    // We also handle the message potentially returning null.
    try {
      info = await _networkConnectionInfoPlugin.getWifiNetworkList();
    } catch (e) {
      info = null;
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {
      _info = info;
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
          child: ListView.builder(
            itemCount: _info?.length ?? 0,
            itemBuilder: (context, index) {
              final item = _info?[index];
              return ListTile(
                title: Text(item?['ssid'] ?? 'Unknown'),
                subtitle: Text(item?['bssid'] ?? 'Unknown'),
                trailing: Text(levelToHumanize(item?['level'])),
              );
            },
          ),
        ),
      ),
    );
  }

  String levelToHumanize(int? level) {
    if (level == null) {
      return 'Unknown';
    } else if (level <= -100) {
      return 'Very bad';
    } else if (level <= -80) {
      return 'Bad';
    } else if (level <= -70) {
      return 'Good';
    } else if (level <= -67) {
      return 'Very good';
    } else {
      return 'Excellent';
    }
  }
}
