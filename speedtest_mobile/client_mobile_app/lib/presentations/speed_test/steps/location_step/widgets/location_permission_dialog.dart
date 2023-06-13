import 'package:flutter/material.dart';
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
              "Use your location",
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
                const TextSpan(
                    text:
                        "collects location data to provide you with locations where wireless quality is being measured as you move around even when the app is closed or not in use"),
              ],
            )),
          ],
        ),
        actions: <Widget>[
          TextButton(
            child: Text(
              "Deny",
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
              "Accept",
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
