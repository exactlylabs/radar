class TakeSpeedTestStepState {
  const TakeSpeedTestStepState({
    this.downloadSpeed,
    this.uploadSpeed,
    this.finishedTesting = false,
    this.isTestingDownloadSpeed = false,
    this.isTestingUploadSpeed = false,
  });

  TakeSpeedTestStepState copyWith({
    bool? finishedTesting,
    bool? isTestingDownloadSpeed,
    bool? isTestingUploadSpeed,
    double? downloadSpeed,
    double? uploadSpeed,
  }) {
    return TakeSpeedTestStepState(
      finishedTesting: finishedTesting ?? this.finishedTesting,
      downloadSpeed: downloadSpeed ?? this.downloadSpeed,
      uploadSpeed: uploadSpeed ?? this.uploadSpeed,
      isTestingDownloadSpeed: isTestingDownloadSpeed ?? this.isTestingDownloadSpeed,
      isTestingUploadSpeed: isTestingUploadSpeed ?? this.isTestingUploadSpeed,
    );
  }

  final bool finishedTesting;
  final bool isTestingDownloadSpeed;
  final bool isTestingUploadSpeed;
  final double? downloadSpeed;
  final double? uploadSpeed;
}
