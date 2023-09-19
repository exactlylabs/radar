import 'dart:async';

import 'package:endless_service/endless_service.dart';

class EndlessServiceHandler {
  EndlessServiceHandler({
    required EndlessService endlessService,
  }) : _endlessService = endlessService;

  final EndlessService _endlessService;

  StreamSubscription? _subscription;
  Function? _onAction;
  Function(String)? _onLog;
  Function(String)? _onError;

  static const _MIN_TO_MILLIS = 60 * 1000;

  Future<void> configure({
    int frequency = 10 * _MIN_TO_MILLIS,
    Function? onAction,
    Function(String)? onLog,
    Function(String)? onFailure,
  }) async {
    _onLog = onLog;
    _onError = onFailure;
    _onAction = onAction;

    if (_subscription != null) {
      await _subscription!.cancel();
      _subscription = null;
    }
    _subscription = _endlessService.listener.listen((event) {
      final parsedEvent = _parseEvents(Map<String, String>.from(event));
      if (parsedEvent == null) return;
      final type = parsedEvent.type;
      final content = parsedEvent.content;
      switch (type) {
        case 'ACTION':
          if (_onAction != null) _onAction!();
          break;
        case 'LOG':
          if (_onLog != null) _onLog!(content);
          break;
        case 'ERROR':
          if (_onError != null) _onError!(content);
          break;
      }
    });

    final isConfigured = await _endlessService.setupEndlessService(frequency);
    if (!isConfigured) {
      _onError?.call('Something went wrong while configuring the endless service');
    } else {
      _onLog?.call('Endless service configured successfully');
    }
  }

  Future<void> start() async {
    final isStarted = await _endlessService.startEndlessService();
    if (!isStarted) {
      _onError?.call('Something went wrong while starting the endless service');
    } else {
      _onLog?.call('Endless service started successfully');
    }
  }

  Future<void> stop() async {
    final isStopped = await _endlessService.stopEndlessService();
    if (!isStopped) {
      _onError?.call('Something went wrong while stopping the endless service');
    } else {
      _onLog?.call('Endless service stopped successfully');
    }
  }

  ({String type, String content})? _parseEvents(Map<String, String> event) {
    if (!event.containsKey('type') || !event.containsKey('content')) return null;
    final type = event['type'] as String;
    final content = event['content'] as String;
    return (type: type, content: content);
  }

  Future<void> close() async {
    _subscription?.cancel();
  }
}
