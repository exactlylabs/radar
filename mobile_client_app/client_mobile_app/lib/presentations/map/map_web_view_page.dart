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

  final CookieManager _cookieManager = CookieManager();
  final Completer<WebViewController> _controller = Completer<WebViewController>();

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
                  initialUrl: AppConfig.of(context)?.stringResource.WEB_ENDPOINT,
                  javascriptMode: JavascriptMode.unrestricted,
                  onWebViewCreated: (WebViewController webViewController) {
                    _controller.complete(webViewController);
                    _cookieManager.clearCookies();
                  },
                  onPageStarted: (String url) => _cookieManager.setCookie(const WebViewCookie(
                      name: _cookieName, value: _cookieValue, domain: _cookieDomain, path: _cookiePath)),
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

  static const String _cookieName = 'visitedAllResults';
  static const String _cookieValue = 'true';
  static const String _cookieDomain = 'speedtest-staging.exactlylabs.com';
  static const String _cookiePath = '/';
}
