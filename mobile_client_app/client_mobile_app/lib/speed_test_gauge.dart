import 'dart:async';
import 'dart:math';
import 'dart:ui' as ui;

import 'dart:math' as math;
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class SpeedTestGauge extends StatefulWidget {
  const SpeedTestGauge({
    Key? key,
    this.speed = 0,
    required this.minSpeed,
    required this.maxSpeed,
    this.isDownloadTest = true,
    this.speedTextStyle = const TextStyle(
      color: Colors.black,
      fontSize: 60,
      fontWeight: FontWeight.bold,
    ),
    this.unitOfMeasurement = 'Mbps',
    this.unitOfMeasurementTextStyle = const TextStyle(
      color: Colors.black,
      fontSize: 20.0,
      fontWeight: FontWeight.w600,
    ),
    this.minMaxTextStyle = const TextStyle(
      color: Colors.black,
      fontSize: 20,
    ),
    this.gaugeWidth = 20,
    this.baseGaugeColor = Colors.transparent,
    this.inactiveGaugeColor = Colors.black87,
    this.activeGaugeColor = Colors.green,
    this.innerCirclePadding = 30,
    this.animate = false,
    this.duration = const Duration(milliseconds: 200),
    this.fractionDigits = 0,
    this.activeGaugeGradientColor,
    this.child,
  }) : super(key: key);

  @override
  State<SpeedTestGauge> createState() => _SpeedTestGaugeState();

  final double speed;
  final bool isDownloadTest;
  final TextStyle speedTextStyle;
  final String unitOfMeasurement;
  final TextStyle unitOfMeasurementTextStyle;
  final double minSpeed;
  final double maxSpeed;
  final TextStyle minMaxTextStyle;
  final double gaugeWidth;
  final Color baseGaugeColor;
  final Color activeGaugeColor;
  final Color inactiveGaugeColor;
  final ui.Gradient? activeGaugeGradientColor;
  final double innerCirclePadding;
  final bool animate;
  final Duration duration;
  final int fractionDigits;
  final Widget? child;
}

class _SpeedTestGaugeState extends State<SpeedTestGauge> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  late double _speed;
  late bool _animate;

  double lastMarkSpeed = 0;
  double _gaugeMarkSpeed = 0;

  @override
  void initState() {
    _speed = widget.speed;
    _animate = widget.animate;
    if (_animate) {
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) => updateSpeed(_speed, animate: _animate));
    } else {
      lastMarkSpeed = _speed;
      _gaugeMarkSpeed = _speed;
    }

    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _animation = Tween(begin: 0.0, end: 1.0).animate(_controller)
      ..addListener(() {
        setState(() {
          _gaugeMarkSpeed = lastMarkSpeed + ((_speed - lastMarkSpeed) * _animation.value);
        });
      })
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          lastMarkSpeed = _gaugeMarkSpeed;
        }
      });
    super.initState();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_speed != widget.speed) {
      updateSpeed(widget.speed, animate: widget.animate, duration: widget.duration);
    }
    return FutureBuilder(
      future: _loadImagesInfo(context),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return CustomPaint(
            painter: _SpeedTestGaugeCustomPainter(
                _gaugeMarkSpeed,
                widget.isDownloadTest,
                snapshot.data as ImageInfo,
                widget.speedTextStyle,
                widget.unitOfMeasurement,
                widget.unitOfMeasurementTextStyle,
                widget.minSpeed,
                widget.maxSpeed,
                widget.minMaxTextStyle,
                widget.gaugeWidth,
                widget.baseGaugeColor,
                widget.inactiveGaugeColor,
                widget.activeGaugeColor,
                widget.innerCirclePadding,
                widget.fractionDigits,
                widget.activeGaugeGradientColor),
            child: widget.child ?? Container(),
          );
        } else {
          return Container();
        }
      },
    );
  }

  Future<ImageInfo> _loadImagesInfo(BuildContext context) async {
    AssetImage assetImage = const AssetImage(Images.downloadIcon);
    ImageStream stream = assetImage.resolve(createLocalImageConfiguration(context));
    Completer<ImageInfo> completer = Completer();
    stream.addListener(ImageStreamListener((imageInfo, _) => completer.complete(imageInfo)));
    return completer.future;
  }

  void updateSpeed(double speed, {bool animate = false, Duration? duration}) {
    if (animate) {
      // print(speed);
      _speed = speed;
      _controller.reset();
      if (duration != null) _controller.duration = duration;
      _controller.forward();
    } else {
      setState(() {
        lastMarkSpeed = speed;
      });
    }
  }
}

