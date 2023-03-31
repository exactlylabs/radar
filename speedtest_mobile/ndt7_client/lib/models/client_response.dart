import 'package:ndt7_client/models/ndt7_response.dart';

class ClientResponse implements NDT7Response {
  const ClientResponse(
    this.data,
    this.source,
    this.testType,
  );

  @override
  Map<String, dynamic> toJson() => {
        'Data': data.toJson(),
        'Source': source,
        'TestType': testType,
      };

  factory ClientResponse.fromJson(String testType, Map<String, dynamic> json) => ClientResponse(
        Data.fromJson(json['Data'] as Map<String, dynamic>),
        json['Source'] as String,
        testType,
      );

  @override
  String toString() => 'ClientResponse: ${toJson()}';

  final Data data;
  final String source;
  final String testType;
}

class Data {
  Data(
    this.elapsedTime,
    this.numBytes,
    this.meanClientMbps,
  );

  Map<String, dynamic> toJson() => {
        'ElapsedTime': elapsedTime,
        'NumBytes': numBytes,
        'MeanClientMbps': meanClientMbps,
      };

  factory Data.fromJson(Map<String, dynamic> json) => Data(
        json['ElapsedTime'] as double,
        json['NumBytes'] as int,
        json['MeanClientMbps'] as double,
      );

  final double elapsedTime;
  final int numBytes;
  final double meanClientMbps;
}
