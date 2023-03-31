import 'package:ndt7_client/models/client_response.dart' as clientData;
import 'package:ndt7_client/models/server_response.dart' as serverData;
import 'package:ndt7_client/models/ndt7_response.dart';

class TestCompletedEvent implements NDT7Response {
  const TestCompletedEvent(
    this.lastClientMeasurement,
    this.lastServerMeasurement,
    this.testType,
  );

  Map<String, dynamic> toJson() => {
        'LastClientMeasurement': lastClientMeasurement?.toJson(),
        'LastServerMeasurement': lastServerMeasurement?.toJson(),
        'TestType': testType,
      };

  factory TestCompletedEvent.fromJson(String testType, Map<String, dynamic> json) => TestCompletedEvent(
        json.containsKey('LastClientMeasurement')
            ? clientData.Data.fromJson(json['LastClientMeasurement'] as Map<String, dynamic>)
            : null,
        json.containsKey('LastServerMeasurement')
            ? serverData.Data.fromJson(json['LastServerMeasurement'] as Map<String, dynamic>)
            : null,
        testType,
      );

  @override
  String toString() => 'TestCompletedEvent: ${toJson()}';

  final String testType;
  final clientData.Data? lastClientMeasurement;
  final serverData.Data? lastServerMeasurement;
}
