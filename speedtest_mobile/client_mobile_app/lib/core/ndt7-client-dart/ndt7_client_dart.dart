import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'dart:isolate';
import 'dart:math';
import 'dart:typed_data';
import 'package:http/http.dart' as http;

// Upload

// 1MB
const MaxUploadSize = 1 << 20;
// 8KB
const InitUploadSize = 1 << 13;

var bytesSoFar = 0;
var lastMessageSize = InitUploadSize;
Uint8List randomMessage = Uint8List(MaxUploadSize);

const protocols = ['net.measurementlab.ndt.v7'];

var clientMeasurement = <String, dynamic>{};
var serverMeasurement = <String, dynamic>{};

Map<String, dynamic> _getIsolateMessage(String msgType, dynamic data) {
  return {
    'MsgType': msgType,
    'Data': data,
  };
}

Map<String, dynamic> _getClientMeasurement(int elapsedTime, int numBytes, String type) {
  final meanMbps = (numBytes * 8 / 1000) / elapsedTime;
  clientMeasurement = {
    'ElapsedTime': elapsedTime,
    'NumBytes': numBytes,
    'MeanClientMbps': meanMbps,
  };
  return {
    'Source': 'client',
    'Data': clientMeasurement,
    'type': type,
  };
}

Map<String, dynamic> _getServerMeasurement(String measurement, String type) {
  serverMeasurement = jsonDecode(measurement) as Map<String, dynamic>;
  return {
    'Source': 'server',
    'Data': serverMeasurement,
    'type': type,
  };
}

Map<String, dynamic> _getLastMeasurements(String type) {
  return {
    'LastClientMeasurement': clientMeasurement,
    'LastServerMeasurement': serverMeasurement,
    'type': type,
  };
}

Map<String, dynamic> _getError(error) {
  return {
    'Error': error.runtimeType,
  };
}

Stream<Uint8List> _uploadMessageStream(DateTime startTime, Function(Object?) send) async* {
  var rand = Random();
  for (var i = 0; i < MaxUploadSize; i++) {
    randomMessage[i] = rand.nextInt(256);
  }

  while (true) {
    if (lastMessageSize >= MaxUploadSize || lastMessageSize >= (bytesSoFar / 16)) {
      bytesSoFar += lastMessageSize;
      yield randomMessage.sublist(0, lastMessageSize);
    } else {
      var nextMessageSize = lastMessageSize * 2;
      lastMessageSize = nextMessageSize;
      bytesSoFar += nextMessageSize;
      yield randomMessage.sublist(0, nextMessageSize);
    }

    final numBytes = bytesSoFar - lastMessageSize;
    final elapsedTime = DateTime.now().difference(startTime).inMilliseconds;
    final measurement = _getClientMeasurement(elapsedTime, numBytes, 'upload');
    send(measurement);
  }
}

void _runUploadIsolate(List<dynamic> args) async {
  final sendPort = args[0] as SendPort;
  final url = args[1] as String;
  final completer = Completer<void>();
  final socket = await WebSocket.connect(url, protocols: protocols);
  DateTime startTime = DateTime.now();

  socket.listen(
    (ev) {
      if (ev is String) {
        final measurement = _getServerMeasurement(ev, 'upload');
        sendPort.send(_getIsolateMessage('onMeasurement', measurement));
      }
    },
    onDone: () {
      final lastMeasurements = _getLastMeasurements('upload');
      sendPort.send(_getIsolateMessage('onCompleted', lastMeasurements));
      completer.complete();
    },
    onError: (ev) {
      final error = _getError(ev);
      sendPort.send(_getIsolateMessage('onError', error));
      completer.completeError(ev);
    },
    cancelOnError: false,
  );

  var stream = _uploadMessageStream(startTime, (message) => sendPort.send(message));
  socket.addStream(stream);
  return completer.future;
}

Future<void> _upload(
  String url, {
  Function(Map<String, dynamic>)? onMeasurement,
  Function(Map<String, dynamic>)? onCompleted,
  Function(Map<String, dynamic>)? onError,
}) async {
  final completer = Completer();
  final receivePort = ReceivePort();

  final isolate =
      await Isolate.spawn<List<dynamic>>(_runUploadIsolate, [receivePort.sendPort, url], debugName: 'UploadIsolate');
  receivePort.listen(
    (data) {
      if (data is Map<String, dynamic>) {
        if (data['MsgType'] == 'onMeasurement') {
          if (onMeasurement != null) onMeasurement(data['Data']);
        } else if (data['MsgType'] == 'onCompleted') {
          if (onCompleted != null) onCompleted(data['Data']);
          receivePort.close();
          isolate.kill(priority: Isolate.immediate);
          completer.complete();
        } else if (data['MsgType'] == 'onError') {
          if (onError != null) onError(data['Data']);
          receivePort.close();
          isolate.kill(priority: Isolate.immediate);
          completer.complete();
        }
      }
    },
  );
  return completer.future;
}

