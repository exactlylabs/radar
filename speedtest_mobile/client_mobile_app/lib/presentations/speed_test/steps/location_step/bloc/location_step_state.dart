import 'package:client_mobile_app/core/models/location.dart';

class LocationStepState {
  const LocationStepState({
    this.loadingSuggestions = false,
    this.suggestions,
    this.query,
    this.isGeolocationEnabled,
    this.isGeolocationLoading = false,
    this.isLocationLoading = false,
    this.isLocationConfirmed = false,
    this.needsToConfirmLocation = false,
    this.requestLocationPermission = false,
    this.isUsingGeolocation,
    this.geolocation,
    this.location,
    this.failure,
  });

  LocationStepState copyWith({
    String? query,
    bool? loadingSuggestions,
    List<Location>? suggestions,
    bool? isGeolocationEnabled,
    bool? isGeolocationLoading,
    bool? isUsingGeolocation,
    bool? isLocationLoading,
    bool? isLocationConfirmed,
    bool? needsToConfirmLocation,
    bool? requestLocationPermission,
    Location? geolocation,
    Location? location,
    String? failure,
  }) {
    return LocationStepState(
      query: query ?? this.query,
      loadingSuggestions: loadingSuggestions ?? this.loadingSuggestions,
      suggestions: suggestions ?? this.suggestions,
      isGeolocationEnabled: isGeolocationEnabled ?? this.isGeolocationEnabled,
      isGeolocationLoading: isGeolocationLoading ?? this.isGeolocationLoading,
      geolocation: geolocation ?? this.geolocation,
      location: location ?? this.location,
      isLocationLoading: isLocationLoading ?? this.isLocationLoading,
      isUsingGeolocation: isUsingGeolocation ?? this.isUsingGeolocation,
      isLocationConfirmed: isLocationConfirmed ?? this.isLocationConfirmed,
      needsToConfirmLocation: needsToConfirmLocation ?? this.needsToConfirmLocation,
      requestLocationPermission: requestLocationPermission ?? this.requestLocationPermission,
      failure: failure ?? this.failure,
    );
  }

  LocationStepState searchingForNewLocation(String query) {
    return LocationStepState(
      query: query,
      loadingSuggestions: true,
      suggestions: suggestions,
      isGeolocationEnabled: isGeolocationEnabled,
      isGeolocationLoading: isGeolocationLoading,
      geolocation: geolocation,
      location: null,
      isLocationLoading: true,
      isUsingGeolocation: isUsingGeolocation,
      isLocationConfirmed: false,
      needsToConfirmLocation: false,
      failure: failure,
      requestLocationPermission: requestLocationPermission,
    );
  }

  LocationStepState clearErrors() {
    return LocationStepState(
      query: query,
      loadingSuggestions: loadingSuggestions,
      location: location,
      suggestions: suggestions,
    );
  }

  final String? query;
  final Location? location;
  final List<Location>? suggestions;
  final bool loadingSuggestions;

  final String? failure;
  final Location? geolocation;
  final bool isGeolocationLoading;
  final bool isLocationLoading;
  final bool? isGeolocationEnabled;
  final bool? isUsingGeolocation;
  final bool isLocationConfirmed;
  final bool needsToConfirmLocation;
  final bool requestLocationPermission;
}
