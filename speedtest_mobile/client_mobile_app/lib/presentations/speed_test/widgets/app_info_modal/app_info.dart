import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/config_warning_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';

class AppInfo extends StatelessWidget {
  const AppInfo({
    Key? key,
    this.configWarning,
    required this.onDisabled,
    required this.onEnabled,
    required this.buildAndVersionNumber,
  }) : super(key: key);

  final VoidCallback onDisabled;
  final VoidCallback onEnabled;
  final WarningViewModel? configWarning;
  final String buildAndVersionNumber;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(Images.logoBig, height: 32.0),
        const SizedBox(height: 30.0),
        Text(
          buildAndVersionNumber,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            height: 1.071,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 56.0),
        BlocBuilder<BackgroundFetchBloc, BackgroundFetchState>(
          builder: (context, state) {
            return Column(
              children: [
                ElevatedButton(
                  onPressed: state.isEnabled ? onDisabled : onEnabled,
                  style: ElevatedButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.secondary,
                    backgroundColor: state.isEnabled
                        ? Theme.of(context).colorScheme.onPrimary
                        : Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                    elevation: 0,
                  ),
                  child: Padding(
                    padding: !state.isEnabled
                        ? const EdgeInsets.all(14.0)
                        : const EdgeInsets.fromLTRB(25.0, 14.0, 25.0, 14.0),
                    child: Text(
                      state.isEnabled
                          ? Strings.appInfoDisableButtonLabel
                          : Strings.appInfoEnableButtonLabel,
                      style: AppTextStyle(
                        fontSize: 16.0,
                        fontWeight: 400,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16.0),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 30),
                  child: state.isEnabled
                      ? RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            text: 'Background mode is ',
                            style: AppTextStyle(
                              fontSize: 14.0,
                              fontWeight: 200,
                              height: 1.5,
                              color: Theme.of(context).colorScheme.tertiary,
                            ),
                            children: [
                              TextSpan(
                                text: 'enabled',
                                style: AppTextStyle(fontWeight: 600),
                              ),
                              const TextSpan(
                                  text: ' and will run speed tests in the background every '),
                              TextSpan(
                                text: '${state.delay} minutes.',
                                style: AppTextStyle(fontWeight: 600),
                              ),
                            ],
                          ),
                        )
                      : Text(
                          Strings.appInfoDescription,
                          textAlign: TextAlign.center,
                          style: AppTextStyle(
                            fontSize: 14.0,
                            fontWeight: 200,
                            height: 1.5,
                            color: Theme.of(context).colorScheme.tertiary,
                          ),
                        ),
                ),
                if (state.isEnabled && configWarning != null)
                  ConfigWarningCard(warning: configWarning!)
              ],
            );
          },
        ),
        const SizedBox(height: 50.0),
        Image.asset(Images.anthcBlueLogo, height: 35.0),
        const SizedBox(height: 55.0),
        Text(
          Strings.rightsReserved,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
