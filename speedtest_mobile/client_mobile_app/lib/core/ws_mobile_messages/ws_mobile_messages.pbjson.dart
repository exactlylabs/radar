//
//  Generated code. Do not modify.
//  source: ws_mobile_messages.proto
//
// @dart = 2.12

// ignore_for_file: annotate_overrides, camel_case_types, comment_references
// ignore_for_file: constant_identifier_names, library_prefixes
// ignore_for_file: non_constant_identifier_names, prefer_final_fields
// ignore_for_file: unnecessary_import, unnecessary_this, unused_import

import 'dart:convert' as $convert;
import 'dart:core' as $core;
import 'dart:typed_data' as $typed_data;

@$core.Deprecated('Use eventsDescriptor instead')
const Events$json = {
  '1': 'Events',
  '2': [
    {'1': 'SCAN_RESULT', '2': 0},
    {'1': 'SCAN_START', '2': 1},
    {'1': 'SCAN_STOP', '2': 2},
    {'1': 'WELCOME', '2': 3},
    {'1': 'PING', '2': 4},
    {'1': 'Other', '2': 99},
  ],
};

/// Descriptor for `Events`. Decode as a `google.protobuf.EnumDescriptorProto`.
final $typed_data.Uint8List eventsDescriptor = $convert.base64Decode(
    'CgZFdmVudHMSDwoLU0NBTl9SRVNVTFQQABIOCgpTQ0FOX1NUQVJUEAESDQoJU0NBTl9TVE9QEA'
    'ISCwoHV0VMQ09NRRADEggKBFBJTkcQBBIJCgVPdGhlchBj');

@$core.Deprecated('Use scannedAPDescriptor instead')
const ScannedAP$json = {
  '1': 'ScannedAP',
  '2': [
    {'1': 'bssid', '3': 1, '4': 1, '5': 9, '10': 'bssid'},
    {'1': 'ssid', '3': 2, '4': 1, '5': 9, '10': 'ssid'},
    {'1': 'capabilities', '3': 3, '4': 1, '5': 9, '10': 'capabilities'},
    {'1': 'level', '3': 4, '4': 1, '5': 5, '10': 'level'},
    {'1': 'frequency', '3': 5, '4': 1, '5': 5, '10': 'frequency'},
    {'1': 'center_freq0', '3': 6, '4': 1, '5': 5, '10': 'centerFreq0'},
    {'1': 'center_freq1', '3': 7, '4': 1, '5': 5, '10': 'centerFreq1'},
    {'1': 'is80211mc_responder', '3': 8, '4': 1, '5': 8, '10': 'is80211mcResponder'},
    {'1': 'channel_width', '3': 9, '4': 1, '5': 5, '10': 'channelWidth'},
    {'1': 'is_passpoint_network', '3': 10, '4': 1, '5': 8, '10': 'isPasspointNetwork'},
    {'1': 'information_elements', '3': 11, '4': 1, '5': 12, '10': 'informationElements'},
    {'1': 'wifi_standard', '3': 12, '4': 1, '5': 5, '10': 'wifiStandard'},
    {'1': 'timestamp', '3': 13, '4': 1, '5': 11, '6': '.google.protobuf.Timestamp', '10': 'timestamp'},
  ],
};

