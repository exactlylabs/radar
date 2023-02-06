import 'package:client_mobile_app/core/models/location.dart';
import 'package:flutter/material.dart';

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
    this.termsAccepted = false,
    this.isTestRunning = false,
    this.isLocationLoading = false,
    this.isFormEnded = false,
    this.versionNumber,
    this.buildNumber,
    this.onContinue,
    this.onBack,
    this.isFTUEApp = false,
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
    bool? termsAccepted,
    bool? isLocationLoading,
    bool? isFormEnded,
    String? versionNumber,
    String? buildNumber,
    VoidCallback? onContinue,
    VoidCallback? onBack,
    bool? isFTUEApp,
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
        termsAccepted: termsAccepted ?? this.termsAccepted,
        onContinue: step != null && step != this.step ? null : onContinue ?? this.onContinue,
        onBack: step != null && step != this.step ? null : onBack ?? this.onBack,
        versionNumber: versionNumber ?? this.versionNumber,
        buildNumber: buildNumber ?? this.buildNumber,
        isFTUEApp: isFTUEApp ?? this.isFTUEApp,
      );

  SpeedTestState resetSpecificStep(bool networkLocation, bool networkType, bool monthlyBillCost) => SpeedTestState(
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
        onContinue: null,
        onBack: null,
        isFTUEApp: isFTUEApp,
      );

  SpeedTestState resetCallbacks() {
    return SpeedTestState(
      step: step,
      isStepValid: isStepValid,
      loss: loss,
      upload: upload,
      latency: latency,
      location: location,
      download: download,
      networkType: networkType,
      monthlyBillCost: monthlyBillCost,
      networkLocation: networkLocation,
      isTestRunning: isTestRunning,
      isLocationLoading: isLocationLoading,
      isFormEnded: isFormEnded,
      termsAccepted: termsAccepted,
      versionNumber: versionNumber,
      buildNumber: buildNumber,
      onContinue: null,
      onBack: null,
      isFTUEApp: isFTUEApp,
    );
  }

  final int step;
  final bool isStepValid;
  final double? loss;
  final double? upload;
  final double? latency;
  final double? download;
  final Location? location;
  final bool termsAccepted;
  final bool isTestRunning;
  final String? networkType;
  final bool isLocationLoading;
  final String? networkLocation;
  final int? monthlyBillCost;
  final bool isFormEnded;
  final String? versionNumber;
  final String? buildNumber;
  final bool isFTUEApp;
  final VoidCallback? onContinue;
  final VoidCallback? onBack;
}
