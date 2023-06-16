import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceDev implements IStringResource {
  @override
  String SERVER_ENDPOINT = 'https://7e95-2800-810-50c-246-dcef-919c-73a6-7469.ngrok-free.app';

  @override
  String APP_NAME = 'Radar Dev';

  @override
  String APP_NAME_PREFIX = '[Radar-Dev]';

  @override
  String SENTRY_FLUTTER_KEY = '';

  @override
  String WEB_ENDPOINT =
      'https://speedtest-staging.exactlylabs.com/?webviewMode=true&tab=2&noZoomControl=true&global=true&client_id=1';

  @override
  String ENVIRONMENT = 'development';

  @override
  String PRIVACY_POLICY_URL = 'https://www.radartoolkit.com/privacy-policy';
}
