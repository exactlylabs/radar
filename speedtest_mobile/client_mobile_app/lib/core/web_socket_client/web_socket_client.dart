import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:client_mobile_app/core/ws_mobile_messages/ws_mobile_messages.pbserver.dart';

class WebSocketClient {
  WebSocketClient(this.endpoint, [this.accessToken]) : reopens = 0;

  final Uri endpoint;
  final StreamController<dynamic> _eventsController = StreamController<dynamic>.broadcast();

  int reopens;
  Timer? pingTimer;
  Timer? pendingReopen;
  String? accessToken;
  WebSocketChannel? socket;
  bool isConnected = false;
  bool reconnect = false;
  Map<String, StreamController<dynamic>> requests = <String, StreamController<dynamic>>{};

  Future<void> open({bool reconnect = false}) async {
    Uri connectEndpoint = _getConnectEndpoint(endpoint, accessToken);
    this.reconnect = reconnect;

    try {
      socket = WebSocketChannel.connect(connectEndpoint);
      await socket!.ready;
      isConnected = true;
      socket!.stream.listen(_handleMessages, onError: _handleError, onDone: _handleError);
    } catch (exception, stackTrace) {
      isConnected = false;
      Sentry.captureException(exception, stackTrace: stackTrace);
    }
  }

  void close() {
    pingTimer?.cancel();
    pingTimer = null;
    socket?.sink.close(_getClosure);
    socket = null;
  }

  void _handleMessages(dynamic event) {
    try {
      final wsMessage = WSMessage.fromBuffer(event);
      print(wsMessage.toString());
    } catch (e) {
      Sentry.captureException(e);
    }
  }

  void _reopen() {
    if (pendingReopen != null) {
      return;
    }

    final timeToNextReopen = Duration(seconds: min(reopens * 2, _MAXIMUM_SECONDS_TO_REOPEN));
    reopens += 1;
    pendingReopen = Timer(timeToNextReopen, () {
      close();
      open();
      pendingReopen = null;
    });
  }

  void _handleError([dynamic err]) {
    isConnected = false;
    if (reconnect) {
      _reopen();
    }
  }

  bool isOpen() {
    return isConnected;
  }

  bool send(dynamic request) {
    if (!isOpen()) {
      return false;
    }
    try {
      socket?.sink.add(request);
      return true;
    } catch (e) {
      Sentry.captureException(e);
      return false;
    }
  }

  String _getEchoCode() {
    return String.fromCharCodes(
        Iterable.generate(10, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
  }

  Uri _getConnectEndpoint(Uri endpoint, String? accessToken) {
    if (accessToken == null) {
      return endpoint;
    }
    return Uri.parse("$endpoint?token=${Uri.encodeComponent(accessToken)}");
  }

  Stream<dynamic> get events => _eventsController.stream.asBroadcastStream();

  int get _getClosure => kIsWeb ? status.normalClosure : status.goingAway;

  static final Random _rnd = Random();
  static const _MAXIMUM_SECONDS_TO_REOPEN = 60;
  static const _SOCKET_PING_INTERVAL = Duration(milliseconds: 7000);
  static const _SOCKET_MESSAGE_TIMOUT = Duration(milliseconds: 5000);
  static const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
}
