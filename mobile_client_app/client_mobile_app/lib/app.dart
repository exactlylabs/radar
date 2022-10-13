import 'package:client_mobile_app/presentations/home_page.dart';
import 'package:client_mobile_app/resources/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class App extends StatelessWidget {
  const App({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBuilder();
    // MultiRepositoryProvider(
    //   providers: [],
    //   child: MultiBlocProvider(
    //     providers: [],
    //     child:
    // ),
    // );
  }
}

class AppBuilder extends StatelessWidget {
  const AppBuilder({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // final config = AppConfig.of(context);
    return MaterialApp(
      // title: config != null ? config.appName : '',
      theme: theme,
      home: HomePage(),
    );
  }
}
