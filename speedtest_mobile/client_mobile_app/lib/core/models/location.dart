import 'package:geolocator/geolocator.dart';

class Location {
  const Location({
    this.latitude,
    this.longitude,
    this.accuracy,
    this.city,
    this.state,
    this.street,
    this.address,
    this.postalCode,
    this.houseNumber,
    this.altitude,
    this.floor,
    this.speed,
    this.speedAccuracy,
    this.heading,
  });

  factory Location.empty(String address) {
    return Location(
      latitude: 39.8282,
      longitude: -98.5696,
      address: address,
    );
  }

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'altitude': altitude,
        'accuracy': accuracy,
        'floor': floor,
        'heading': heading,
        'speed': speed,
        'speedAccuracy': speedAccuracy,
        'city': city,
        'state': state,
        'street': street,
        'address': address,
        'postalCode': postalCode,
        'houseNumber': houseNumber,
      };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
        latitude: json['coordinates'][0] as double?,
        longitude: json['coordinates'][1] as double?,
        address: json['address'] as String?,
        city: json['city'] as String?,
        state: json['state'] as String?,
        street: json['street'] as String?,
        postalCode: json['postal_code'] as String?,
        houseNumber: json['house_number'] as String?,
        altitude: json['altitude'] as double?,
        accuracy: json['accuracy'] as double?,
        floor: json['floor'] as int?,
        heading: json['heading'] as double?,
        speed: json['speed'] as double?,
        speedAccuracy: json['speed_accuracy'] as double?,
      );

  factory Location.fromJsonWithDefaultValues(Map<String, dynamic> json) => Location(
        latitude: double.tryParse(json['coordinates'][0] as String) ?? 0.0,
        longitude: double.tryParse(json['coordinates'][1] as String) ?? 0.0,
        address: json['address'] as String?,
        city: json['city'] as String?,
        state: json['state'] as String?,
        street: json['street'] as String?,
        postalCode: json['postalCode'] as String?,
        houseNumber: json['houseNumber'] as String?,
        altitude: json['altitude'] as double?,
        accuracy: json['accuracy'] as double?,
        floor: json['floor'] as int?,
        heading: json['heading'] as double?,
        speed: json['speed'] as double?,
        speedAccuracy: json['speed_accuracy'] as double?,
      );

  factory Location.fromPosition(Position position) => Location(
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        heading: position.heading,
        accuracy: position.accuracy,
        floor: position.floor,
        speed: position.speed,
        speedAccuracy: position.speedAccuracy,
      );

  Location copyWith({
    double? latitude,
    double? longitude,
    double? altitude,
    double? accuracy,
    int? floor,
    double? heading,
    double? speed,
    double? speedAccuracy,
    String? city,
    String? state,
    String? street,
    String? address,
    String? postalCode,
    String? houseNumber,
  }) {
    return Location(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      altitude: altitude ?? this.altitude,
      accuracy: accuracy ?? this.accuracy,
      floor: floor ?? this.floor,
      heading: heading ?? this.heading,
      speed: speed ?? this.speed,
      speedAccuracy: speedAccuracy ?? this.speedAccuracy,
      city: city ?? this.city,
      state: state ?? this.state,
      street: street ?? this.street,
      address: address ?? this.address,
      postalCode: postalCode ?? this.postalCode,
      houseNumber: houseNumber ?? this.houseNumber,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Location &&
          latitude == other.latitude &&
          longitude == other.longitude &&
          altitude == other.altitude &&
          accuracy == other.accuracy &&
          floor == other.floor &&
          heading == other.heading &&
          speed == other.speed &&
          speedAccuracy == other.speedAccuracy &&
          city == other.city &&
          state == other.state &&
          street == other.street &&
          address == other.address &&
          postalCode == other.postalCode &&
          houseNumber == other.houseNumber;

  @override
  int get hashCode =>
      latitude.hashCode ^
      longitude.hashCode ^
      city.hashCode ^
      state.hashCode ^
      street.hashCode ^
      address.hashCode ^
      postalCode.hashCode ^
      houseNumber.hashCode;

  final String? city;
  final String? street;
  final String? state;
  final String? postalCode;
  final String? houseNumber;
  final String? address;
  final double? longitude;
  final double? latitude;
  final double? altitude;
  final double? accuracy;
  final int? floor;
  final double? heading;
  final double? speed;
  final double? speedAccuracy;
}
