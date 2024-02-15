import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
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
  Map<String, StreamController<dynamic>> requests = <String, StreamController<dynamic>>{};

  void open() {
    // TODO: Seperate concept of openning/closing from attempted opening/retry opening
    Uri connectEndpoint = _getConnectEndpoint(endpoint, accessToken);

    socket = WebSocketChannel.connect(connectEndpoint);
    socket!.stream
        .listen(_handleMessages, onError: _handleError, onDone: _handleError, cancelOnError: true);
  }

  void close() {
    pingTimer?.cancel();
    pingTimer = null;
    socket?.sink.close(_getClosure);
    socket = null;
    // TODO: throw for outstanding requests
  }

  void _handleMessages(dynamic event) {
    try {
      final wsMessage = WSMessage.fromBuffer(event);
      print(wsMessage.toString());
    } catch (e) {
      print("Failed to parse message:");
      print(event);
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
    // TODO: If no longer opened by public interface, shouldn't reopen
    _reopen();
  }

  bool isOpen() {
    return socket != null;
  }

  Future<dynamic> send(dynamic request) async {
    try {
      socket?.sink.add(request);
    } catch (e) {
      print(e);
    }
  }

  String _getEchoCode() {
    return String.fromCharCodes(
        Iterable.generate(10, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
  }

  Uri _getConnectEndpoint(Uri endpoint, String? accesToken) {
    if (accesToken == null) {
      return endpoint;
    }
    return Uri.parse("$endpoint?token=${Uri.encodeComponent(accessToken!)}");
  }

  Stream<dynamic> get events => _eventsController.stream.asBroadcastStream();

  int get _getClosure => kIsWeb ? status.normalClosure : status.goingAway;

  static final Random _rnd = Random();
  static const _MAXIMUM_SECONDS_TO_REOPEN = 60;
  static const _SOCKET_PING_INTERVAL = Duration(milliseconds: 7000);
  static const _SOCKET_MESSAGE_TIMOUT = Duration(milliseconds: 5000);
  static const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
}