class _SpeedTestGaugeCustomPainter extends CustomPainter {
  //We are considering this start angle starting point for gauge view
  final double arcStartAngle = 135;
  final double arcSweepAngle = 270;

  final double speed;
  final bool isDownloadTest;
  final TextStyle speedTextStyle;
  final String unitOfMeasurement;
  final TextStyle unitOfMeasurementTextStyle;

  final double minSpeed;
  final double maxSpeed;
  final TextStyle minMaxTextStyle;

  final double gaugeWidth;
  final Color baseGaugeColor;
  final Color inactiveGaugeColor;
  final Color activeGaugeColor;
  final ui.Gradient? activeGaugeGradientColor;

  final double innerCirclePadding;
  final ImageInfo imageInfo;

  Offset? center;
  double mRadius = 200;
  double mDottedCircleRadius = 0;

  final int fractionDigits;

  _SpeedTestGaugeCustomPainter(
    this.speed,
    this.isDownloadTest,
    this.imageInfo,
    this.speedTextStyle,
    this.unitOfMeasurement,
    this.unitOfMeasurementTextStyle,
    this.minSpeed,
    this.maxSpeed,
    this.minMaxTextStyle,
    this.gaugeWidth,
    this.baseGaugeColor,
    this.inactiveGaugeColor,
    this.activeGaugeColor,
    this.innerCirclePadding,
    this.fractionDigits,
    this.activeGaugeGradientColor,
  );

  @override
  void paint(Canvas canvas, Size size) {
    //get the center of the view
    center = size.center(const Offset(0, 0));

    _drawGauge(size, canvas);

    //draw division dots circle(big one)
    _drawSteps(canvas, size);

    //Draw Unit of Measurement
    _drawUnitOfMeasurementText(canvas, size);

    //Draw Speed Text
    _drawSpeedText(canvas, size);

    _drawDownloadIcon(canvas, size, isDownloadTest ? 1.0 : 0.3);

    _drawUploadIcon(canvas, size, isDownloadTest ? 0.3 : 1.0);
  }

  void _drawGauge(ui.Size size, ui.Canvas canvas) {
    double minDimension = size.width > size.height ? size.height : size.width;
    mRadius = minDimension / 2;

    mDottedCircleRadius = mRadius - innerCirclePadding;

    Paint paint = Paint();
    paint.strokeWidth = gaugeWidth;
    paint.strokeCap = StrokeCap.round;
    paint.style = PaintingStyle.stroke;

    canvas.drawCircle(center!, mRadius, paint..color = baseGaugeColor);

    canvas.drawArc(
      Rect.fromCircle(center: center!, radius: mRadius),
      degToRad(arcStartAngle) as double,
      degToRad(arcSweepAngle) as double,
      false,
      paint..color = const Color.fromRGBO(17, 14, 76, 0.1),
    );

    paint.color = activeGaugeColor;

    const uploadGradient = LinearGradient(
      tileMode: TileMode.clamp,
      colors: [
        Color.fromRGBO(255, 195, 79, 1),
        Color.fromRGBO(229, 101, 187, 1),
      ],
    );

    const downloadGradient = LinearGradient(
      tileMode: TileMode.clamp,
      colors: [
        Color.fromRGBO(99, 191, 225, 1),
        Color.fromRGBO(80, 84, 194, 1),
      ],
    );

    paint.shader = isDownloadTest
        ? downloadGradient.createShader(Rect.fromCircle(center: center!, radius: mRadius))
        : uploadGradient.createShader(Rect.fromCircle(center: center!, radius: mRadius));

    canvas.drawArc(
      Rect.fromCircle(center: center!, radius: mRadius),
      degToRad(arcStartAngle) as double,
      degToRad(_getAngleOfSpeed(speed)) as double,
      false,
      paint,
    );

    paint.style = PaintingStyle.fill;
  }

