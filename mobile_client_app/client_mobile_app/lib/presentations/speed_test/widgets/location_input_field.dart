import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class LocationInputField extends StatefulWidget {
  const LocationInputField({
    Key? key,
    this.onChanged,
  }) : super(key: key);

  final Function(String)? onChanged;

  @override
  State<LocationInputField> createState() => _LocationInputFieldState();
}

class _LocationInputFieldState extends State<LocationInputField> {
  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: widget.onChanged,
      style: AppTextStyle(
        fontSize: 16.0,
        color: Theme.of(context).colorScheme.primary,
        fontWeight: 400,
      ),
      decoration: InputDecoration(
        filled: true,
        fillColor: Theme.of(context).colorScheme.primary.withOpacity(0.05),
        hintText: Strings.locationInputFieldHint,
        hintStyle: AppTextStyle(
          fontSize: 16.0,
          letterSpacing: 0.5,
          color: Theme.of(context).colorScheme.tertiary,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.0),
          borderSide: BorderSide(
            width: 1.5,
            color: Theme.of(context).colorScheme.secondary.withOpacity(0.4),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.0),
          borderSide: BorderSide.none,
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.0),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.error,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.0),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.error.withOpacity(0.4),
          ),
        ),
        suffixIcon: Image.asset(Images.locationButton),
      ),
    );
  }
}
