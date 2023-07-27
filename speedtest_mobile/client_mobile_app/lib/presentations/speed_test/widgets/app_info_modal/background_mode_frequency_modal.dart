import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/time_interval_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_state.dart';

class BackgroundModeFrequencyModal extends StatefulWidget {
  const BackgroundModeFrequencyModal({
    Key? key,
    this.frequency,
    required this.onCancel,
  }) : super(key: key);

  final int? frequency;
  final VoidCallback onCancel;

  @override
  State<BackgroundModeFrequencyModal> createState() => _BackgroundModeFrequencyModalState();
}

class _BackgroundModeFrequencyModalState extends State<BackgroundModeFrequencyModal> {
  String? warning;
  late int frequency;

  @override
  void initState() {
    super.initState();
    frequency = widget.frequency ?? 10;
  }

  void _onFrequencyUpdated(String value) {
    setState(() => frequency = int.tryParse(value) ?? -1);
  }

  bool _onFrequencyConfirmed() {
    final isAndroid = Platform.isAndroid;
    final isValid = _validateFrequency(frequency, isAndroid);
    final warningMsg = isValid
        ? null
        : (isAndroid ? Strings.androidMinimumDelayError : Strings.iOSMinimumDelayError);
    setState(() {
      warning = warningMsg;
      frequency = frequency;
    });
    return isValid;
  }

  bool _validateFrequency(int frequency, bool isAndroid) {
    return Platform.isAndroid ? (frequency > 0) : (frequency >= 15);
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<BackgroundModeCubit, BackgroundModeState>(
      builder: (context, state) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                Strings.enableWardriveModalTitle,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 20.0,
                  fontWeight: 800,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(height: 15),
              Text(
                Strings.enableWardriveModalSubtitle,
                textAlign: TextAlign.center,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 200,
                  color: Theme.of(context).colorScheme.tertiary,
                ),
              ),
              const SizedBox(height: 45),
              TimeIntervalInputField(
                frequency: state.frequency,
                onChanged: _onFrequencyUpdated,
                onBlur: _onFrequencyConfirmed,
              ),
              if (warning != null) ...[
                const SizedBox(height: 20),
                ErrorMessage(message: warning!),
                const SizedBox(height: 20),
              ] else
                const SizedBox(height: 104),
              PrimaryButton(
                onPressed: () {
                  bool isValid = _onFrequencyConfirmed();
                  if (isValid) {
                    context.read<BackgroundFetchBloc>().setDelay(frequency);
                    context.read<BackgroundFetchBloc>().enableBackgroundSpeedTest();
                    Navigator.of(context).pop();
                  }
                },
                child: Text(
                  Strings.enableWardriveModalButtonLabel,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 700,
                    color: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              PrimaryButton(
                color: Theme.of(context).colorScheme.onPrimary,
                shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                onPressed: () {
                  Navigator.of(context).pop();
                  widget.onCancel();
                },
                child: Text(
                  Strings.cancelButttonLabel,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 700,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}

Future<void> askForBackgroundModeFrequency(
    BuildContext context, int? frequency, VoidCallback onCancel) {
  return showModalBottomSheet(
    context: context,
    enableDrag: true,
    isScrollControlled: true,
    backgroundColor: Theme.of(context).colorScheme.background,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.only(
        topLeft: Radius.circular(16.0),
        topRight: Radius.circular(16.0),
      ),
    ),
    builder: (_) => BlocProvider.value(
      value: context.read<BackgroundModeCubit>(),
      child: ModalWithTitle(
        title: Strings.emptyString,
        body: BackgroundModeFrequencyModal(
          frequency: frequency,
          onCancel: onCancel,
        ),
        onPop: onCancel,
      ),
    ),
  ).whenComplete(onCancel);
}
