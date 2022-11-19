import 'dart:async';

import 'package:async/async.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/utils.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';

class LocationStepCubit extends Cubit<LocationStepState> {
  LocationStepCubit({
    required ILocationsService locationsService,
  })  : _locationsService = locationsService,
        super(const LocationStepState());

  final ILocationsService _locationsService;
  CancelableOperation? _lastRequestPromise;
  String? _lastRequestId;

  Future<List<Location>> searchLocations(String query) async {
    if (_lastRequestPromise != null) {
      _lastRequestPromise!.cancel();
    }
    if (query.isEmpty) {
      emit(state.copyWith(isLoading: false));
      return [];
    } else {
      emit(state.copyWith(isLoading: true));
      final requestId = Utils.getRandomString();
      _lastRequestId = requestId;
      _lastRequestPromise = CancelableOperation.fromFuture(_searchLocations(requestId, query));
      return await _lastRequestPromise!.value;
    }
  }

  Future<List<Location>> _searchLocations(String requestId, String query) {
    return _locationsService.getSuggestedLocations(query).then((locations) {
      List<Location> suggestions;
      if (requestId == _lastRequestId) {
        suggestions = locations.length > 2 ? locations.sublist(0, 2) : locations;
        emit(state.copyWith(isLoading: false, suggestions: suggestions));
      } else {
        suggestions = [];
      }
      return suggestions..add(Location.empty(query));
    });
  }
}
