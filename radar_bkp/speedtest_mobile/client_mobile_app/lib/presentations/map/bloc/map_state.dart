class MapState {
  MapState({
    this.isFTUE = false,
  });

  MapState copyWith({bool? isFTUE}) => MapState(isFTUE: isFTUE ?? this.isFTUE);

  final bool isFTUE;
}
