import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/pool.dart';

class PoolStorageService {
  static const String _poolKey = 'saved_pool';
  
  // Sauvegarder la piscine sélectionnée (de manière persistante)
  Future<void> saveSelectedPool(Pool pool) async {
    final prefs = await SharedPreferences.getInstance();
    final poolJson = pool.toJson();
    await prefs.setString(_poolKey, jsonEncode(poolJson));
  }
  
  // Récupérer la piscine sauvegardée
  Future<Pool?> getSelectedPool() async {
    final prefs = await SharedPreferences.getInstance();
    final poolString = prefs.getString(_poolKey);
    
    if (poolString != null) {
      try {
        final poolJson = jsonDecode(poolString);
        return Pool.fromJson(poolJson);
      } catch (e) {
        // En cas d'erreur de parsing, supprimer les données corrompues
        await clearSelectedPool();
        return null;
      }
    }
    return null;
  }
  
  // Supprimer la piscine sauvegardée
  Future<void> clearSelectedPool() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_poolKey);
  }
  
  // Vérifier si une piscine est sauvegardée
  Future<bool> hasSelectedPool() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(_poolKey);
  }
  
  // Sauvegarder seulement l'IP de la piscine (méthode simplifiée)
  Future<void> savePoolIP(String ipAddress, {String name = 'Piscine', int port = 8080}) async {
    final pool = Pool(
      id: 'saved_pool',
      name: name,
      ipAddress: ipAddress,
      port: port,
      lastSeen: DateTime.now(),
    );
    await saveSelectedPool(pool);
  }
  
  // Récupérer seulement l'IP de la piscine sauvegardée
  Future<String?> getSavedPoolIP() async {
    final pool = await getSelectedPool();
    return pool?.ipAddress;
  }
}
