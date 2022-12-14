import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/result_card.dart';
import 'package:client_mobile_app/presentations/your_results/widgets/test_result_info_modal.dart';

class ResultsList extends StatefulWidget {
  const ResultsList({
    Key? key,
    required this.results,
  }) : super(key: key);

  final List<TestResult> results;

  @override
  State<ResultsList> createState() => _ResultsListState();
}

class _ResultsListState extends State<ResultsList> {
  final ScrollController _controller = ScrollController();
  double _topStop = 0.0;
  double _bottomStop = 1.0;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      if (_controller.position.atEdge) {
        bool isTop = _controller.position.pixels == 0;
        if (isTop) {
          setState(() => _topStop = 0.0);
        } else {
          setState(() => _bottomStop = 1.0);
        }
      } else {
        setState(() {
          _topStop = 0.1;
          _bottomStop = 0.9;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (Rect rect) {
        return LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: const [
            AppColors.paleLilac,
            Colors.transparent,
            Colors.transparent,
            AppColors.paleLilac,
          ],
          stops: [0.0, _topStop, _bottomStop, 1.0],
        ).createShader(rect);
      },
      blendMode: BlendMode.dstOut,
      child: ListView.builder(
        controller: _controller,
        itemCount: widget.results.length,
        shrinkWrap: true,
        itemBuilder: (BuildContext context, int index) {
          return ResultCard(
            networkType: _getNetworkType(widget.results[index].networkType),
            date: _dateFromDateTime(widget.results[index].dateTime),
            time: _timeFromDateTime(widget.results[index].dateTime),
            download: widget.results[index].download.toStringAsFixed(2),
            upload: widget.results[index].upload.toStringAsFixed(2),
            onTap: () => _infoModal(context, widget.results[index]),
            color: index % 2 == 0
                ? Theme.of(context).colorScheme.primary.withOpacity(0.05)
                : Theme.of(context).backgroundColor,
          );
        },
      ),
    );
  }

  String _dateFromDateTime(DateTime dateTime) {
    return DateFormat('yyyy/MM/dd').format(dateTime);
  }

  String _timeFromDateTime(DateTime dateTime) {
    return DateFormat('hh:mm a').format(dateTime).toLowerCase();
  }

  Future<void> _infoModal(BuildContext context, TestResult result) {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      TestResultInfoModal(
        date: _dateFromDateTime(result.dateTime),
        time: _timeFromDateTime(result.dateTime),
        address: result.address,
        networkPlace: result.networkLocation,
        networkType: result.networkType,
        networkQuality: result.networkQuality,
        downloadSpeed: result.download,
        uploadSpeed: result.upload,
        latency: result.latency,
        loss: result.loss,
      ),
    );
  }

  _getNetworkType(String networkType) {
    switch (networkType) {
      case Strings.wifiConnectionType:
        return Images.connectionWifi;
      case Strings.cellularConnectionType:
        return Images.connectionCellular;
      default:
        return Images.connectionWired;
    }
  }
}
