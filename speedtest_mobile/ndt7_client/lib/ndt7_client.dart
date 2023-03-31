// You have generated a new plugin project without specifying the `--platforms`
// flag. A plugin project with no platform support was generated. To add a
// platform, run `flutter create -t plugin --platforms <platforms> .` under the
// same directory. You can also find a detailed instruction on how to add
// platforms in the `pubspec.yaml` at
// https://flutter.dev/docs/development/packages-and-plugins/developing-packages#plugin-platforms.

import 'models/ndt7_response.dart';
import 'ndt7_client_platform_interface.dart';

class Ndt7Client {
  Stream<NDT7Response?> get data => Ndt7ClientPlatform.instance.data;

  Future<void> startDownloadTest(String dir) {
    return Ndt7ClientPlatform.instance.startDownloadTest(dir);
  }

  Future<void> startUploadTest() {
    return Ndt7ClientPlatform.instance.startUploadTest();
  }

  Future<void> stopTest() {
    return Ndt7ClientPlatform.instance.stopTest();
  }
}
