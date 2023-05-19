import 'package:client_mobile_app/core/models/location.dart';

class LocationStepState {
  const LocationStepState({
    this.isLoading = false,
    this.loadingCurrentLocation = false,
    this.loadingSuggestions = false,
    this.currentLocation,
    this.suggestedLocation,
    this.location,
    this.suggestions,
    this.query,
    this.error,
  });

  LocationStepState copyWith({
    String? query,
    String? error,
    bool? isLoading,
    bool? loadingCurrentLocation,
    bool? loadingSuggestions,
    Location? currentLocation,
    Location? suggestedLocation,
    Location? location,
    List<Location>? suggestions,
  }) {
    return LocationStepState(
      query: query ?? this.query,
      error: error ?? this.error,
      isLoading: isLoading ?? this.isLoading,
      loadingCurrentLocation: loadingCurrentLocation ?? this.loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions ?? this.loadingSuggestions,
      currentLocation: currentLocation ?? this.currentLocation,
      suggestedLocation: suggestedLocation ?? this.suggestedLocation,
      location: location ?? this.location,
      suggestions: suggestions ?? this.suggestions,
    );
  }

  LocationStepState setLocation(Location newLocation) {
    return LocationStepState(
      query: query,
      error: null,
      isLoading: isLoading,
      loadingCurrentLocation: loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions,
      currentLocation: currentLocation,
      suggestedLocation: suggestedLocation,
      location: newLocation,
      suggestions: suggestions,
    );
  }

  LocationStepState clearErrors() {
    return LocationStepState(
      query: query,
      error: null,
      isLoading: isLoading,
      loadingCurrentLocation: loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions,
      currentLocation: currentLocation,
      suggestedLocation: suggestedLocation,
      location: location,
      suggestions: suggestions,
    );
  }

  final String? query;
  final String? error;
  final bool isLoading;
  final List<Location>? suggestions;
  final Location? currentLocation;
  final Location? suggestedLocation;
  final Location? location;
  final bool loadingCurrentLocation;
  final bool loadingSuggestions;
}
