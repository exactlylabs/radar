import 'package:client_mobile_app/resources/strings.dart';

class TestResult {
  TestResult({
    required this.latitude,
    required this.longitude,
    required this.testedAt,
    required this.address,
    required this.city,
    required this.street,
    required this.state,
    required this.postalCode,
    required this.houseNumber,
    required this.networkType,
    required this.networkLocation,
    required this.networkCost,
    this.networkQuality,
    required this.upload,
    required this.download,
    required this.loss,
    required this.latency,
    required this.versionNumber,
    required this.buildNumber,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) => TestResult(
        latitude: json['latitude'] ?? 0.0,
        longitude: json['longitude'] ?? 0.0,
        testedAt: DateTime.parse(json['tested_at'] ?? json['dateTime']),
        address: json['address'],
        city: json['city'],
        street: json['street'],
        state: json['state'],
        postalCode: json['postal_code'],
        houseNumber: json['house_number'],
        networkType: json['network_type'] ?? json['networkType'],
        networkLocation: json['network_location'] ?? json['networkLocation'],
        networkCost: json['network_cost'],
        networkQuality: json['network_quality'] ?? json['networkQuality'],
        upload: json['upload'],
        download: json['download'],
        loss: json['loss'],
        latency: json['latency'],
        versionNumber: json['version_number'] ?? Strings.emptyString,
        buildNumber: json['build_number'] ?? Strings.emptyString,
      );

  Map<String, dynamic> toJsonServer() {
    return {
      "latitude": latitude,
      "longitude": longitude,
      'tested_at': testedAt.toString(),
      'address': address,
      "city": city,
      "street": street,
      "state": state,
      "postal_code": postalCode,
      "house_number": houseNumber,
      'network_type': networkType,
      'network_location': networkLocation,
      'network_cost': networkCost,
      'version_number': versionNumber,
      'build_number': buildNumber,
    };
  }

  Map<String, dynamic> toJson() {
    return {
      "download": download,
      "upload": upload,
      "loss": loss,
      "latency": latency,
      "latitude": latitude,
      "longitude": longitude,
      'tested_at': testedAt.toString(),
      'address': address,
      "city": city,
      "street": street,
      "state": state,
      "postal_code": postalCode,
      "house_number": houseNumber,
      'network_type': networkType,
      'network_location': networkLocation,
      'network_cost': networkCost,
      'network_quality': networkQuality,
      'version_number': versionNumber,
      'build_number': buildNumber,
    };
  }

  final double latitude;
  final double longitude;
  final DateTime testedAt;
  final String address;
  final String? city;
  final String? street;
  final String? state;
  final String? postalCode;
  final String? houseNumber;
  final String networkType;
  final String networkLocation;
  final String? networkCost;
  final String? networkQuality;
  final double download;
  final double upload;
  final double loss;
  final double latency;
  final String versionNumber;
  final String buildNumber;
}
