import 'package:flutter/material.dart';

class WarningViewModel {
  WarningViewModel({
    required this.title,
    required this.description,
    this.onPressed,
  });

  final String title;
  final String description;
  final VoidCallback? onPressed;
}
