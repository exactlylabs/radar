import 'package:flutter/material.dart';

class StepsIndicator extends CustomPainter {
  StepsIndicator({
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

  double? stepCircleSize;

  @override
  void paint(Canvas canvas, Size size) {
    stepCircleSize = (size.width * 0.055) / 2;

    final xi =
        (size.width / 2) - ((size.width * 0.055) * (totalSteps)) / 2 - ((stepCircleSize! + 20) * (totalSteps - 1)) / 2;
    final y = size.height / 2;

    for (var i = 0; i < totalSteps; i++) {
      final x = stepCircleSize! + ((size.width * 0.055) * i) + (stepCircleSize! + 20) * i;
      drawStep(Offset(xi + x, y), canvas, i);
      if (i < totalSteps - 1) drawSeparator(Offset(xi + x + stepCircleSize! + 5, y), canvas);
    }
  }

  void drawStep(Offset offset, Canvas canvas, int step) async {
    var circlePaint = Paint()
      ..color = (step == currentStep) ? currentStepColor : stepColor
      ..strokeWidth = 5
      ..style = PaintingStyle.fill
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(offset, stepCircleSize ?? 24, circlePaint);

    if (step < currentStep) {
      paintImage(
        canvas: canvas,
        rect: Rect.fromCenter(
          center: offset,
          width: imageInfo.image.width / 2.5,
          height: imageInfo.image.height / 2.5,
        ),
        image: imageInfo.image,
      );
    } else {
      TextSpan stepNumber = TextSpan(
        text: '${step + 1}',
        style: TextStyle(
          fontSize: 13.0,
          fontWeight: FontWeight.w900,
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
        (offset.dy - textPainter.height) / 2,
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
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;

    Offset startingPoint = Offset(offset.dx, offset.dy);
    Offset endingPoint = Offset((startingPoint.dx) + stepCircleSize! + 10, offset.dy);

    canvas.drawLine(startingPoint, endingPoint, paint2);
  }
}
