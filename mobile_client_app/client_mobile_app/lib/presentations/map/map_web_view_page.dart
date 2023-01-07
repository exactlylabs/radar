import 'dart:async';

import 'package:get_it/get_it.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_cubit.dart';
import 'package:client_mobile_app/presentations/map/bloc/map_state.dart';
import 'package:client_mobile_app/presentations/map/widgets/ftue_map_modal.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';

class MapWebViewPage extends StatelessWidget {
  MapWebViewPage({
    Key? key,
  }) : super(key: key);

  late WebViewController _myController;

  final CookieManager _cookieManager = CookieManager();
  final Completer<WebViewController> _controller = Completer<WebViewController>();

  @override
  Widget build(BuildContext context) {
    return BlocProvider<MapCubit>(
      create: (_) => MapCubit(localStorage: GetIt.I.get<LocalStorage>()),
      child: BlocListener<MapCubit, MapState>(
        listenWhen: (previous, current) => current.isFTUE,
        listener: (context, state) => _ftueModal(context),
        child: Column(
          children: [
            const SizedBox(height: 23.0),
            Expanded(
              child: WebView(
                initialUrl: AppConfig.of(context)?.stringResource.WEB_ENDPOINT,
                javascriptMode: JavascriptMode.unrestricted,
                onWebViewCreated: (WebViewController webViewController) {
                  _controller.complete(webViewController);
                  _myController = webViewController;
                  _cookieManager.clearCookies();
                },
                onPageStarted: (String url) => _cookieManager.setCookie(const WebViewCookie(
                    name: _cookieName, value: _cookieValue, domain: _cookieDomain, path: _cookiePath)),
                onPageFinished: (String url) {
                  _myController.runJavascript(_goToMap);
                  _myController.runJavascript(_hideHeader);
                  _myController.runJavascript(_hideTabs);
                  _myController.runJavascript(_hideFooter);
                  _myController.runJavascript(_setMainFrameMaxHeight);
                  Future.delayed(const Duration(milliseconds: 700), () {
                    _myController.runJavascript(_setMapMaxHeight);
                    _myController.runJavascript(_setSpeedResultsBoxPosition);
                    _myController.runJavascript(_setFloatingExploreButtonFiltersPosition);
                    _myController.runJavascript(_setCallbackForFloatingButton);
                  });
                },
              ),
            ),
          ],
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
  static const String _setSpeedResultsBoxPosition =
      "document.getElementById(\"speed-results-box--mobile-filters\").style.top='calc(100vh - 125px - 25px)';";
  static const String _setFloatingExploreButtonFiltersPosition =
      "document.getElementById(\"floating-explore-button--filters-button\").style.top='calc(100vh - 50px - 25px)';";
  static const String _setCallbackForFloatingButton =
      "document.getElementById(\"floating-explore-button--filters-button\").addEventListener('click',() => {setTimeout(() => {document.getElementById(\"speed-results-box--mobile-filters\").style.top='calc(100vh - 125px - 25px)';}, 0)});";
}
