import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/horizontal_dashed_separator.dart';

class NetworkPlaceStep extends StatelessWidget {
  const NetworkPlaceStep({
    Key? key,
    this.optionSelected,
    required this.isStepValid,
    required this.address,
  }) : super(key: key);

  final String? optionSelected;
  final String address;
  final bool isStepValid;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Expanded(
      child: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              children: [
                const TitleAndSubtitle(
                  title: Strings.networkPlaceStepTitle,
                  subtitle: Strings.networkPlaceStepSubtitle,
                  subtitleHeight: 1.56,
                  titleHeight: 1.81,
                ),
                SpacerWithMax(size: height * 0.037, maxSize: 30.0),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: NETWORK_LOCATIONS.length + 1,
                  separatorBuilder: (context, index) {
                    if (index < 2) {
                      return SpacerWithMax(size: height * 0.012, maxSize: 10.0);
                    } else if (index == 2) {
                      final horizontal = height * 0.025 < 20.0 ? height * 0.025 : 20.0;
                      return Padding(
                        padding: EdgeInsets.symmetric(horizontal: horizontal, vertical: 14.5),
                        child: HorizontalDashedSeparator(color: Theme.of(context).colorScheme.primary.withOpacity(0.2)),
                      );
                    } else {
                      return SpacerWithMax(size: height * 0.025, maxSize: 220.0);
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
              ],
            ),
          ),
          Positioned(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 0.0,
            right: 0.0,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 45.0),
              child: GoBackAndContinueButtons(
                onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
                onContinuePressed: isStepValid
                    ? optionSelected == Strings.iDontHaveNetworkLocation
                        ? () => _noInternetModal(context, address)
                        : () => context.read<SpeedTestCubit>().nextStep()
                    : null,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _noInternetModal(BuildContext context, String address) {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      NoInternetModal(
        address: address,
        onPressed: () {
          Navigator.of(context).pop();
          context.read<SpeedTestCubit>().endForm();
        },
      ),
    );
  }

  static const NETWORK_LOCATIONS = <String, String>{
    Strings.homeNetworkLocation: Images.locationHome,
    Strings.workNetworkLocation: Images.locationWork,
    Strings.otherNetworkLocation: Images.locationOther,
    Strings.iDontHaveNetworkLocation: Images.locationNoInternet,
  };
}
