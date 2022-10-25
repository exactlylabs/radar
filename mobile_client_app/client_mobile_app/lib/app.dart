import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/theme.dart';
import 'package:client_mobile_app/presentations/home_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class App extends StatelessWidget {
  const App({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => NavigationCubit()),
      ],
      child: const AppBuilder(),
    );
  }
}

class AppBuilder extends StatelessWidget {
  const AppBuilder({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final config = AppConfig.of(context);
    return MaterialApp(
      title: config != null ? config.appName : 'Radar',
      theme: theme,
      home: const HomePage(),
    );
  }
}
