class RestClient {
  RestClient({required String baseUrl}) : _baseUrl = baseUrl;

  // Add here the getters for the different services:
  String get speedTest => _combineUrl(_speedTest);

  String _combineUrl(String url) {
    return _baseUrl + url;
  }

  // Add here the paths for the different services:
  static const String _speedTest = '/client_api/v1/speed_tests';

  final String _baseUrl;
}
