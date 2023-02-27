import 'dart:async';

import 'package:geolocator/geolocator.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';

class LocationStepCubit extends Cubit<LocationStepState> {
  LocationStepCubit({
    required ILocationsService locationsService,
    Location? location,
    bool termsAccepted = false,
  })  : _locationsService = locationsService,
        super(LocationStepState(location: location)) {
    search("");
  }

  final ILocationsService _locationsService;

  Timer? _delayedSearchTimer;
  Completer<List<Location>>? _completer;

  Future<List<Location>> delayedSearch(String query) async {
    if (_delayedSearchTimer != null) {
      _delayedSearchTimer!.cancel();
      _completer = null;
    }
    if (query.isEmpty) {
      reset();
      return [];
    }
    if (state.currentLocation?.address == query ||
        state.location?.address == query ||
        (state.suggestions?.any((suggestion) => suggestion.address == query) ?? false)) {
      return [];
    }
    _completer = Completer<List<Location>>();
    _delayedSearchTimer =
        Timer(const Duration(milliseconds: 400), () async => _completer!.complete(await search(query)));
    return _completer!.future;
  }

  Future<List<Location>> search(String query, [bool? searchInWrite]) async {
    if (query.isNotEmpty) {
      if (_delayedSearchTimer != null) _delayedSearchTimer!.cancel();
      emit(state.copyWith(query: query, isLoading: true, loadingSuggestions: true));
      final locations = await _locationsService.getSuggestedLocations(query);
      emit(state.copyWith(suggestions: locations, isLoading: false, loadingSuggestions: false));
      return locations;
    }
    return [];
  }

  Future<void> getCurrentLocation() async {
    emit(state.copyWith(isLoading: true, loadingCurrentLocation: true));
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.deniedForever) {
        emit(state.copyWith(isLoading: false, loadingCurrentLocation: false, error: Strings.locationError));
        return;
      }
    }
    final position = await Geolocator.getCurrentPosition();
    getLocationByLatLng(position.latitude, position.longitude, false);
  }

  Future<void> getLocationByLatLng(double lat, double lng, bool isSuggestedLocation) async {
    emit(state.copyWith(isLoading: true));
    final location = await _locationsService.getLocationByCoordinates(lat, lng);
    emit(state.clearErrors());
    if (isSuggestedLocation) {
      emit(state.copyWith(suggestedLocation: location, isLoading: false));
    } else {
      emit(state.copyWith(currentLocation: location, isLoading: false, loadingCurrentLocation: false));
    }
  }

  Future<void> updateLocationLatLng(double lat, double lng) async {
    if (state.currentLocation != null) {
      Location newLocation = state.currentLocation!.copyWith(lat: lat, long: lng);
      emit(state.copyWith(currentLocation: newLocation, loadingCurrentLocation: false));
    }
  }

  void setLocationError() => emit(state.copyWith(error: Strings.locationMissingError));

  void setSuggestedLocation(Location location) => emit(state.copyWith(suggestedLocation: location));

  void reset() => emit(const LocationStepState());

  void useCurrentLocation() {
    if (state.currentLocation == null) return;
    emit(state.setLocation(state.currentLocation!));
  }

  void useSuggestedLocation() {
    if (state.suggestedLocation == null) return;
    emit(state.setLocation(state.suggestedLocation!));
  }
}
