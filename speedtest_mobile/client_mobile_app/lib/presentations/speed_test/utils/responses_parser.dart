import 'package:ndt7_client/models/client_response.dart';
import 'package:ndt7_client/models/server_response.dart';

class ResponsesParser {
  static Map<String, dynamic> parseClientResponse(ClientResponse response) {
    return {
      'Source': 'client',
      'Data': response.appInfo.toJson(),
      'type': response.test,
    };
  }

  static Map<String, dynamic> parseServerResponse(ServerResponse response) {
    return {
      'Source': 'server',
      'Data': {
        'ConnectionInfo': response.connectionInfo.toJson(),
        'BBRInfo': response.bbrInfo.toJson(),
        'TCPInfo': response.tcpInfo.toJson(),
      },
      'type': response.test,
    };
  }
}
