import 'package:flutter/material.dart';

class TemperatureCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final int? temperature;
  final bool isLoading;
  final Animation<double> loadingAnimation;

  const TemperatureCard({
    super.key,
    required this.title,
    required this.icon,
    required this.temperature,
    required this.isLoading,
    required this.loadingAnimation,
  });

  @override
  Widget build(BuildContext context) {
    return Flexible(
      flex: 1,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF16213E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFF0EA5E9).withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0EA5E9).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    icon,
                    color: const Color(0xFF0EA5E9),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            AnimatedBuilder(
              animation: loadingAnimation,
              builder: (context, child) {
                if (isLoading) {
                  return Transform.scale(
                    scale: loadingAnimation.value,
                    child: const Text(
                      '--°C',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF0EA5E9),
                      ),
                    ),
                  );
                } else {
                  return Text(
                    '${temperature ?? '--'}°C',
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF0EA5E9),
                    ),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