/// Descriptor for `ScannedAP`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List scannedAPDescriptor = $convert.base64Decode(
    'CglTY2FubmVkQVASFAoFYnNzaWQYASABKAlSBWJzc2lkEhIKBHNzaWQYAiABKAlSBHNzaWQSIg'
    'oMY2FwYWJpbGl0aWVzGAMgASgJUgxjYXBhYmlsaXRpZXMSFAoFbGV2ZWwYBCABKAVSBWxldmVs'
    'EhwKCWZyZXF1ZW5jeRgFIAEoBVIJZnJlcXVlbmN5EiEKDGNlbnRlcl9mcmVxMBgGIAEoBVILY2'
    'VudGVyRnJlcTASIQoMY2VudGVyX2ZyZXExGAcgASgFUgtjZW50ZXJGcmVxMRIvChNpczgwMjEx'
    'bWNfcmVzcG9uZGVyGAggASgIUhJpczgwMjExbWNSZXNwb25kZXISIwoNY2hhbm5lbF93aWR0aB'
    'gJIAEoBVIMY2hhbm5lbFdpZHRoEjAKFGlzX3Bhc3Nwb2ludF9uZXR3b3JrGAogASgIUhJpc1Bh'
    'c3Nwb2ludE5ldHdvcmsSMQoUaW5mb3JtYXRpb25fZWxlbWVudHMYCyABKAxSE2luZm9ybWF0aW'
    '9uRWxlbWVudHMSIwoNd2lmaV9zdGFuZGFyZBgMIAEoBVIMd2lmaVN0YW5kYXJkEjgKCXRpbWVz'
    'dGFtcBgNIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXBSCXRpbWVzdGFtcA==');

@$core.Deprecated('Use scanResultDescriptor instead')
const ScanResult$json = {
  '1': 'ScanResult',
  '2': [
    {'1': 'scanned_aps', '3': 1, '4': 3, '5': 11, '6': '.ws_mobile_messages_pb.ScannedAP', '10': 'scannedAps'},
    {'1': 'latitude', '3': 2, '4': 1, '5': 2, '10': 'latitude'},
    {'1': 'longitude', '3': 3, '4': 1, '5': 2, '10': 'longitude'},
  ],
};

/// Descriptor for `ScanResult`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List scanResultDescriptor = $convert.base64Decode(
    'CgpTY2FuUmVzdWx0EkEKC3NjYW5uZWRfYXBzGAEgAygLMiAud3NfbW9iaWxlX21lc3NhZ2VzX3'
    'BiLlNjYW5uZWRBUFIKc2Nhbm5lZEFwcxIaCghsYXRpdHVkZRgCIAEoAlIIbGF0aXR1ZGUSHAoJ'
    'bG9uZ2l0dWRlGAMgASgCUglsb25naXR1ZGU=');

@$core.Deprecated('Use wSMessageDescriptor instead')
const WSMessage$json = {
  '1': 'WSMessage',
  '2': [
    {'1': 'event', '3': 1, '4': 1, '5': 14, '6': '.ws_mobile_messages_pb.Events', '10': 'event'},
    {'1': 'scan_result', '3': 2, '4': 1, '5': 11, '6': '.ws_mobile_messages_pb.ScanResult', '9': 0, '10': 'scanResult'},
    {'1': 'timestamp', '3': 3, '4': 1, '5': 11, '6': '.google.protobuf.Timestamp', '9': 0, '10': 'timestamp'},
    {'1': 'json', '3': 4, '4': 1, '5': 9, '9': 0, '10': 'json'},
  ],
  '8': [
    {'1': 'message'},
  ],
};

/// Descriptor for `WSMessage`. Decode as a `google.protobuf.DescriptorProto`.
final $typed_data.Uint8List wSMessageDescriptor = $convert.base64Decode(
    'CglXU01lc3NhZ2USMwoFZXZlbnQYASABKA4yHS53c19tb2JpbGVfbWVzc2FnZXNfcGIuRXZlbn'
    'RzUgVldmVudBJECgtzY2FuX3Jlc3VsdBgCIAEoCzIhLndzX21vYmlsZV9tZXNzYWdlc19wYi5T'
    'Y2FuUmVzdWx0SABSCnNjYW5SZXN1bHQSOgoJdGltZXN0YW1wGAMgASgLMhouZ29vZ2xlLnByb3'
    'RvYnVmLlRpbWVzdGFtcEgAUgl0aW1lc3RhbXASFAoEanNvbhgEIAEoCUgAUgRqc29uQgkKB21l'
    'c3NhZ2U=');

