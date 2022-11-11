import 'package:client_mobile_app/resources/app_colors.dart';
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
      padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 15.0),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 10.0),
            child: Image.asset(
              networkType,
              scale: 1.5,
              color: Theme.of(context).colorScheme.secondary,
            ),
          ),
          Expanded(
            child: Text(
              '$date\n$time',
              textAlign: TextAlign.start,
              style: AppTextStyle(
                fontSize: 13.0,
                fontWeight: 200,
                color: Theme.of(context).colorScheme.tertiary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              download,
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 15.0,
                fontWeight: 200,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              upload,
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 15.0,
                fontWeight: 200,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          GestureDetector(
            onTap: onTap,
            child: Image.asset(Images.infoIcon),
          )
        ],
      ),
    );
  }
}
