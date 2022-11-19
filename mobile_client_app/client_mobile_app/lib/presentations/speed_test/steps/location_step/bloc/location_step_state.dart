import 'package:client_mobile_app/core/models/location.dart';

class LocationStepState {
  const LocationStepState({
    this.isLoading = false,
    this.query,
    this.suggestions,
  });

  LocationStepState copyWith({
    String? query,
    bool? isLoading,
    List<Location>? suggestions,
  }) {
    return LocationStepState(
      isLoading: isLoading ?? this.isLoading,
      query: query ?? this.query,
      suggestions: suggestions ?? this.suggestions,
    );
  }

  final String? query;
  final bool isLoading;
  final List<Location>? suggestions;
}
