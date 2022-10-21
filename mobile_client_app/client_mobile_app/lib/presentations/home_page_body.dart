import 'package:client_mobile_app/presentations/map/map_web_view_page.dart';
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
      return const Center(child: Text('Speed Test'));
    } else if (pageIdx == _YOUR_RESULTS_PAGE_IDX) {
      return const Center(child: Text('Your Results'));
    } else if (pageIdx == _MAP_PAGE_IDX) {
      return const MapWebViewPage();
    } else {
      return const Center(child: Text('Speed Test'));
    }
  }

  static const int _SPEED_TEST_PAGE_IDX = 0;
  static const int _YOUR_RESULTS_PAGE_IDX = 1;
  static const int _MAP_PAGE_IDX = 2;
}
