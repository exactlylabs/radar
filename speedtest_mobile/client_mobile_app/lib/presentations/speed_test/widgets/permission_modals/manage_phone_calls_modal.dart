import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';

class ManagePhoneCallsModal extends StatelessWidget {
  const ManagePhoneCallsModal({
    Key? key,
    required this.onPressed,
    required this.onClosed,
  }) : super(key: key);

  final VoidCallback onPressed;
  final VoidCallback onClosed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 15.0),
        Image.asset(Images.managePhoneCalls, height: 50.0),
        const SizedBox(height: 30.0),
        Text(
          Strings.managePhoneCallsModalTitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 15.0),
        Text(
          Strings.managePhoneCallsModalSubtitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.56,
            color: AppColors.darkGrey,
          ),
        ),
        const SizedBox(height: 50.0),
        PrimaryButton(
          onPressed: () {
            Navigator.of(context).pop();
            onPressed();
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                Strings.managePhoneCallsModalButtonLabel,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 700,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
              const SizedBox(width: 15.0),
              Image.asset(
                Images.buttonRightArrow,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20.0),
        PrimaryButton(
          color: Theme.of(context).colorScheme.onPrimary,
          shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
          child: Text(
            Strings.notNowButtonLabel,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 700,
              color: AppColors.darkGrey,
            ),
          ),
          onPressed: () {
            Navigator.of(context).pop();
            onClosed();
          },
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}

Future<void> openManagePhoneCallsModal(
    BuildContext context, VoidCallback onPressed, VoidCallback onCancel) {
  return showModalBottomSheet(
    context: context,
    enableDrag: true,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).colorScheme.background,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16.0),
        topRight: Radius.circular(16.0),
      ),
    ),
    builder: (_) => ModalWithTitle(
      title: Strings.emptyString,
      body: ManagePhoneCallsModal(
        onPressed: onPressed,
        onClosed: onCancel,
      ),
    ),
  );
}
