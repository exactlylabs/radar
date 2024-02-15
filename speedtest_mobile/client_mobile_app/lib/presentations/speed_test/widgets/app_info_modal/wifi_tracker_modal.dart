import 'package:client_mobile_app/core/wifi_tracking/bloc/wifi_tracker_cubit.dart';
import 'package:client_mobile_app/core/wifi_tracking/bloc/wifi_tracker_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/time_interval_input_field.dart';

class WifiTrackerModal extends StatelessWidget {
  const WifiTrackerModal({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<WifiTrackerCubit, WifiTrackerState>(
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom, left: 10, right: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Enable Wifi Tracker',
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 20.0,
                  fontWeight: 800,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 15),
              if (!state.isEnabled) ...[
                Text(
                  'Set the frequency of the wifi tracker',
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 200,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
                const SizedBox(height: 45),
                TimeIntervalInputField(
                  unit: 'secs',
                  frequency: state.frequency,
                  onChanged: (freq) =>
                      context.read<WifiTrackerCubit>().setFrequency(int.tryParse(freq) ?? -1),
                ),
                const SizedBox(height: 104),
                PrimaryButton(
                  onPressed: () => context.read<WifiTrackerCubit>().enableWifiTracker(),
                  child: Text(
                    'Enable',
                    style: AppTextStyle(
                      fontSize: 16.0,
                      fontWeight: 700,
                      color: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
                )
              ] else ...[
                const SizedBox(height: 45),
                Text(
                  'Wifi Tracker is enabled, running every ${state.frequency} seconds.',
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 200,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
                const SizedBox(height: 45),
                PrimaryButton(
                  onPressed: () => context.read<WifiTrackerCubit>().disableWifiTracker(),
                  child: Text(
                    'Disable',
                    style: AppTextStyle(
                      fontSize: 16.0,
                      fontWeight: 700,
                      color: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 45),
              ],
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }
}
