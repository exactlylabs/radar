import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/presentations/widgets/close_rounded_button.dart';

Future<void> modalWithTitle(
    BuildContext context, bool? isScrollControlled, String title, Widget body,
    [VoidCallback? onPop, EdgeInsets? padding, bool? enableDrag]) {
  return showModalBottomSheet(
    context: context,
    backgroundColor: Theme.of(context).colorScheme.background,
    shape: const RoundedRectangleBorder(
        borderRadius:
            BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0))),
    isScrollControlled: isScrollControlled ?? false,
    enableDrag: enableDrag ?? true,
    builder: (context) => ModalWithTitle(
      title: title,
      body: body,
      onPop: onPop,
      padding: padding,
    ),
  );
}

class ModalWithTitle extends StatelessWidget {
  const ModalWithTitle({
    Key? key,
    required this.title,
    required this.body,
    this.padding,
    this.onPop,
  }) : super(key: key);

  final String title;
  final Widget body;
  final VoidCallback? onPop;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraint) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraint.minHeight),
              child: IntrinsicHeight(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Align(
                          alignment: Alignment.centerRight,
                          child: CloseRoundedButton(
                            height: 28,
                            margin: const EdgeInsets.fromLTRB(12.0, 12.0, 12.0, 0.0),
                            onTap: () {
                              if (onPop != null) {
                                onPop!();
                              }
                              Navigator.of(context).pop();
                            },
                          ),
                        ),
                        Text(
                          title,
                          style: AppTextStyle(
                            fontSize: 17.0,
                            fontWeight: 800,
                            letterSpacing: -0.5,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: padding ?? const EdgeInsets.symmetric(horizontal: 20.0),
                      child: body,
                    )
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
