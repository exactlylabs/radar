import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/horizontal_dashed_separator.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';

class NetworkTypeStep extends StatelessWidget {
  const NetworkTypeStep({
    Key? key,
    this.optionSelected,
  }) : super(key: key);

  final String? optionSelected;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.networkTypeStepTitle,
          subtitle: Strings.networkTypeStepSubtitle,
        ),
        const SizedBox(height: 30.0),
        ListView.separated(
          shrinkWrap: true,
          itemCount: CONNECTION_TYPE.length + 1,
          separatorBuilder: (context, index) {
            if (index < CONNECTION_TYPE.length) {
              return const SizedBox(height: 10.0);
            } else {
              return const SizedBox(height: 20.0);
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
                onPressed: (option) => context.read<SpeedTestCubit>().setNetworkType(option),
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

  static const CONNECTION_TYPE = <String, String>{
    'Wired': Images.connectionWired,
    'Wifi': Images.connectionWifi,
    'Cellular': Images.connectionCellular,
  };
}
