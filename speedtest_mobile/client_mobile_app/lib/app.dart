import 'package:flutter/material.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/core/services/results_service/implementation/results_service.dart';
import 'package:client_mobile_app/core/services/locations_service/implementation/locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';

class App extends StatelessWidget {
  const App({
    Key? key,
    required this.restClient,
    required this.localStorage,
    required this.httpProvider,
    required this.ndt7client,
    required this.networkConnectionInfo,
  }) : super(key: key);

  final RestClient restClient;
  final LocalStorage localStorage;
  final IHttpProvider httpProvider;
  final Ndt7Client ndt7client;
  final NetworkConnectionInfo networkConnectionInfo;

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
          BlocProvider(
            create: (context) => NavigationCubit(),
          ),
          BlocProvider<BackgroundFetchBloc>(
            lazy: false,
            create: (context) => BackgroundFetchBloc(localStorage: localStorage),
          ),
          BlocProvider<SpeedTestCubit>(
            lazy: false,
            create: (context) => SpeedTestCubit(
              resultsService: context.read<IResultsService>(),
              localStorage: localStorage,
            ),
          ),
          BlocProvider(
            create: (context) => TakeSpeedTestStepCubit(
              ndt7client: ndt7client,
              networkConnectionInfo: networkConnectionInfo,
            ),
          ),
          BlocProvider(create: (context) => AppInfoModalCubit())
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
