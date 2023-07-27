import 'dart:async';

import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/copy_to_clipboar.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/config_warning_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfo extends StatefulWidget {
  const AppInfo({
    Key? key,
    this.warning,
    this.onEnabled,
    required this.buildNumber,
    required this.versionNumber,
    required this.frequency,
    required this.isEnabled,
    required this.onDisabled,
    required this.sessionId,
  }) : super(key: key);

  final bool isEnabled;
  final int? frequency;
  final VoidCallback onDisabled;
  final VoidCallback? onEnabled;
  final WarningViewModel? warning;
  final String buildNumber;
  final String versionNumber;
  final String sessionId;

  @override
  State<AppInfo> createState() => _AppInfoState();
}

class _AppInfoState extends State<AppInfo> {
  late bool showSnackbar;
  late String snackbarText;
  Timer? snackbarTimer;

  @override
  void initState() {
    super.initState();
    showSnackbar = false;
  }

  @override
  void dispose() {
    snackbarTimer?.cancel();
    super.dispose();
  }

  void showSessionIdCopiedSnackbar() {
    if (mounted) {
      setState(() {
        showSnackbar = true;
        snackbarText = Strings.snackbarSessionId;
      });
    }
    if (snackbarTimer != null) {
      snackbarTimer!.cancel();
    }
    snackbarTimer = Timer(
        const Duration(seconds: 5), () => mounted ? setState(() => showSnackbar = false) : null);
  }

  void showVersionAndBuildNumberCopiedSnackbar() {
    if (mounted) {
      setState(() {
        showSnackbar = true;
        snackbarText = Strings.snackbarAppVersion;
      });
    }
    if (snackbarTimer != null) {
      snackbarTimer!.cancel();
    }
    snackbarTimer = Timer(
        const Duration(seconds: 5), () => mounted ? setState(() => showSnackbar = false) : null);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.bottomCenter,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Image.asset(Images.logoBig, height: 32.0),
            const SizedBox(height: 30.0),
            CopyToClipboard(
              copyText: '${widget.versionNumber}+${widget.buildNumber}',
              text: 'App version ${widget.versionNumber} · Build ${widget.buildNumber}',
              onCopied: showVersionAndBuildNumberCopiedSnackbar,
            ),
            CopyToClipboard(
              copyText: widget.sessionId,
              text: 'Session ID: ${widget.sessionId}',
              onCopied: showSessionIdCopiedSnackbar,
            ),
            const SizedBox(height: 56.0),
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
            const SizedBox(height: 16.0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: widget.isEnabled && widget.frequency != null
                  ? RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        text:
                            'Background mode is enabled and will run speed tests in the background ',
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
                padding: const EdgeInsets.only(top: 30.0),
                child: ConfigWarningCard(warning: widget.warning!),
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
                height: 1.5,
                color: AppColors.darkLavender,
              ),
            ),
            const SizedBox(height: 12.0),
            Text(
              Strings.devInfo,
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 200,
                height: 1.5,
                color: AppColors.darkLavender,
              ),
            ),
            const SizedBox(height: 16.0),
          ],
        ),
        if (showSnackbar)
          Positioned(
            bottom: 10,
            child: Container(
              padding: const EdgeInsets.all(16.0),
              width: MediaQuery.of(context).size.width * 0.9,
              decoration:
                  BoxDecoration(borderRadius: BorderRadius.circular(10.0), color: AppColors.fern),
              child: Text(
                snackbarText,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 200,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
