import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:network_info_plus/network_info_plus.dart';
import '../models/pool.dart';

class PoolScannerService {
  static const int _port = 81;
  static const String _testCommand = '/temp/water';
  static const Duration _timeout = Duration(milliseconds: 500);
  
  final NetworkInfo _networkInfo = NetworkInfo();
  final List<Pool> _foundPools = [];
  final StreamController<Pool> _poolFoundController = StreamController<Pool>.broadcast();
  final StreamController<double> _progressController = StreamController<double>.broadcast();
  final StreamController<String> _logController = StreamController<String>.broadcast();
  
  bool _stopScan = false;

  Stream<Pool> get poolFoundStream => _poolFoundController.stream;
  Stream<double> get progressStream => _progressController.stream;
  Stream<String> get logStream => _logController.stream;

  Future<List<Pool>> scanNetwork() async {
    _foundPools.clear();
    _stopScan = false;
    _logController.add('Démarrage du scan réseau...');
    
    try {
      // Obtenir l'adresse IP locale
      String? wifiIP = await _networkInfo.getWifiIP();
      if (wifiIP == null) {
        _logController.add('Impossible d\'obtenir l\'adresse IP WiFi');
        return [];
      }
      
      _logController.add('Adresse IP locale: $wifiIP');
      
      // Extraire le préfixe réseau (ex: 192.168.1)
      String networkPrefix = _getNetworkPrefix(wifiIP);
      _logController.add('Scan du réseau: $networkPrefix.0/24');
      _logController.add('Recherche de la première piscine...');
      
      // Scanner les adresses en parallèle par groupes de 10
      const int batchSize = 10;
      int completedScans = 0;
      
      for (int batch = 0; batch < 26 && !_stopScan; batch++) { // 254/10 ≈ 26 groupes
        List<Future<void>> batchTasks = [];
        
        // Créer un groupe de 10 scans parallèles
        for (int i = 0; i < batchSize && !_stopScan; i++) {
          int ipIndex = batch * batchSize + i + 1;
          if (ipIndex > 254) break;
          
          String targetIP = '$networkPrefix.$ipIndex';
          batchTasks.add(_scanIP(targetIP));
        }
        
        // Exécuter le groupe en parallèle
        await Future.wait(batchTasks, eagerError: false);
        
        completedScans += batchTasks.length;
        double progress = completedScans / 254;
        _progressController.add(progress);
        
        // Si une piscine est trouvée, arrêter le scan
        if (_foundPools.isNotEmpty) {
          _logController.add('✅ Piscine trouvée ! Arrêt du scan.');
          break;
        }
      }
      
      if (_foundPools.isEmpty) {
        _logController.add('Aucune piscine trouvée sur le réseau');
      } else {
        _logController.add('Scan terminé. Piscine connectée: ${_foundPools.first.ipAddress}');
      }
      
      return List.from(_foundPools);
      
    } catch (e) {
      _logController.add('Erreur lors du scan: $e');
      return [];
    }
  }

  String _getNetworkPrefix(String ip) {
    List<String> parts = ip.split('.');
    if (parts.length == 4) {
      return '${parts[0]}.${parts[1]}.${parts[2]}';
    }
    return '192.168.1'; // Fallback
  }

  Future<void> _scanIP(String ip) async {
    try {
      // Vérifier si le scan doit s'arrêter
      if (_stopScan) return;
      
      // Log moins verbeux pour éviter le spam
      // _logController.add('Test de $ip:$_port');
      
      // Test de connexion WebSocket
      WebSocketChannel? channel;
      
      try {
        channel = WebSocketChannel.connect(
          Uri.parse('ws://$ip:$_port'),
        );
        
                 // Attendre la connexion
         await channel.ready.timeout(_timeout);
         
         // Envoyer la commande de test
         channel.sink.add(_testCommand);
         
         // Attendre la réponse
         String? response = await channel.stream
             .timeout(_timeout)
             .first as String?;
         
         _logController.add('Réponse reçue de $ip: "$response"');
        
        if (response != null && response.startsWith('GTW')) {
          _logController.add('🎉 PISCINE TROUVÉE: $ip - Réponse: $response');
          
          // Créer l'objet Pool
          Pool pool = Pool(
            id: ip,
            name: 'Ma Piscine',
            ipAddress: ip,
            port: _port,
            isConnected: true,
            status: 'Connectée',
            lastSeen: DateTime.now(),
          );
          
          _foundPools.add(pool);
          _poolFoundController.add(pool);
          
          _logController.add('✅ Piscine trouvée et ajoutée: $ip');
          
          // Arrêter le scan puisqu'on a trouvé la piscine
          _stopScan = true;
        } else {
          _logController.add('Réponse invalide de $ip: $response');
        }
        
             } catch (e) {
         // Connexion échouée, c'est normal pour la plupart des IPs
         // Ne pas logger les erreurs courantes pour éviter le spam
         if (!e.toString().contains('Connection refused') && 
             !e.toString().contains('timeout') &&
             !e.toString().contains('Network is unreachable')) {
           _logController.add('Erreur avec $ip: $e');
         }
       } finally {
        channel?.sink.close();
      }
      
    } catch (e) {
      // Ignorer les erreurs de scan individuel
    }
  }

  Future<bool> testConnection(Pool pool) async {
    try {
      WebSocketChannel channel = WebSocketChannel.connect(
        Uri.parse('ws://${pool.ipAddress}:${pool.port}'),
      );
      
      await channel.ready.timeout(_timeout);
      channel.sink.add(_testCommand);
      
      String? response = await channel.stream
          .timeout(_timeout)
          .first as String?;
      
      channel.sink.close();
      
      return response != null && response.startsWith('GTW');
      
    } catch (e) {
      return false;
    }
  }

  Future<String?> sendCommand(Pool pool, String command) async {
    try {
      WebSocketChannel channel = WebSocketChannel.connect(
        Uri.parse('ws://${pool.ipAddress}:${pool.port}'),
      );
      
      await channel.ready.timeout(_timeout);
      channel.sink.add(command);
      
      String? response = await channel.stream
          .timeout(_timeout)
          .first as String?;
      
      channel.sink.close();
      
      return response;
      
    } catch (e) {
      _logController.add('Erreur lors de l\'envoi de commande: $e');
      return null;
    }
  }

  void dispose() {
    _poolFoundController.close();
    _progressController.close();
    _logController.close();
  }
}
