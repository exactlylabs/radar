import 'dart:math';

String generateId() {
  return String.fromCharCodes(
      Iterable.generate(10, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
}

final Random _rnd = Random();
const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
