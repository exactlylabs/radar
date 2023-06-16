import 'package:sqflite/sqflite.dart';

class SQLiteLocalStorage {
  Database? _db;

  static const String _dbName = 'local_storage.db';
  static const int _dbVersion = 1;

  static const String _offlineReportsTableName = 'offline_reports';

  Future<void> openLocalStorage() async {
    _db = await openDatabase(
      _dbName,
      version: _dbVersion,
      onCreate: (Database db, int version) async {
        await _createOfflineReportsTable(db);
      },
    );
  }

  bool isLocalStorageOpen() {
    if (_db == null) {
      return false;
    }
    return _db!.isOpen;
  }

  Future<void> _createOfflineReportsTable(Database db) {
    return db.execute(
      '''
      CREATE TABLE IF NOT EXISTS $_offlineReportsTableName (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report TEXT
      )
    ''',
    );
  }

  Future<void> saveOfflineReport(String report) async {
    await _db!.insert(_offlineReportsTableName, {'report': report});
  }

  Future<List<Map<String, dynamic>>> getOfflineReports() async {
    return await _db!.query(_offlineReportsTableName);
  }

  Future<void> deleteOfflineReport(int id) async {
    await _db!.delete(
      _offlineReportsTableName,
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
