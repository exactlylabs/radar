//
//  Generated code. Do not modify.
//  source: ws_mobile_messages.proto
//
// @dart = 2.12

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_final_fields
// ignore_for_file: unnecessary_import, unnecessary_this, unused_import

import 'dart:core' as $core;

import 'package:protobuf/protobuf.dart' as $pb;

import 'google/protobuf/timestamp.pb.dart' as $0;
import 'ws_mobile_messages.pbenum.dart';

export 'ws_mobile_messages.pbenum.dart';

class ScannedAP extends $pb.GeneratedMessage {
  factory ScannedAP({
    $core.String? bssid,
    $core.String? ssid,
    $core.String? capabilities,
    $core.int? level,
    $core.int? frequency,
    $core.int? centerFreq0,
    $core.int? centerFreq1,
    $core.bool? is80211mcResponder,
    $core.int? channelWidth,
    $core.bool? isPasspointNetwork,
    $core.List<$core.int>? informationElements,
    $core.int? wifiStandard,
    $0.Timestamp? timestamp,
  }) {
    final $result = create();
    if (bssid != null) {
      $result.bssid = bssid;
    }
    if (ssid != null) {
      $result.ssid = ssid;
    }
    if (capabilities != null) {
      $result.capabilities = capabilities;
    }
    if (level != null) {
      $result.level = level;
    }
    if (frequency != null) {
      $result.frequency = frequency;
    }
    if (centerFreq0 != null) {
      $result.centerFreq0 = centerFreq0;
    }
    if (centerFreq1 != null) {
      $result.centerFreq1 = centerFreq1;
    }
    if (is80211mcResponder != null) {
      $result.is80211mcResponder = is80211mcResponder;
    }
    if (channelWidth != null) {
      $result.channelWidth = channelWidth;
    }
    if (isPasspointNetwork != null) {
      $result.isPasspointNetwork = isPasspointNetwork;
    }
    if (informationElements != null) {
      $result.informationElements = informationElements;
    }
    if (wifiStandard != null) {
      $result.wifiStandard = wifiStandard;
    }
    if (timestamp != null) {
      $result.timestamp = timestamp;
    }
    return $result;
  }
  ScannedAP._() : super();
  factory ScannedAP.fromBuffer($core.List<$core.int> i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(i, r);
  factory ScannedAP.fromJson($core.String i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(i, r);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'ScannedAP', package: const $pb.PackageName(_omitMessageNames ? '' : 'ws_mobile_messages_pb'), createEmptyInstance: create)
    ..aOS(1, _omitFieldNames ? '' : 'bssid')
    ..aOS(2, _omitFieldNames ? '' : 'ssid')
    ..aOS(3, _omitFieldNames ? '' : 'capabilities')
    ..a<$core.int>(4, _omitFieldNames ? '' : 'level', $pb.PbFieldType.O3)
    ..a<$core.int>(5, _omitFieldNames ? '' : 'frequency', $pb.PbFieldType.O3)
    ..a<$core.int>(6, _omitFieldNames ? '' : 'centerFreq0', $pb.PbFieldType.O3)
    ..a<$core.int>(7, _omitFieldNames ? '' : 'centerFreq1', $pb.PbFieldType.O3)
    ..aOB(8, _omitFieldNames ? '' : 'is80211mcResponder')
    ..a<$core.int>(9, _omitFieldNames ? '' : 'channelWidth', $pb.PbFieldType.O3)
    ..aOB(10, _omitFieldNames ? '' : 'isPasspointNetwork')
    ..a<$core.List<$core.int>>(11, _omitFieldNames ? '' : 'informationElements', $pb.PbFieldType.OY)
    ..a<$core.int>(12, _omitFieldNames ? '' : 'wifiStandard', $pb.PbFieldType.O3)
    ..aOM<$0.Timestamp>(13, _omitFieldNames ? '' : 'timestamp', subBuilder: $0.Timestamp.create)
    ..hasRequiredFields = false
  ;

  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.deepCopy] instead. '
  'Will be removed in next major version')
  ScannedAP clone() => ScannedAP()..mergeFromMessage(this);
  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.rebuild] instead. '
  'Will be removed in next major version')
  ScannedAP copyWith(void Function(ScannedAP) updates) => super.copyWith((message) => updates(message as ScannedAP)) as ScannedAP;

  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ScannedAP create() => ScannedAP._();
  ScannedAP createEmptyInstance() => create();
  static $pb.PbList<ScannedAP> createRepeated() => $pb.PbList<ScannedAP>();
  @$core.pragma('dart2js:noInline')
  static ScannedAP getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<ScannedAP>(create);
  static ScannedAP? _defaultInstance;

  @$pb.TagNumber(1)
  $core.String get bssid => $_getSZ(0);
  @$pb.TagNumber(1)
  set bssid($core.String v) { $_setString(0, v); }
  @$pb.TagNumber(1)
  $core.bool hasBssid() => $_has(0);
  @$pb.TagNumber(1)
  void clearBssid() => clearField(1);

  @$pb.TagNumber(2)
  $core.String get ssid => $_getSZ(1);
  @$pb.TagNumber(2)
  set ssid($core.String v) { $_setString(1, v); }
  @$pb.TagNumber(2)
  $core.bool hasSsid() => $_has(1);
  @$pb.TagNumber(2)
  void clearSsid() => clearField(2);

  @$pb.TagNumber(3)
  $core.String get capabilities => $_getSZ(2);
  @$pb.TagNumber(3)
  set capabilities($core.String v) { $_setString(2, v); }
  @$pb.TagNumber(3)
  $core.bool hasCapabilities() => $_has(2);
  @$pb.TagNumber(3)
  void clearCapabilities() => clearField(3);

  @$pb.TagNumber(4)
  $core.int get level => $_getIZ(3);
  @$pb.TagNumber(4)
  set level($core.int v) { $_setSignedInt32(3, v); }
  @$pb.TagNumber(4)
  $core.bool hasLevel() => $_has(3);
  @$pb.TagNumber(4)
  void clearLevel() => clearField(4);

  @$pb.TagNumber(5)
  $core.int get frequency => $_getIZ(4);
  @$pb.TagNumber(5)
  set frequency($core.int v) { $_setSignedInt32(4, v); }
  @$pb.TagNumber(5)
  $core.bool hasFrequency() => $_has(4);
  @$pb.TagNumber(5)
  void clearFrequency() => clearField(5);

  @$pb.TagNumber(6)
  $core.int get centerFreq0 => $_getIZ(5);
  @$pb.TagNumber(6)
  set centerFreq0($core.int v) { $_setSignedInt32(5, v); }
  @$pb.TagNumber(6)
  $core.bool hasCenterFreq0() => $_has(5);
  @$pb.TagNumber(6)
  void clearCenterFreq0() => clearField(6);

  @$pb.TagNumber(7)
  $core.int get centerFreq1 => $_getIZ(6);
  @$pb.TagNumber(7)
  set centerFreq1($core.int v) { $_setSignedInt32(6, v); }
  @$pb.TagNumber(7)
  $core.bool hasCenterFreq1() => $_has(6);
  @$pb.TagNumber(7)
  void clearCenterFreq1() => clearField(7);

  @$pb.TagNumber(8)
  $core.bool get is80211mcResponder => $_getBF(7);
  @$pb.TagNumber(8)
  set is80211mcResponder($core.bool v) { $_setBool(7, v); }
  @$pb.TagNumber(8)
  $core.bool hasIs80211mcResponder() => $_has(7);
  @$pb.TagNumber(8)
  void clearIs80211mcResponder() => clearField(8);

  @$pb.TagNumber(9)
  $core.int get channelWidth => $_getIZ(8);
  @$pb.TagNumber(9)
  set channelWidth($core.int v) { $_setSignedInt32(8, v); }
  @$pb.TagNumber(9)
  $core.bool hasChannelWidth() => $_has(8);
  @$pb.TagNumber(9)
  void clearChannelWidth() => clearField(9);

  @$pb.TagNumber(10)
  $core.bool get isPasspointNetwork => $_getBF(9);
  @$pb.TagNumber(10)
  set isPasspointNetwork($core.bool v) { $_setBool(9, v); }
  @$pb.TagNumber(10)
  $core.bool hasIsPasspointNetwork() => $_has(9);
  @$pb.TagNumber(10)
  void clearIsPasspointNetwork() => clearField(10);

  @$pb.TagNumber(11)
  $core.List<$core.int> get informationElements => $_getN(10);
  @$pb.TagNumber(11)
  set informationElements($core.List<$core.int> v) { $_setBytes(10, v); }
  @$pb.TagNumber(11)
  $core.bool hasInformationElements() => $_has(10);
  @$pb.TagNumber(11)
  void clearInformationElements() => clearField(11);

  @$pb.TagNumber(12)
  $core.int get wifiStandard => $_getIZ(11);
  @$pb.TagNumber(12)
  set wifiStandard($core.int v) { $_setSignedInt32(11, v); }
  @$pb.TagNumber(12)
  $core.bool hasWifiStandard() => $_has(11);
  @$pb.TagNumber(12)
  void clearWifiStandard() => clearField(12);

  @$pb.TagNumber(13)
  $0.Timestamp get timestamp => $_getN(12);
  @$pb.TagNumber(13)
  set timestamp($0.Timestamp v) { setField(13, v); }
  @$pb.TagNumber(13)
  $core.bool hasTimestamp() => $_has(12);
  @$pb.TagNumber(13)
  void clearTimestamp() => clearField(13);
  @$pb.TagNumber(13)
  $0.Timestamp ensureTimestamp() => $_ensure(12);
}

