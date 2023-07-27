import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CopyToClipboard extends StatelessWidget {
  const CopyToClipboard({
    Key? key,
    required this.copyText,
    required this.text,
    required this.onCopied,
  }) : super(key: key);

  final String copyText;
  final String text;
  final VoidCallback onCopied;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Clipboard.setData(ClipboardData(text: copyText)).then(
        (_) => onCopied(),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10.0),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              text,
              textAlign: TextAlign.center,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 200,
                height: 1.071,
                color: AppColors.darkLavender,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 10.0),
              child: Icon(Icons.copy, size: 16.0, color: Theme.of(context).colorScheme.secondary),
            ),
          ],
        ),
      ),
    );
  }
}
