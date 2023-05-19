import 'package:client_mobile_app/core/models/location.dart';

abstract class ILocationsService {
  Future<List<Location>> getSuggestedLocations(String name);

  Future<Location?> getLocationByCoordinates(double latitude, double longitude);
}
