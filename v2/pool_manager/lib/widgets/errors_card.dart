import 'package:flutter/material.dart';

class ErrorsCard extends StatelessWidget {
  final Map<String, bool>? errors;
  final bool isLoading;
  final int? errorByte;

  const ErrorsCard({
    super.key,
    required this.errors,
    required this.isLoading,
    this.errorByte,
  });

  @override
  Widget build(BuildContext context) {
    final hasErrors = errors != null && errors!.values.any((error) => error);
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16213E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasErrors 
            ? Colors.red.withOpacity(0.5)
            : const Color(0xFF0EA5E9).withOpacity(0.3),
          width: 1,
        ),
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
                  color: hasErrors 
                    ? Colors.red.withOpacity(0.2)
                    : const Color(0xFF0EA5E9).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  hasErrors ? Icons.error_outline : Icons.check_circle_outline,
                  color: hasErrors ? Colors.red : const Color(0xFF0EA5E9),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'État du Système',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              if (errorByte != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '0x${errorByte!.toRadixString(16).toUpperCase().padLeft(2, '0')}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Contenu
          if (isLoading) ...[
            const Center(
              child: Column(
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0EA5E9)),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Vérification du système...',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ] else if (errors != null) ...[
            if (hasErrors) ...[
              // Liste des erreurs
              ...errors!.entries.where((entry) => entry.value).map((entry) => 
                _buildErrorItem(entry.key)
              ),
            ] else ...[
              // Aucune erreur
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: const Color(0xFF10B981).withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: Color(0xFF10B981),
                      size: 16,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Aucune erreur détectée - Système opérationnel',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF10B981),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
  
  Widget _buildErrorItem(String errorKey) {
    final errorInfo = _getErrorInfo(errorKey);
    
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.red.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            errorInfo['icon'] as IconData,
            color: Colors.red,
            size: 16,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              errorInfo['message'] as String,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Map<String, dynamic> _getErrorInfo(String errorKey) {
    switch (errorKey) {
      case 'clock_sync':
        return {
          'icon': Icons.access_time,
          'message': 'Horloge atomique non synchronisée',
        };
      case 'water_sensor':
        return {
          'icon': Icons.water_drop,
          'message': 'Erreur capteur de température eau',
        };
      case 'air_sensor':
        return {
          'icon': Icons.air,
          'message': 'Erreur capteur de température air',
        };
      case 'water_transmission':
        return {
          'icon': Icons.wifi_off,
          'message': 'Erreur de transmission capteur eau',
        };
      case 'air_transmission':
        return {
          'icon': Icons.wifi_off,
          'message': 'Erreur de transmission capteur air',
        };
      case 'water_battery':
        return {
          'icon': Icons.battery_alert,
          'message': 'Batterie faible capteur eau',
        };
      case 'air_battery':
        return {
          'icon': Icons.battery_alert,
          'message': 'Batterie faible capteur air',
        };
      default:
        return {
          'icon': Icons.error,
          'message': 'Erreur inconnue',
        };
    }
  }
}
