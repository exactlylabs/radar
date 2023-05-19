import 'package:ndt7_client/models/ndt7_response.dart';

class TestCompletedEvent implements NDT7Response {
  const TestCompletedEvent(this.test);

  Map<String, dynamic> toJson() => {
        'test': test,
      };

  factory TestCompletedEvent.fromJson(Map<String, dynamic> json) =>
      TestCompletedEvent((json['test'] as String).toLowerCase());

  @override
  String toString() => 'TestCompletedEvent: ${toJson()}';

  final String test;
}
