import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/icon_with_text.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class SummaryTable extends StatelessWidget {
  const SummaryTable({
    Key? key,
    this.networkQuality,
    required this.address,
    required this.networkType,
    required this.networkPlace,
  }) : super(key: key);

  final String address;
  final String networkPlace;
  final String networkType;
  final String? networkQuality;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          IconWithText(
            icon: Images.roundedPinAddress,
            text: address,
            alignment: MainAxisAlignment.center,
          ),
          Container(
            height: 1,
            color: Theme.of(context).colorScheme.surface.withOpacity(0.3),
          ),
          IntrinsicHeight(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconWithText(
                  icon: Images.roundedLocationHome,
                  text: networkPlace,
                  alignment: MainAxisAlignment.end,
                ),
                VerticalDivider(
                  thickness: 1,
                  indent: 8,
                  endIndent: 8,
                  color: Theme.of(context).colorScheme.surface.withOpacity(0.3),
                ),
                IconWithText(
                  icon: Images.roundedConnectionWifi,
                  text: networkType,
                  alignment: MainAxisAlignment.center,
                ),
                if (networkQuality != null) ...[
                  VerticalDivider(
                    thickness: 1,
                    indent: 8,
                    endIndent: 8,
                    color: Theme.of(context).colorScheme.surface.withOpacity(0.3),
                  ),
                  IconWithText(
                    icon: Images.roundedConnectionWifi,
                    text: networkQuality!,
                    alignment: MainAxisAlignment.start,
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }
}
