import 'package:flutter/material.dart';

Future<void> modalWithTitle(BuildContext context, bool? isScrollControlled, String title, Widget body,
    [VoidCallback? onPop]) async {
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
    ),
  );
}

class ModalWithTitle extends StatelessWidget {
  const ModalWithTitle({
    Key? key,
    required this.title,
    required this.body,
    this.onPop,
  }) : super(key: key);

  final String title;
  final Widget body;
  final VoidCallback? onPop;

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
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Align(
                            alignment: Alignment.centerRight,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                shape: const CircleBorder(),
                                elevation: 0.0,
                                padding: EdgeInsets.zero,
                                backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                              ),
                              child: Icon(
                                Icons.close_rounded,
                                color: Theme.of(context).colorScheme.tertiary,
                              ),
                              onPressed: () {
                                if (onPop != null) onPop!();
                                Navigator.of(context).pop();
                              },
                            ),
                          ),
                          Text(
                            title,
                            style: TextStyle(
                              fontSize: 17.0,
                              letterSpacing: -0.5,
                              fontWeight: FontWeight.w600,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 20.0),
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
