import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';
import 'package:client_mobile_app/core/utils/id_generator.dart';

class LocalStorage {
  late Box<bool> _preferencesBox;
  late Box<int> _backgroundModeSettingsBox;
  late Box<String> _deviceInfoBox;
  late Box<Map> _speedTestResultsBox;
  late Box<Map> _pendingSpeedTestResultsBox;
  late Box<List<int>> _pendingWifiTrackerResultsBox;

  static const String _preferencesBoxName = 'preferences';
  static const String _backgroundModeSettingsBoxName = 'background_mode_settings';
  static const String _deviceInfoBoxName = 'device_info';
  static const String _speedTestResultsBoxName = 'speed_test_results';
  static const String _pendingSpeedTestResultsBoxName = 'pending_speed_test_results';
  static const String _pendingWifiTrackerResultsBoxName = 'pending_wifi_tracker_results';

  static const String _preferencesFTUEMap = 'preferences_ftue_map';
  static const String _preferencesTermsAccepted = 'preferences_terms_accepted';
  static const String _preferencesEverAskedForLocationAllTime =
      'preferences_ever_asked_for_location_all_time';

  static const String _deviceInfoSessionId = 'device_info_session_id';

  static const String _backgroundModeSettingsFrequency = 'background_mode_settings_frequency';

  static const String _wifiTrackerFrequency = 'wifi_tracker_frequency';

  Future<void> setLocalStorage() async {
    WidgetsFlutterBinding.ensureInitialized();
    final directory = await getApplicationDocumentsDirectory();
    Hive.init(directory.path);
    await _openBoxes();
  }

  Future<void> _openBoxes() async {
    _deviceInfoBox = await Hive.openBox(_deviceInfoBoxName,
        compactionStrategy: (entries, deletedEntries) =>
            deletedEntries > _MAX_DEFAULT_DELETED_ENTRIES);
    _preferencesBox = await Hive.openBox(_preferencesBoxName,
        compactionStrategy: (entries, deletedEntries) =>
            deletedEntries > _MAX_DEFAULT_DELETED_ENTRIES);
    _speedTestResultsBox = await Hive.openBox(_speedTestResultsBoxName,
        compactionStrategy: (entries, deletedEntries) =>
            deletedEntries > _MAX_DEFAULT_DELETED_ENTRIES);
    _backgroundModeSettingsBox = await Hive.openBox(_backgroundModeSettingsBoxName,
        compactionStrategy: (entries, deletedEntries) =>
            deletedEntries > _MAX_DEFAULT_DELETED_ENTRIES);
    _pendingSpeedTestResultsBox = await Hive.openBox(_pendingSpeedTestResultsBoxName,
        compactionStrategy: (entries, deletedEntries) =>
            deletedEntries > _MAX_PENDING_SPEED_TEST_RESULTS_DELETED_ENTRIES);
    _pendingWifiTrackerResultsBox = await Hive.openBox(_pendingWifiTrackerResultsBoxName);
  }

  bool getFTUEMap() => _preferencesBox.get(_preferencesFTUEMap, defaultValue: true)!;

  bool getTerms() => _preferencesBox.get(_preferencesTermsAccepted, defaultValue: false)!;

  bool getEverAskedForLocationAllTime() =>
      _preferencesBox.get(_preferencesEverAskedForLocationAllTime, defaultValue: false)!;

  String getSessionId() {
    final sessionId = _deviceInfoBox.get(_deviceInfoSessionId);
    if (sessionId != null) {
      return sessionId;
    }

    final id = generateId();
    _deviceInfoBox.put(_deviceInfoSessionId, id);
    return id;
  }

  int getBackgroundModeFrequency() =>
      _backgroundModeSettingsBox.get(_backgroundModeSettingsFrequency, defaultValue: -1)!;

  List<Map> getSpeedTestResults() => _speedTestResultsBox.values.toList();

  Map<dynamic, Map<dynamic, dynamic>> getPendingSpeedTestResults() {
    return _pendingSpeedTestResultsBox.toMap();
  }

  Map<dynamic, List<int>> getPendingWifiTrackerResults() => _pendingWifiTrackerResultsBox.toMap();

  Future<void> setFTUEMap() async {
    const ftueMap = false;
    await _preferencesBox.put(_preferencesFTUEMap, ftueMap);
  }

  Future<void> setTerms() async {
    const termsAccepted = true;
    await _preferencesBox.put(_preferencesTermsAccepted, termsAccepted);
  }

  Future<void> setEverAskedForLocationAllTime() async {
    const everAskedForLocationAllTime = true;
    await _preferencesBox.put(_preferencesEverAskedForLocationAllTime, everAskedForLocationAllTime);
  }

  Future<void> addSpeedTestResult(Map<String, dynamic> speedTestResult) async {
    await _speedTestResultsBox.add(speedTestResult);
  }

  Future<void> setBackgroundModeFrequency(int frequency) async {
    await _backgroundModeSettingsBox.put(_backgroundModeSettingsFrequency, frequency);
  }

  Future<void> addPendingSpeedTestResult(Map<String, dynamic> speedTestResult) async {
    await _pendingSpeedTestResultsBox.add(speedTestResult);
  }

  Future<void> addPendingWifiTrackerResult(List<int> wifiTrackerResult) async {
    await _pendingWifiTrackerResultsBox.add(wifiTrackerResult);
  }

  Future<void> removePendingSpeedTestResult(dynamic key) async {
    await _pendingSpeedTestResultsBox.delete(key);
  }

  Future<void> removePendingWifiTrackerResult(dynamic key) async {
    await _pendingWifiTrackerResultsBox.delete(key);
  }

  Future<void> setWifiTrackerFrequency(int frequency) async {
    await _backgroundModeSettingsBox.put(_wifiTrackerFrequency, frequency);
  }

  int getWifiTrackerFrequency() =>
      _backgroundModeSettingsBox.get(_wifiTrackerFrequency, defaultValue: -1)!;

  static const int _MAX_PENDING_SPEED_TEST_RESULTS_DELETED_ENTRIES = 10;
  static const int _MAX_DEFAULT_DELETED_ENTRIES = 1;
}
