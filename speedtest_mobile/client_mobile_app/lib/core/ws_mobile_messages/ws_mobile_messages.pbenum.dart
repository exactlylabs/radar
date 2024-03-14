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

class Events extends $pb.ProtobufEnum {
  static const Events SCAN_RESULT = Events._(0, _omitEnumNames ? '' : 'SCAN_RESULT');
  static const Events WELCOME = Events._(3, _omitEnumNames ? '' : 'WELCOME');
  static const Events PING = Events._(4, _omitEnumNames ? '' : 'PING');
  static const Events Other = Events._(99, _omitEnumNames ? '' : 'Other');

  static const $core.List<Events> values = <Events>[
    SCAN_RESULT,
    WELCOME,
    PING,
    Other,
  ];

  static final $core.Map<$core.int, Events> _byValue = $pb.ProtobufEnum.initByValue(values);
  static Events? valueOf($core.int value) => _byValue[value];

  const Events._($core.int v, $core.String n) : super(v, n);
}

const _omitEnumNames = $core.bool.fromEnvironment('protobuf.omit_enum_names');
