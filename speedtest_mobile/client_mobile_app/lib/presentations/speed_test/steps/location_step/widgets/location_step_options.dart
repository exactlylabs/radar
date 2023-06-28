import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';

class LocationStepOptions extends StatefulWidget {
  const LocationStepOptions({
    super.key,
    required this.isGeolocationLoading,
    required this.onLocationInputPressed,
    required this.onCurrentLocationPressed,
  });

  final bool isGeolocationLoading;
  final VoidCallback onCurrentLocationPressed;
  final VoidCallback onLocationInputPressed;

  @override
  State<LocationStepOptions> createState() => _LocationStepOptionsState();
}

class _LocationStepOptionsState extends State<LocationStepOptions>
    with SingleTickerProviderStateMixin {
  late Animation _animation;
  late AnimationController _animationController;

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(duration: const Duration(seconds: 1), vsync: this);
    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _animationController.reverse();
      } else if (status == AnimationStatus.dismissed) {
        _animationController.forward();
      }
    });
    _animation = Tween<double>(begin: 0.7, end: 1.0).animate(_animationController);
    _animationController.forward();
  }

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        children: [
          SpacerWithMax(size: height * 0.037, maxSize: 30.0),
          SizedBox(
            height: 258.0,
            width: 258.0,
            child: Stack(
              alignment: Alignment.center,
              children: [
                AnimatedBuilder(
                    animation: _animation,
                    builder: (context, child) {
                      return SizedBox(
                        height: _animation.value * 182.0,
                        width: _animation.value * 182.0,
                        child: CustomPaint(
                          painter: LoadingLocationPainter(
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                        ),
                      );
                    }),
                Image.asset(Images.pinMarker, width: 32.0, height: 38.6)
              ],
            ),
          ),
          SpacerWithMax(size: height * 0.05, maxSize: 40.0),
          PrimaryButton(
            shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
            onPressed: widget.isGeolocationLoading ? null : widget.onCurrentLocationPressed,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Strings.useMyCurrentLocationButtonLabel,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 400,
                    letterSpacing: 1,
                    color: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
                const SizedBox(width: 15.0),
                Image.asset(
                  Images.buttonRightArrow,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ],
            ),
          ),
          SpacerWithMax(size: height * 0.031, maxSize: 25.0),
          InkWell(
            onTap: widget.onLocationInputPressed,
            child: Text(
              Strings.enterAddressManuallyButtonLabel,
              style: AppTextStyle(
                color: Theme.of(context).colorScheme.tertiary,
                fontSize: 15.0,
                height: 1.66,
                fontWeight: 600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LoadingLocationPainter extends CustomPainter {
  const LoadingLocationPainter({
    required this.color,
  });

  final Color color;

  @override
  bool shouldRepaint(covariant LoadingLocationPainter oldDelegate) => color != oldDelegate.color;

  @override
  void paint(Canvas canvas, Size size) {
    final bigCirclePaint = Paint()
      ..color = color.withOpacity(0.15)
      ..style = PaintingStyle.fill;

    final smallCirclePaint = Paint()
      ..color = color.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    final offset = Offset(size.width / 2, size.height / 2);
    final bigRadius = size.width / 2;
    final smallRadius = bigRadius * 0.5;

    _drawCircle(canvas, bigRadius, offset, bigCirclePaint);
    _drawCircle(canvas, smallRadius, offset, smallCirclePaint);
  }

  void _drawCircle(Canvas canvas, double radius, Offset offset, Paint paint) {
    canvas.drawCircle(offset, radius, paint);
  }
}
