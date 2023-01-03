import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

Future<void> modalWithTitle(BuildContext context, bool? isScrollControlled, String title, Widget body,
    [VoidCallback? onPop, EdgeInsets? padding]) async {
  return showModalBottomSheet(
    context: context,
    backgroundColor: Theme.of(context).backgroundColor,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0))),
    isScrollControlled: isScrollControlled ?? false,
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
                          child: InkWell(
                            onTap: () {
                              if (onPop != null) {
                                onPop!();
                              }
                              Navigator.pop(context);
                            },
                            child: Container(
                              height: 28,
                              margin: const EdgeInsets.fromLTRB(12.0, 12.0, 12.0, 0.0),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context).colorScheme.surface.withOpacity(0.3),
                                boxShadow: [
                                  BoxShadow(
                                    color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                                    spreadRadius: -2.0,
                                    blurRadius: 15.0,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Image.asset(Images.closeIcon),
                            ),
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