class ScanResult extends $pb.GeneratedMessage {
  factory ScanResult({
    $core.Iterable<ScannedAP>? scannedAps,
    $core.double? latitude,
    $core.double? longitude,
  }) {
    final $result = create();
    if (scannedAps != null) {
      $result.scannedAps.addAll(scannedAps);
    }
    if (latitude != null) {
      $result.latitude = latitude;
    }
    if (longitude != null) {
      $result.longitude = longitude;
    }
    return $result;
  }
  ScanResult._() : super();
  factory ScanResult.fromBuffer($core.List<$core.int> i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(i, r);
  factory ScanResult.fromJson($core.String i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(i, r);

  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'ScanResult', package: const $pb.PackageName(_omitMessageNames ? '' : 'ws_mobile_messages_pb'), createEmptyInstance: create)
    ..pc<ScannedAP>(1, _omitFieldNames ? '' : 'scannedAps', $pb.PbFieldType.PM, subBuilder: ScannedAP.create)
    ..a<$core.double>(2, _omitFieldNames ? '' : 'latitude', $pb.PbFieldType.OF)
    ..a<$core.double>(3, _omitFieldNames ? '' : 'longitude', $pb.PbFieldType.OF)
    ..hasRequiredFields = false
  ;

  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.deepCopy] instead. '
  'Will be removed in next major version')
  ScanResult clone() => ScanResult()..mergeFromMessage(this);
  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.rebuild] instead. '
  'Will be removed in next major version')
  ScanResult copyWith(void Function(ScanResult) updates) => super.copyWith((message) => updates(message as ScanResult)) as ScanResult;

  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static ScanResult create() => ScanResult._();
  ScanResult createEmptyInstance() => create();
  static $pb.PbList<ScanResult> createRepeated() => $pb.PbList<ScanResult>();
  @$core.pragma('dart2js:noInline')
  static ScanResult getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<ScanResult>(create);
  static ScanResult? _defaultInstance;

  @$pb.TagNumber(1)
  $core.List<ScannedAP> get scannedAps => $_getList(0);

  @$pb.TagNumber(2)
  $core.double get latitude => $_getN(1);
  @$pb.TagNumber(2)
  set latitude($core.double v) { $_setFloat(1, v); }
  @$pb.TagNumber(2)
  $core.bool hasLatitude() => $_has(1);
  @$pb.TagNumber(2)
  void clearLatitude() => clearField(2);

  @$pb.TagNumber(3)
  $core.double get longitude => $_getN(2);
  @$pb.TagNumber(3)
  set longitude($core.double v) { $_setFloat(2, v); }
  @$pb.TagNumber(3)
  $core.bool hasLongitude() => $_has(2);
  @$pb.TagNumber(3)
  void clearLongitude() => clearField(3);
}

