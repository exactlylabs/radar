class NavigationState {
  NavigationState({
    this.currentIndex = 0,
    this.args,
  });

  NavigationState copyWith({
    int? currentIndex,
    dynamic args,
  }) {
    return NavigationState(
      currentIndex: currentIndex ?? this.currentIndex,
      args: args ?? this.args,
    );
  }

  final dynamic args;
  final int currentIndex;
}
