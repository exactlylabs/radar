import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';

class LocationsService implements ILocationsService {
  const LocationsService({
    required IHttpProvider httpProvider,
    required RestClient restClient,
  })  : _httpProvider = httpProvider,
        _restClient = restClient;

  final RestClient _restClient;
  final IHttpProvider _httpProvider;

  @override
  Future<List<Location>> getSuggestedLocations(String name) async {
    final failureOrLocations = await _httpProvider.postAndDecode<List>(
      url: _restClient.suggestedLocations,
      headers: {'Content-Type': 'application/json'},
      body: {'address': name},
    );

    return failureOrLocations.fold(
      (failure) => [],
      (locations) => locations.map((location) => Location.fromJson(location)).toList(),
    );
  }
}
