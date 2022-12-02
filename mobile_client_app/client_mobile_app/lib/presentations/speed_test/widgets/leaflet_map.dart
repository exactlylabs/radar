import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/pin_marker.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/circle_marker.dart' as cm;

// import 'package:flutter_map/plugin_api.dart';

class LeafletMap extends StatefulWidget {
  const LeafletMap({
    Key? key,
    required this.onLocationSelected,
    this.address,
  }) : super(key: key);

  final Function(LatLng) onLocationSelected;
  final LatLng? address;

  @override
  State<LeafletMap> createState() => _LeafletMapState();
}

class _LeafletMapState extends State<LeafletMap> {
  final MapController _mapController = MapController();
  late LatLng _address;
  late double _zoom;
  late bool _circleMarkerVisible;

  @override
  void initState() {
    super.initState();
    _address = widget.address ?? LatLng(30, 40);
    _zoom = widget.address != null ? 16.0 : 5.0;
    _circleMarkerVisible = true;
  }

  void _updateAddress(LatLng address) {
    widget.onLocationSelected(address);
    setState(() {
      _address = address;
    });
  }

  void _hideCircleMarker() {
    setState(() {
      _circleMarkerVisible = false;
    });
  }

  void _showCircleMarker() {
    setState(() {
      _circleMarkerVisible = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        center: _address,
        zoom: _zoom,
        onPositionChanged: (mapPosition, _) => mapPosition.center != null ? _updateAddress(mapPosition.center!) : null,
        onMapEvent: (event) {
          if (event is MapEventMoveStart || event is MapEventDoubleTapZoomStart) {
            _hideCircleMarker();
          } else if (event is MapEventMoveEnd || event is MapEventDoubleTapZoomEnd) {
            _showCircleMarker();
          }
        },
      ),
      children: [
        TileLayer(
          urlTemplate:
              'https://api.mapbox.com/styles/v1/exactlylabs/cl7iwvbaz000l15mmms6da3kx/tiles/512/{z}/{x}/{y}?access_token={access_token}',
          additionalOptions: const {
            'access_token':
                'pk.eyJ1IjoiZXhhY3RseWxhYnMiLCJhIjoiY2w3OXJqcXhjMG1vbzQycGxidHNqdXRtcCJ9.BTDEZoZFcVnMMftMm33EMw'
          },
        ),
        MarkerLayer(
          markers: [
            PinMarker(point: _address),
            cm.CircleMarker(point: _address, visible: _circleMarkerVisible),
          ],
        ),
      ],
    );
  }
}
