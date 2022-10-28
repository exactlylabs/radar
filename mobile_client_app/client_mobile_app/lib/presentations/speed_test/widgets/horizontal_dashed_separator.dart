import 'package:flutter/material.dart';

class DashedLinePainter extends CustomPainter {
  DashedLinePainter({
    this.color = Colors.grey,
    this.strokeWidth = 1,
  });

  final Color color;
  final double strokeWidth;

  @override
  void paint(Canvas canvas, Size size) {
    double dashWidth = 5, dashSpace = 7, startX = 0;
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth;
    while (startX <= size.width) {
      canvas.drawLine(Offset(startX, 0), Offset(startX + dashWidth, 0), paint);
      startX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class HorizontalDashedSeparator extends StatelessWidget {
  const HorizontalDashedSeparator({
    Key? key,
    this.color = Colors.grey,
    this.strokeWidth = 1,
    this.height = 1,
  }) : super(key: key);

  final Color color;
  final double strokeWidth;
  final double height;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: DashedLinePainter(
        color: color,
        strokeWidth: strokeWidth,
      ),
      size: Size.fromHeight(height),
    );
  }
}
