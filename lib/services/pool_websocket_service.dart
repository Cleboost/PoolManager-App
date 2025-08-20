import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/pool.dart';

class PoolWebSocketService {
  WebSocketChannel? _channel;
  StreamController<Map<String, dynamic>>? _dataController;
  
  bool _isConnected = false;
  Timer? _reconnectTimer;
  Timer? _heartbeatTimer;
  bool _isDisposed = false;
  
  // Queue pour gérer les envois de commandes
  final List<String> _commandQueue = [];
  bool _isProcessingQueue = false;
  
  // Gestion des timeouts de commandes
  String? _currentCommand;
  Timer? _commandTimeoutTimer;
  static const Duration _commandTimeout = Duration(milliseconds: 500);
  
  // Completer pour attendre la réponse de la commande courante
  Completer<void>? _currentCommandCompleter;
  
  Stream<Map<String, dynamic>> get dataStream => _dataController?.stream ?? const Stream.empty();
  bool get isConnected => _isConnected;
  
  // Se connecter à la piscine
  Future<bool> connect(Pool pool) async {
    if (_isDisposed) return false;
    
    try {
      print('🔌 [WebSocket] Tentative de connexion à ws://${pool.ipAddress}:${pool.port}');
      
      // Initialiser le StreamController s'il n'existe pas
      _dataController ??= StreamController<Map<String, dynamic>>.broadcast();
      
      _channel = WebSocketChannel.connect(
        Uri.parse('ws://${pool.ipAddress}:${pool.port}'),
      );
      
      await _channel!.ready.timeout(const Duration(seconds: 5));
      _isConnected = true;
      
      print('✅ [WebSocket] Connexion établie avec succès');
      
      // Écouter les messages
      _channel!.stream.listen(
        (message) => _handleMessage(message.toString()),
        onError: (error) => _handleError(error),
        onDone: () => _handleDisconnect(),
      );
      
      // Démarrer le heartbeat
      _startHeartbeat();
      
      return true;
    } catch (e) {
      print('❌ [WebSocket] Erreur de connexion: $e');
      _isConnected = false;
      return false;
    }
  }
  
  // Envoyer une commande
  Future<void> sendCommand(String command) async {
    if (_isDisposed) return;
    
    // Ajouter la commande à la queue
    _commandQueue.add(command);
    print('📋 [WebSocket] Commande ajoutée à la queue: $command (${_commandQueue.length} en attente)');
    
    // Démarrer le traitement de la queue si pas déjà en cours
    if (!_isProcessingQueue) {
      _processCommandQueue();
    }
  }
  
  // Traiter la queue des commandes
  Future<void> _processCommandQueue() async {
    if (_isDisposed || _commandQueue.isEmpty || _isProcessingQueue) return;
    
    _isProcessingQueue = true;
    
    await _processNextCommand();
  }
  
  // Traiter la prochaine commande dans la queue
  Future<void> _processNextCommand() async {
    if (_isDisposed || _commandQueue.isEmpty) {
      _isProcessingQueue = false;
      _currentCommand = null;
      _commandTimeoutTimer?.cancel();
      _safeCompleteCompleter();
      return;
    }
    
    final command = _commandQueue.removeAt(0);
    _currentCommand = command;
    _currentCommandCompleter = Completer<void>();
    
    if (_isConnected && _channel != null) {
      try {
        print('📤 [WebSocket] Envoi commande: $command (${_commandQueue.length} restantes)');
        _channel!.sink.add(command);
        
        // Démarrer le timeout pour cette commande
        _startCommandTimeout();
        
        // Attendre la réponse de cette commande avant de passer à la suivante
        await _currentCommandCompleter!.future;
        
        // Traiter la prochaine commande immédiatement
        await _processNextCommand();
      } catch (e) {
        print('❌ [WebSocket] Erreur envoi: $e');
        _handleError(e);
        _isProcessingQueue = false;
        _currentCommand = null;
        _commandTimeoutTimer?.cancel();
        _safeCompleteCompleterError(e);
      }
    } else {
      print('❌ [WebSocket] Impossible d\'envoyer $command - Connecté: $_isConnected, Channel: ${_channel != null}');
      _isProcessingQueue = false;
      _currentCommand = null;
      _commandTimeoutTimer?.cancel();
      _safeCompleteCompleter();
    }
  }
  
  // Démarrer le timeout pour la commande courante
  void _startCommandTimeout() {
    _commandTimeoutTimer?.cancel();
    _commandTimeoutTimer = Timer(_commandTimeout, () {
      if (_currentCommand != null) {
        print('⏰ [WebSocket] Timeout pour la commande: $_currentCommand - remise en queue');
        // Remettre la commande en queue
        _commandQueue.add(_currentCommand!);
        _currentCommand = null;
        _commandTimeoutTimer?.cancel();
        
        // Continuer avec la prochaine commande
        _safeCompleteCompleter();
      }
    });
  }
  
