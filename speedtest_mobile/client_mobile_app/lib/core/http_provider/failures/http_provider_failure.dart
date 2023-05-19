class HttpProviderFailure {
  HttpProviderFailure({
    this.exception,
    this.stackTrace,
    this.arguments,
  });

  final Object? exception;
  final StackTrace? stackTrace;
  final Map<String, List<String>>? arguments;
}
