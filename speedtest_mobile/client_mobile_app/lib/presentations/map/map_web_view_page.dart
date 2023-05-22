import 'dart:async';

import 'package:get_it/get_it.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_cubit.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_state.dart';
import 'package:client_mobile_app/presentations/map/widgets/ftue_map_modal.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';

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

  static const String _cookieName = 'visitedAllResults';
  static const String _cookieValue = 'true';
  static const String _cookieDomain = 'speedtest-staging.exactlylabs.com';
  static const String _cookiePath = '/';
}

class _MapWebViewPageState extends State<MapWebViewPage> {
  final CookieManager _cookieManager = CookieManager();
  final Completer<WebViewController> _controller = Completer<WebViewController>();
  late String initialUrl;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    initialUrl = _getWebViewUrl(context, widget.latitude, widget.longitude);
    if (widget.latitude == null && widget.longitude == null) {
      getCurrentLocation();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider<MapCubit>(
      create: (_) => MapCubit(localStorage: GetIt.I.get<LocalStorage>()),
      child: BlocListener<MapCubit, MapState>(
        listenWhen: (previous, current) => current.isFTUE,
        listener: (context, state) => _ftueModal(context),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: WebView(
                  key: ValueKey(initialUrl),
                  initialUrl: initialUrl,
                  javascriptMode: JavascriptMode.unrestricted,
                  onWebViewCreated: (WebViewController webViewController) {
                    if (!_controller.isCompleted) {
                      _controller.complete(webViewController);
                      _cookieManager.clearCookies();
                    }
                  },
                  onPageStarted: (String url) => _cookieManager.setCookie(const WebViewCookie(
                      name: MapWebViewPage._cookieName,
                      value: MapWebViewPage._cookieValue,
                      domain: MapWebViewPage._cookieDomain,
                      path: MapWebViewPage._cookiePath)),
                  navigationDelegate: (NavigationRequest request) {
                    final validRequestUrl = AppConfig.of(context)?.stringResource.WEB_ENDPOINT;
                    if (validRequestUrl == null || !request.url.contains(validRequestUrl)) {
                      return NavigationDecision.prevent;
                    }
                    return NavigationDecision.navigate;
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _ftueModal(BuildContext context) {
    return modalWithTitle(
      context,
      true,
      'Explore Map',
      FTUEMapModal(onPressed: () => context.read<MapCubit>().setFTUEMap()),
      () => context.read<MapCubit>().setFTUEMap(),
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
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      final permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.deniedForever) {
        setState(() => initialUrl = webEndpoint!);
      }
    }
    final position = await Geolocator.getCurrentPosition();
    setState(() => initialUrl = '$webEndpoint&userLat=${position.latitude}&userLng=${position.longitude}&zoom=17');
  }
}
