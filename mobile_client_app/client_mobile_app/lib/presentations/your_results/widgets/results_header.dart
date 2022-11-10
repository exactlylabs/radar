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
      padding: const EdgeInsets.fromLTRB(35, 12, 40, 12),
      child: Row(
        children: [
          Expanded(
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
          Expanded(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
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
          Expanded(
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
            ]),
          ),
        ],
      ),
    );
  }
}
