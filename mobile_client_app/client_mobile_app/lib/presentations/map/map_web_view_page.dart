import 'dart:async';

import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_cubit.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_state.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';

class MapWebViewPage extends StatefulWidget {
  const MapWebViewPage({
    Key? key,
  }) : super(key: key);

  @override
  MapWebViewPageState createState() => MapWebViewPageState();
}

class MapWebViewPageState extends State<MapWebViewPage> {
  late WebViewController _myController;

  final CookieManager _cookieManager = CookieManager();
  final Completer<WebViewController> _controller = Completer<WebViewController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocProvider<MapCubit>(
        create: (_) => MapCubit(localStorage: LocalStorage()),
        child: BlocListener<MapCubit, MapState>(
          listenWhen: (previous, current) => current.isFTUE,
          listener: (context, state) => modalWithTitle(
            context,
            false,
            'Explore Map',
            Column(children: [
              Text(
                  'Our map shows all speed tests taken across the country. Tap a test to view more details or filter tests by speed results.'),
              Image.asset(Images.mapIllustration),
              ElevatedButton(
                onPressed: () => null,
                child: Text('Go to map'),
              ),
            ]),
          ),
          child: WebView(
            initialUrl: 'https://speedtest-staging.exactlylabs.com/',
            javascriptMode: JavascriptMode.unrestricted,
            onWebViewCreated: (WebViewController webViewController) {
              _controller.complete(webViewController);
              _myController = webViewController;
              _cookieManager.clearCookies();
            },
            onPageStarted: (String url) => _cookieManager.setCookie(
                const WebViewCookie(name: _cookieName, value: _cookieValue, domain: _cookieDomain, path: _cookiePath)),
            onPageFinished: (String url) {
              _myController.runJavascript(_goToMap);
              _myController.runJavascript(_hideHeader);
              _myController.runJavascript(_hideTabs);
              _myController.runJavascript(_hideFooter);
              _myController.runJavascript(_setMainFrameMaxHeight);
              Future.delayed(const Duration(milliseconds: 600), () => _myController.runJavascript(_setMapMaxHeight));
            },
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  static const String _cookieName = 'visitedAllResults';
  static const String _cookieValue = 'true';
  static const String _cookieDomain = 'speedtest-staging.exactlylabs.com';
  static const String _cookiePath = '/';
  static const String _goToMap = "document.getElementById(\"tabs--explore-map-button\").click();";
  static const String _hideHeader = "document.getElementById(\"header--wrapper\").style.display='none';";
  static const String _hideTabs = "document.getElementById(\"tabs--wrapper\").style.display='none';";
  static const String _hideFooter = "document.getElementById(\"footer--wrapper\").style.display='none';";
  static const String _setMainFrameMaxHeight =
      "document.getElementById(\"frame--main-frame-wrapper\").style.height='100%';";
  static const String _setMapMaxHeight =
      "document.getElementById(\"all-results-page--map-container\").style.height='100%';";
}
