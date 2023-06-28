import 'package:dio/dio.dart';
import 'package:async/async.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/utils.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';

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
    return _uniqueRequest<Location?>(
        (requestId) => _getLocationByCoordinates(requestId, latitude, longitude));
  }

  Future<List<Location>> _getSuggestedLocations(String requestId, String query) async {
    final userCoordinates = await _getUserCoordinates(requestId);
    Location userLocation = Location.empty(query);
    if (userCoordinates.latitude != null && userCoordinates.longitude != null) {
      userLocation = userLocation.copyWith(
          latitude: userCoordinates.latitude, longitude: userCoordinates.longitude);
    }
    return _suggestedLocationsRequest(query).then((locations) {
      List<Location> suggestions;
      if (requestId == _lastRequestId) {
        suggestions = locations.length > 2 ? locations.sublist(0, 2) : locations;
      } else {
        suggestions = [];
      }

      return suggestions..add(userLocation);
    });
  }

  Future<Location?> _getLocationByCoordinates(
      String requestId, double latitude, double longitude) async {
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: {'address': name},
    );

    if (failureOrLocations.failure != null) {
      Sentry.captureException(failureOrLocations.failure!.exception,
          stackTrace: failureOrLocations.failure!.stackTrace);
      return [];
    } else {
      return failureOrLocations.response!.map((location) => Location.fromJson(location)).toList();
    }
  }

  Future<Location?> _locationByCoordinatesRequest(double latitude, double longitude) async {
    final failureOrLocation = await _httpProvider.postAndDecode(
      url: _restClient.locationByCoordinates,
      headers: {
        'Content-Type': 'application/json',
      },
      body: FormData.fromMap({'coordinates': "$latitude, $longitude"}),
      fromJson: (json) {
        if (json.containsKey('coordinates') && (json['coordinates'] as List).length == 2) {
          return Location.fromJsonWithDefaultValues(json);
        } else {
          return null;
        }
      },
    );
    if (failureOrLocation.failure != null) {
      Sentry.captureException(failureOrLocation.failure!.exception,
          stackTrace: failureOrLocation.failure!.stackTrace);
      return null;
    } else {
      return failureOrLocation.response;
    }
  }

  Future<({double? latitude, double? longitude})> _getUserCoordinates(String requestId) async {
    final failureOrLocation = await _httpProvider.getAndDecode<List>(
      url: _restClient.userCoordinates,
      headers: {
        'Content-Type': 'application/json',
      },
    );

    if (failureOrLocation.failure != null) {
      Sentry.captureException(failureOrLocation.failure!.exception,
          stackTrace: failureOrLocation.failure!.stackTrace);
      return (latitude: null, longitude: null);
    } else {
      return (
        latitude: failureOrLocation.response![0] as double,
        longitude: failureOrLocation.response![1] as double
      );
    }
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
