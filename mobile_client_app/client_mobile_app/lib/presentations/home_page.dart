import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:animations/animations.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';

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
                label: 'Speed Test',
              ),
              BottomNavigationBarItem(
                icon: Image.asset(Images.yourResults),
                activeIcon: Image.asset(Images.yourResultsSelected),
                label: 'Your Results',
              ),
              BottomNavigationBarItem(
                icon: Image.asset(Images.map),
                activeIcon: Image.asset(Images.mapSelected),
                label: 'Map',
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
            child: state.currentIndex == 0
                ? Center(child: Text('Speed Test'))
                : state.currentIndex == 1
                    ? Container(
                        // color: Colors.blue,
                        child: const Center(
                          child: Text('Your Results'),
                        ),
                      )
                    : Container(
                        // color: Colors.red,
                        child: const Center(
                          child: Text('Map'),
                        ),
                      ),
          ),
        );
      },
    );
  }
}