  void _drawDownloadIcon(ui.Canvas canvas, Size size, [double opacity = 1.0]) {
    Offset offset = Offset((size.width / 2) - (imageInfo.image.width / 3.5), (size.height / 2) - 45);
    paintImage(
      canvas: canvas,
      opacity: opacity,
      rect: Rect.fromCenter(
        center: offset,
        width: imageInfo.image.width / 2.5,
        height: imageInfo.image.height / 2.5,
      ),
      image: imageInfo.image,
    );
  }

  void _drawUploadIcon(ui.Canvas canvas, Size size, [double opacity = 1.0]) {
    canvas.translate((size.width / 2) + (imageInfo.image.width / 3.5), (size.height / 2) - 45);
    canvas.rotate(180 * pi / 180);
    paintImage(
      canvas: canvas,
      opacity: opacity,
      colorFilter: const ColorFilter.mode(Color.fromRGBO(229, 101, 187, 1), BlendMode.srcIn),
      rect: Rect.fromCenter(
        center: Offset.zero,
        width: imageInfo.image.width / 2.5,
        height: imageInfo.image.height / 2.5,
      ),
      image: imageInfo.image,
    );
  }

  void _drawSteps(Canvas canvas, Size size) {
    final steps = ['0', '5', '10', '15', '20', '30', '50', '75', '100'];
    for (double i = 0; i <= 270; i = i + (33.75)) {
      final angle = i + arcStartAngle;
      var offset = _getDegreeOffsetOnCircle(mDottedCircleRadius, angle);
      TextSpan span = TextSpan(style: minMaxTextStyle, text: steps[(i / 33.75).round()]);
      TextPainter textPainter = TextPainter(
        text: span,
        textDirection: TextDirection.ltr,
      );
      textPainter.layout(
        minWidth: 0,
        maxWidth: size.width,
      );

      final width = -textPainter.width / 2;

      offset = offset.translate(width, -textPainter.height / 2);
      textPainter.paint(canvas, offset);
    }
  }

  @override
  bool shouldRepaint(CustomPainter old) {
    return true;
  }

  Offset _getDegreeOffsetOnCircle(double radius, double angle) {
    double radian = degToRad(angle) as double;
    double dx = (center!.dx + radius * math.cos(radian));
    double dy = (center!.dy + radius * math.sin(radian));
    return Offset(dx, dy);
  }

  double _getAngleOfSpeed(double speed) {
    //limit speed to max speed
    double parsedSpeed;
    if (speed >= maxSpeed) {
      parsedSpeed = 270;
    } else if (speed < 20) {
      parsedSpeed = 6.75 * speed;
    } else if (speed <= 30) {
      parsedSpeed = 135 + (3.375 * (speed - 20));
    } else if (speed <= 50) {
      parsedSpeed = 168.75 + (1.6625 * (speed - 30));
    } else if (speed <= 75) {
      parsedSpeed = 202 + (1.37 * (speed - 50));
    } else {
      parsedSpeed = 236.25 + (1.35 * (speed - 75));
    }
    return parsedSpeed;
  }

  void _drawUnitOfMeasurementText(Canvas canvas, Size size) {
    //Get the center point of the minSpeed and maxSpeed label
    //that would be center of the unit of measurement text
    Offset unitOfMeasurementOffset = Offset(size.width / 2, size.height / 2);

    TextSpan span = TextSpan(style: unitOfMeasurementTextStyle, text: unitOfMeasurement);
    TextPainter textPainter = TextPainter(
      text: span,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: size.width,
    );

    unitOfMeasurementOffset = unitOfMeasurementOffset.translate(-textPainter.width / 2, (-textPainter.height / 2) + 38);
    textPainter.paint(canvas, unitOfMeasurementOffset);
  }

  void _drawSpeedText(Canvas canvas, Size size) {
    //We are going to draw this text in the center of the widget

    Offset? unitOfMeasurementOffset = center;

    TextSpan span = TextSpan(style: speedTextStyle, text: speed.toStringAsFixed(fractionDigits));
    TextPainter textPainter = TextPainter(
      text: span,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: size.width,
    );

    unitOfMeasurementOffset = center!.translate(-textPainter.width / 2, -textPainter.height / 2);
    textPainter.paint(canvas, unitOfMeasurementOffset);
  }

  static num degToRad(num deg) => deg * (math.pi / 180.0);
}
