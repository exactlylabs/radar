import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:client_mobile_app/resources/theme.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/presentations/home_page.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/core/services/results_service/implementation/results_service.dart';
import 'package:client_mobile_app/core/services/warnings_service/implementation/warnings_service.dart';
import 'package:client_mobile_app/core/services/locations_service/implementation/locations_service.dart';
import 'package:client_mobile_app/core/services/device_info_service/implementation/device_info_service.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';

class App extends StatelessWidget {
  const App({
    Key? key,
    required this.restClient,
    required this.localStorage,
    required this.httpProvider,
    required this.networkConnectionInfo,
    required this.configurationMonitoring,
  }) : super(key: key);

  final RestClient restClient;
  final LocalStorage localStorage;
  final IHttpProvider httpProvider;
  final NetworkConnectionInfo networkConnectionInfo;
  final ConfigurationMonitoring configurationMonitoring;

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
        RepositoryProvider<IWarningsService>(
          create: (_) => WarningService(
            configurationMonitoring: configurationMonitoring,
          ),
        ),
        RepositoryProvider<DeviceInfoService>(
          create: (_) => DeviceInfoService(
            localStorage: localStorage,
          ),
        ),
        RepositoryProvider<Connectivity>(
          create: (_) => Connectivity(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => NavigationCubit(),
          ),
          BlocProvider<BackgroundFetchBloc>(
            lazy: false,
            create: (context) => BackgroundFetchBloc(
              localStorage: localStorage,
              networkConnectionInfo: networkConnectionInfo,
              configurationMonitoring: configurationMonitoring,
            ),
          ),
          BlocProvider<SpeedTestCubit>(
            lazy: false,
            create: (context) => SpeedTestCubit(
              deviceInfoService: context.read<DeviceInfoService>(),
              resultsService: context.read<IResultsService>(),
              connectivity: context.read<Connectivity>(),
              localStorage: localStorage,
            ),
          ),
          BlocProvider(
            create: (context) => TakeSpeedTestStepCubit(
              networkConnectionInfo: networkConnectionInfo,
            ),
          ),
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
