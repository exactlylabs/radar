import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';

Future<void> openNoInternetConnectionModal(BuildContext context, VoidCallback onPressed) async {
  return modalWithTitle(
    context,
    true,
    Strings.emptyString,
    NoInternetConnectionModal(
      onPressed: () {
        onPressed();
        Navigator.of(context).pop();
      },
    ),
  );
}

class NoInternetConnectionModal extends StatelessWidget {
  const NoInternetConnectionModal({
    Key? key,
    required this.onPressed,
  }) : super(key: key);

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NavigationCubit, NavigationState>(
      builder: (context, state) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 15.0),
            Image.asset(Images.locationNoInternetBig, height: 50.0),
            const SizedBox(height: 30.0),
            Text(
              Strings.noInternetConnection,
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 20.0,
                fontWeight: 800,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(height: 15.0),
            Text(
              Strings.checkInternetConnection,
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
              onPressed: state.canNavigate ? onPressed : null,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    Strings.tryAgain,
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
                Strings.cancelButttonLabel,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 700,
                  color: AppColors.darkGrey,
                ),
              ),
              onPressed: () => Navigator.of(context).pop(),
            ),
            const SizedBox(height: 16.0),
          ],
        );
      },
    );
  }
}
