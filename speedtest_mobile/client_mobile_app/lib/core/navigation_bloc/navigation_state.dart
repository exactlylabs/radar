class NavigationState {
  NavigationState({
    this.args,
    this.canNavigate = false,
    this.currentIndex = 0,
  });

  NavigationState copyWith({
    int? currentIndex,
    bool? canNavigate,
    dynamic args,
  }) {
    return NavigationState(
      args: args ?? this.args,
      canNavigate: canNavigate ?? this.canNavigate,
      currentIndex: currentIndex ?? this.currentIndex,
    );
  }

  final dynamic args;
  final int currentIndex;
  final bool canNavigate;
}
