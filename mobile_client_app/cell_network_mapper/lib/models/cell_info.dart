class CellInfo {
  CellInfo({
    required this.cId,
    // required this.cellNumber,
    required this.systemSubType,
    required this.arfcn,
    required this.rsrp,
    required this.bandwidth,
    required this.uplinkFrequency,
    required this.downlinkFrequency,
    required this.frequencyBand,
  });

  final String cId;
  // final String cellNumber;
  final String systemSubType;
  final String arfcn;
  final String rsrp;
  final String bandwidth;
  final String uplinkFrequency;
  final String downlinkFrequency;
  final String frequencyBand;
}
