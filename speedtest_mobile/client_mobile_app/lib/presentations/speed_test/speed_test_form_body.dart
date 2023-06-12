import 'package:flutter/material.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/network_place_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/monthly_bill_cost_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/take_speed_test_step.dart';

class SpeedTestFormBody extends StatelessWidget {
  const SpeedTestFormBody({
    Key? key,
    required this.step,
    required this.isStepValid,
    this.location,
    this.networkType,
    this.monthlyBillCost,
    this.networkLocation,
  }) : super(key: key);

  final int step;
  final bool isStepValid;
  final Location? location;
  final String? networkType;
  final int? monthlyBillCost;
  final String? networkLocation;

  @override
  Widget build(BuildContext context) {
    switch (step) {
      case _LOCATION_STEP:
        return LocationStep(location: location);
      case _NETWORK_PLACE_STEP:
        return NetworkPlaceStep(
          isStepValid: isStepValid,
          address: location?.address,
          optionSelected: networkLocation,
        );
      case _MONTHLY_BILL_COST_STEP:
        return MonthlyBillCostStep(
          billCost: monthlyBillCost,
          isStepValid: isStepValid,
        );
      case _TAKE_SPEED_TEST_STEP:
        return TakeSpeedTestStep(
          networkType: networkType,
          networkPlace: networkLocation,
          address: location?.address,
          latitude: location?.latitude,
          longitude: location?.longitude,
        );
      default:
        return Container();
    }
  }

  static const _LOCATION_STEP = 0;
  static const _NETWORK_PLACE_STEP = 1;
  static const _MONTHLY_BILL_COST_STEP = 2;
  static const _TAKE_SPEED_TEST_STEP = 3;
}