  // Marquer la commande courante comme traitée (réponse reçue)
  void _markCommandAsProcessed() {
    if (_currentCommand != null) {
      print('✅ [WebSocket] Commande traitée avec succès: $_currentCommand');
      _currentCommand = null;
      _commandTimeoutTimer?.cancel();
      _safeCompleteCompleter();
    }
  }
  
  // Compléter le Completer de manière sécurisée
  void _safeCompleteCompleter() {
    if (_currentCommandCompleter != null && !_currentCommandCompleter!.isCompleted) {
      _currentCommandCompleter!.complete();
    }
  }
  
  // Compléter le Completer avec une erreur de manière sécurisée
  void _safeCompleteCompleterError(dynamic error) {
    if (_currentCommandCompleter != null && !_currentCommandCompleter!.isCompleted) {
      _currentCommandCompleter!.completeError(error);
    }
  }
  
  // Demander la température de l'eau
  Future<void> requestWaterTemperature() async {
    print('🌊 [WebSocket] Demande température eau: /temp/water');
    await sendCommand('/temp/water');
  }
  
  // Demander la température de l'air
  Future<void> requestAirTemperature() async {
    print('🌬️ [WebSocket] Demande température air: /temp/air');
    await sendCommand('/temp/air');
  }
  
  // Demander le mode de la pompe
  Future<void> requestPumpMode() async {
    print('🔧 [WebSocket] Demande mode pompe: /pompe/mode');
    await sendCommand('/pompe/mode');
  }
  
  // Allumer la pompe
  Future<void> turnPumpOn() async {
    print('🔧 [WebSocket] Allumer la pompe: /pompe/on');
    await sendCommand('/pompe/on');
  }
  
  // Éteindre la pompe
  Future<void> turnPumpOff() async {
    print('🔧 [WebSocket] Éteindre la pompe: /pompe/off');
    await sendCommand('/pompe/off');
  }
  
  // Mode auto pour la pompe
  Future<void> setPumpAuto() async {
    print('🔧 [WebSocket] Mode auto pompe: /pompe/auto');
    await sendCommand('/pompe/auto');
  }
  
  // Demander une plage horaire spécifique
  Future<void> requestTimeSlot(int slotIndex) async {
    print('⏰ [WebSocket] Demande plage horaire slot $slotIndex: /slot/$slotIndex');
    await sendCommand('/slot/$slotIndex');
  }
  
  // Augmenter les heures d'une plage horaire
  Future<void> addTimeSlotHours(int slotIndex) async {
    print('➕ [WebSocket] Augmenter heures slot $slotIndex: /slot/$slotIndex/add');
    await sendCommand('/slot/$slotIndex/add');
  }
  
  // Diminuer les heures d'une plage horaire
  Future<void> subtractTimeSlotHours(int slotIndex) async {
    print('➖ [WebSocket] Diminuer heures slot $slotIndex: /slot/$slotIndex/sub');
    await sendCommand('/slot/$slotIndex/sub');
  }
  
  // Demander les erreurs
  Future<void> requestErrors() async {
    print('⚠️ [WebSocket] Demande erreurs: /errors');
    await sendCommand('/errors');
  }
  
