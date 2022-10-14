import 'package:hive/hive.dart';

class LocalStorage {
  LocalStorage() : _box = Hive.box('local_storage');

  final Box<List<Map<String, dynamic>>> _box;

  static const String resultsKey = 'RESULTS';

  Future<void> addResult(Map<String, dynamic> value) async {
    try {
      final results = _box.get(resultsKey, defaultValue: <Map<String, dynamic>>[]);
      return _box.put(resultsKey, [...results!, value]);
    } catch (exception, stackTrace) {
      print(exception);
      print(stackTrace);
    }
  }

  Future<List<Map<String, dynamic>>> getResults() async {
    try {
      return _box.get(resultsKey, defaultValue: <Map<String, dynamic>>[])!;
    } catch (exception, stackTrace) {
      print(exception);
      print(stackTrace);
      return <Map<String, dynamic>>[];
    }
  }
}
