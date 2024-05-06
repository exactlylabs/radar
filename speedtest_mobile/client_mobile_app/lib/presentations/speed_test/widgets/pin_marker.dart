import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:client_mobile_app/resources/images.dart';

class PinMarker extends Marker {
  PinMarker({
    required LatLng point,
  }) : super(
          point: point,
          width: 32,
          height: 38.6,
          rotate: true,
          child: Image.asset(Images.pinMarker),
        );
}
