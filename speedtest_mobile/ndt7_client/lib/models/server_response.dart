import 'package:ndt7_client/models/ndt7_response.dart';

class ServerResponse implements NDT7Response {
  ServerResponse(this.bbrInfo, this.connectionInfo, this.tcpInfo, this.test);

  Map<String, dynamic> toJson() => {
        'BBRInfo': bbrInfo.toJson(),
        'ConnectionInfo': connectionInfo.toJson(),
        'TCPInfo': tcpInfo.toJson(),
        'Test': test,
      };

  factory ServerResponse.fromJson(Map<String, dynamic> json) => ServerResponse(
        BBRInfo.fromJson(json['BBRInfo'] as Map<String, dynamic>),
        ConnectionInfo.fromJson(json['ConnectionInfo'] as Map<String, dynamic>),
        TCPInfo.fromJson(json['TCPInfo'] as Map<String, dynamic>),
        json['Test'] as String,
      );

  final BBRInfo bbrInfo;
  final ConnectionInfo connectionInfo;
  final TCPInfo tcpInfo;
  final String test;
}

class BBRInfo {
  BBRInfo(
    this.bw,
    this.cwndGain,
    this.elapsedTime,
    this.minRTT,
    this.pacingGain,
  );

  Map<String, dynamic> toJson() => {
        'BW': bw,
        'CwndGain': cwndGain,
        'ElapsedTime': elapsedTime,
        'MinRTT': minRTT,
        'PacingGain': pacingGain,
      };

  factory BBRInfo.fromJson(Map<String, dynamic> json) => BBRInfo(
        json['BW'] as int,
        json['CwndGain'] as int,
        json['ElapsedTime'] as int,
        json['MinRTT'] as int,
        json['PacingGain'] as int,
      );

  final int bw;
  final int cwndGain;
  final int elapsedTime;
  final int minRTT;
  final int pacingGain;
}

class ConnectionInfo {
  ConnectionInfo(
    this.client,
    this.server,
    this.uuid,
  );

  Map<String, dynamic> toJson() => {
        'Client': client,
        'Server': server,
        'UUID': uuid,
      };

  factory ConnectionInfo.fromJson(Map<String, dynamic> json) => ConnectionInfo(
        json['Client'] as String,
        json['Server'] as String,
        json['UUID'] as String,
      );

  final String client;
  final String server;
  final String uuid;
}

class TCPInfo {
  TCPInfo(
    this.caState,
    this.advMSS,
    this.appLimited,
    this.ato,
    this.backoff,
    this.busyTime,
    this.bytesAcked,
    this.bytesReceived,
    this.bytesRetrans,
    this.bytesSent,
    this.dSackDups,
    this.dataSegsIn,
    this.dataSegsOut,
    this.delivered,
    this.deliveredCE,
    this.deliveryRate,
    this.elapsedTime,
    this.fackets,
    this.lastAckRecv,
    this.lastAckSent,
    this.lastDataRecv,
    this.lastDataSent,
    this.lost,
    this.maxPacingRate,
    this.minRTT,
    this.notsentBytes,
    this.options,
    this.pacingRate,
    this.pmtu,
    this.probes,
    this.rwndLimited,
    this.rcvMSS,
    this.rcvRTT,
    this.rcvSpace,
    this.rcvSsThresh,
    this.reordSeen,
    this.reordering,
    this.retrans,
    this.retransmits,
    this.rto,
    this.rtt,
    this.rttVar,
    this.sacked,
    this.segsIn,
    this.segsOut,
    this.sndBufLimited,
    this.sndCwnd,
    this.sndMSS,
    this.sndSsThresh,
    this.state,
    this.totalRetrans,
    this.unacked,
    this.wScale,
  );

