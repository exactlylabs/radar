import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';

class ManageLocationAlwaysModal extends StatelessWidget {
  const ManageLocationAlwaysModal({
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
        Image.asset(Images.manageLocation, height: 50.0),
        const SizedBox(height: 30.0),
        Text(
          'Update your location settings',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 15.0),
        Text(
          'Allow us to access your location all the time to provide you with the locations where wireless quality is being measured on your phone as you move around.',
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
            onPressed();
            Navigator.of(context).pop();
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Update settings',
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
            'Not now',
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 700,
              color: AppColors.darkGrey,
            ),
          ),
          onPressed: () {
            onClosed();
            Navigator.of(context).pop();
          },
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}

Future<void> openManageLocationAlwaysModal(BuildContext context) {
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
      body: ManageLocationAlwaysModal(
        onPressed: () {},
        onClosed: () {},
      ),
    ),
  );
}
