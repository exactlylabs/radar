import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class MapCubit extends Cubit<MapState> {
  MapCubit({
    required LocalStorage localStorage,
  })  : _localStorage = localStorage,
        super(MapState()) {
    _loadFTUEMap();
  }

  final LocalStorage _localStorage;

  void _loadFTUEMap() {
    final isFTUE = _localStorage.getFTUEMap();
    emit(state.copyWith(isFTUE: isFTUE));
  }

  void setFTUEMap() {
    _localStorage.setFTUEMap();
    emit(state.copyWith(isFTUE: false));
  }
}