enum WSMessage_Message {
  scanResult, 
  timestamp, 
  json, 
  notSet
}

class WSMessage extends $pb.GeneratedMessage {
  factory WSMessage({
    Events? event,
    ScanResult? scanResult,
    $0.Timestamp? timestamp,
    $core.String? json,
  }) {
    final $result = create();
    if (event != null) {
      $result.event = event;
    }
    if (scanResult != null) {
      $result.scanResult = scanResult;
    }
    if (timestamp != null) {
      $result.timestamp = timestamp;
    }
    if (json != null) {
      $result.json = json;
    }
    return $result;
  }
  WSMessage._() : super();
  factory WSMessage.fromBuffer($core.List<$core.int> i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromBuffer(i, r);
  factory WSMessage.fromJson($core.String i, [$pb.ExtensionRegistry r = $pb.ExtensionRegistry.EMPTY]) => create()..mergeFromJson(i, r);

  static const $core.Map<$core.int, WSMessage_Message> _WSMessage_MessageByTag = {
    2 : WSMessage_Message.scanResult,
    3 : WSMessage_Message.timestamp,
    4 : WSMessage_Message.json,
    0 : WSMessage_Message.notSet
  };
  static final $pb.BuilderInfo _i = $pb.BuilderInfo(_omitMessageNames ? '' : 'WSMessage', package: const $pb.PackageName(_omitMessageNames ? '' : 'ws_mobile_messages_pb'), createEmptyInstance: create)
    ..oo(0, [2, 3, 4])
    ..e<Events>(1, _omitFieldNames ? '' : 'event', $pb.PbFieldType.OE, defaultOrMaker: Events.SCAN_RESULT, valueOf: Events.valueOf, enumValues: Events.values)
    ..aOM<ScanResult>(2, _omitFieldNames ? '' : 'scanResult', subBuilder: ScanResult.create)
    ..aOM<$0.Timestamp>(3, _omitFieldNames ? '' : 'timestamp', subBuilder: $0.Timestamp.create)
    ..aOS(4, _omitFieldNames ? '' : 'json')
    ..hasRequiredFields = false
  ;

  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.deepCopy] instead. '
  'Will be removed in next major version')
  WSMessage clone() => WSMessage()..mergeFromMessage(this);
  @$core.Deprecated(
  'Using this can add significant overhead to your binary. '
  'Use [GeneratedMessageGenericExtensions.rebuild] instead. '
  'Will be removed in next major version')
  WSMessage copyWith(void Function(WSMessage) updates) => super.copyWith((message) => updates(message as WSMessage)) as WSMessage;

  $pb.BuilderInfo get info_ => _i;

  @$core.pragma('dart2js:noInline')
  static WSMessage create() => WSMessage._();
  WSMessage createEmptyInstance() => create();
  static $pb.PbList<WSMessage> createRepeated() => $pb.PbList<WSMessage>();
  @$core.pragma('dart2js:noInline')
  static WSMessage getDefault() => _defaultInstance ??= $pb.GeneratedMessage.$_defaultFor<WSMessage>(create);
  static WSMessage? _defaultInstance;

  WSMessage_Message whichMessage() => _WSMessage_MessageByTag[$_whichOneof(0)]!;
  void clearMessage() => clearField($_whichOneof(0));

  @$pb.TagNumber(1)
  Events get event => $_getN(0);
  @$pb.TagNumber(1)
  set event(Events v) { setField(1, v); }
  @$pb.TagNumber(1)
  $core.bool hasEvent() => $_has(0);
  @$pb.TagNumber(1)
  void clearEvent() => clearField(1);

  @$pb.TagNumber(2)
  ScanResult get scanResult => $_getN(1);
  @$pb.TagNumber(2)
  set scanResult(ScanResult v) { setField(2, v); }
  @$pb.TagNumber(2)
  $core.bool hasScanResult() => $_has(1);
  @$pb.TagNumber(2)
  void clearScanResult() => clearField(2);
  @$pb.TagNumber(2)
  ScanResult ensureScanResult() => $_ensure(1);

  @$pb.TagNumber(3)
  $0.Timestamp get timestamp => $_getN(2);
  @$pb.TagNumber(3)
  set timestamp($0.Timestamp v) { setField(3, v); }
  @$pb.TagNumber(3)
  $core.bool hasTimestamp() => $_has(2);
  @$pb.TagNumber(3)
  void clearTimestamp() => clearField(3);
  @$pb.TagNumber(3)
  $0.Timestamp ensureTimestamp() => $_ensure(2);

  @$pb.TagNumber(4)
  $core.String get json => $_getSZ(3);
  @$pb.TagNumber(4)
  set json($core.String v) { $_setString(3, v); }
  @$pb.TagNumber(4)
  $core.bool hasJson() => $_has(3);
  @$pb.TagNumber(4)
  void clearJson() => clearField(4);
}


const _omitFieldNames = $core.bool.fromEnvironment('protobuf.omit_field_names');
const _omitMessageNames = $core.bool.fromEnvironment('protobuf.omit_message_names');
