import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';

class NetworkTypeStep extends StatelessWidget {
  const NetworkTypeStep({
    Key? key,
    this.optionSelected,
    required this.isStepValid,
  }) : super(key: key);

  final String? optionSelected;
  final bool isStepValid;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.networkTypeStepTitle,
          subtitle: Strings.networkTypeStepSubtitle,
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        ListView.separated(
          shrinkWrap: true,
          itemCount: CONNECTION_TYPE.length + 1,
          separatorBuilder: (context, index) {
            if (index < CONNECTION_TYPE.length - 1) {
              return SpacerWithMax(size: height * 0.012, maxSize: 10.0);
            } else {
              return SpacerWithMax(size: height * 0.025, maxSize: 20.0);
            }
          },
          itemBuilder: (context, idx) {
            if (idx < CONNECTION_TYPE.length) {
              final entry = CONNECTION_TYPE.entries.elementAt(idx);
              return OptionCard(
                name: entry.key,
                icon: entry.value,
                isSelected: optionSelected == entry.key,
                onTap: (name) => context.read<SpeedTestCubit>().setNetworkType(name),
              );
            } else {
              return PreferNotToAnswerButton(
                onPressed: (option) {
                  context.read<SpeedTestCubit>().setNetworkType(option);
                  context.read<SpeedTestCubit>().nextStep();
                },
              );
            }
          },
        ),
        SpacerWithMax(size: height * 0.12, maxSize: 95.0),
        GoBackAndContinueButtons(
          onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
          onContinuePressed: isStepValid ? () => context.read<SpeedTestCubit>().nextStep() : null,
        ),
        SpacerWithMax(size: height * 0.053, maxSize: 45.0),
      ],
    );
  }

  static const CONNECTION_TYPE = <String, String>{
    Strings.wiredConnectionType: Images.connectionWired,
    Strings.wifiConnectionType: Images.connectionWifi,
    Strings.cellularConnectionType: Images.connectionCellular,
  };
}
