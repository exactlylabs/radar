import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class ModalTab extends StatelessWidget {
  const ModalTab({
    Key? key,
    required this.title,
    required this.onPressed,
    required this.isSelected,
    this.leading,
  }) : super(key: key);

  final bool isSelected;
  final String title;
  final Widget? leading;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        decoration: BoxDecoration(
          border: isSelected
              ? Border(
                  bottom: BorderSide(
                    width: 2.0,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                )
              : const Border(
                  bottom: BorderSide(
                    color: Color.fromARGB(255, 227, 227, 232),
                  ),
                ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (leading != null) ...[
              leading!,
              const SizedBox(width: 6.0),
            ],
            Text(
              title,
              style: AppTextStyle(
                fontWeight: 700,
                fontSize: 15.0,
                height: 1.66,
                color: isSelected
                    ? const Color.fromARGB(255, 63, 60, 112)
                    : const Color.fromARGB(255, 109, 106, 148),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
