import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/results_list.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/results_header.dart';
import 'package:client_mobile_app/presentations/your_results/bloc/your_results_cubit.dart';
import 'package:client_mobile_app/presentations/your_results/bloc/your_results_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';

class YourResultsPage extends StatelessWidget {
  const YourResultsPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return BlocProvider<YourResultsCubit>(
      create: (_) => YourResultsCubit(resultsService: context.read<IResultsService>()),
      child: BlocBuilder<YourResultsCubit, YourResultsState>(
        builder: (context, state) {
          return Container(
            color: Theme.of(context).colorScheme.background,
            padding: const EdgeInsets.symmetric(horizontal: 15.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SpacerWithMax(size: height * 0.074, maxSize: 60.0),
                Padding(
                  padding: const EdgeInsets.only(left: 3.0),
                  child: Text(
                    Strings.allResultsLabel,
                    textAlign: TextAlign.center,
                    style: AppTextStyle(
                      fontSize: 22.0,
                      fontWeight: 800,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ),
                SpacerWithMax(size: height * 0.025, maxSize: 20.0),
                const ResultsHeader(),
                Expanded(child: ResultsList(results: state.results ?? [])),
                BlocBuilder<NavigationCubit, NavigationState>(
                  builder: (context, state) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 5.0),
                    child: PrimaryButton(
                      onPressed: onExploreTheMapPressed(context, state.canNavigate),
                      child: Text(
                        Strings.exploreTheMapButtonLabel,
                        style: AppTextStyle(
                          fontSize: 16.0,
                          fontWeight: 700,
                        ),
                      ),
                    ),
                  ),
                ),
                SpacerWithMax(size: height * 0.037, maxSize: 25.0),
              ],
            ),
          );
        },
      ),
    );
  }

  VoidCallback onExploreTheMapPressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<NavigationCubit>().changeTab(NavigationCubit.MAP_INDEX);

    return canNavigate
        ? onCanNavigate
        : () => openNoInternetConnectionModal(context, onCanNavigate);
  }
}
