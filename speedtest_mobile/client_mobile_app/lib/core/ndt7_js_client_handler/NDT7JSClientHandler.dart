import 'dart:io';
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/ndt7_response.dart';
import 'package:ndt7_client/models/server_response.dart';
import 'package:ndt7_client/models/test_completed_event.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class NDT7JSClientHandler {
  static Set<JavascriptChannel> setJavascriptsChannels({
    required Function(String, String) onTestComplete,
    required Function(String, String) onTestMeasurement,
    required Function(String) onTestError,
  }) {
    return <JavascriptChannel>{
      JavascriptChannel(
          name: 'downloadComplete',
          onMessageReceived: (JavascriptMessage message) => onTestComplete('Download', message.message)),
      JavascriptChannel(
        name: 'downloadMeasurement',
        onMessageReceived: (JavascriptMessage message) => onTestMeasurement('Download', message.message),
      ),
      JavascriptChannel(
        name: 'uploadComplete',
        onMessageReceived: (JavascriptMessage message) => onTestComplete('Upload', message.message),
      ),
      JavascriptChannel(
        name: 'uploadMeasurement',
        onMessageReceived: (JavascriptMessage message) => onTestMeasurement('Upload', message.message),
      ),
      JavascriptChannel(
        name: 'error',
        onMessageReceived: (JavascriptMessage message) => onTestError(message.message),
      ),
    };
  }

  static Future<String> _loadFilesAndGetUri() async {
    String filePath = 'assets/files/client.html';
    String ndtJS = await rootBundle.loadString('assets/files/src/ndt7.min.js');
    String donwloadWorkerJS = await rootBundle.loadString('assets/files/src/ndt7-download-worker.min.js');
    String uploadWorkerJS = await rootBundle.loadString('assets/files/src/ndt7-upload-worker.min.js');
    String htmlText = await rootBundle.loadString(filePath);

    final tempDir = await getTemporaryDirectory();
    final htmlPath = join(tempDir.path, 'client.html');
    final jsPath = join(tempDir.path, 'ndt7.min.js');
    final downloadWorkerPath = join(tempDir.path, 'ndt7-download-worker.min.js');
    final uploadWorkerPath = join(tempDir.path, 'ndt7-upload-worker.min.js');

    File(htmlPath).writeAsStringSync(htmlText);
    File(jsPath).writeAsStringSync(ndtJS);
    File(downloadWorkerPath).writeAsStringSync(donwloadWorkerJS);
    File(uploadWorkerPath).writeAsStringSync(uploadWorkerJS);
    return Uri(scheme: 'file', path: htmlPath).toString();
  }

  static Future<void> launchClient(
      FlutterWebviewPlugin flutterWebViewPlugin, Set<JavascriptChannel> javascriptChannels) async {
    final headers = <String, String>{'Origin': 'https://ndt7.radar.app'};
    final url = await _loadFilesAndGetUri();
    try {
      await flutterWebViewPlugin.launch(
        url,
        headers: headers,
        javascriptChannels: javascriptChannels,
        mediaPlaybackRequiresUserGesture: false,
        clearCookies: true,
        clearCache: true,
        hidden: true,
        withZoom: true,
        withJavascript: true,
        withLocalUrl: true,
        allowFileURLs: true,
        localUrlScope: url.substring(0, url.lastIndexOf('/') + 1),
      );
    } catch (e) {
      await flutterWebViewPlugin.reloadUrl(url, headers: headers);
    }
  }

  static void onTestComplete(String testType, String testResult, Function(NDT7Response) parseResponse) {
    final result = jsonDecode(testResult) as Map<String, dynamic>;
    if (result.isNotEmpty) {
      NDT7Response testCompleteEvent = TestCompletedEvent.fromJson(testType, result);
      parseResponse(testCompleteEvent);
    }
  }

  static void onTestMeasurement(String testType, String testResult, Function(NDT7Response) parseResponse) {
    final result = jsonDecode(testResult) as Map<String, dynamic>;
    NDT7Response? ndt7Response;
    if (result['Source'] == 'server') {
      ndt7Response = ServerResponse.fromJson(testType, result);
    } else if (result['Source'] == 'client') {
      ndt7Response = ClientResponse.fromJson(testType, result);
    }
    if (ndt7Response != null) {
      parseResponse(ndt7Response);
    }
  }

  static void onTestError(String error, Function(String) parseError) {
    parseError(error);
  }
}
