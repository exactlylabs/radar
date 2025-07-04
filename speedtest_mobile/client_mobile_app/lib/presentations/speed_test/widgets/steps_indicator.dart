import 'dart:async';

import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';

class StepIndicator extends StatelessWidget {
  const StepIndicator({
    Key? key,
    required this.currentStep,
    required this.totalSteps,
    this.textColor = Colors.grey,
    this.stepColor = Colors.black,
    this.currentStepColor = Colors.amber,
    this.currentTextColor = Colors.black,
  }) : super(key: key);

  final int currentStep;
  final int totalSteps;
  final Color currentStepColor;
  final Color currentTextColor;
  final Color textColor;
  final Color stepColor;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _loadCheckImageInfo(context),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return CustomPaint(
            painter: StepsIndicatorPainter(
              imageInfo: snapshot.data as ImageInfo,
              currentStep: currentStep,
              totalSteps: 4,
              textColor: textColor,
              currentTextColor: currentTextColor,
              stepColor: stepColor,
              currentStepColor: currentStepColor,
            ),
            child: Container(height: 24),
          );
        } else {
          return Container();
        }
      },
    );
  }

  Future<ImageInfo> _loadCheckImageInfo(BuildContext context) async {
    AssetImage assetImage = const AssetImage(Images.check);
    ImageStream stream = assetImage.resolve(createLocalImageConfiguration(context));
    Completer<ImageInfo> completer = Completer();
    stream.addListener(ImageStreamListener((imageInfo, _) => completer.complete(imageInfo)));
    return completer.future;
  }
}

class StepsIndicatorPainter extends CustomPainter {
  StepsIndicatorPainter({
    required this.currentStep,
    required this.totalSteps,
    required this.imageInfo,
    this.textColor = Colors.grey,
    this.stepColor = Colors.black,
    this.currentStepColor = Colors.amber,
    this.currentTextColor = Colors.black,
  });

  final int currentStep;
  final int totalSteps;
  final Color currentStepColor;
  final Color currentTextColor;
  final Color textColor;
  final Color stepColor;
  final ImageInfo imageInfo;

  final double stepCircleRadius = 12.0;
  final double stepSeparatorWidth = 30.0;

  @override
  void paint(Canvas canvas, Size size) {
    final x = ((size.width) / 2 + stepCircleRadius) -
        ((totalSteps / 2) * (stepCircleRadius * 2)) -
        (totalSteps % 2 == 0 ? ((totalSteps - 1) / 2) : (totalSteps / 2)) * stepSeparatorWidth;
    final y = size.height / 2;

    for (var i = 0; i < totalSteps; i++) {
      final xi = (((stepCircleRadius * 2) + stepSeparatorWidth) * (i));
      drawStep(Offset(x + xi, y), canvas, i);
      if (i < totalSteps - 1) drawSeparator(Offset(x + xi, y), canvas);
    }
  }

  void drawStep(Offset offset, Canvas canvas, int step) async {
    var circlePaint = Paint()
      ..color = (step == currentStep) ? currentStepColor : stepColor
      ..strokeWidth = 5
      ..style = PaintingStyle.fill
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(offset, stepCircleRadius, circlePaint);

    if (step < currentStep) {
      paintImage(
        canvas: canvas,
        rect: Rect.fromCenter(
          center: offset,
          width: 10.0,
          height: 8.0,
        ),
        image: imageInfo.image,
      );
    } else {
      TextSpan stepNumber = TextSpan(
        text: '${step + 1}',
        style: AppTextStyle(
          fontSize: 13.0,
          fontWeight: 800,
          height: 1.92,
          color: (step == currentStep) ? currentTextColor : textColor,
        ),
      );
      TextPainter textPainter = TextPainter(
        text: stepNumber,
        textDirection: TextDirection.ltr,
      );

      textPainter.layout();
      Offset offset2 = Offset(
        (offset.dx - textPainter.width / 2),
        (offset.dy - textPainter.height / 2),
      );
      textPainter.paint(canvas, offset2);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }

  void drawSeparator(Offset offset, Canvas canvas) {
    var paint2 = Paint()
      ..color = stepColor
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    const double leftPadding = 5.0;
    const double separatorWidth = 20.0;

    Offset startingPoint = Offset(offset.dx + stepCircleRadius + leftPadding, offset.dy);
    Offset endingPoint = Offset(startingPoint.dx + separatorWidth, offset.dy);

    canvas.drawLine(startingPoint, endingPoint, paint2);
  }
}
