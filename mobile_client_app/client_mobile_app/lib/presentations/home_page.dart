import 'package:client_mobile_app/presentations/map/map_web_view_page.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:animations/animations.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/presentations/home_page_body.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomePage extends StatelessWidget {
  const HomePage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NavigationCubit, NavigationState>(
      builder: (context, state) {
        return Scaffold(
          backgroundColor: Theme.of(context).backgroundColor,
          appBar: AppBar(
            backgroundColor: Theme.of(context).backgroundColor,
            title: Image.asset(Images.logoDark, fit: BoxFit.contain),
          ),
          bottomNavigationBar: BottomNavigationBar(
            items: [
              BottomNavigationBarItem(
                icon: Image.asset(Images.speedTest),
                activeIcon: Image.asset(Images.speedTestSelected),
                label: Strings.speedTestLabel,
              ),
              BottomNavigationBarItem(
                icon: Image.asset(Images.yourResults),
                activeIcon: Image.asset(Images.yourResultsSelected),
                label: Strings.yourResultsLabel,
              ),
              BottomNavigationBarItem(
                icon: Image.asset(Images.map),
                activeIcon: Image.asset(Images.mapSelected),
                label: Strings.mapLabel,
              ),
            ],
            type: BottomNavigationBarType.fixed,
            currentIndex: state.currentIndex,
            onTap: (index) => context.read<NavigationCubit>().changeTab(index),
          ),
          body: PageTransitionSwitcher(
            duration: const Duration(milliseconds: 3000),
            reverse: true,
            transitionBuilder: (child, animation, secondaryAnimation) {
              return FadeThroughTransition(
                animation: animation,
                secondaryAnimation: secondaryAnimation,
                child: child,
              );
            },
            child: HomePageBody(pageIdx: state.currentIndex),
          ),
        );
      },
    );
  }
}
