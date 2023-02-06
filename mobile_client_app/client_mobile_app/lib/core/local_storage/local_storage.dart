import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

class LocalStorage {
  LocalStorage() {
    _openBox();
  }

  late Box<List> _box;

  static const String resultsKey = 'RESULTS';
  static const String ftueMapKey = 'FTUE_MAP';
  static const String ftueAppKey = 'FTUE_APP';

  Future<void> _openBox() async {
    if (!Hive.isBoxOpen('local_storage')) {
      final directory = await getApplicationDocumentsDirectory();
      Hive.init(directory.path);
    }
    _box = await Hive.openBox<List>('local_storage');
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
    final ftue = _box.get(ftueMapKey, defaultValue: [
      {'value': true}
    ])!;
    return ftue.first['value'] as bool;
  }

  Future<void> setFTUEMap() async {
    final ftue = [
      {'value': false}
    ];
    await _box.put(ftueMapKey, ftue);
  }

  bool getFTUEApp() {
    final ftue = _box.get(ftueAppKey, defaultValue: [
      {'value': true}
    ])!;
    return ftue.first['value'] as bool;
  }

  Future<void> setFTUEApp() async {
    final ftue = [
      {'value': false}
    ];
    await _box.put(ftueAppKey, ftue);
  }
}
