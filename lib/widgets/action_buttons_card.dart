import 'package:flutter/material.dart';

class ActionButtonsCard extends StatelessWidget {
  final bool isConnected;
  final VoidCallback? onRefresh;
  final VoidCallback? onDisconnect;

  const ActionButtonsCard({
    super.key,
    required this.isConnected,
    required this.onRefresh,
    required this.onDisconnect,
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
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF0EA5E9).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.settings,
                  color: Color(0xFF0EA5E9),
                  size: 18,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Actions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Boutons d'action
          Row(
            children: [
              // Bouton d'actualisation
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isConnected ? onRefresh : null,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Actualiser'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0EA5E9),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    disabledBackgroundColor: Colors.grey[600],
                    disabledForegroundColor: Colors.grey[400],
                  ),
                ),
              ),
              
              const SizedBox(width: 12),
              
              // Bouton de déconnexion
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onDisconnect,
                  icon: const Icon(Icons.logout),
                  label: const Text('Déconnexion'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
