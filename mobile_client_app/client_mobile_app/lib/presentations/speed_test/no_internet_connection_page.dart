import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class NoInternetConnectionPage extends StatelessWidget {
  const NoInternetConnectionPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Image.asset(Images.roundedCheck),
                const TitleAndSubtitle(
                  title: Strings.noInternetConnectionTitle,
                  subtitle: Strings.noInternetConnectionSubtitle,
                ),
                Text(
                  Strings.noInternetConnectionDescription,
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 200,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
              ],
            ),
          ),
          PrimaryButton(
            child: Text(
              Strings.exploreTheMapButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 600,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
            onPressed: () {
              context.read<NavigationCubit>().changeTab(2);
              context.read<SpeedTestCubit>().resetForm();
            },
          ),
          SpacerWithMax(size: height * 0.025, maxSize: 20.0),
          PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            child: Text(
              Strings.startOverButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: AppColors.darkGrey,
              ),
            ),
            onPressed: () => context.read<SpeedTestCubit>().resetForm(),
          ),
          SpacerWithMax(size: height * 0.053, maxSize: 45.0),
        ],
      ),
    );
  }
}
