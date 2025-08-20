import 'dart:async';

import 'package:get_it/get_it.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/map/widgets/ftue_map_modal.dart';

class MapWebViewPage extends StatefulWidget {
  const MapWebViewPage({
    Key? key,
    this.latitude,
    this.longitude,
  }) : super(key: key);

  final double? latitude;
  final double? longitude;

  @override
  State<MapWebViewPage> createState() => _MapWebViewPageState();

  static const String _cookiePath = '/';
  static const String _cookieValue = 'true';
  static const String _cookieName = 'visitedAllResults';
}

class _MapWebViewPageState extends State<MapWebViewPage> {
  late final WebViewController _controller;
  final LocalStorage _localStorage = GetIt.I<LocalStorage>();

  late String initialUrl;
  late String _cookieDomain;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            final validRequestUrl = AppConfig.of(context)?.stringResource.WEB_ENDPOINT;
            if (validRequestUrl == null || !request.url.contains(validRequestUrl)) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onPageStarted: (String url) {
            final cookieManager = WebViewCookieManager();
            cookieManager.setCookie(
              WebViewCookie(
                name: MapWebViewPage._cookieName,
                value: MapWebViewPage._cookieValue,
                domain: _cookieDomain,
                path: MapWebViewPage._cookiePath,
              ),
            );
          },
        ),
      );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final ftueMap = _localStorage.getFTUEMap();
    if (ftueMap) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _ftueModal(context));
    }
    _cookieDomain = AppConfig.of(context)?.stringResource.WEB_ENDPOINT_COOKIE_DOMAIN ?? '';
    initialUrl = _getWebViewUrl(context, widget.latitude, widget.longitude);
    _controller.loadRequest(Uri.parse(initialUrl));
    if (widget.latitude == null && widget.longitude == null) {
      getCurrentLocation();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Expanded(
            child: WebViewWidget(
              controller: _controller,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _ftueModal(BuildContext context) {
    return modalWithTitle(
      context,
      true,
      '',
      FTUEMapModal(
        onPressed: () {
          _localStorage.setFTUEMap();
          Navigator.of(context).pop();
        },
      ),
      () => _localStorage.setFTUEMap(),
    );
  }

  String _getWebViewUrl(BuildContext context, double? latitude, double? longitude) {
    final webEndpoint = AppConfig.of(context)?.stringResource.WEB_ENDPOINT;
    if (latitude == null || longitude == null) {
      return webEndpoint!;
    }
    return '$webEndpoint&userLat=$latitude&userLng=$longitude&zoom=20';
  }

  Future<void> getCurrentLocation() async {
    final webEndpoint = AppConfig.of(context)?.stringResource.WEB_ENDPOINT;
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        final permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied ||
            permission == LocationPermission.deniedForever) {
          final newUrl = webEndpoint!;
          _controller.loadRequest(Uri.parse(newUrl));
          return;
        }
      }
      final position = await Geolocator.getCurrentPosition();
      final newUrl = '$webEndpoint&userLat=${position.latitude}&userLng=${position.longitude}&zoom=17';
      _controller.loadRequest(Uri.parse(newUrl));
    } catch (failure) {
      final newUrl = '$webEndpoint&zoom=17';
      _controller.loadRequest(Uri.parse(newUrl));
    }
  }
}
