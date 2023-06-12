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
    loadGeolocation();
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
      return [];
    }
    if (state.location?.address == query ||
        (state.suggestions?.any((suggestion) => suggestion.address == query) ?? false)) {
      return [];
    }
    _completer = Completer<List<Location>>();
    _delayedSearchTimer = Timer(
        const Duration(milliseconds: 400), () async => _completer!.complete(await _search(query)));
    return _completer!.future;
  }

  Future<List<Location>> _search(String query) async {
    if (query.isNotEmpty) {
      if (_delayedSearchTimer != null) _delayedSearchTimer!.cancel();
      emit(state.searchingForNewLocation(query));
      final locations = await _locationsService.getSuggestedLocations(query);
      emit(state.copyWith(
          suggestions: locations, isLocationLoading: false, loadingSuggestions: false));
      return locations;
    }
    return [];
  }

  void reset() {
    final isGeolocationEnabled = state.isGeolocationEnabled;
    final isUsingGeolocation = state.isUsingGeolocation;
    final geolocation = state.geolocation;
    emit(LocationStepState(
        isGeolocationEnabled: isGeolocationEnabled,
        isUsingGeolocation: isUsingGeolocation,
        geolocation: geolocation));
  }

  Future<void> loadGeolocation() async {
    final geolocationEnabled = await isGeolocationEnabled();
    emit(state.copyWith(isGeolocationEnabled: geolocationEnabled));
    if (geolocationEnabled ?? false) {
      await getGeolocation();
    }
  }

  Future<bool?> isGeolocationEnabled() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.deniedForever) {
      return false;
    } else if (permission == LocationPermission.denied) {
      emit(state.copyWith(requestLocationPermission: true));
      return null;
    }
    return true;
  }

  Future<void> requestLocationPermission() async {
    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      emit(state.copyWith(requestLocationPermission: true, isGeolocationEnabled: false));
    } else {
      emit(state.copyWith(requestLocationPermission: false, isGeolocationEnabled: true));
      await getGeolocation();
    }
  }

  void cancelLocationPermissionRequest() => emit(state.copyWith(requestLocationPermission: false));

  Future<void> getGeolocation() async {
    if (state.isGeolocationEnabled ?? false) {
      emit(state.copyWith(isGeolocationLoading: true));
      final position = await Geolocator.getCurrentPosition();
      final location = await getLocationByLatLng(position.latitude, position.longitude);
      if (location != null) {
        final geolocation = location.copyWith(
          altitude: position.altitude,
          heading: position.heading,
          floor: position.floor,
          speed: position.speed,
          speedAccuracy: position.speedAccuracy,
        );
        emit(state.copyWith(isGeolocationLoading: false, geolocation: geolocation));
      } else {
        useInputLocationOption();
      }
    }
  }

  Future<Location?> getLocationByLatLng(double lat, double lng) async {
    final location = await _locationsService.getLocationByCoordinates(lat, lng);
    return location;
  }

  void useInputLocationOption() => emit(state.copyWith(isUsingGeolocation: false));

  void useGeolocationOption() {
    if (!(state.isGeolocationEnabled ?? false)) {
      emit(state.copyWith(failure: Strings.locationMissingError));
      return;
    }
    emit(state.copyWith(isUsingGeolocation: true));
  }

  void confirmGeolocation() {
    if (state.geolocation == null) return;
    emit(state.copyWith(isUsingGeolocation: true, isLocationConfirmed: true));
  }

  void accurateGeolocation(double lat, double long) {
    final accurateGeolocation = state.geolocation!.copyWith(latitude: lat, longitude: long);
    emit(state.copyWith(geolocation: accurateGeolocation));
  }

  void accurateLocation(double lat, double long) {
    Location? accurateLocation;
    if (!state.isGeolocationEnabled! && state.location == null) {
      accurateLocation = Location.empty(state.query ?? '');
    } else {
      accurateLocation = state.location!.copyWith(latitude: lat, longitude: long);
    }
    emit(state.copyWith(location: accurateLocation));
  }

  void chooseLocationOption([Location? location, bool canUseLocation = true]) {
    final locationEval = (location == null || !canUseLocation) ? null : location;
    emit(state.copyWith(
        isUsingGeolocation: false,
        isLocationConfirmed: false,
        needsToConfirmLocation: true,
        location: locationEval,
        query: location != null ? '' : null));
  }

  void confirmInputLocation(Location location) {
    emit(state.copyWith(
        isUsingGeolocation: false,
        isLocationConfirmed: true,
        needsToConfirmLocation: false,
        location: location));
  }
}
