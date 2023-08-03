import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/copy_to_clipboar.dart';

class InfoRow extends StatelessWidget {
  const InfoRow({
    Key? key,
    required this.title,
    required this.value,
    required this.onCopied,
  }) : super(key: key);

  final String title;
  final String value;
  final VoidCallback onCopied;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            textAlign: TextAlign.right,
            style: AppTextStyle(
              fontWeight: 600,
              fontSize: 15.0,
              height: 1.5,
              color: Theme.of(context).colorScheme.tertiary,
            ),
          ),
        ),
        const SizedBox(width: 16.0),
        Expanded(
          child: Align(
            alignment: Alignment.centerLeft,
            child: CopyToClipboard(
              copyText: value,
              text: value,
              onCopied: onCopied,
            ),
          ),
        )
      ],
    );
  }
}
