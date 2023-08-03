import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/config_warning_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class BackgroundModeTab extends StatefulWidget {
  const BackgroundModeTab({
    Key? key,
    required this.isEnabled,
    required this.onDisabled,
    this.frequency,
    this.warning,
    this.onEnabled,
  }) : super(key: key);

  final bool isEnabled;
  final int? frequency;
  final VoidCallback onDisabled;
  final VoidCallback? onEnabled;
  final WarningViewModel? warning;

  @override
  State<BackgroundModeTab> createState() => _BackgroundModeTabState();
}

class _BackgroundModeTabState extends State<BackgroundModeTab> {
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 40.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30.0),
          child: Text(
            Strings.backgroundModeTabTitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 14.0,
              fontWeight: 200,
              height: 1.5,
              color: Theme.of(context).colorScheme.tertiary,
            ),
          ),
        ),
        const SizedBox(height: 40.0),
        ElevatedButton(
          onPressed: widget.isEnabled ? widget.onDisabled : (widget.onEnabled ?? () {}),
          style: ElevatedButton.styleFrom(
            foregroundColor: Theme.of(context).colorScheme.secondary,
            backgroundColor: widget.isEnabled
                ? Theme.of(context).colorScheme.onPrimary
                : widget.onEnabled == null
                    ? Theme.of(context).colorScheme.secondary.withOpacity(0.05)
                    : Theme.of(context).colorScheme.secondary.withOpacity(0.2),
            elevation: 0,
          ),
          child: Padding(
            padding: !widget.isEnabled
                ? const EdgeInsets.all(14.0)
                : const EdgeInsets.fromLTRB(25.0, 14.0, 25.0, 14.0),
            child: Text(
              widget.isEnabled
                  ? Strings.appInfoDisableButtonLabel
                  : Strings.appInfoEnableButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 400,
                color: widget.onEnabled == null
                    ? Theme.of(context).colorScheme.secondary.withOpacity(0.3)
                    : Theme.of(context).colorScheme.secondary,
              ),
            ),
          ),
        ),
        const SizedBox(height: 20.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 30),
          child: widget.isEnabled && widget.frequency != null
              ? RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    text: 'Background mode is enabled and will run speed tests in the background ',
                    style: AppTextStyle(
                      fontSize: 14.0,
                      fontWeight: 400,
                      height: 1.5,
                      color: Theme.of(context).colorScheme.tertiary,
                    ),
                    children: [
                      TextSpan(
                        text:
                            'every ${widget.frequency} ${widget.frequency == 1 ? 'minute' : 'minutes'}.',
                        style: AppTextStyle(fontWeight: 700),
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
        if (widget.warning != null &&
            ((widget.warning!.isOptional && widget.isEnabled) ||
                (!widget.warning!.isOptional && !widget.isEnabled)))
          Padding(
            padding: const EdgeInsets.only(top: 32.0, right: 20.0, left: 20.0),
            child: ConfigWarningCard(warning: widget.warning!),
          ),
      ],
    );
  }
}
