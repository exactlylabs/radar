class NavigationState {
  NavigationState({this.currentIndex = 0});

  NavigationState copyWith({int? currentIndex}) => NavigationState(currentIndex: currentIndex ?? this.currentIndex);

  final int currentIndex;
}
