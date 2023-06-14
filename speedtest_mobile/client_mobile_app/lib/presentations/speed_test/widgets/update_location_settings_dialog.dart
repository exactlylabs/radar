import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:permission_handler/permission_handler.dart';

showUpdateLocationSettingsDialog(BuildContext context) {
  showDialog(
    barrierDismissible: false,
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20.0))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              Strings.updateLocationSettingsTitle,
              style: AppTextStyle(
                fontSize: 20.0,
                fontWeight: 500,
                color: Theme.of(context).colorScheme.tertiary,
              ),
            ),
            const SizedBox(height: 40.0),
            Image.asset(Images.pinMarker),
            const SizedBox(height: 40.0),
            RichText(
                text: TextSpan(
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 400,
                color: Colors.black,
              ),
              children: [
                const TextSpan(text: Strings.updateLocationSettingsSubtitle1),
                TextSpan(
                  text: Strings.allTheTimeLocation,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 600,
                    color: Colors.blue,
                  ),
                ),
                const TextSpan(text: Strings.updateLocationSettingsSubtitle2),
              ],
            )),
          ],
        ),
        actions: <Widget>[
          TextButton(
            child: Text(
              Strings.noThanksButtonLabel,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 600,
                color: Colors.blue,
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
          TextButton(
            child: Text(
              Strings.updateSettings,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 600,
                color: Colors.blue,
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              openAppSettings();
            },
          ),
        ],
      );
    },
  );
}
