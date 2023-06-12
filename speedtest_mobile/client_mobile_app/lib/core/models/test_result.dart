import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';

class TestResult {
  TestResult({
    required this.location,
    required this.testedAt,
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
    this.locationBefore,
    this.locationAfter,
  });

  factory TestResult.fromJson(Map<String, dynamic> json) => TestResult(
        location: Location(
          latitude: json['latitude'] as double?,
          longitude: json['longitude'] as double?,
          altitude: json['altitude'] as double?,
          address: json['address'] as String?,
          city: json['city'] as String?,
          street: json['street'] as String?,
          state: json['state'] as String?,
          postalCode: json['postal_code'] as String?,
          houseNumber: json['house_number'] as String?,
        ),
        testedAt: DateTime.parse(json['tested_at'] ?? json['dateTime']),
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
      'tested_at': testedAt.toString(),
      'latitude': location.latitude,
      'longitude': location.longitude,
      'altitude': location.altitude,
      'accuracy': location.accuracy,
      'floor': location.floor,
      'heading': location.heading,
      'speed': location.speed,
      'speed_accuracy': location.speedAccuracy,
      'address': location.address,
      'city': location.city,
      'street': location.street,
      'state': location.state,
      'postal_code': location.postalCode,
      'house_number': location.houseNumber,
      'network_type': networkType,
      'network_location': networkLocation,
      'network_cost': networkCost,
      'version_number': versionNumber,
      'build_number': buildNumber,
      'latitude_before': locationBefore?.latitude,
      'longitude_before': locationBefore?.longitude,
      'altitude_before': locationBefore?.altitude,
      'accuracy_before': locationBefore?.accuracy,
      'floor_before': locationBefore?.floor,
      'heading_before': locationBefore?.heading,
      'speed_before': locationBefore?.speed,
      'speed_accuracy_before': locationBefore?.speedAccuracy,
      'latitude_after': locationAfter?.latitude,
      'longitude_after': locationAfter?.longitude,
      'altitude_after': locationAfter?.altitude,
      'accuracy_after': locationAfter?.accuracy,
      'floor_after': locationAfter?.floor,
      'heading_after': locationAfter?.heading,
      'speed_after': locationAfter?.speed,
      'speed_accuracy_after': locationAfter?.speedAccuracy,
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'tested_at': testedAt.toString(),
      'download': download,
      'upload': upload,
      'loss': loss,
      'latency': latency,
      'latitude': location.latitude,
      'longitude': location.longitude,
      'altitude': location.altitude,
      'floor': location.floor,
      'heading': location.heading,
      'speed': location.speed,
      'speedAccuracy': location.speedAccuracy,
      'address': location.address,
      'city': location.city,
      'street': location.street,
      'state': location.state,
      'postal_code': location.postalCode,
      'house_number': location.houseNumber,
      'network_type': networkType,
      'network_location': networkLocation,
      'network_cost': networkCost,
      'network_quality': networkQuality,
      'version_number': versionNumber,
      'build_number': buildNumber,
    };
  }

  final DateTime testedAt;
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
  final Location location;
  final Location? locationBefore;
  final Location? locationAfter;
}