  Map<String, dynamic> toJson() => {
        'CAState': caState,
        'AdvMSS': advMSS,
        'AppLimited': appLimited,
        'ATO': ato,
        'Backoff': backoff,
        'BusyTime': busyTime,
        'BytesAcked': bytesAcked,
        'BytesReceived': bytesReceived,
        'BytesRetrans': bytesRetrans,
        'BytesSent': bytesSent,
        'DSackDups': dSackDups,
        'DataSegsIn': dataSegsIn,
        'DataSegsOut': dataSegsOut,
        'Delivered': delivered,
        'DeliveredCE': deliveredCE,
        'DeliveryRate': deliveryRate,
        'ElapsedTime': elapsedTime,
        'Fackets': fackets,
        'LastAckRecv': lastAckRecv,
        'LastAckSent': lastAckSent,
        'LastDataRecv': lastDataRecv,
        'LastDataSent': lastDataSent,
        'Lost': lost,
        'MaxPacingRate': maxPacingRate,
        'MinRTT': minRTT,
        'NotsentBytes': notsentBytes,
        'Options': options,
        'PacingRate': pacingRate,
        'PMTU': pmtu,
        'Probes': probes,
        'RWndLimited': rwndLimited,
        'RcvMSS': rcvMSS,
        'RcvRTT': rcvRTT,
        'RcvSpace': rcvSpace,
        'RcvSsThresh': rcvSsThresh,
        'ReordSeen': reordSeen,
        'Reordering': reordering,
        'Retrans': retrans,
        'Retransmits': retransmits,
        'RTO': rto,
        'RTT': rtt,
        'RTTVar': rttVar,
        'Sacked': sacked,
        'SegsIn': segsIn,
        'SegsOut': segsOut,
        'SndBufLimited': sndBufLimited,
        'SndCwnd': sndCwnd,
        'SndMSS': sndMSS,
        'SndSsThresh': sndSsThresh,
        'State': state,
        'TotalRetrans': totalRetrans,
        'Unacked': unacked,
        'WScale': wScale,
      };

  factory TCPInfo.fromJson(Map<String, dynamic> json) => TCPInfo(
        json['CAState'] as int?,
        json['AdvMSS'] as int?,
        json['AppLimited'] as int?,
        json['ATO'] as int?,
        json['Backoff'] as int?,
        json['BusyTime'] as int?,
        json['BytesAcked'] as int?,
        json['BytesReceived'] as int?,
        json['BytesRetrans'] as int?,
        json['BytesSent'] as int?,
        json['DSackDups'] as int?,
        json['DataSegsIn'] as int?,
        json['DataSegsOut'] as int?,
        json['Delivered'] as int?,
        json['DeliveredCE'] as int?,
        json['DeliveryRate'] as int?,
        json['ElapsedTime'] as int?,
        json['Fackets'] as int?,
        json['LastAckRecv'] as int?,
        json['LastAckSent'] as int?,
        json['LastDataRecv'] as int?,
        json['LastDataSent'] as int?,
        json['Lost'] as int?,
        json['MaxPacingRate'] as int?,
        json['MinRTT'] as int?,
        json['NotsentBytes'] as int?,
        json['Options'] as int?,
        json['PacingRate'] as int?,
        json['PMTU'] as int?,
        json['Probes'] as int?,
        json['RWndLimited'] as int?,
        json['RcvMSS'] as int?,
        json['RcvRTT'] as int?,
        json['RcvSpace'] as int?,
        json['RcvSsThresh'] as int?,
        json['ReordSeen'] as int?,
        json['Reordering'] as int?,
        json['Retrans'] as int?,
        json['Retransmits'] as int?,
        json['RTO'] as int?,
        json['RTT'] as int?,
        json['RTTVar'] as int?,
        json['Sacked'] as int?,
        json['SegsIn'] as int?,
        json['SegsOut'] as int?,
        json['SndBufLimited'] as int?,
        json['SndCwnd'] as int?,
        json['SndMSS'] as int?,
        json['SndSsThresh'] as int?,
        json['State'] as int?,
        json['TotalRetrans'] as int?,
        json['Unacked'] as int?,
        json['WScale'] as int?,
      );

  final int? caState;
  final int? advMSS;
  final int? appLimited;
  final int? ato;
  final int? backoff;
  final int? busyTime;
  final int? bytesAcked;
  final int? bytesReceived;
  final int? bytesRetrans;
  final int? bytesSent;
  final int? dSackDups;
  final int? dataSegsIn;
  final int? dataSegsOut;
  final int? delivered;
  final int? deliveredCE;
  final int? deliveryRate;
  final int? elapsedTime;
  final int? fackets;
  final int? lastAckRecv;
  final int? lastAckSent;
  final int? lastDataRecv;
  final int? lastDataSent;
  final int? lost;
  final int? maxPacingRate;
  final int? minRTT;
  final int? notsentBytes;
  final int? options;
  final int? pacingRate;
  final int? pmtu;
  final int? probes;
  final int? rwndLimited;
  final int? rcvMSS;
  final int? rcvRTT;
  final int? rcvSpace;
  final int? rcvSsThresh;
  final int? reordSeen;
  final int? reordering;
  final int? retrans;
  final int? retransmits;
  final int? rto;
  final int? rtt;
  final int? rttVar;
  final int? sacked;
  final int? segsIn;
  final int? segsOut;
  final int? sndBufLimited;
  final int? sndCwnd;
  final int? sndMSS;
  final int? sndSsThresh;
  final int? state;
  final int? totalRetrans;
  final int? unacked;
  final int? wScale;
}
