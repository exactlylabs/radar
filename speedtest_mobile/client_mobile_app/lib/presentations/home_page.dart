import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/presentations/home_page_body.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';

class HomePage extends StatelessWidget {
  const HomePage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NavigationCubit, NavigationState>(
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Theme.of(context).colorScheme.background,
          bottomNavigationBar: SizedBox(
            child: BottomNavigationBar(
              items: [
                BottomNavigationBarItem(
                  icon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.speedTest),
                  ),
                  activeIcon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.speedTestSelected),
                  ),
                  label: Strings.speedTestLabel,
                ),
                BottomNavigationBarItem(
                  icon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.yourResults),
                  ),
                  activeIcon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.yourResultsSelected),
                  ),
                  label: Strings.yourResultsLabel,
                ),
                BottomNavigationBarItem(
                  icon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.map),
                  ),
                  activeIcon: Container(
                    margin: const EdgeInsets.only(bottom: 5.0),
                    child: Image.asset(Images.mapSelected),
                  ),
                  label: Strings.mapLabel,
                ),
              ],
              type: BottomNavigationBarType.fixed,
              currentIndex: state.currentIndex,
              onTap: (index) {
                if (index != NavigationCubit.MAP_INDEX || state.canNavigate) {
                  context.read<NavigationCubit>().changeTab(index);
                } else {
                  openNoInternetConnectionModal(context, () => context.read<NavigationCubit>().changeTab(index));
                }
              },
            ),
          ),
          body: HomePageBody(
            pageIdx: state.currentIndex,
            args: state.args,
          ),
        );
      },
    );
  }
}
