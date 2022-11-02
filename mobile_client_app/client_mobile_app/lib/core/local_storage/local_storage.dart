import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

class LocalStorage {
  LocalStorage() {
    _openBox();
  }

  late LazyBox<List<Map<String, dynamic>>> _box;

  static const String resultsKey = 'RESULTS';
  static const String ftueMapKey = 'FTUE_MAP';

  Future<void> _openBox() async {
    if (!Hive.isBoxOpen('local_storage')) {
      final directory = await getApplicationDocumentsDirectory();
      Hive.init(directory.path);
    }
    _box = await Hive.openLazyBox<List<Map<String, dynamic>>>('local_storage');
  }

  Future<List<Map<String, dynamic>>> addResult(Map<String, dynamic> value) async {
    final results = await getResults();
    final newResults = [value, ...results];
    await _box.put(resultsKey, newResults);
    return newResults;
  }

  Future<List<Map<String, dynamic>>> getResults() async {
    final results = await _box.get(resultsKey, defaultValue: <Map<String, dynamic>>[]);
    return results!;
  }

  Future<bool> getFTUEMap() async {
    final List<Map<String, dynamic>>? ftue = await _box.get(ftueMapKey, defaultValue: [
      {'value': true}
    ]);
    return ftue!.first['value'] as bool;
  }

  Future<void> setFTUEMap() async {
    final ftue = [
      {'value': false}
    ];
    await _box.put(ftueMapKey, ftue);
  }
}
