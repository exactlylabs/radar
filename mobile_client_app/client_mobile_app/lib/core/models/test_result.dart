class TestResult {
  TestResult({
    required this.timestamp,
    required this.download,
    required this.upload,
    required this.lat,
    required this.long,
    required this.startTimestamp,
    required this.downloadValue,
    required this.uploadValue,
    required this.loss,
    required this.latency,
    required this.networkType,
    required this.networkLocation,
    required this.location,
    required this.address,
    required this.coordinates,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) => TestResult(
        timestamp: json["timestamp"],
        download: json["download"],
        upload: json["upload"],
        lat: json["lat"],
        long: json["long"],
        startTimestamp: json["startTimestamp"],
        downloadValue: json["downloadValue"],
        uploadValue: json["uploadValue"],
        loss: json["loss"],
        latency: json["latency"],
        networkType: json["networkType"],
        networkLocation: json["networkLocation"],
        location: json["location"],
        address: json["address"],
        coordinates: json["coordinates"],
      );

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp,
      'download': download,
      'upload': upload,
      'lat': lat,
      'long': long,
      'startTimestamp': startTimestamp,
      'downloadValue': downloadValue,
      'uploadValue': uploadValue,
      'loss': loss,
      'latency': latency,
      'networkType': networkType,
      'networkLocation': networkLocation,
      'location': location,
      'address': address,
      'coordinates': coordinates,
    };
  }

  final String timestamp;
  final double download;
  final double upload;
  final String lat;
  final String long;
  final String startTimestamp;
  final double downloadValue;
  final double uploadValue;
  final double loss;
  final double latency;
  final String networkType;
  final String networkLocation;
  final List<String> location;
  final String address;
  final List<String> coordinates;
}