  // Traiter les messages reçus
  void _handleMessage(String message) {
    if (_isDisposed || _dataController == null) return;
    
    print('📥 [WebSocket] Message reçu: $message');
    
    if (message.startsWith('GTW')) {
      // Température de l'eau - format: GTW25
      final tempMatch = RegExp(r'GTW(\d+)').firstMatch(message);
      if (tempMatch != null) {
        final temp = int.tryParse(tempMatch.group(1) ?? '0') ?? 0;
        print('🌊 [WebSocket] Température eau reçue: $temp°C');
        _dataController!.add({
          'type': 'water_temperature',
          'value': temp,
        });
        // Marquer la commande comme traitée
        _markCommandAsProcessed();
      } else {
        print('⚠️ [WebSocket] Format température eau invalide: $message');
      }
    } else if (message.startsWith('GTA')) {
      // Température de l'air - format: GTA28
      final tempMatch = RegExp(r'GTA(\d+)').firstMatch(message);
      if (tempMatch != null) {
        final temp = int.tryParse(tempMatch.group(1) ?? '0') ?? 0;
        print('🌬️ [WebSocket] Température air reçue: $temp°C');
        _dataController!.add({
          'type': 'air_temperature',
          'value': temp,
        });
        // Marquer la commande comme traitée
        _markCommandAsProcessed();
      } else {
        print('⚠️ [WebSocket] Format température air invalide: $message');
      }
    } else if (message.startsWith('GMD')) {
      // Mode de la pompe - format: GMD0, GMD1, GMD2
      final modeMatch = RegExp(r'GMD(\d+)').firstMatch(message);
      if (modeMatch != null) {
        final mode = int.tryParse(modeMatch.group(1) ?? '0') ?? 0;
        String modeText;
        switch (mode) {
          case 0:
            modeText = 'arrêtée';
            break;
          case 1:
            modeText = 'allumée';
            break;
          case 2:
            modeText = 'auto';
            break;
          default:
            modeText = 'inconnu';
        }
        print('🔧 [WebSocket] Mode pompe reçu: $modeText (GMD$mode)');
        _dataController!.add({
          'type': 'pump_mode',
          'value': mode,
        });
        // Marquer la commande comme traitée
        _markCommandAsProcessed();
      } else {
                          print('⚠️ [WebSocket] Format mode pompe invalide: $message');
                }
              } else if (message.startsWith('GTS')) {
                // Plage horaire - format: GTS012 (slot 0, 12 heures)
                final slotMatch = RegExp(r'GTS(\d)(\d+)').firstMatch(message);
                if (slotMatch != null) {
                  final slotIndex = int.tryParse(slotMatch.group(1) ?? '0') ?? 0;
                  final hours = int.tryParse(slotMatch.group(2) ?? '0') ?? 0;
                  print('⏰ [WebSocket] Plage horaire reçue: slot $slotIndex = ${hours}h (GTS$slotIndex$hours)');
                  _dataController!.add({
                    'type': 'time_slot',
                    'slot_index': slotIndex,
                    'hours': hours,
                  });
                  // Marquer la commande comme traitée
                  _markCommandAsProcessed();
                } else {
                  print('⚠️ [WebSocket] Format plage horaire invalide: $message');
                }
              } else if (message.startsWith('GER')) {
                // Erreurs - format: GER96 (octet 96 = 01100000 en binaire)
                final errorMatch = RegExp(r'GER(\d+)').firstMatch(message);
                if (errorMatch != null) {
                  final errorByte = int.tryParse(errorMatch.group(1) ?? '0') ?? 0;
                  print('⚠️ [WebSocket] Erreurs reçues: octet $errorByte (GER$errorByte)');
                  
                  // Décoder les erreurs bit par bit
                  final errors = <String, bool>{
                    'clock_sync': (errorByte & 0x01) != 0,      // Bit 0: Erreur horloge atomique
                    'water_sensor': (errorByte & 0x02) != 0,   // Bit 1: Erreur capteur eau
                    'air_sensor': (errorByte & 0x04) != 0,     // Bit 2: Erreur capteur air
                    'water_transmission': (errorByte & 0x08) != 0, // Bit 3: Erreur transmission eau
                    'air_transmission': (errorByte & 0x10) != 0,   // Bit 4: Erreur transmission air
                    'water_battery': (errorByte & 0x20) != 0,      // Bit 5: Batterie faible eau
                    'air_battery': (errorByte & 0x40) != 0,        // Bit 6: Batterie faible air
                  };
                  
                  _dataController!.add({
                    'type': 'errors',
                    'error_byte': errorByte,
                    'errors': errors,
                  });
                  // Marquer la commande comme traitée
                  _markCommandAsProcessed();
                } else {
                  print('⚠️ [WebSocket] Format erreurs invalide: $message');
                }
              } else {
                print('❓ [WebSocket] Message non reconnu: $message');
              }
  }
  
  // Gérer les erreurs
  void _handleError(dynamic error) {
    if (_isDisposed || _dataController == null) return;
    
    _isConnected = false;
    _dataController!.add({
      'type': 'error',
      'message': error.toString(),
    });
    
    // Tentative de reconnexion
    _scheduleReconnect();
  }
  
  // Gérer la déconnexion
  void _handleDisconnect() {
    if (_isDisposed || _dataController == null) return;
    
    _isConnected = false;
    _dataController!.add({
      'type': 'disconnected',
    });
    
    // Tentative de reconnexion
    _scheduleReconnect();
  }
  
  // Programmer une reconnexion
  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      // TODO: Implémenter la reconnexion automatique
    });
  }
  
  // Démarrer le heartbeat
  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_isConnected) {
        // Envoyer une commande de température pour maintenir la connexion
        // au lieu de /ping qui n'existe peut-être pas
        sendCommand('/temp/water');
        print('💓 [WebSocket] Heartbeat - demande température eau');
      }
    });
  }
  
  // Se déconnecter
  void disconnect() {
    _reconnectTimer?.cancel();
    _heartbeatTimer?.cancel();
    _commandTimeoutTimer?.cancel();
    _channel?.sink.close();
    _isConnected = false;
    
    // Vider la queue
    _commandQueue.clear();
    _isProcessingQueue = false;
    _currentCommand = null;
    _safeCompleteCompleter();
  }
  
  // Libérer les ressources
  void dispose() {
    _isDisposed = true;
    disconnect();
    _dataController?.close();
    _dataController = null;
  }
}
