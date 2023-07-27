import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/permission_modals/optional_permissions_modal/optional_permission_tile.dart';

class OptionalPermissionsModal extends StatelessWidget {
  const OptionalPermissionsModal({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BackgroundModeCubit, BackgroundModeState>(
      builder: (context, state) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 15.0),
          Image.asset(Images.optionalPermissions, height: 50.0),
          const SizedBox(height: 30.0),
          Text(
            Strings.optionalPermissionsTitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 20.0,
              fontWeight: 800,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(height: 15.0),
          Text(
            Strings.optionalPermissionsSubtitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 200,
              height: 1.56,
              color: AppColors.darkGrey,
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 32.0, horizontal: 25.0),
            child: Column(
              children: [
                OptionalPermissionTile(
                  title: Strings.phoneStatePermissionTitle,
                  description: Strings.phoneStatePermissionSubtitle,
                  isGranted: state.hasAccessToPhoneState ?? false,
                ),
                const SizedBox(height: 24.0),
                OptionalPermissionTile(
                  title: Strings.notificationPermissionTitle,
                  description: Strings.notificationPermissionSubtitle,
                  isGranted: state.hasAccessToNotifications ?? false,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20.0),
          PrimaryButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await context.read<BackgroundModeCubit>().allowAccessToOptionalPermissions();
            },
            child: Text(
              Strings.optionalPermissionsAllowAccessButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
          ),
          const SizedBox(height: 20.0),
          PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
            child: Text(
              Strings.optionalPermissionsNotNowButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: AppColors.darkGrey,
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              context.read<BackgroundModeCubit>().askForBackgroundModeFrequency();
            },
          ),
          const SizedBox(height: 16.0),
        ],
      ),
    );
  }
}

Future<void> askForOptionalPermissionsModal(BuildContext context) {
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
    builder: (_) => BlocProvider.value(
      value: context.read<BackgroundModeCubit>(),
      child: const ModalWithTitle(
        title: Strings.emptyString,
        body: OptionalPermissionsModal(),
      ),
    ),
  );
}
