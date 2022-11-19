import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/core/services/locations_service/implementation/locations_service.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/core/services/results_service/implementation/results_service.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/theme.dart';
import 'package:client_mobile_app/presentations/home_page.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class App extends StatelessWidget {
  const App({
    Key? key,
    required this.restClient,
    required this.localStorage,
    required this.httpProvider,
  }) : super(key: key);

  final RestClient restClient;
  final LocalStorage localStorage;
  final IHttpProvider httpProvider;

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<IResultsService>(
          create: (_) => ResultsService(
            restClient: restClient,
            localStorage: localStorage,
            httpProvider: httpProvider,
          ),
        ),
        RepositoryProvider<ILocationsService>(
          create: (_) => LocationsService(
            restClient: restClient,
            httpProvider: httpProvider,
          ),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => NavigationCubit()),
        ],
        child: const AppBuilder(),
      ),
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
