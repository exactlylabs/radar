import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class ResultsHeader extends StatelessWidget {
  const ResultsHeader({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(46, 10, 46, 13),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            flex: 1,
            fit: FlexFit.loose,
            child: Text(
              'Date/Time',
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 700,
                color: Theme.of(context).colorScheme.tertiary,
              ),
            ),
          ),
          Flexible(
            flex: 1,
            fit: FlexFit.loose,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(width: 12.0),
                Image.asset(Images.downloadIcon),
                const SizedBox(width: 5.0),
                Text(
                  'Mbps',
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 14.0,
                    fontWeight: 700,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
              ],
            ),
          ),
          Flexible(
            flex: 1,
            fit: FlexFit.loose,
            child: Row(mainAxisSize: MainAxisSize.min, mainAxisAlignment: MainAxisAlignment.center, children: [
              Image.asset(Images.uploadIcon),
              const SizedBox(width: 5.0),
              Text(
                'Mbps',
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 14.0,
                  fontWeight: 700,
                  color: Theme.of(context).colorScheme.tertiary,
                ),
              ),
              const SizedBox(width: 13.0),
            ]),
          ),
        ],
      ),
    );
  }
}