// Download
Future<void> _download(
  String url, {
  Function(Map<String, dynamic>)? onMeasurement,
  Function(Map<String, dynamic>)? onCompleted,
  Function(Map<String, dynamic>)? onError,
}) async {
  final completer = Completer();
  final receivePort = ReceivePort();

  final isolate = await Isolate.spawn<List<dynamic>>(_runDownloadIsolate, [receivePort.sendPort, url],
      debugName: 'DownloadIsolate');
  receivePort.listen(
    (data) {
      if (data is Map<String, dynamic>) {
        if (data['MsgType'] == 'onMeasurement') {
          if (onMeasurement != null) onMeasurement(data['Data']);
        } else if (data['MsgType'] == 'onCompleted') {
          if (onCompleted != null) onCompleted(data['Data']);
          receivePort.close();
          isolate.kill(priority: Isolate.immediate);
          completer.complete();
        } else if (data['MsgType'] == 'onError') {
          if (onError != null) onError(data['Data']);
          receivePort.close();
          isolate.kill(priority: Isolate.immediate);
          completer.complete();
        }
      }
    },
  );
  return completer.future;
}

void _runDownloadIsolate(List<dynamic> args) async {
  final sendPort = args[0] as SendPort;
  final url = args[1] as String;

  var startTime = DateTime.now();
  var previousTime = startTime;
  var total = 0;

  final socket = await WebSocket.connect(url, protocols: protocols);
  socket.listen(
    (ev) {
      if (ev is Uint8List) {
        total += ev.length;
        var now = DateTime.now();
        const every = 2000; //ms
        if (now.difference(previousTime).inMilliseconds > every) {
          // previousTime = now;
          final elapsedTime = now.difference(startTime).inMilliseconds;
          final measurement = _getClientMeasurement(elapsedTime, total, 'download');
          sendPort.send(_getIsolateMessage('onMeasurement', measurement));
        }
      } else if (ev is String) {
        var now = DateTime.now();
        const every = 2000; //ms
        if (now.difference(previousTime).inMilliseconds > every) {
          previousTime = now;
          final measurement = _getServerMeasurement(ev, 'download');
          sendPort.send(_getIsolateMessage('onMeasurement', measurement));
        }
      }
    },
    onDone: () {
      final lastMeasurements = _getLastMeasurements('download');
      sendPort.send(_getIsolateMessage('onCompleted', lastMeasurements));
    },
    onError: (ev) {
      final error = _getError(ev);
      sendPort.send(_getIsolateMessage('onError', error));
    },
    cancelOnError: false,
  );
}

Future<List<String>?> _discoverServerURLs(Map<String, String> config) async {
  final queryParameters = {
    'client_name': 'dart-client',
    'client_library_name': 'ndt7-dart',
    'client_library_version': '0.0.1',
  };

  final protocol = config['protocol'] ?? 'wss';
  final url = Uri.https('locate.measurementlab.net', '/v2/nearest/ndt/ndt7', queryParameters);

  try {
    final response = await http.get(url);
    final body = jsonDecode(response.body);
    final downloadUrl = body['results'][0]['urls']['$protocol:///ndt/v7/download'];
    final uploadUrl = body['results'][0]['urls']['$protocol:///ndt/v7/upload'];
    return [downloadUrl, uploadUrl];
  } catch (exception) {
    //HANDLE EXCEPTION
    return null;
  }
}

Future<void> test({
  Map<String, String>? config,
  Function(Map<String, dynamic>)? onMeasurement,
  Function(Map<String, dynamic>)? onCompleted,
  Function(Map<String, dynamic>)? onError,
}) async {
  var results = await _discoverServerURLs(config ?? {});
  if (results == null) {
    // use onError callback
    return;
  }

  final downloadUrl = results[0];
  final uploadUrl = results[1];
  await _download(
    downloadUrl,
    onMeasurement: onMeasurement,
    onCompleted: onCompleted,
    onError: onError,
  );
  await _upload(
    uploadUrl,
    onMeasurement: onMeasurement,
    onCompleted: onCompleted,
    onError: onError,
  );
}
