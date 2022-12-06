import 'package:client_mobile_app/core/models/location.dart';

class LocationStepState {
  const LocationStepState({
    this.isLoading = false,
    this.loadingCurrentLocation = false,
    this.loadingSuggestions = false,
    this.termsAccepted = false,
    this.currentLocation,
    this.suggestedLocation,
    this.location,
    this.suggestions,
    this.query,
    this.termsError,
    this.locationError,
  });

  LocationStepState copyWith({
    String? query,
    String? termsError,
    String? locationError,
    bool? isLoading,
    bool? loadingCurrentLocation,
    bool? loadingSuggestions,
    bool? termsAccepted,
    Location? currentLocation,
    Location? suggestedLocation,
    Location? location,
    List<Location>? suggestions,
  }) {
    return LocationStepState(
      query: query ?? this.query,
      termsError: termsError ?? this.termsError,
      locationError: locationError ?? this.locationError,
      isLoading: isLoading ?? this.isLoading,
      loadingCurrentLocation: loadingCurrentLocation ?? this.loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions ?? this.loadingSuggestions,
      termsAccepted: termsAccepted ?? this.termsAccepted,
      currentLocation: currentLocation ?? this.currentLocation,
      suggestedLocation: suggestedLocation ?? this.suggestedLocation,
      location: location ?? this.location,
      suggestions: suggestions ?? this.suggestions,
    );
  }

  LocationStepState acceptTerms(bool value) {
    return LocationStepState(
      query: query,
      termsError: null,
      locationError: null,
      isLoading: isLoading,
      loadingCurrentLocation: loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions,
      termsAccepted: value,
      currentLocation: currentLocation,
      suggestedLocation: suggestedLocation,
      location: location,
      suggestions: suggestions,
    );
  }

  LocationStepState setLocation(Location newLocation) {
    return LocationStepState(
      query: query,
      termsError: null,
      locationError: null,
      isLoading: isLoading,
      loadingCurrentLocation: loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions,
      termsAccepted: termsAccepted,
      currentLocation: currentLocation,
      suggestedLocation: suggestedLocation,
      location: newLocation,
      suggestions: suggestions,
    );
  }

  LocationStepState clearErrors() {
    return LocationStepState(
      query: query,
      termsError: null,
      locationError: null,
      isLoading: isLoading,
      loadingCurrentLocation: loadingCurrentLocation,
      loadingSuggestions: loadingSuggestions,
      termsAccepted: termsAccepted,
      currentLocation: currentLocation,
      suggestedLocation: suggestedLocation,
      location: location,
      suggestions: suggestions,
    );
  }

  final String? query;
  final String? termsError;
  final String? locationError;
  final bool isLoading;
  final bool termsAccepted;
  final List<Location>? suggestions;
  final Location? currentLocation;
  final Location? suggestedLocation;
  final Location? location;
  final bool loadingCurrentLocation;
  final bool loadingSuggestions;
}
