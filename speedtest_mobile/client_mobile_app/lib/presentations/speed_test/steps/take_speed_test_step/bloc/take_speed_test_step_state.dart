import 'package:geolocator/geolocator.dart';
import 'package:network_connection_info/models/connection_info.dart';

class TakeSpeedTestStepState {
  const TakeSpeedTestStepState({
    this.downloadSpeed,
    this.uploadSpeed,
    this.latency,
    this.loss,
    this.minRtt,
    this.bytesRetrans,
    this.bytesSent,
    this.downloadProgress = 0,
    this.uploadProgress = 0,
    this.responses = const [],
    this.finishedTesting = false,
    this.isTestingDownloadSpeed = false,
    this.isTestingUploadSpeed = false,
    this.requestPhonePermission = false,
    this.networkQuality,
    this.connectionInfo,
    this.positionBeforeSpeedTest,
    this.positionAfterSpeedTest,
    this.deviceAndPermissionsState,
  });

  TakeSpeedTestStepState copyWith({
    bool? finishedTesting,
    bool? isTestingDownloadSpeed,
    bool? isTestingUploadSpeed,
    bool? requestPhonePermission,
    double? downloadSpeed,
    double? uploadSpeed,
    double? latency,
    double? loss,
    int? minRtt,
    int? bytesRetrans,
    int? bytesSent,
    double? downloadProgress,
    double? uploadProgress,
    List<Map<String, dynamic>>? responses,
    String? networkQuality,
    ConnectionInfo? connectionInfo,
    Position? positionBeforeSpeedTest,
    Position? positionAfterSpeedTest,
    Map<String, dynamic>? deviceAndPermissionsState,
  }) {
    return TakeSpeedTestStepState(
      finishedTesting: finishedTesting ?? this.finishedTesting,
      downloadSpeed: downloadSpeed ?? this.downloadSpeed,
      uploadSpeed: uploadSpeed ?? this.uploadSpeed,
      latency: latency ?? this.latency,
      loss: loss ?? this.loss,
      minRtt: minRtt ?? this.minRtt,
      bytesRetrans: bytesRetrans ?? this.bytesRetrans,
      bytesSent: bytesSent ?? this.bytesSent,
      isTestingDownloadSpeed: isTestingDownloadSpeed ?? this.isTestingDownloadSpeed,
      isTestingUploadSpeed: isTestingUploadSpeed ?? this.isTestingUploadSpeed,
      requestPhonePermission: requestPhonePermission ?? this.requestPhonePermission,
      responses: responses ?? this.responses,
      downloadProgress: downloadProgress ?? this.downloadProgress,
      uploadProgress: uploadProgress ?? this.uploadProgress,
      networkQuality: networkQuality ?? this.networkQuality,
      connectionInfo: connectionInfo ?? this.connectionInfo,
      positionBeforeSpeedTest: positionBeforeSpeedTest ?? this.positionBeforeSpeedTest,
      positionAfterSpeedTest: positionAfterSpeedTest ?? this.positionAfterSpeedTest,
      deviceAndPermissionsState: deviceAndPermissionsState ?? this.deviceAndPermissionsState,
    );
  }

  final bool finishedTesting;
  final bool isTestingDownloadSpeed;
  final bool isTestingUploadSpeed;
  final bool requestPhonePermission;
  final double? downloadSpeed;
  final double? uploadSpeed;
  final double? latency;
  final double? loss;
  final int? minRtt;
  final int? bytesRetrans;
  final int? bytesSent;
  final List<Map<String, dynamic>> responses;
  final double downloadProgress;
  final double uploadProgress;
  final String? networkQuality;
  final ConnectionInfo? connectionInfo;
  final Position? positionBeforeSpeedTest;
  final Position? positionAfterSpeedTest;
  final Map<String, dynamic>? deviceAndPermissionsState;
}
