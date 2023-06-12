import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';

class LocationIndicator extends StatelessWidget {
  const LocationIndicator({
    Key? key,
    required this.address,
  }) : super(key: key);

  final String address;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.background,
        border: Border.all(color: Theme.of(context).colorScheme.surface.withOpacity(0.21)),
        borderRadius: BorderRadius.circular(16.0),
      ),
      child: Row(
        children: [
          Image.asset(
            Images.roundedPinAddress,
            height: 28.0,
          ),
          const SizedBox(width: 10.0),
          Expanded(
            child: Text(
              address,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                height: 1.56,
                color: AppColors.darkGrey,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
