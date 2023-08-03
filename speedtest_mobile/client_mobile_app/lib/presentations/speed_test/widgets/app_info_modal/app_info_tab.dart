import 'dart:async';

import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/info_row.dart';

class AppInfoTab extends StatefulWidget {
  const AppInfoTab({
    Key? key,
    required this.buildNumber,
    required this.versionNumber,
    required this.sessionId,
    required this.server,
  }) : super(key: key);

  final String buildNumber;
  final String versionNumber;
  final String sessionId;
  final String server;

  @override
  State<AppInfoTab> createState() => _AppInfoTabState();
}

class _AppInfoTabState extends State<AppInfoTab> {
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

  void showVersionNumberCopiedSnackbar() {
    if (mounted) {
      setState(() {
        showSnackbar = true;
        snackbarText = Strings.snackbarVersionNumber;
      });
    }
    if (snackbarTimer != null) {
      snackbarTimer!.cancel();
    }
    snackbarTimer = Timer(
        const Duration(seconds: 5), () => mounted ? setState(() => showSnackbar = false) : null);
  }

  void showBuildNumberCopiedSnackbar() {
    if (mounted) {
      setState(() {
        showSnackbar = true;
        snackbarText = Strings.snackbarBuildNumber;
      });
    }
    if (snackbarTimer != null) {
      snackbarTimer!.cancel();
    }
    snackbarTimer = Timer(
        const Duration(seconds: 5), () => mounted ? setState(() => showSnackbar = false) : null);
  }

  void showServerCopiedSnackbar() {
    if (mounted) {
      setState(() {
        showSnackbar = true;
        snackbarText = Strings.snackbarServer;
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
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 32.0),
            InfoRow(
              title: Strings.appVersionInfoTitle,
              value: widget.versionNumber,
              onCopied: showVersionNumberCopiedSnackbar,
            ),
            InfoRow(
              title: Strings.buildInfoTitle,
              value: widget.buildNumber,
              onCopied: showBuildNumberCopiedSnackbar,
            ),
            InfoRow(
              title: Strings.sessionIdInfoTitle,
              value: widget.sessionId,
              onCopied: showSessionIdCopiedSnackbar,
            ),
            InfoRow(
              title: Strings.serverInfoTitle,
              value: widget.server,
              onCopied: showServerCopiedSnackbar,
            ),
            const SizedBox(height: 32.0),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 15.0),
              height: 1.0,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: <Color>[
                      AppColors.lightGrey.withOpacity(0),
                      AppColors.lightGrey.withOpacity(0.3),
                      AppColors.lightGrey.withOpacity(0)
                    ]),
              ),
            ),
            const SizedBox(height: 32.0),
            Image.asset(Images.anthcBlueLogo, height: 35.0),
            const SizedBox(height: 30.0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Text(
                Strings.rightsReserved,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 14.0,
                  fontWeight: 200,
                  height: 1.5,
                  color: AppColors.darkLavender,
                ),
              ),
            ),
            const SizedBox(height: 30.0),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Text(
                Strings.devInfo,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 14.0,
                  fontWeight: 200,
                  height: 1.5,
                  color: AppColors.darkLavender,
                ),
              ),
            ),
            const SizedBox(height: 16.0),
          ],
        ),
        if (showSnackbar)
          Positioned(
            bottom: 0,
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
