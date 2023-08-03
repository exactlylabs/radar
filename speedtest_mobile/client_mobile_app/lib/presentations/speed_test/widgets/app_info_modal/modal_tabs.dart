import 'package:flutter/material.dart';
import 'package:client_mobile_app/widgets/dot.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/modal_tab.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/info_modal.dart';

class ModalTabs extends StatelessWidget {
  const ModalTabs({
    Key? key,
    required this.currentTab,
    this.backgroundModeWithWarnings,
    required this.onTabChanged,
  }) : super(key: key);

  final int currentTab;
  final bool? backgroundModeWithWarnings;
  final Function(int) onTabChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Container(
          width: 21.0,
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: Color.fromARGB(255, 227, 227, 232),
              ),
            ),
          ),
        ),
        Expanded(
          child: ModalTab(
            title: Strings.aboutTab,
            onPressed: () => onTabChanged(InfoModal.INFO_TAB),
            isSelected: currentTab == InfoModal.INFO_TAB,
          ),
        ),
        Expanded(
          child: ModalTab(
            title: Strings.backgroundModeTab,
            onPressed: () => onTabChanged(InfoModal.BGM_TAB),
            isSelected: currentTab == InfoModal.BGM_TAB,
            leading: Dot(
              color: backgroundModeWithWarnings == null
                  ? const Color.fromARGB(255, 188, 187, 199)
                  : backgroundModeWithWarnings!
                      ? AppColors.rockfish
                      : AppColors.blue,
            ),
          ),
        ),
        Container(
          width: 21.0,
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: Color.fromARGB(255, 227, 227, 232),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
