import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/horizontal_dashed_separator.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';

class NetworkPlaceStep extends StatelessWidget {
  const NetworkPlaceStep({
    Key? key,
    this.optionSelected,
  }) : super(key: key);

  final String? optionSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.networkPlaceStepTitle,
          subtitle: Strings.networkPlaceStepSubtitle,
        ),
        const SizedBox(height: 30.0),
        ListView.separated(
          shrinkWrap: true,
          itemCount: NETWORK_LOCATIONS.length,
          separatorBuilder: (context, index) {
            if (index < NETWORK_LOCATIONS.length - 3) {
              return const SizedBox(height: 10.0);
            } else if (index == NETWORK_LOCATIONS.length - 3) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 14.5),
                child: HorizontalDashedSeparator(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                ),
              );
            } else {
              return const SizedBox(height: 30.0);
            }
          },
          itemBuilder: (context, idx) {
            final entry = NETWORK_LOCATIONS.entries.elementAt(idx);
            if (idx < NETWORK_LOCATIONS.length - 1) {
              return OptionCard(
                name: entry.key,
                icon: entry.value,
                isSelected: optionSelected == entry.key,
                onTap: (name) => context.read<SpeedTestCubit>().setNetworkLocation(name),
              );
            } else {
              return TextButton(
                onPressed: () => context.read<SpeedTestCubit>().setNetworkLocation(entry.key),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      entry.key,
                      style: AppTextStyle(
                        color: Theme.of(context).colorScheme.tertiary,
                        fontSize: 15.0,
                        fontWeight: 700,
                      ),
                    ),
                    const SizedBox(width: 5.0),
                    Image.asset(
                      Images.rightArrow,
                      width: 10.0,
                      height: 10.0,
                      color: Theme.of(context).colorScheme.tertiary,
                    ),
                  ],
                ),
              );
            }
          },
        ),
        const SizedBox(height: 35.0),
        GoBackAndContinueButtons(
          onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
          onContinuePressed: () => context.read<SpeedTestCubit>().nextStep(),
        ),
        const SizedBox(height: 45.0),
      ],
    );
  }

  static const NETWORK_LOCATIONS = <String, String>{
    'Home': Images.locationHome,
    'Work': Images.locationWork,
    'Other': Images.locationOther,
    'I don\'t have': Images.locationNoInternet,
    'I prefer not to answer': '',
  };
}
