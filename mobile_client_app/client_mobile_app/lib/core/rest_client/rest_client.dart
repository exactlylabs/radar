class RestClient {
  RestClient({required String baseUrl}) : _baseUrl = baseUrl;

  // Add here the getters for the different services:
  // eg: String get loginUrl => _combineUrl(_loginPath);

  String _combineUrl(String url) {
    return _baseUrl + url;
  }

  // Add here the paths for the different services:
  //eg: static const String _loginPath = 'auth/login';

  final String _baseUrl;
}
