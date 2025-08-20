import 'package:flutter/material.dart';

class TimeSlotsTable extends StatelessWidget {
  final List<int> timeSlots;
  final bool isLoading;
  final Function(int)? onDecreaseHours;
  final Function(int)? onIncreaseHours;

  const TimeSlotsTable({
    super.key,
    required this.timeSlots,
    required this.isLoading,
    this.onDecreaseHours,
    this.onIncreaseHours,
  });

  Widget _buildTimeSlotCard(String temperatureRange, int hours, int slotIndex, Color temperatureColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A2E),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: temperatureColor.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          // Indicateur de température
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: temperatureColor,
              shape: BoxShape.circle,
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Plage de température
          Expanded(
            flex: 2,
            child: Text(
              temperatureRange,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: temperatureColor,
              ),
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Affichage des heures
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  temperatureColor.withOpacity(0.3),
                  temperatureColor.withOpacity(0.1),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: temperatureColor.withOpacity(0.4),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.access_time,
                  size: 12,
                  color: temperatureColor,
                ),
                const SizedBox(width: 4),
                Text(
                  '$hours h',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: temperatureColor,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Bouton moins
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: temperatureColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: temperatureColor.withOpacity(0.4),
                width: 1,
              ),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onDecreaseHours != null ? () => onDecreaseHours!(slotIndex) : null,
                borderRadius: BorderRadius.circular(6),
                child: Icon(
                  Icons.remove,
                  size: 14,
                  color: temperatureColor,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 8),
          
          // Bouton plus
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: temperatureColor.withOpacity(0.2),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: temperatureColor.withOpacity(0.4),
                width: 1,
              ),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onIncreaseHours != null ? () => onIncreaseHours!(slotIndex) : null,
                borderRadius: BorderRadius.circular(6),
                child: Icon(
                  Icons.add,
                  size: 14,
                  color: temperatureColor,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getTemperatureColor(int slotIndex) {
    switch (slotIndex) {
      case 0: // 13° - 16°
        return const Color(0xFF0EA5E9); // Bleu froid
      case 1: // 17° - 20°
        return const Color(0xFF10B981); // Vert frais
      case 2: // 21° - 24°
        return const Color(0xFFF59E0B); // Orange doux
      case 3: // 25° - 28°
        return const Color(0xFFF97316); // Orange chaud
      case 4: // 29° - 32°
        return const Color(0xFFEF4444); // Rouge chaud
      case 5: // > 32°
        return const Color(0xFFDC2626); // Rouge très chaud
      default:
        return const Color(0xFF0EA5E9);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16213E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF0EA5E9).withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF0EA5E9).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.schedule,
                  color: Color(0xFF0EA5E9),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Plages horaires',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Configuration du mode automatique',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Contenu
          if (isLoading) ...[
            // Affichage de chargement
            Container(
              padding: const EdgeInsets.all(40),
              child: const Center(
                child: Column(
                  children: [
                    SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Color(0xFF0EA5E9),
                        strokeWidth: 2,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'Chargement des plages horaires...',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // Affichage des plages
            _buildTimeSlotCard('13° - 16°', timeSlots[0], 0, _getTemperatureColor(0)),
            _buildTimeSlotCard('17° - 20°', timeSlots[1], 1, _getTemperatureColor(1)),
            _buildTimeSlotCard('21° - 24°', timeSlots[2], 2, _getTemperatureColor(2)),
            _buildTimeSlotCard('25° - 28°', timeSlots[3], 3, _getTemperatureColor(3)),
            _buildTimeSlotCard('29° - 32°', timeSlots[4], 4, _getTemperatureColor(4)),
            _buildTimeSlotCard('> 32°', timeSlots[5], 5, _getTemperatureColor(5)),
          ],
        ],
      ),
    );
  }
}
