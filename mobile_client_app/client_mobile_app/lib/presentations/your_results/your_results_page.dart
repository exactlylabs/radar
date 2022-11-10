import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/result_card.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/results_header.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class YourResultsPage extends StatelessWidget {
  const YourResultsPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Container(
      color: Theme.of(context).colorScheme.background,
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SpacerWithMax(size: height * 0.025, maxSize: 20.0),
          Text(
            'All your results',
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 22.0,
              fontWeight: 800,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          SpacerWithMax(size: height * 0.031, maxSize: 25.0),
          const ResultsHeader(),
          Expanded(
            child: ShaderMask(
              shaderCallback: (Rect rect) {
                return const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [AppColors.paleLilac, Colors.transparent, Colors.transparent, AppColors.paleLilac],
                  stops: [0.0, 0.1, 0.9, 1.0], // 10% purple, 80% transparent, 10% purple
                ).createShader(rect);
              },
              blendMode: BlendMode.dstOut,
              child: ListView.builder(
                itemCount: 30,
                shrinkWrap: true,
                itemBuilder: (BuildContext context, int index) {
                  return ResultCard(
                    networkType: Images.connectionCellular,
                    date: '03/02/2022',
                    time: '1:12 pm',
                    download: '20.90',
                    upload: '22.30',
                    onTap: () => null,
                    color: index % 2 == 0
                        ? Theme.of(context).colorScheme.primary.withOpacity(0.05)
                        : Theme.of(context).backgroundColor,
                  );
                },
              ),
            ),
          ),
          PrimaryButton(
            child: Text(
              'Explore the map',
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
              ),
            ),
            onPressed: () => null,
          ),
          SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        ],
      ),
    );
  }
}
