import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class BillCostInputField extends StatefulWidget {
  const BillCostInputField({
    Key? key,
    this.billCost,
    this.onChanged,
  }) : super(key: key);

  final int? billCost;
  final Function(String)? onChanged;

  @override
  State<BillCostInputField> createState() => _BillCostInputFieldState();
}

class _BillCostInputFieldState extends State<BillCostInputField> {
  final TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (widget.billCost != null) {
      _controller.text = widget.billCost.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        InkWell(
          onTap: () {
            _controller.text = (int.tryParse(_controller.text) ?? 0) - 1 > 0
                ? ((int.tryParse(_controller.text) ?? 0) - 1).toString()
                : '0';
            if (widget.onChanged != null) widget.onChanged!(_controller.text);
          },
          child: Image.asset(Images.lessButton),
        ),
        const SizedBox(width: 22.0),
        Expanded(
          child: TextFormField(
            controller: _controller,
            onChanged: widget.onChanged,
            keyboardType: TextInputType.number,
            style: AppTextStyle(
              fontSize: 16.0,
              color: Theme.of(context).colorScheme.primary,
              fontWeight: 400,
            ),
            decoration: InputDecoration(
              filled: true,
              fillColor: Theme.of(context).colorScheme.primary.withOpacity(0.05),
              hintText: '0',
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
              suffixText: 'US \$',
              suffixStyle: AppTextStyle(
                fontSize: 15.0,
                color: Theme.of(context).colorScheme.primary,
                fontWeight: 300,
              ),
            ),
          ),
        ),
        const SizedBox(width: 22.0),
        InkWell(
          onTap: () {
            _controller.text = (int.tryParse(_controller.text) ?? 0) + 1 > 0
                ? ((int.tryParse(_controller.text) ?? 0) + 1).toString()
                : '0';
            if (widget.onChanged != null) widget.onChanged!(_controller.text);
          },
          child: Image.asset(Images.moreButton),
        ),
      ],
    );
  }
}
