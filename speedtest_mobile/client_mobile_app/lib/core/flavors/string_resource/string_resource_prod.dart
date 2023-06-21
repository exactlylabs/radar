import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceProd implements IStringResource {
  @override
  String SERVER_ENDPOINT = 'https://pods.radartoolkit.com';

  @override
  String APP_NAME = 'Radar';

  @override
  String APP_NAME_PREFIX = '[Radar-Prod]';

  @override
  String SENTRY_FLUTTER_KEY =
      'https://78243fce78ad4aef8db5b419d03fa6e2@o1197382.ingest.sentry.io/4504327976386560';

  @override
  String WEB_ENDPOINT =
      'https://speed.radartoolkit.com/?webviewMode=true&tab=2&noZoomControl=true&global=true&client_id=1';

  @override
  String WEB_ENDPOINT_COOKIE_DOMAIN = 'speed.radartoolkit.com';

  @override
  String ENVIRONMENT = 'production';

  @override
  String PRIVACY_POLICY_URL = 'https://www.radartoolkit.com/privacy-policy';
}
