import 'dart:async';

import 'package:client_mobile_app/presentations/map/map_web_view_page.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
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
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Speed Test'),
          GoBackAndContinueButtons(),
          const SizedBox(height: 300),
          FutureBuilder(
            future: _loadCheckImageInfo(context),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return CustomPaint(
                    painter: StepsIndicator(
                      imageInfo: snapshot.data as ImageInfo,
                      currentStep: 2,
                      totalSteps: 4,
                      textColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                      currentTextColor: Theme.of(context).colorScheme.onPrimary,
                      stepColor: Theme.of(context).colorScheme.surface,
                      currentStepColor: Theme.of(context).colorScheme.secondary,
                    ),
                    child: Container());
              } else {
                return Container();
              }
            },
          ),
        ],
      );
    } else if (pageIdx == _YOUR_RESULTS_PAGE_IDX) {
      return const Center(child: Text('Your Results'));
    } else if (pageIdx == _MAP_PAGE_IDX) {
      return MapWebViewPage();
    } else {
      return const Center(child: Text('Speed Test'));
    }
  }

  Future<ImageInfo> _loadCheckImageInfo(BuildContext context) async {
    AssetImage assetImage = const AssetImage(Images.check);
    ImageStream stream = assetImage.resolve(createLocalImageConfiguration(context));
    Completer<ImageInfo> completer = Completer();
    stream.addListener(ImageStreamListener((imageInfo, _) => completer.complete(imageInfo)));
    return completer.future;
  }

  static const int _SPEED_TEST_PAGE_IDX = 0;
  static const int _YOUR_RESULTS_PAGE_IDX = 1;
  static const int _MAP_PAGE_IDX = 2;
}
