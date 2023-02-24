import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

class LocalStorage {
  LocalStorage();

  late Box<List> _box;

  static const String boxName = 'local_storage';
  static const String resultsKey = 'RESULTS';
  static const String ftueMapKey = 'FTUE_MAP';
  static const String termsKey = 'TERMS';
  static const String backgroundSpeedTestKey = 'BACKGROUND_SPEED_TEST';

  Future<void> openLocalStorage() async {
    if (!Hive.isBoxOpen(boxName)) {
      final directory = await getApplicationDocumentsDirectory();
      Hive.init(directory.path);
    }
    _box = await Hive.openBox<List>(boxName);
  }

  Future<List<Map<String, dynamic>>> addResult(Map<String, dynamic> value) async {
    final results = getResults();
    final newResults = [value, ...results];
    await _box.put(resultsKey, newResults);
    return newResults;
  }

  List<Map<String, dynamic>> getResults() {
    List<dynamic> results = _box.get(resultsKey, defaultValue: [])!;
    return results.map((result) => Map<String, dynamic>.from(result)).toList();
  }

  bool getFTUEMap() {
    final ftue = _box.get(
      ftueMapKey,
      defaultValue: [
        {'value': true}
      ],
    )!;
    return ftue.first['value'] as bool;
  }

  Future<void> setFTUEMap() async {
    final ftue = [
      {'value': false}
    ];
    await _box.put(ftueMapKey, ftue);
  }

  bool getTerms() {
    final terms = _box.get(
      termsKey,
      defaultValue: [
        {'accepted': false}
      ],
    )!;
    return terms.first['accepted'] as bool;
  }

  Future<void> setTerms() async {
    final terms = [
      {'accepted': true}
    ];
    await _box.put(termsKey, terms);
  }

  int getBackgroundSpeedTestDelay() {
    final value = _box.get(
      backgroundSpeedTestKey,
      defaultValue: [
        {'delay': -1}
      ],
    )!;
    return value.first['delay'] as int;
  }

  Future<void> setBackgroundSpeedTestDelay(int delay) async {
    final value = [
      {'delay': delay}
    ];
    await _box.put(backgroundSpeedTestKey, value);
  }

  bool isLocalStorageOpen() {
    return Hive.isBoxOpen(boxName);
  }
}
