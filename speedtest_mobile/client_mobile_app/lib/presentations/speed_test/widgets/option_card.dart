import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class OptionCard extends StatelessWidget {
  const OptionCard({
    Key? key,
    required this.name,
    required this.icon,
    required this.isSelected,
    this.onTap,
  }) : super(key: key);

  final String name;
  final String icon;
  final bool isSelected;
  final Function(String)? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap != null ? () => onTap!(name) : null,
      child: Container(
        height: 56,
        padding: EdgeInsets.symmetric(horizontal: isSelected ? 18.0 : 19.0),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.background,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: isSelected
                ? Theme.of(context).colorScheme.secondary
                : Theme.of(context).colorScheme.primary.withOpacity(0.2),
            width: isSelected ? 2.0 : 1.0,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Padding(
              padding: EdgeInsets.only(top: isSelected ? 4.0 : 0.0),
              child: Text(
                name,
                style: AppTextStyle(
                  color: Theme.of(context).colorScheme.primary,
                  fontSize: 16.0,
                  height: isSelected ? 1.56 : 1.35,
                  fontWeight: isSelected ? 700 : 200,
                  letterSpacing: isSelected ? 0.0 : 0.2,
                ),
              ),
            ),
            Image.asset(
              icon,
              color: isSelected ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.tertiary,
            ),
          ],
        ),
      ),
    );
  }
}
