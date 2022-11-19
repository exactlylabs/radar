class Location {
  const Location({
    required this.lat,
    required this.long,
    required this.city,
    required this.state,
    required this.street,
    required this.address,
    required this.postalCode,
    required this.houseNumber,
  });

  factory Location.empty(String address) {
    return Location(
      lat: 0.0,
      long: 0.0,
      city: '',
      state: '',
      street: '',
      address: address,
      postalCode: '',
      houseNumber: '',
    );
  }

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'long': long,
        'city': city,
        'state': state,
        'street': street,
        'address': address,
        'postalCode': postalCode,
        'houseNumber': houseNumber,
      };

  factory Location.fromJson(Map<String, dynamic> json) => Location(
        lat: json['coordinates'][0] as double,
        long: json['coordinates'][1] as double,
        address: json['address'] as String,
        city: json['city'] as String,
        state: json['state'] as String,
        street: json['street'] as String,
        postalCode: json['postal_code'] as String,
        houseNumber: json['house_number'] as String,
      );

  final String city;
  final String street;
  final String state;
  final String postalCode;
  final String houseNumber;
  final String address;
  final double lat;
  final double long;
}
