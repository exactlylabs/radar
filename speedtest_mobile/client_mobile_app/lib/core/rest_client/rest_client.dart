class RestClient {
  RestClient({required String baseUrl}) : _baseUrl = baseUrl;

  // Add here the getters for the different services:
  String get speedTest => _combineUrl(_speedTest);

  String get suggestedLocations => _combineUrl(_suggestedLocations);

  String get locationByCoordinates => _combineUrl(_locationByCoordinates);

  String get userCoordinates => _combineUrl(_userCoordinates);

  String get baseUrl => _baseUrl;

  String _combineUrl(String url) {
    return _baseUrl + url;
  }

  // Add here the paths for the different services:
  static const String _speedTest = '/client_api/v1/speed_tests?mobile=true';

  static const String _suggestedLocations = '/client_api/v1/suggestions';

  static const String _locationByCoordinates = '/client_api/v1/coordinates';

  static const String _userCoordinates = '/client_api/v1/user_coordinates';

  final String _baseUrl;
}
