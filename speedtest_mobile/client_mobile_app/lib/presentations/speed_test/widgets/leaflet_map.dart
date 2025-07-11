import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/pin_marker.dart';
import 'package:client_mobile_app/presentations/speed_test/utils/leaflet_map_utils.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/circle_marker.dart' as cm;

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
    _address = widget.address ?? const LatLng(39.8282, -98.5696);
    _zoom = widget.address != null ? 16.0 : 3.0;
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
        initialCenter: _address,
        initialZoom: _zoom,
        interactionOptions: const InteractionOptions(
          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
          rotationWinGestures: MultiFingerGesture.none,
        ),
        onPositionChanged: (mapPosition, _) =>
            mapPosition.center != null ? _updateAddress(mapPosition.center!) : null,
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
          urlTemplate: LeafletMapUtils.mapBoxUrlTemplate,
          additionalOptions: const {'access_token': LeafletMapUtils.mapBoxAccessToken},
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
