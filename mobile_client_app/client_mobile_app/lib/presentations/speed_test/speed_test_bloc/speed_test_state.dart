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
    this.termsError,
    this.locationError,
    this.isTestRunning = false,
    this.termsAccepted = false,
    this.isLocationLoading = false,
    this.isFormEnded = false,
  });

  factory SpeedTestState.fromJson(Map<String, dynamic> json) => SpeedTestState(
        step: json['step'],
        isStepValid: json['isStepValid'],
        loss: json['loss'],
        upload: json['upload'],
        latency: json['latency'],
        location: json['location'],
        download: json['download'],
        networkType: json['networkType'],
        monthlyBillCost: json['monthlyBillCost'],
        networkLocation: json['networkLocation'],
        isTestRunning: json['isTestRunning'],
        termsAccepted: json['termsAccepted'],
        isLocationLoading: json['isLocationLoading'],
        termsError: json['termsError'],
        locationError: json['locationError'],
        isFormEnded: json['isFormEnded'],
      );

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
    bool? termsAccepted,
    bool? isLocationLoading,
    String? termsError,
    String? locationError,
    bool? isFormEnded,
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
        termsAccepted: termsAccepted ?? this.termsAccepted,
        isLocationLoading: isLocationLoading ?? this.isLocationLoading,
        isFormEnded: isFormEnded ?? this.isFormEnded,
        termsError: termsError ?? this.termsError,
        locationError: locationError ?? this.locationError,
      );

  Map<String, dynamic> toJson() {
    return {
      'step': step,
      'isStepValid': isStepValid,
      'loss': loss,
      'upload': upload,
      'latency': latency,
      'location': location,
      'download': download,
      'networkType': networkType,
      'monthlyBillCost': monthlyBillCost,
      'networkLocation': networkLocation,
      'isTestRunning': isTestRunning,
      'termsAccepted': termsAccepted,
      'isLocationLoading': isLocationLoading,
      'termsError': termsError,
      'locationError': locationError,
      'isFormEnded': isFormEnded,
    };
  }

  final int step;
  final bool isStepValid;
  final double? loss;
  final double? upload;
  final double? latency;
  final double? download;
  final Location? location;
  final String? locationError;
  final bool termsAccepted;
  final String? termsError;
  final bool isTestRunning;
  final String? networkType;
  final bool isLocationLoading;
  final String? networkLocation;
  final int? monthlyBillCost;
  final bool isFormEnded;
}
