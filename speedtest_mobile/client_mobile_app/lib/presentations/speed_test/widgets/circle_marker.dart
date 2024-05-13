import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:client_mobile_app/resources/images.dart';

class CircleMarker extends Marker {
  CircleMarker({
    required LatLng point,
    this.visible = true,
  }) : super(
          point: point,
          width: 132,
          height: 132,
          child: AnimatedOpacity(
            opacity: visible ? 1.0 : 0.0,
            duration: const Duration(milliseconds: 200),
            child: Image.asset(Images.circleMarker),
          ),
        );

  final bool visible;
}
