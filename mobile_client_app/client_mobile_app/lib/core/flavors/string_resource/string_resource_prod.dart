import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class StringResourceProd implements IStringResource {
  @override
  String SERVER_ENDPOINT = '';

  @override
  String APP_NAME = 'Radar';

  @override
  String APP_NAME_PREFIX = '[Radar-Prod]';

  @override
  String SENTRY_FLUTTER_KEY = '';
}
