import 'package:flutter/material.dart';

class PumpManagementCard extends StatelessWidget {
  final bool autoMode;
  final bool pumpRunning;
  final int? waterTemperature;
  final bool isConnected;
  final VoidCallback? onAutoModeChanged;
  final VoidCallback? onStartPump;
  final VoidCallback? onStopPump;

  const PumpManagementCard({
    super.key,
    required this.autoMode,
    required this.pumpRunning,
    required this.waterTemperature,
    required this.isConnected,
    required this.onAutoModeChanged,
    required this.onStartPump,
    required this.onStopPump,
  });

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
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête avec toggle mode auto
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF0EA5E9).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.settings,
                  color: Color(0xFF0EA5E9),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Gestion Pompe',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Mode Auto',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.grey,
                    ),
                  ),
                  Switch(
                    value: autoMode,
                    onChanged: isConnected ? (value) => onAutoModeChanged?.call() : null,
                    activeThumbColor: const Color(0xFF0EA5E9),
                    activeTrackColor: const Color(0xFF0EA5E9).withOpacity(0.3),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Boutons de contrôle - Amélioration de la disposition
          SizedBox(
            width: double.infinity,
            child: Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 48, // Hauteur fixe pour éviter l'écrasement
                    child: ElevatedButton.icon(
                      onPressed: (autoMode || pumpRunning || !isConnected) ? null : onStartPump,
                      icon: const Icon(Icons.play_arrow, size: 20),
                      label: const Text(
                        'Démarrer',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        disabledBackgroundColor: Colors.grey[600],
                        disabledForegroundColor: Colors.grey[400],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SizedBox(
                    height: 48, // Hauteur fixe pour éviter l'écrasement
                    child: ElevatedButton.icon(
                      onPressed: (autoMode || !pumpRunning || !isConnected) ? null : onStopPump,
                      icon: const Icon(Icons.stop, size: 20),
                      label: const Text(
                        'Arrêter',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        disabledBackgroundColor: Colors.grey[600],
                        disabledForegroundColor: Colors.grey[400],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Statut de la pompe
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: autoMode ? const Color(0xFF0EA5E9) : (pumpRunning ? const Color(0xFF10B981) : Colors.red),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  autoMode ? 'Pompe en mode auto' : (pumpRunning ? 'Pompe en marche' : 'Pompe arrêtée'),
                  style: TextStyle(
                    fontSize: 12,
                    color: autoMode ? const Color(0xFF0EA5E9) : (pumpRunning ? const Color(0xFF10B981) : Colors.red),
                  ),
                ),
              ),
              if (autoMode) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0EA5E9).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'AUTO',
                    style: TextStyle(
                      fontSize: 10,
                      color: Color(0xFF0EA5E9),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
          
          // Message de saison en mode auto
          if (autoMode && waterTemperature != null) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: waterTemperature! < 12 
                  ? const Color(0xFF0EA5E9).withOpacity(0.15)
                  : const Color(0xFFFFD700).withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: waterTemperature! < 12 
                    ? const Color(0xFF0EA5E9).withOpacity(0.3)
                    : const Color(0xFFFFD700).withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    waterTemperature! < 12 ? Icons.ac_unit : Icons.wb_sunny,
                    size: 16,
                    color: waterTemperature! < 12 
                      ? const Color(0xFF0EA5E9)
                      : const Color(0xFFFFD700),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      waterTemperature! < 12 
                        ? 'Mode Hiver - Protection antigel active'
                        : 'Mode Été - Bonne baignade !',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: waterTemperature! < 12 
                          ? const Color(0xFF0EA5E9)
                          : const Color(0xFFFFD700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
