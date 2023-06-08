import 'package:flutter/material.dart';
import 'package:client_mobile_app/presentations/map/map_web_view_page.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_page.dart';
import 'package:client_mobile_app/presentations/your_results/your_results_page.dart';

class HomePageBody extends StatelessWidget {
  const HomePageBody({
    Key? key,
    required this.pageIdx,
    this.args,
  }) : super(key: key);

  final int pageIdx;
  final dynamic args;

  @override
  Widget build(BuildContext context) {
    if (pageIdx == _SPEED_TEST_PAGE_IDX) {
      return const SpeedTestPage();
    } else if (pageIdx == _YOUR_RESULTS_PAGE_IDX) {
      return const YourResultsPage();
    } else if (pageIdx == _MAP_PAGE_IDX) {
      if (args != null) {
        List<double?> latLng = args as List<double?>;
        return MapWebViewPage(
          latitude: latLng[0],
          longitude: latLng[1],
        );
      } else {
        return MapWebViewPage();
      }
    } else {
      return const SpeedTestPage();
    }
  }

  static const int _SPEED_TEST_PAGE_IDX = 0;
  static const int _YOUR_RESULTS_PAGE_IDX = 1;
  static const int _MAP_PAGE_IDX = 2;
}
