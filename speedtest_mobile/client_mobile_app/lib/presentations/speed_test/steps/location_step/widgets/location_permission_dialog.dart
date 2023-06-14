import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';

showLocationPermissionDialog(BuildContext context,
    {required VoidCallback onAccept, required VoidCallback onDeny}) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20.0))),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              Strings.useYourLocation,
              style: AppTextStyle(
                fontSize: 20.0,
                fontWeight: 500,
                color: Theme.of(context).colorScheme.tertiary,
              ),
            ),
            const SizedBox(height: 20.0),
            RichText(
                text: TextSpan(
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 400,
                color: Colors.black,
              ),
              children: [
                TextSpan(
                    text: '${AppConfig.of(context)?.appName} ',
                    style: AppTextStyle(
                      fontSize: 16.0,
                      fontWeight: 600,
                      color: Colors.blue,
                    )),
                const TextSpan(text: Strings.useYourLocationSubtitle),
              ],
            )),
          ],
        ),
        actions: <Widget>[
          TextButton(
            child: Text(
              Strings.denyButtonLabel,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 600,
                color: Colors.blue,
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              onDeny();
            },
          ),
          TextButton(
            child: Text(
              Strings.acceptButtonLabel,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 600,
                color: Colors.blue,
              ),
            ),
            onPressed: () {
              Navigator.of(context).pop();
              onAccept();
            },
          ),
        ],
      );
    },
  );
}
