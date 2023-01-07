import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class ResultCard extends StatelessWidget {
  const ResultCard({
    Key? key,
    required this.networkType,
    required this.date,
    required this.time,
    required this.download,
    required this.upload,
    required this.onTap,
    this.color = Colors.grey,
  }) : super(key: key);

  final String networkType;
  final String date;
  final String time;
  final String download;
  final String upload;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(15, 12, 15, 12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(right: 15.0),
                child: Image.asset(
                  networkType,
                  scale: 1.75,
                  color: Theme.of(context).colorScheme.secondary,
                ),
              ),
              Flexible(
                flex: 1,
                fit: FlexFit.loose,
                child: Text(
                  '$date\n$time',
                  maxLines: 2,
                  textAlign: TextAlign.start,
                  style: AppTextStyle(
                    fontSize: 14.0,
                    fontWeight: 200,
                    height: 1.1,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
              ),
            ],
          ),
          Flexible(
            flex: 1,
            fit: FlexFit.loose,
            child: Padding(
              padding: const EdgeInsets.only(left: 10.0),
              child: Text(
                download,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 15.0,
                  fontWeight: 200,
                  height: 1.66,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Flexible(
                flex: 1,
                fit: FlexFit.loose,
                child: Text(
                  upload,
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 15.0,
                    fontWeight: 200,
                    height: 1.66,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 23.0),
              GestureDetector(
                onTap: onTap,
                child: Image.asset(Images.infoIcon),
              )
            ],
          ),
        ],
      ),
    );
  }
}
