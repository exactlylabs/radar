import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

class LocalStorage {
  late Box<bool> _preferencesBox;
  late Box<int> _backgroundModeSettingsBox;
  late Box<String> _deviceInfoBox;
  late Box<Map> _speedTestResultsBox;
  late Box<Map> _pendingSpeedTestResultsBox;

  static const String _preferencesBoxName = 'preferences';
  static const String _backgroundModeSettingsBoxName = 'background_mode_settings';
  static const String _deviceInfoBoxName = 'device_info';
  static const String _speedTestResultsBoxName = 'speed_test_results';
  static const String _pendingSpeedTestResultsBoxName = 'pending_speed_test_results';

  static const String _preferencesFTUEMap = 'preferences_ftue_map';
  static const String _preferencesTermsAccepted = 'preferences_terms_accepted';
  static const String _preferencesEverAskedForLocationAllTime =
      'preferences_ever_asked_for_location_all_time';

  static const String _deviceInfoSessionId = 'device_info_session_id';

  static const String _backgroundModeSettingsFrequency = 'background_mode_settings_frequency';

  Future<void> setLocalStorage() async {
    final directory = await getApplicationDocumentsDirectory();
    Hive.init(directory.path);
    await _openBoxes();
  }

  Future<void> _openBoxes() async {
    _deviceInfoBox = await Hive.openBox(_deviceInfoBoxName);
    _preferencesBox = await Hive.openBox(_preferencesBoxName);
    _speedTestResultsBox = await Hive.openBox(_speedTestResultsBoxName);
    _backgroundModeSettingsBox = await Hive.openBox(_backgroundModeSettingsBoxName);
    _pendingSpeedTestResultsBox = await Hive.openBox(_pendingSpeedTestResultsBoxName);
  }

  bool getFTUEMap() => _preferencesBox.get(_preferencesFTUEMap, defaultValue: true)!;

  bool getTerms() => _preferencesBox.get(_preferencesTermsAccepted, defaultValue: false)!;

  bool getEverAskedForLocationAllTime() =>
      _preferencesBox.get(_preferencesEverAskedForLocationAllTime, defaultValue: false)!;
  String? getSessionId() => _deviceInfoBox.get(_deviceInfoSessionId);

  int getBackgroundModeFrequency() =>
      _backgroundModeSettingsBox.get(_backgroundModeSettingsFrequency, defaultValue: -1)!;

  List<Map> getSpeedTestResults() => _speedTestResultsBox.values.toList();

  Map<dynamic, Map<dynamic, dynamic>> getPendingSpeedTestResults() {
    return _pendingSpeedTestResultsBox.toMap();
  }

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

  Future<void> setSessionId(String id) async {
    await _deviceInfoBox.put(_deviceInfoSessionId, id);
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

  Future<void> removePendingSpeedTestResult(dynamic key) async {
    await _pendingSpeedTestResultsBox.delete(key);
  }
}
