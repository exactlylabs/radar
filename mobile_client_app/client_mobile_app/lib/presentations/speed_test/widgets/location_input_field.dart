import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class LocationInputField extends StatefulWidget {
  const LocationInputField({
    Key? key,
    this.onChanged,
    this.onSubmitted,
    this.controller,
    this.focusNode,
    this.isLoading = false,
  }) : super(key: key);

  final bool isLoading;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final Function(String)? onChanged;
  final Function(String)? onSubmitted;

  @override
  State<LocationInputField> createState() => _LocationInputFieldState();
}

class _LocationInputFieldState extends State<LocationInputField> {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56.0,
      child: TextField(
        controller: widget.controller,
        focusNode: widget.focusNode,
        onChanged: widget.onChanged,
        onSubmitted: widget.onSubmitted,
        style: AppTextStyle(
          fontSize: 16.0,
          height: 1.56,
          fontWeight: 400,
          color: Theme.of(context).colorScheme.primary,
        ),
        decoration: InputDecoration(
          filled: true,
          contentPadding: const EdgeInsets.fromLTRB(20, 15, 15, 15),
          fillColor: Theme.of(context).colorScheme.primary.withOpacity(0.05),
          hintText: Strings.locationInputFieldHint,
          hintStyle: AppTextStyle(
            fontSize: 16.0,
            height: 1.56,
            fontWeight: 400,
            color: Theme.of(context).colorScheme.surface,
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
          suffixIcon: widget.isLoading
              ? Transform.scale(
                  scale: 0.4,
                  child: CircularProgressIndicator(
                    strokeWidth: 6.0,
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                )
              : null,
        ),
      ),
    );
  }
}
