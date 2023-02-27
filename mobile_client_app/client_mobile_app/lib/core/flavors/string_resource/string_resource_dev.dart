import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceDev implements IStringResource {
  @override
  String SERVER_ENDPOINT = 'https://614b-2800-af0-1438-b90-144b-6019-a209-d9e5.ngrok.io';

  @override
  String APP_NAME = 'Radar Dev';

  @override
  String APP_NAME_PREFIX = '[Radar-Dev]';

  @override
  String SENTRY_FLUTTER_KEY = '';

  @override
  String WEB_ENDPOINT = 'https://speedtest-staging.exactlylabs.com/?webviewMode=true&tab=2&noZoomControl=true';

  @override
  String ENVIRONMENT = 'development';

  @override
  String PRIVACY_POLICY_URL = 'https://www.radartoolkit.com/privacy-policy';
}
