class Location {
  const Location({
    required this.lat,
    required this.long,
    required this.address,
  });

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'long': long,
        'address': address,
      };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
        lat: json['lat'] as String,
        long: json['long'] as String,
        address: json['address'] as String,
      );

  final String address;
  final String lat;
  final String long;
}
