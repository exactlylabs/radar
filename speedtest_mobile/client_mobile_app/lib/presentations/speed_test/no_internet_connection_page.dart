import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';

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
          BlocBuilder<NavigationCubit, NavigationState>(
            builder: (context, state) => PrimaryButton(
              onPressed: onExploreTheMapPressed(context, state.canNavigate),
              child: Text(
                Strings.exploreTheMapButtonLabel,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 600,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
            ),
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
            onPressed: () {
              context.read<SpeedTestCubit>().resetForm();
              context.read<TakeSpeedTestStepCubit>().resetSpeedTest();
            },
          ),
          SpacerWithMax(size: height * 0.053, maxSize: 45.0),
        ],
      ),
    );
  }

  VoidCallback onExploreTheMapPressed(BuildContext context, bool canNavigate) {
    onCanNavigate() {
      context.read<NavigationCubit>().changeTab(NavigationCubit.MAP_INDEX);
      context.read<SpeedTestCubit>().resetForm();
      context.read<TakeSpeedTestStepCubit>().resetSpeedTest();
    }

    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }
}
