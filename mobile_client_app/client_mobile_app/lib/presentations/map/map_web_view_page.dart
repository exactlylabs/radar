import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class MapWebViewPage extends StatefulWidget {
  const MapWebViewPage({
    Key? key,
  }) : super(key: key);

  @override
  MapWebViewPageState createState() => MapWebViewPageState();
}

class MapWebViewPageState extends State<MapWebViewPage> {
  final Completer<WebViewController> _controller = Completer<WebViewController>();
  late WebViewController _myController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebView(
        initialUrl: 'http://localhost:9999/',
        javascriptMode: JavascriptMode.unrestricted,
        onWebViewCreated: (WebViewController webViewController) {
          _controller.complete(webViewController);
          _myController = webViewController;
        },
        onPageFinished: (String url) {
          _myController.runJavascript("document.getElementById(\"tabs--explore-map-button\").click();");
          _myController.runJavascript("document.getElementById(\"header--wrapper\").style.display='none';");
          _myController.runJavascript("document.getElementById(\"tabs--wrapper\").style.display='none';");
          _myController.runJavascript("document.getElementById(\"footer--wrapper\").style.display='none';");
          // _myController.runJavascript("document.getElementsByClassName(\"leaflet-container\")[0].style.height='100%';");
        },
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}
