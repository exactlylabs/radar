import 'package:async/async.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/utils.dart';
import 'package:dio/dio.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

class LocationsService implements ILocationsService {
  LocationsService({
    required IHttpProvider httpProvider,
    required RestClient restClient,
  })  : _httpProvider = httpProvider,
        _restClient = restClient;

  final RestClient _restClient;
  final IHttpProvider _httpProvider;
  CancelableOperation? _lastRequestPromise;
  String? _lastRequestId;

  @override
  Future<List<Location>> getSuggestedLocations(String query) async {
    return _uniqueRequest<List<Location>>((requestId) => _getSuggestedLocations(requestId, query));
  }

  @override
  Future<Location?> getLocationByCoordinates(double latitude, double longitude) async {
    return _uniqueRequest<Location?>((requestId) => _getLocationByCoordinates(requestId, latitude, longitude));
  }

  Future<List<Location>> _getSuggestedLocations(String requestId, String query) async {
    return _suggestedLocationsRequest(query).then((locations) {
      List<Location> suggestions;
      if (requestId == _lastRequestId) {
        suggestions = locations.length > 2 ? locations.sublist(0, 2) : locations;
      } else {
        suggestions = [];
      }
      return suggestions..add(Location.empty(query));
    });
  }

  Future<Location?> _getLocationByCoordinates(String requestId, double latitude, double longitude) async {
    return _locationByCoordinatesRequest(latitude, longitude).then((location) {
      if (requestId == _lastRequestId) {
        return location;
      } else {
        return null;
      }
    });
  }

  Future<List<Location>> _suggestedLocationsRequest(String name) async {
    final failureOrLocations = await _httpProvider.postAndDecode<List>(
      url: _restClient.suggestedLocations,
      headers: {'Content-Type': 'application/json'},
      body: {'address': name},
    );

    return failureOrLocations.fold(
      (failure) {
        Sentry.captureException(failure.exception, stackTrace: failure.stackTrace);
        return [];
      },
      (locations) => locations.map((location) => Location.fromJson(location)).toList(),
    );
  }

  Future<Location?> _locationByCoordinatesRequest(double latitude, double longitude) async {
    final failureOrLocation = await _httpProvider.postAndDecode(
      url: _restClient.locationByCoordinates,
      headers: {'Content-Type': 'application/json'},
      body: FormData.fromMap({'coordinates': "$latitude, $longitude"}),
      fromJson: (json) => Location.fromJsonWithDefaultValues(json),
    );
    return failureOrLocation.fold(
      (failure) {
        Sentry.captureException(failure.exception, stackTrace: failure.stackTrace);
        return null;
      },
      (location) => location,
    );
  }

  Future<T> _uniqueRequest<T>(Future<T> Function(String) result) async {
    if (_lastRequestPromise != null) {
      _lastRequestPromise!.cancel();
    }
    final requestId = Utils.getRandomString();
    _lastRequestId = requestId;
    _lastRequestPromise = CancelableOperation.fromFuture(result(requestId));
    return await _lastRequestPromise!.value as T;
  }
}
