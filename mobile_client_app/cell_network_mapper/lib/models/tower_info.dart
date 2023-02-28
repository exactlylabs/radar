class TowerInfo {
  TowerInfo({
    required this.mcc,
    required this.mnc,
    required this.lac,
    required this.type,
    required this.bands,
  });

  final String mcc;
  final String mnc;
  final String lac;
  final String type;
  final List<int> bands;
}
