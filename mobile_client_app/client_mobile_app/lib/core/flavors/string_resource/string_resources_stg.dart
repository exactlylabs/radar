import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceStg implements IStringResource {
  @override
  String SERVER_ENDPOINT = 'https://radar-staging.exactlylabs.com';

  @override
  String APP_NAME = 'Radar Stg';

  @override
  String APP_NAME_PREFIX = '[Radar-Stg]';

  @override
  String SENTRY_FLUTTER_KEY = '';

  @override
  String WEB_ENDPOINT = 'https://speedtest-staging.exactlylabs.com/';
}
