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
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    if (widget.billCost != null) {
      _controller.text = widget.billCost.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5.0),
      height: 56.0,
      child: Row(
        children: [
          InkWell(
            onTap: () {
              _controller.text = decrease(_controller.text);
              _controller.selection = TextSelection.fromPosition(TextPosition(offset: _controller.text.length));
              if (widget.onChanged != null) widget.onChanged!(_controller.text);
            },
            child: Image.asset(Images.lessButton),
          ),
          const SizedBox(width: 22.0),
          Expanded(
            child: TextFormField(
              focusNode: _focusNode,
              autofocus: true,
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
                hintText: '0',
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
                suffixIcon: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'US \$',
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
          ),
          const SizedBox(width: 22.0),
          InkWell(
            onTap: () {
              _controller.text = increase(_controller.text);
              _controller.selection = TextSelection.fromPosition(TextPosition(offset: _controller.text.length));
              if (widget.onChanged != null) widget.onChanged!(_controller.text);
            },
            child: Image.asset(Images.moreButton),
          ),
        ],
      ),
    );
  }

  String increase(String value) {
    return (int.tryParse(value) ?? 0) + 10 > 0 ? ((int.tryParse(value) ?? 0) + 10).toString() : '0';
  }

  String decrease(String value) {
    return (int.tryParse(value) ?? 0) - 10 > 0 ? ((int.tryParse(value) ?? 0) - 10).toString() : '0';
  }
}
