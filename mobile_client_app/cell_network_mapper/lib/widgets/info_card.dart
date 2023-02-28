import 'package:flutter/material.dart';

class InfoCard extends StatelessWidget {
  const InfoCard({
    Key? key,
    required this.name,
    required this.value,
    required this.moreInfo,
  }) : super(key: key);

  final String name;
  final String value;
  final String moreInfo;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(5),
      color: Colors.lightBlue,
      child: Row(
        children: [
          Text('$name: ', style: const TextStyle(color: Colors.white, fontSize: 18)),
          Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 18))),
          IconButton(
            icon: const Icon(
              Icons.info,
              color: Colors.white,
            ),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text(name, style: const TextStyle(color: Colors.blue)),
                  content: Text(moreInfo, style: const TextStyle(color: Colors.blue)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('OK'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
