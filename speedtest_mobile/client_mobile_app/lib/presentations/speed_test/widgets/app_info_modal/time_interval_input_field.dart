import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class TimeIntervalInputField extends StatefulWidget {
  const TimeIntervalInputField({
    Key? key,
    this.unit,
    this.frequency,
    this.onChanged,
    this.onBlur,
  }) : super(key: key);

  final String? unit;
  final int? frequency;
  final Function(String)? onChanged;
  final VoidCallback? onBlur;

  @override
  State<TimeIntervalInputField> createState() => _TimeIntervalInputFieldState();
}

class _TimeIntervalInputFieldState extends State<TimeIntervalInputField> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    addListener();
    if (widget.frequency != null) {
      _controller.text = widget.frequency.toString();
    }
  }

  void addListener() {
    _focusNode.addListener(() {
      if (!_focusNode.hasFocus) {
        widget.onBlur?.call();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 77.0),
      padding: const EdgeInsets.symmetric(horizontal: 5.0),
      height: 56.0,
      child: TextFormField(
        focusNode: _focusNode,
        controller: _controller,
        onChanged: widget.onChanged,
        keyboardType: TextInputType.number,
        style: AppTextStyle(
          fontSize: 16.0,
          fontWeight: 400,
          height: 1.56,
          color: Theme.of(context).colorScheme.primary,
        ),
        decoration: InputDecoration(
          contentPadding: const EdgeInsets.only(left: 20.0, top: 16.0, bottom: 16.0),
          filled: true,
          fillColor: Theme.of(context).colorScheme.primary.withOpacity(0.05),
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
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                widget.unit ?? Strings.timeIntervalInputSufix,
                style: AppTextStyle(
                  fontSize: 15.0,
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: 300,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
