import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';

class NetworkPlaceStep extends StatelessWidget {
  const NetworkPlaceStep({
    Key? key,
    this.optionSelected,
    required this.isStepValid,
    this.address,
  }) : super(key: key);

  final String? optionSelected;
  final String? address;
  final bool isStepValid;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Stack(
          children: [
            Column(
              children: [
                const TitleAndSubtitle(
                  title: Strings.networkPlaceStepTitle,
                  subtitle: Strings.networkPlaceStepSubtitle,
                  subtitleHeight: 1.56,
                  titleHeight: 1.81,
                ),
                SpacerWithMax(size: height * 0.037, maxSize: 30.0),
                SizedBox(
                  height: 330,
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: NETWORK_LOCATIONS.length + 1,
                    separatorBuilder: (context, index) {
                      if (index < 2) {
                        return SpacerWithMax(size: height * 0.012, maxSize: 10.0);
                      } else {
                        return const SizedBox(height: 30);
                      }
                    },
                    itemBuilder: (context, idx) {
                      if (idx < NETWORK_LOCATIONS.length) {
                        final entry = NETWORK_LOCATIONS.entries.elementAt(idx);
                        return OptionCard(
                          name: entry.key,
                          icon: entry.value,
                          isSelected: optionSelected == entry.key,
                          onTap: (name) => context.read<SpeedTestCubit>().setNetworkLocation(name),
                        );
                      } else {
                        return PreferNotToAnswerButton(
                          onPressed: (option) => context.read<SpeedTestCubit>().preferNotToAnswer(),
                        );
                      }
                    },
                  ),
                ),
              ],
            ),
            Positioned(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 0.0,
              right: 0.0,
              child: BlocBuilder<NavigationCubit, NavigationState>(
                builder: (context, state) => Padding(
                  padding: const EdgeInsets.only(bottom: 40.0),
                  child: GoBackAndContinueButtons(
                    onContinuePressed: isStepValid ? onContinuePressed(context, state.canNavigate) : null,
                    onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  VoidCallback onContinuePressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<SpeedTestCubit>().nextStep();
    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }

  static const NETWORK_LOCATIONS = <String, String>{
    Strings.homeNetworkLocation: Images.locationHome,
    Strings.workNetworkLocation: Images.locationWork,
    Strings.otherNetworkLocation: Images.locationOther,
  };
}
