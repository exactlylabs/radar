import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/enable_wardriving_mode.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class WardrivingModal extends StatelessWidget {
  const WardrivingModal({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AppInfoModalCubit, AppInfoModalState>(
      builder: (context, state) => EnableWardrivingMode(
        onCancel: () {
          context.read<AppInfoModalCubit>().cancel();
          Navigator.of(context).pop();
        },
        onChanged: (delay) {
          context.read<AppInfoModalCubit>().updateDelay(delay);
          context.read<BackgroundFetchBloc>().setDelay(int.tryParse(delay) ?? -1);
        },
        onEnabled: () {
          context.read<BackgroundFetchBloc>().enableBackgroundSpeedTest();
          Navigator.of(context).pop();
        },
        delay: state.delay,
        warning: state.warning,
      ),
    );
  }
}
