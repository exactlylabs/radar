import 'dart:io';

import 'package:flutter/material.dart';
import 'dart:async';

import 'package:flutter/services.dart';
import 'package:ndt7_client/models/ndt7_response.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _ndt7ClientPlugin = Ndt7Client();

  @override
  void initState() {
    super.initState();
    initPlatformState();
  }

  // Platform messages are asynchronous, so we initialize in an async method.
  Future<void> initPlatformState() async {
    String platformVersion;
    // Platform messages may fail, so we use a try/catch PlatformException.
    // We also handle the message potentially returning null.
    try {
      // platformVersion = await _ndt7ClientPlugin.getPlatformVersion() ?? 'Unknown platform version';
      platformVersion = 'Unknown platform version';
      final dir = await _loadFilesAndGetUri();
      final result = await _ndt7ClientPlugin.startDownloadTest(dir);
    } on PlatformException {
      platformVersion = 'Failed to get platform version.';
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {});
  }

  static Future<String> _loadFilesAndGetUri() async {
    String filePath = 'assets/files/client.html';
    String ndtJS = await rootBundle.loadString('assets/files/src/ndt7.js');
    String donwloadWorkerJS = await rootBundle.loadString('assets/files/src/ndt7-download-worker.js');
    String uploadWorkerJS = await rootBundle.loadString('assets/files/src/ndt7-upload-worker.js');
    String htmlText = await rootBundle.loadString(filePath);

    final tempDir = await getTemporaryDirectory();
    final htmlPath = join(tempDir.path, 'client.html');
    final jsPath = join(tempDir.path, 'ndt7.js');
    final downloadWorkerPath = join(tempDir.path, 'ndt7-download-worker.js');
    final uploadWorkerPath = join(tempDir.path, 'ndt7-upload-worker.js');

    File(htmlPath).writeAsStringSync(htmlText);
    File(jsPath).writeAsStringSync(ndtJS);
    File(downloadWorkerPath).writeAsStringSync(donwloadWorkerJS);
    File(uploadWorkerPath).writeAsStringSync(uploadWorkerJS);
    return Uri(scheme: 'file', path: tempDir.path).toString();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Plugin example app'),
        ),
        body: Center(
            child: StreamBuilder<NDT7Response?>(
          stream: _ndt7ClientPlugin.data,
          builder: (context, snapshot) => Text(snapshot.data.toString()),
        )),
      ),
    );
  }
}
