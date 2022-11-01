class HttpResponseModel {
  const HttpResponseModel({
    required this.body,
    this.statusCode,
  });

  final int? statusCode;
  final String body;
}
