import 'dart:async';

import 'package:client_mobile_app/presentations/map/map_web_view_page.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_page.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class HomePageBody extends StatelessWidget {
  const HomePageBody({
    required this.pageIdx,
    super.key,
  });

  final int pageIdx;

  @override
  Widget build(BuildContext context) {
    if (pageIdx == _SPEED_TEST_PAGE_IDX) {
      return SpeedTestPage();
      return Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Speed Test'),
            GoBackAndContinueButtons(),
            const SizedBox(height: 300),

            const SizedBox(height: 50),
            LocationInputField(),
            // ErrorMessage(
            //     message:
            //         'We could not detect your current location. Make sure you enable location access in your browser and try again.'),
            // const SizedBox(height: 20),
            // CurrentLocationButton(),
          ],
        ),
      );
    } else if (pageIdx == _YOUR_RESULTS_PAGE_IDX) {
      return const Center(child: Text('Your Results'));
    } else if (pageIdx == _MAP_PAGE_IDX) {
      return MapWebViewPage();
    } else {
      return const Center(child: Text('Speed Test'));
    }
  }

  static const int _SPEED_TEST_PAGE_IDX = 0;
  static const int _YOUR_RESULTS_PAGE_IDX = 1;
  static const int _MAP_PAGE_IDX = 2;
}
