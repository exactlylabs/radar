import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/cellular_connection_modal.dart';
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
    setOnContinueAndOnGoBackPressed(context);
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.networkTypeStepTitle,
          subtitle: Strings.networkTypeStepSubtitle,
          subtitleHeight: 1.56,
          titleHeight: 1.81,
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        SizedBox(
          height: 245,
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: CONNECTION_TYPE.length + 1,
            separatorBuilder: (context, index) {
              if (index < CONNECTION_TYPE.length - 1) {
                return SpacerWithMax(size: height * 0.012, maxSize: 10.0);
              } else {
                return const SizedBox(
                  height: 30.0,
                );
              }
            },
            itemBuilder: (context, idx) {
              if (idx < CONNECTION_TYPE.length) {
                final entry = CONNECTION_TYPE.entries.elementAt(idx);
                return OptionCard(
                  name: entry.key,
                  icon: entry.value,
                  isSelected: optionSelected == entry.key,
                  onTap: (name) => name == Strings.cellularConnectionType
                      ? _cellularConnectionModal(context)
                      : context.read<SpeedTestCubit>().setNetworkType(name),
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
    );
  }

  Future<void> _cellularConnectionModal(BuildContext context) {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      ConnectionCellularModal(
        onPressed: () {
          Navigator.of(context).pop();
          context.read<SpeedTestCubit>().setNetworkType(Strings.cellularConnectionType);
        },
      ),
    );
  }

  void setOnContinueAndOnGoBackPressed(BuildContext context) {
    VoidCallback? onContinueCallback = isStepValid ? () => context.read<SpeedTestCubit>().nextStep() : null;

    context
        .read<SpeedTestCubit>()
        .setOnContinueAndOnGoBackPressed(onContinueCallback, () => context.read<SpeedTestCubit>().previousStep());
  }

  static const CONNECTION_TYPE = <String, String>{
    Strings.wiredConnectionType: Images.connectionWired,
    Strings.wifiConnectionType: Images.connectionWifi,
    Strings.cellularConnectionType: Images.connectionCellular,
  };
}
