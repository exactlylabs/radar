class RestClient {
  RestClient({required String baseUrl}) : _baseUrl = baseUrl;

  // Add here the getters for the different services:
  String get speedTest => _combineUrl(_speedTest);

  String get suggestedLocations => _combineUrl(_suggestedLocations);

  String get locationByCoordinates => _combineUrl(_locationByCoordinates);

  String get userCoordinates => _combineUrl(_userCoordinates);

  String get baseUrl => _baseUrl;

  String get ws {
    String url = _baseUrl;
    final http = RegExp(r'^http://');
    final https = RegExp(r'^https://');
    if (http.hasMatch(url)) {
      url = url.replaceFirst(http, 'ws://');
    } else if (https.hasMatch(url)) {
      url = url.replaceFirst(https, 'wss://');
    }
    return '$url$_ws';
  }

  String _combineUrl(String url) {
    return _baseUrl + url;
  }

  // Add here the paths for the different services:
  static const String _speedTest = '/client_api/v1/speed_tests?client_id=$_CLIENT_ID&mobile=true';

  static const String _suggestedLocations = '/client_api/v1/suggestions';

  static const String _locationByCoordinates = '/client_api/v1/coordinates';

  static const String _userCoordinates = '/client_api/v1/user_coordinates';

  static const String _ws = '/client_api/v1/ws';

  final String _baseUrl;

  static const int _CLIENT_ID = 1;
}
