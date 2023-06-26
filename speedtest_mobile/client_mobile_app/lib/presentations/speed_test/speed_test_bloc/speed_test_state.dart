import 'package:client_mobile_app/core/models/location.dart';

class SpeedTestState {
  const SpeedTestState({
    this.step = 0,
    this.isStepValid = true,
    this.loss,
    this.upload,
    this.latency,
    this.location,
    this.download,
    this.networkType,
    this.monthlyBillCost,
    this.networkLocation,
    this.isTestRunning = false,
    this.isLocationLoading = false,
    this.isFormEnded = false,
    this.versionNumber,
    this.buildNumber,
    this.termsAccepted = true,
    this.isLoadingTerms = true,
  });

  SpeedTestState copyWith({
    int? step,
    bool? isStepValid,
    double? loss,
    double? upload,
    double? latency,
    Location? location,
    double? download,
    String? networkType,
    int? monthlyBillCost,
    String? networkLocation,
    bool? isTestRunning,
    bool? isLocationLoading,
    bool? isFormEnded,
    String? versionNumber,
    String? buildNumber,
    bool? termsAccepted,
    bool? isLoadingTerms,
    bool? hasWarnings,
  }) =>
      SpeedTestState(
        step: step ?? this.step,
        isStepValid: isStepValid ?? this.isStepValid,
        loss: loss ?? this.loss,
        upload: upload ?? this.upload,
        latency: latency ?? this.latency,
        location: location ?? this.location,
        download: download ?? this.download,
        networkType: networkType ?? this.networkType,
        monthlyBillCost: monthlyBillCost ?? this.monthlyBillCost,
        networkLocation: networkLocation ?? this.networkLocation,
        isTestRunning: isTestRunning ?? this.isTestRunning,
        isLocationLoading: isLocationLoading ?? this.isLocationLoading,
        isFormEnded: isFormEnded ?? this.isFormEnded,
        versionNumber: versionNumber ?? this.versionNumber,
        buildNumber: buildNumber ?? this.buildNumber,
        termsAccepted: termsAccepted ?? this.termsAccepted,
        isLoadingTerms: isLoadingTerms ?? this.isLoadingTerms,
      );

  SpeedTestState resetSpecificStep(bool networkLocation, bool networkType, bool monthlyBillCost) =>
      SpeedTestState(
        step: step,
        isStepValid: isStepValid,
        loss: loss,
        upload: upload,
        latency: latency,
        location: location,
        download: download,
        networkType: networkType ? null : this.networkType,
        monthlyBillCost: monthlyBillCost ? null : this.monthlyBillCost,
        networkLocation: networkLocation ? null : this.networkLocation,
        isTestRunning: isTestRunning,
        isLocationLoading: isLocationLoading,
        isFormEnded: isFormEnded,
        versionNumber: versionNumber,
        buildNumber: buildNumber,
        termsAccepted: termsAccepted,
        isLoadingTerms: isLoadingTerms,
      );

  final int step;
  final bool isStepValid;
  final double? loss;
  final double? upload;
  final double? latency;
  final double? download;
  final Location? location;
  final bool isTestRunning;
  final String? networkType;
  final bool isLocationLoading;
  final String? networkLocation;
  final int? monthlyBillCost;
  final bool isFormEnded;
  final String? versionNumber;
  final String? buildNumber;
  final bool termsAccepted;
  final bool isLoadingTerms;
}
