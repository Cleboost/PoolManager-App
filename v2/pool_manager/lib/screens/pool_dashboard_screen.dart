import 'package:flutter/material.dart';
import '../models/pool.dart';
import '../services/pool_storage_service.dart';
import '../services/pool_websocket_service.dart';
import '../widgets/pool_header_card.dart';
import '../widgets/temperature_card.dart';
import '../widgets/pump_management_card.dart';
import '../widgets/time_slots_table.dart';
import '../widgets/action_buttons_card.dart';
import '../widgets/errors_card.dart';

class PoolDashboardScreen extends StatefulWidget {
  final Pool pool;
  
  const PoolDashboardScreen({
    super.key,
    required this.pool,
  });

  @override
  State<PoolDashboardScreen> createState() => _PoolDashboardScreenState();
}

class _PoolDashboardScreenState extends State<PoolDashboardScreen> 
    with TickerProviderStateMixin {
  final PoolStorageService _storageService = PoolStorageService();
  final PoolWebSocketService _webSocketService = PoolWebSocketService();
  
  bool _autoMode = false;
  bool _pumpRunning = false;
  
  // Variables pour les températures
  int? _waterTemperature;
  int? _airTemperature;
  bool _isLoadingWater = true;
  bool _isLoadingAir = true;
  bool _isWebSocketConnected = false;
  
  // Variables pour les plages horaires
  final List<int> _timeSlots = [2, 4, 6, 8, 10, 12]; // Valeurs par défaut
  bool _isLoadingTimeSlots = true;
  
  // Variables pour les erreurs
  Map<String, bool>? _errors;
  bool _isLoadingErrors = true;
  int? _errorByte;
  
  // Variables pour la reconnexion
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 3;
  static const Duration _reconnectDelay = Duration(seconds: 10);
  bool _isReconnecting = false;
  
  // Variables pour les erreurs
  bool _isError = false;
  String _errorMessage = '';
  
  // Contrôleurs d'animation
  late AnimationController _waterLoadingController;
  late AnimationController _airLoadingController;
  late AnimationController _connectionController;
  
  late Animation<double> _waterLoadingAnimation;
  late Animation<double> _airLoadingAnimation;
  late Animation<double> _connectionAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _connectToPool();
  }
  
  void _initializeAnimations() {
    // Animation pour le chargement de la température de l'eau
    _waterLoadingController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _waterLoadingAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _waterLoadingController,
      curve: Curves.easeInOut,
    ));
    
    // Animation pour le chargement de la température de l'air
    _airLoadingController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _airLoadingAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _airLoadingController,
      curve: Curves.easeInOut,
    ));
    
    // Animation pour l'indicateur de connexion
    _connectionController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _connectionAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _connectionController,
      curve: Curves.easeInOut,
    ));
  }
  
  void _connectToPool() async {
    // Démarrer les animations de chargement
    _waterLoadingController.repeat();
    _airLoadingController.repeat();
    
    // Se connecter au WebSocket
    bool connected = await _webSocketService.connect(widget.pool);
    
    if (connected) {
      setState(() {
        _isWebSocketConnected = true;
      });
      
      // Démarrer l'animation de connexion
      _connectionController.repeat();
      
      // Écouter les données du WebSocket
      _webSocketService.dataStream.listen((data) {
        _handleWebSocketData(data);
      });
      
      // Demander les températures initiales, le mode de la pompe et les plages horaires
      await _webSocketService.requestWaterTemperature();
      await _webSocketService.requestAirTemperature();
      await _webSocketService.requestPumpMode();
      
      // Demander les plages horaires
      for (int i = 0; i < 6; i++) {
        await _webSocketService.requestTimeSlot(i);
      }
      
      // Demander les erreurs
      await _webSocketService.requestErrors();
      
      // Arrêter les animations de chargement après un délai
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _isLoadingWater = false;
            _isLoadingAir = false;
          });
          _waterLoadingController.stop();
          _airLoadingController.stop();
        }
      });
    } else {
      // En cas d'échec de connexion, arrêter les animations
      _waterLoadingController.stop();
      _airLoadingController.stop();
      setState(() {
        _isLoadingWater = false;
        _isLoadingAir = false;
      });
    }
  }
  
  void _handleWebSocketData(Map<String, dynamic> data) {
    if (!mounted) return;
    
    setState(() {
      switch (data['type']) {
        case 'water_temperature':
          _waterTemperature = data['value'];
          _isLoadingWater = false;
          _waterLoadingController.stop();
          break;
        case 'air_temperature':
          _airTemperature = data['value'];
          _isLoadingAir = false;
          _airLoadingController.stop();
          break;
        case 'pump_mode':
          final mode = data['value'] as int;
          switch (mode) {
            case 0: // Arrêtée
              _autoMode = false;
              _pumpRunning = false;
              break;
            case 1: // Allumée
              _autoMode = false;
              _pumpRunning = true;
              break;
            case 2: // Auto
              _autoMode = true;
              _pumpRunning = false;
              break;
          }
          break;
        case 'error':
          _isWebSocketConnected = false;
          _handleDisconnection();
          break;
        case 'disconnected':
          _isWebSocketConnected = false;
          _handleDisconnection();
          break;
        case 'time_slot':
          final slotIndex = data['slot_index'] as int;
          final hours = data['hours'] as int;
          print('📊 [Dashboard] Mise à jour slot $slotIndex: ${hours}h');
          if (slotIndex >= 0 && slotIndex < _timeSlots.length) {
            _timeSlots[slotIndex] = hours;
            print('✅ [Dashboard] Slot $slotIndex mis à jour: ${_timeSlots[slotIndex]}h');
          }
          if (slotIndex == 5) { // Dernier slot reçu
            _isLoadingTimeSlots = false;
            print('🎯 [Dashboard] Tous les slots reçus, tableau complet: $_timeSlots');
          }
          break;
        case 'errors':
          _errors = data['errors'] as Map<String, bool>;
          _errorByte = data['error_byte'] as int;
          _isLoadingErrors = false;
          print('⚠️ [Dashboard] Erreurs reçues: $_errors (octet: $_errorByte)');
          break;
      }
    });
  }
  
  // Gérer la déconnexion et tenter la reconnexion
  void _handleDisconnection() {
    if (_isReconnecting) return; // Éviter les tentatives multiples
    
    _isReconnecting = true;
    _reconnectAttempts++;
    
    print('🔌 [Dashboard] Déconnexion détectée - Tentative $_reconnectAttempts/$_maxReconnectAttempts');
    
    if (_reconnectAttempts <= _maxReconnectAttempts) {
      // Tenter la reconnexion après un délai
      Future.delayed(_reconnectDelay, () async {
        if (mounted) {
          print('🔄 [Dashboard] Tentative de reconnexion $_reconnectAttempts/$_maxReconnectAttempts');
          bool reconnected = await _webSocketService.connect(widget.pool);
          
          if (reconnected) {
            print('✅ [Dashboard] Reconnexion réussie !');
            setState(() {
              _isWebSocketConnected = true;
              _isReconnecting = false;
              _reconnectAttempts = 0;
            });
            
            // Redémarrer l'animation de connexion
            _connectionController.repeat();
            
            // Redemander les données
            await _webSocketService.requestWaterTemperature();
            await _webSocketService.requestAirTemperature();
            await _webSocketService.requestPumpMode();
          } else {
            print('❌ [Dashboard] Échec de la reconnexion $_reconnectAttempts/$_maxReconnectAttempts');
            setState(() {
              _isReconnecting = false;
            });
            
            if (_reconnectAttempts >= _maxReconnectAttempts) {
              _showConnectionErrorDialog();
            } else {
              _handleDisconnection(); // Continuer les tentatives
            }
          }
        }
      });
    } else {
      _showConnectionErrorDialog();
    }
  }
  
  // Afficher le dialogue d'erreur de connexion
  void _showConnectionErrorDialog() {
    if (!mounted) return;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF16213E),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.error_outline,
                  color: Colors.red,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Erreur de connexion',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: const Text(
            'La piscine ne peut pas être contactée.\n\n'
            'Vérifiez que :\n'
            '• Votre téléphone est connecté au même réseau WiFi\n'
            '• La piscine est allumée et fonctionnelle\n'
            '• L\'adresse IP est correcte',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Retourner à l'écran de recherche
                Navigator.of(context).pop();
              },
              child: const Text(
                'Retour à la recherche',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                // Réinitialiser et retenter la connexion
                setState(() {
                  _reconnectAttempts = 0;
                  _isReconnecting = false;
                });
                _connectToPool();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0EA5E9),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Réessayer'),
            ),
          ],
        );
      },
    );
  }
  
  // Forcer l'actualisation des températures et du mode de la pompe
  void _refreshTemperatures() async {
    if (!_isWebSocketConnected) return;
    
    setState(() {
      _isLoadingWater = true;
      _isLoadingAir = true;
      _isLoadingTimeSlots = true;
      _isLoadingErrors = true;
    });
    
    // Redémarrer les animations de chargement
    _waterLoadingController.repeat();
    _airLoadingController.repeat();
    
    // Demander les nouvelles températures et le mode de la pompe
    await _webSocketService.requestWaterTemperature();
    await _webSocketService.requestAirTemperature();
    await _webSocketService.requestPumpMode();
    
    // Redemander les plages horaires
    for (int i = 0; i < 6; i++) {
      await _webSocketService.requestTimeSlot(i);
    }
    
    // Redemander les erreurs système
    await _webSocketService.requestErrors();
    
    print('🔄 [Dashboard] Actualisation complète demandée (températures, mode pompe, plages horaires, erreurs système)');
  }
  
  // Gestionnaires pour les contrôles de la pompe
  void _handleAutoModeChanged() async {
    if (_isWebSocketConnected) {
      if (!_autoMode) {
        await _webSocketService.setPumpAuto();
      } else {
        await _webSocketService.turnPumpOff();
      }
    }
  }
  
  void _handleStartPump() async {
    if (_isWebSocketConnected) {
      await _webSocketService.turnPumpOn();
    }
  }
  
  void _handleStopPump() async {
    if (_isWebSocketConnected) {
      await _webSocketService.turnPumpOff();
    }
  }
  
  // Gestionnaires pour les plages horaires
  void _handleDecreaseHours(int slotIndex) {
    if (_isWebSocketConnected) {
      _webSocketService.subtractTimeSlotHours(slotIndex);
      print('🔽 [Dashboard] Diminuer heures pour slot $slotIndex');
    }
  }
  
  void _handleIncreaseHours(int slotIndex) {
    if (_isWebSocketConnected) {
      _webSocketService.addTimeSlotHours(slotIndex);
      print('🔼 [Dashboard] Augmenter heures pour slot $slotIndex');
    }
  }
  
  // Gestionnaire de déconnexion
  void _handleDisconnect() async {
    await _storageService.clearSelectedPool();
    if (mounted) {
      Navigator.of(context).pop();
    }
  }
  
  @override
  void dispose() {
    _waterLoadingController.dispose();
    _airLoadingController.dispose();
    _connectionController.dispose();
    _webSocketService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A1A2E),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Dashboard Piscine',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.logout,
              color: Colors.white,
            ),
            onPressed: _handleDisconnect,
            tooltip: 'Se déconnecter',
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // En-tête avec informations de la piscine
              PoolHeaderCard(
                pool: widget.pool,
                isConnected: _isWebSocketConnected,
                connectionAnimation: _connectionAnimation,
              ),
              
              const SizedBox(height: 30),
              
              // Cartes de température
              Row(
                children: [
                  TemperatureCard(
                    title: 'Temp. Eau',
                    icon: Icons.water_drop,
                    temperature: _waterTemperature,
                    isLoading: _isLoadingWater,
                    loadingAnimation: _waterLoadingAnimation,
                  ),
                  const SizedBox(width: 12),
                  TemperatureCard(
                    title: 'Temp. Air',
                    icon: Icons.air,
                    temperature: _airTemperature,
                    isLoading: _isLoadingAir,
                    loadingAnimation: _airLoadingAnimation,
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Module de gestion de la pompe
              PumpManagementCard(
                autoMode: _autoMode,
                pumpRunning: _pumpRunning,
                waterTemperature: _waterTemperature,
                isConnected: _isWebSocketConnected,
                onAutoModeChanged: _handleAutoModeChanged,
                onStartPump: _handleStartPump,
                onStopPump: _handleStopPump,
              ),
              
              const SizedBox(height: 20),
              
              // Tableau des plages horaires pour le mode auto
              TimeSlotsTable(
                timeSlots: _timeSlots,
                isLoading: _isLoadingTimeSlots,
                onDecreaseHours: _handleDecreaseHours,
                onIncreaseHours: _handleIncreaseHours,
              ),
              
              const SizedBox(height: 20),
              
              // Carte des erreurs système
              ErrorsCard(
                errors: _errors,
                isLoading: _isLoadingErrors,
                errorByte: _errorByte,
              ),
              
              const SizedBox(height: 40),
              
              // Section des boutons d'action
              ActionButtonsCard(
                isConnected: _isWebSocketConnected,
                onRefresh: _refreshTemperatures,
                onDisconnect: _handleDisconnect,
              ),
              
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
