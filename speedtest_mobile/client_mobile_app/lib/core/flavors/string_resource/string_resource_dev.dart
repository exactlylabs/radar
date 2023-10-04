import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceDev implements IStringResource {
  @override
  String SERVER_ENDPOINT = 'https://9817-45-239-131-25.ngrok-free.app';

  @override
  String SERVER_NAME = 'Radar Dev';

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
  String WEB_ENDPOINT_COOKIE_DOMAIN = 'speedtest-staging.exactlylabs.com';

  @override
  String ENVIRONMENT = 'development';

  @override
  String PRIVACY_POLICY_URL = 'https://www.radartoolkit.com/privacy-policy';
}
