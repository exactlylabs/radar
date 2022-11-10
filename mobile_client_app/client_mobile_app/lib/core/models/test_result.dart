class TestResult {
  TestResult({
    required this.dateTime,
    required this.download,
    required this.upload,
    required this.loss,
    required this.latency,
    required this.address,
    required this.networkType,
    required this.networkLocation,
    required this.networkQuality,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) => TestResult(
        dateTime: DateTime.parse(json["dateTime"]),
        download: json["download"],
        upload: json["upload"],
        loss: json["loss"],
        latency: json["latency"],
        address: json["address"],
        networkType: json["networkType"],
        networkLocation: json["networkLocation"],
        networkQuality: json["networkQuality"],
      );

  Map<String, dynamic> toJson() {
    return {
      'dateTime': dateTime.toString(),
      'download': download,
      'upload': upload,
      'loss': loss,
      'latency': latency,
      'address': address,
      'networkType': networkType,
      'networkLocation': networkLocation,
      'networkQuality': networkQuality,
    };
  }

  final DateTime dateTime;
  final double download;
  final double upload;
  final double loss;
  final double latency;
  final String address;
  final String networkType;
  final String networkLocation;
  final String networkQuality;
}
