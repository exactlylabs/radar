import 'package:hive/hive.dart';

class LocalStorage {
  LocalStorage() : _box = Hive.box('local_storage');

  final Box<List<Map<String, dynamic>>> _box;

  static const String resultsKey = 'RESULTS';

  Future<List<Map<String, dynamic>>> addResult(Map<String, dynamic> value) async {
    final results = _box.get(resultsKey, defaultValue: <Map<String, dynamic>>[]);
    final newResults = [...results!, value];
    await _box.put(resultsKey, newResults);
    return newResults;
  }

  List<Map<String, dynamic>> getResults() {
    return _box.get(resultsKey, defaultValue: <Map<String, dynamic>>[])!;
  }
}
